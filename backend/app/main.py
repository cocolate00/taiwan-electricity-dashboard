import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.api import health, charts, chat
from app.core.database import Base, engine
from app.models.documents import Document, DocumentChunk

app = FastAPI(
    title="Taiwan Electricity Data Dashboard & RAG API",
    description="Backend API for Taiwan electricity stats dashboard and Gemini-powered RAG Q&A",
    version="0.1.0"
)

@app.on_event("startup")
def startup_event():
    # 當服務啟動時，自動建立所有資料庫表 (特別是 pgvector 文件向量表)
    Base.metadata.create_all(bind=engine)

# Set CORS origins
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [
    frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api")
app.include_router(charts.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Taiwan Electricity Data & RAG API"}
