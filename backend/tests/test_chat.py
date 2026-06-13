from unittest.mock import patch
from sqlalchemy import text
from app.core.database import get_db

def test_chat_faq_strong_match(client):
    # 1. 自資料庫中查詢一個 FAQ 的 Embedding 向量與內容
    db = next(get_db())
    faq_chunk = db.execute(text("""
        SELECT c.embedding, c.content, d.title
        FROM document_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.source_type = 'faq' AND c.embedding IS NOT NULL
        LIMIT 1
    """)).fetchone()
    
    assert faq_chunk is not None, "資料庫中應該至少存在一筆 FAQ"
    
    embedding_data = faq_chunk[0]
    # 如果是字串格式則解析為 float list
    if isinstance(embedding_data, str):
        embedding_list = [float(x) for x in embedding_data.strip("[]").split(",")]
    else:
        embedding_list = embedding_data
    
    faq_content = faq_chunk[1]
    faq_title = faq_chunk[2]

    # 2. Mock EmbeddingService 的 get_embedding 方法，讓它返回這筆 FAQ 的 embedding
    with patch("app.services.embedding_service.EmbeddingService.get_embedding") as mock_emb:
        mock_emb.return_value = embedding_list

        # 3. 發送 chat 請求
        response = client.post("/api/chat", json={"message": "這是一個能觸發強匹配的問題"})
        
        assert response.status_code == 200
        json_data = response.json()
        assert "answer" in json_data
        assert "sources" in json_data
        
        # 4. 驗證強匹配攔截直接返回庫存內容，且包含正確的 FAQ 來源
        assert json_data["answer"] == faq_content
        assert len(json_data["sources"]) == 1
        assert faq_title in json_data["sources"][0]["title"]

def test_chat_fallback_guidance(client):
    # 1. 產生一個隨機的 3072 維度向量 (幾乎不可能匹配任何 FAQ)
    random_embedding = [0.0] * 3072
    random_embedding[0] = 0.99

    # 2. Mock EmbeddingService 返回此不相關向量
    with patch("app.services.embedding_service.EmbeddingService.get_embedding") as mock_emb:
        mock_emb.return_value = random_embedding

        # 3. 發送 chat 請求
        response = client.post("/api/chat", json={"message": "這是一個無法匹配 FAQ 的隨機問題"})
        
        assert response.status_code == 200
        json_data = response.json()
        assert "answer" in json_data
        assert "sources" in json_data
        
        # 4. 驗證直接返回官方引導訊息
        assert "台灣電力公司官網" in json_data["answer"]
        assert "經濟部能源署" in json_data["answer"]
        assert "國家再生能源憑證中心" in json_data["answer"]
        
        # 驗證 sources 包含 3 個官方網站
        assert len(json_data["sources"]) == 3
        titles = [s["title"] for s in json_data["sources"]]
        assert "台灣電力公司官網" in titles
        assert "經濟部能源署官網" in titles
        assert "國家再生能源憑證中心官網" in titles
