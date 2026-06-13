import os
import google.generativeai as genai

# gemini-embedding-001 輸出為 3072 維向量
EMBEDDING_DIM = 3072

class EmbeddingService:
    """
    負責封裝 Google Gemini Embedding API 進行文字向量化，
    產生的向量將用於 pgvector 進行語意檢索。
    """
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        # gemini-embedding-001 為目前可用的高維度 Embedding 模型
        self.model_name = "models/gemini-embedding-001"

    def get_embedding(self, text: str) -> list[float]:
        if not text:
            return [0.0] * EMBEDDING_DIM
        
        try:
            cleaned_text = text.replace("\n", " ").strip()
            result = genai.embed_content(
                model=self.model_name,
                content=cleaned_text,
                task_type="retrieval_document"
            )
            return result["embedding"]
        except Exception as e:
            print(f"❌ [EmbeddingService] 產生向量失敗: {str(e)}")
            return [0.0] * EMBEDDING_DIM
