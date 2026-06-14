# Taiwan Electricity Data Service Platform

資料視覺化 × 知識查詢 × AI 應用規劃

## 專案背景

近年來能源轉型、再生能源發展與供電穩定性等議題受到廣泛關注，但相關資訊分散於不同政府機關、公開資料平台及台灣電力公司網站，一般使用者不易快速取得所需資訊。

因此，本專案以「台灣電力資訊整合平台」為概念，透過資料視覺化與知識查詢機制，提供使用者更直觀且易於理解的電力資訊服務。

本專案同時作為資料服務平台（Data Service Platform）與 AI 知識查詢系統的概念驗證（Proof of Concept），展示資料整合、平台開發及 AI 應用規劃能力。

---

## Demo

### Website

https://cocolate00.github.io/taiwan-electricity-dashboard/

### GitHub Repository

https://github.com/cocolate00/taiwan-electricity-dashboard

---

## 專案目標

* 提供集中化的台灣電力資訊入口
* 降低使用者查找資訊成本
* 透過視覺化方式提升資訊理解效率
* 建立可擴充的知識查詢架構
* 驗證資料平台與 AI 應用整合的可行性

---

## 核心功能

### 電力資訊儀表板

透過圖表與卡片式介面呈現電力相關資訊，提升資料可讀性與使用者體驗。

功能包含：

* 電力資訊展示
* 能源結構說明
* 電力知識整理
* 響應式網頁設計（Responsive Design）

---

### FAQ 知識查詢系統

系統內建電力相關 FAQ 知識庫，提供常見問題查詢服務。

查詢流程：

1. 使用者輸入問題
2. 系統比對 FAQ 知識庫
3. 回傳最相關答案
4. 若無適合答案，導引至官方資料來源

目前知識庫收錄 28 筆常見電力問題。

---

### 官方資訊導引機制

當問題超出知識庫範圍時，系統將引導使用者查閱可信資料來源，例如：

* 台灣電力公司
* 經濟部能源署
* 政府資料開放平台

藉此降低錯誤資訊回覆風險，提升資訊可信度。

---

## 系統架構

### Current Architecture

```text
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Backend
 │
 ├── FAQ Knowledge Base
 │
 └── PostgreSQL
         │
         └── Supabase
```

### Future Architecture

```text
User
 │
 ▼
Frontend
 │
 ▼
FastAPI
 │
 ▼
Embedding Model
 │
 ▼
pgvector
 │
 ▼
Retrieval Layer
 │
 ▼
LLM Response
```

---

## 技術架構

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* FastAPI
* Python

### Database

* PostgreSQL
* Supabase

### Infrastructure

* Docker
* GitHub Pages
* UptimeRobot

---

## 設計考量

### 為何目前未採用完整 RAG 架構？

專案初期曾評估導入 Retrieval-Augmented Generation（RAG）。

然而目前知識範圍相對固定，FAQ 數量有限，因此採用結構化 FAQ Knowledge Base 即可滿足需求。

此設計具備以下優勢：

* 降低推論成本
* 提升回覆穩定性
* 降低維護複雜度
* 降低模型幻覺風險

當知識文件規模持續增加時，可逐步升級為：

```text
FAQ
↓
Semantic Search
↓
Vector Database
↓
RAG
↓
Hybrid Search
```

---

## 開發方式

本專案採用 AI Assisted Development（AI 輔助開發）模式完成。

開發過程中運用 AI Coding Assistant 協助產生程式碼、建立元件及加速功能實作，藉此提升原型開發效率。

本人主要負責：

* 專案主題規劃與需求分析
* 功能設計與使用情境定義
* 系統架構規劃
* 技術選型與方案評估
* FAQ 知識庫內容整理
* 功能測試與驗證
* 錯誤修正與迭代優化
* 網站部署與維運

透過 AI 工具加速開發流程，並專注於需求分析、系統設計與問題解決。

---

## 專案收穫

透過本專案實作與規劃，熟悉以下技術與概念：

### 資料服務平台

* Data Service Platform Design
* API Design
* Database Integration
* Frontend & Backend Integration

### AI 應用規劃

* FAQ Knowledge Base
* Semantic Search Concept
* Vector Database Architecture
* RAG System Design

### 軟體工程

* Component-Based Development
* Docker Containerization
* Version Control
* Deployment Workflow

---

## 未來規劃

### Data Pipeline

* 自動化資料更新流程
* ETL Pipeline 建置
* 資料品質監控機制

### AI Search

* Embedding Model
* pgvector
* Semantic Search
* Hybrid Search
* Re-ranking

### Platform Engineering

* API Gateway
* Monitoring
* Logging
* Usage Analytics
* CI/CD Workflow

### Advanced AI Features

* Local LLM（Ollama）
* Qwen 系列模型
* Multimodal RAG
* Document Intelligence

---

## 專案定位

本專案並非單純的資料展示網站，而是以台灣電力資訊為主題，實作資料視覺化、知識查詢及 AI 應用規劃的資料服務平台原型（Proof of Concept）。

透過本專案驗證從資料整理、資料儲存、資訊展示到知識查詢的完整流程，並作為資料平台開發、AI 應用導入與系統架構設計能力的作品展示。
