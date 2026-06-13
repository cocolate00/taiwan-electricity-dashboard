from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str
    history: list = []  # 對話歷史格式: [{"prompt": str, "response": str}]

class ChatResponse(BaseModel):
    answer: str
    sources: list = []

# 初始化服務
embedding_service = EmbeddingService()
llm_service = LLMService()

# 台灣電力 RAG 專用系統提示
SYSTEM_INSTRUCTION = """
你是一個專業的台灣電力、綠色能源與能源政策 AI 助理，名字叫「台灣電力觀測站」。請使用繁體中文（台灣習慣用語，如「用電量」、「發發電量」、「度電」）回答使用者的問題。

請優先使用【知識庫文檔】中的內容來回答使用者的問題。
如果文檔中的資訊不足以回答問題，你可以使用你本身的知識庫進行回答，但必須在回答中註明：「以下回答包含我原本的知識，文檔中未提及...」。

【核心要求：動態圖表呈現】
如果使用者詢問的問題涉及「數據變化」、「歷年趨勢」、「比例對比」等（例如：歷年再生能源發電量、製造業用電大戶、夏季損耗率等），你必須在回答的最後，以單獨一行開始的 markdown 區塊形式附加特殊的 `[chart_data]` JSON，前端將會解析它並動態在對話氣泡下方繪製精美的 Recharts 互動圖表。

請嚴格遵守以下格式，且 JSON 必須是單獨一個 block，不可被包在其他文字內，且請確保為合法 JSON（不可包含尾隨逗號）：
```json [chart_data]
{
  "type": "line" | "bar" | "pie",
  "title": "圖表標題（例如：台灣歷年再生能源發電走勢）",
  "unit": "單位（例如：億度 或 %）",
  "xAxisKey": "label",
  "series": [
    {"key": "value", "name": "數值名稱", "color": "#06b6d4"}
  ],
  "data": [
    {"label": "2020年", "value": 151.2},
    {"label": "2021年", "value": 174.5}
  ]
}
```
注意事項：
1. 提供的數據點應在 3~10 個以內以利移動端和桌面端清晰顯示。
2. 數據的單位應與 Dashboard 對齊，發/用電量全面換算為「億度」，占比為「%」。
3. type 可以是 "line"（折線圖）、"bar"（柱狀圖）或 "pie"（圓餅圖，圓餅圖通常用於某年的能源結構占比，此時 xAxisKey 為 "name"，series 的 key 為 "value"）。
4. 確保 JSON 格式完全正確，不能有拼寫錯誤。
"""

import re

@router.post("", response_model=ChatResponse)
def handle_chat(request: ChatRequest, db: Session = Depends(get_db)):
    if not request.message:
        raise HTTPException(status_code=400, detail="對話內容不能為空")

    # 1. 歷史紀錄預處理：使用正則表達式徹底過濾掉歷史 AI 回答中的 [chart_data] JSON 塊以省 Token
    cleaned_history = []
    if request.history:
        for h in request.history[-3:]:  # 限制最近 3 輪
            prompt = h.get('prompt', '')
            response = h.get('response', '')
            # 移除 ```json [chart_data] ... ``` 區塊
            clean_resp = re.sub(r'```json \[chart_data\].*?```', '[已移除歷史圖表數據]', response, flags=re.DOTALL).strip()
            cleaned_history.append({"prompt": prompt, "response": clean_resp})

    # 2. 將使用者提問向量化
    query_vec = embedding_service.get_embedding(request.message)
    # 格式化為 PostgreSQL vector 的字串陣列格式 e.g., '[0.1, 0.2, ...]'
    vec_str = f"[{','.join(str(x) for x in query_vec)}]"

    sources = []
    context_text = ""
    faq_matched = False

    try:
        # A. 優先嘗試 FAQ 語意快取比對 (只搜尋 source_type = 'faq' 的 Chunks)
        faq_query = text("""
            SELECT c.content, d.title, d.source_url, 1 - (c.embedding <=> :vec) AS similarity
            FROM document_chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE d.source_type = 'faq'
            ORDER BY c.embedding <=> :vec
            LIMIT 1
        """)
        faq_result = db.execute(faq_query, {"vec": vec_str}).fetchone()

        if faq_result:
            content, title, source_url, similarity = faq_result
            similarity = float(similarity)
            print(f"ℹ️ [ChatAPI] FAQ 檢索最相似度: {similarity:.4f}，問題: {request.message[:20]}")

            if similarity >= 0.90:
                # 🎯 FAQ 強匹配命中！直接攔截回傳！LLM Token 消耗 = 0
                print(f"⚡ [ChatAPI] FAQ 強匹配命中！直接攔截回傳 (相似度: {similarity:.4f})")
                return ChatResponse(
                    answer=content,
                    sources=[{"title": f"常見問答集 - {title}", "source_url": source_url}]
                )
    except Exception as e:
        print(f"❌ [ChatAPI] 檢索資料庫失敗: {str(e)}")

    # 🎯 相似度低於 0.90（或是無 FAQ 資料）：不調用 LLM，直接引導至官方優質來源
    print(f"🔗 [ChatAPI] 未命中 FAQ (或相似度小於 0.90)。直接返回引導訊息，節省 Token")
    
    guidance_answer = (
        "您好！我是台灣電力觀測站助理。為了提供最準確且即時的資訊，若您的問題不在我們的常見問答集（FAQ）中，"
        "建議您直接前往以下優質的官方平台進行查詢，以獲取最權威的解答：\n\n"
        "1. **台灣電力公司官網**：提供即時供電資訊、歷史電力統計與用電宣導。\n"
        "2. **經濟部能源署**：提供最新的能源政策、法規指引與統計年報。\n"
        "3. **國家再生能源憑證中心**：提供綠電交易、憑證申請與再生能源推廣資訊。\n\n"
        "您可以嘗試調整您的提問方式，或在下方點擊推薦問題以獲得更精準的 FAQ 數據回答喔！"
    )
    
    official_sources = [
        {"title": "台灣電力公司官網", "source_url": "https://www.taipower.com.tw"},
        {"title": "經濟部能源署官網", "source_url": "https://www.energy.gov.tw"},
        {"title": "國家再生能源憑證中心官網", "source_url": "https://www.trec.org.tw"}
    ]
    
    return ChatResponse(answer=guidance_answer, sources=official_sources)
