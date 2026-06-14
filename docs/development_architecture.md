# 📐 「台灣電力觀測站」詳細開發架構解析 (Development Architecture)

本文件深入解析「台灣電力觀測站」專案的內部程式碼元件關係、三層式後端架構（Separation of Concerns）以及資料庫之間的資料交互邏輯，為開發學習與技術展示提供清晰的軟體工程藍圖。

---

## 🎨 開發架構概念圖

![開發架構解析概念圖](file:///c:/Users/kejun/Desktop/Project/electric/docs/images/development_architecture_diagram.png)

---

## ⚙️ 一、 元件開發架構圖 (Component Interaction Flow)

本專案的前端與後端均遵循模組化設計。下圖詳述了前端 React 組件樹、後端三層式代碼架構與 Supabase 之間的資料流向與呼叫關係：

```mermaid
flowchart TD
    subgraph Frontend ["React 前端組件層 (Frontend/src/)"]
        App["App.tsx<br>(路由調配 & 導覽列)"]
        Dash["DashboardPage.tsx<br>(電力儀表板 & Recharts)"]
        Sources["EnergySourcesPage.tsx<br>(電力百科 & 供電挑戰)"]
        Chat["ChatPage.tsx<br>(AI 智能問答對話框)"]
        
        App -->|路由分發| Dash
        App -->|路由分發| Sources
        App -->|路由分發| Chat
        Dash -->|點擊發電走勢圖| Sources
    end

    subgraph Backend ["FastAPI 後端三層架構 (Backend/app/)"]
        subgraph Controller ["1. 控制器層 (app/api/)"]
            ApiCharts["charts.py<br>(/charts/generation<br>/charts/industry-consumption)"]
            ApiChat["chat.py<br>(/chat)"]
            ApiHealth["health.py<br>(/health)"]
        end

        subgraph Service ["2. 業務邏輯層 (app/services/)"]
            ChartService["chart_service.py<br>(數據累加 / 單位換算)"]
            ChatService["chat_service.py<br>(0-Token 快取比對 / RAG 檢索)"]
            EmbedService["embedding_service.py<br>(生成問題向量)"]
        end

        subgraph Repository ["3. 資料存取層 (app/repositories/)"]
            PowerRepo["power_repository.py<br>(SQLAlchemy 電力 CRUD)"]
            DocRepo["document_repository.py<br>(pgvector 向量檢索)"]
        end

        %% 後端內部呼叫
        ApiCharts --> ChartService
        ApiChat --> ChatService
        ChartService --> PowerRepo
        ChatService --> DocRepo
        ChatService --> EmbedService
    end

    subgraph Database ["雲端數據層 (Supabase PostgreSQL)"]
        TablePower["power_generation<br>(歷史發電量)"]
        TableConsumption["power_consumption_by_industry<br>(產業用電量)"]
        TableFAQ["document_chunks<br>(28 筆 FAQ 向量與預存圖表)"]
        
        PowerRepo <-->|SQL 查詢| TablePower
        PowerRepo <-->|SQL 查詢| TableConsumption
        DocRepo <-->|Vector Cosine 比對| TableFAQ
    end

    %% 前後端串接
    Dash <-->|HTTPS GET 請求| ApiCharts
    Chat <-->|HTTPS POST (剔除 JSON 歷史)| ApiChat
    Sources -->|官方出處連結| Database
```

---

## 🔍 二、 後端三層架構設計說明 (Three-Tier Architecture)

為了解決代碼雜亂、邏輯與資料查詢混在一起（Spaghetti Code）的痛點，本專案後端採用了企業級的**三層式架構**，實現了**職責分離 (Separation of Concerns)**：

1. **控制器層 (Controller / API Layer)**：
   * **職責**：只負責接收 HTTP 請求、驗證傳入參數（透過 Pydantic），並回傳 HTTP 狀態碼與 JSON。
   * **優點**：不涉及任何業務邏輯與資料庫 SQL，若未來將 FastAPI 換成其他 Web 框架（如 Flask），只需重寫這一層。
2. **業務邏輯層 (Service Layer)**：
   * **職責**：專案的核心大腦。負責數據的計算與轉換（例如 2026 年未完結數據的動態累加、單位標準化為「億度」），以及 RAG 系統的向量相似度閥值比對（$\ge 0.90$ 則物理攔截直接回傳）。
   * **優點**：容易進行單元測試（Unit Test）。在測試時，可以輕鬆 Mock 掉 Service 層所依賴的資料庫查詢，專注驗證計算邏輯。
3. **資料存取層 (Repository / DAL Layer)**：
   * **職責**：專職與資料庫（SQLAlchemy ORM）進行溝通，執行最底層的 SQL 查詢、新增、修改與 pgvector 餘弦距離比對。
   * **優點**：將所有的資料庫存取集中管理，未來若資料庫從 PostgreSQL 遷移到 MySQL 或 MongoDB，只需修改 Repository 層，Service 層與 Controller 層代碼完全不需要改動。

---

## 📈 三、 前端組件與交互機制 (Frontend Interactions)

前端 React 採用單頁面應用（SPA）的聲明式渲染，核心特色在於組件之間的高度聯動與路由導向：

1. **點擊圖表跨頁導航**：
   * 在 `DashboardPage.tsx` 中，我們為發電歷史走勢圖綁定了點擊事件，當使用者點擊圖表時，會透過路由 Hook（`useNavigate`）自動跳轉至 `EnergySourcesPage.tsx`（電力百科），並自動切換至對應的發電來源，提供直觀流暢的導覽體驗。
2. **對話歷史的 Token 節約過濾**：
   * 在 `ChatPage.tsx` 中，使用者在對話中能看到 AI 繪製的 Recharts 圖表。為了避免這些龐大的圖表數據（JSON 陣列）在多輪對話中被當作歷史文字重複傳給後端，前端在將對話歷史（`history`）送出前，後端會利用正則表達式剔除帶有 `[chart_data]` 的區塊，優化上行頻寬與大模型 Context 限制。
