from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy.types import UserDefinedType

class Vector(UserDefinedType):
    """
    自定義 Vector 類型以支援 PostgreSQL pgvector 擴充功能，
    避免額外安裝外部 python-pgvector 依賴，保證系統的簡潔度與高相容性。
    """
    def __init__(self, dimensions: int):
        self.dimensions = dimensions

    def get_col_spec(self, **kw):
        return f"vector({self.dimensions})"

    def bind_processor(self, dialect):
        def process(value):
            if value is None:
                return None
            if isinstance(value, list):
                return f"[{','.join(str(x) for x in value)}]"
            return value
        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is None:
                return None
            # 回傳的字串格式為 "[1.2,3.4,...]"，需解析為 float list
            return [float(x) for x in value.strip("[]").split(",")]
        return process

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    source_type = Column(String(50), nullable=False)  # 例如: "policy", "report", "faq"
    source_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    # Gemini gemini-embedding-001 產生的嵌入特徵維度預設為 3072
    embedding = Column(Vector(3072), nullable=True)

    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("idx_chunk_document_id", "document_id"),
    )
