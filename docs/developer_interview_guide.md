# 🎓 「台灣電力觀測站」開發者學習與面試實戰指南 (Developer & Interview Guide)

本指南專為**開發新手學習**與**技術面試準備**而設計。內容以白話解析本系統的架構細節，並整理了面試官最關心的核心技術問題與回答套路，幫助您深入理解每個技術組件的角色與串接邏輯。

---

## 🌐 一、 零基礎白話架構解析

本系統是一個結合「數據圖表（Dashboard）」與「AI 問答（RAG）」的應用。它像是由四個齒輪協同運作的機械：

```
[使用者瀏覽器] <---> [前端 React] <---> [後端 FastAPI] <---> [雲端 Supabase PostgreSQL]
```

1. **前端 React (瀏覽器端)**：負責「面孔與互動」。它向後端拿數據，然後用 **Recharts** 把枯燥的數值畫成美麗的折線圖、圓餅圖，並提供對話框讓使用者跟 AI 聊天。
2. **後端 FastAPI (伺服器端)**：負責「大腦與邏輯」。它提供 API 路由（例如：拿發電量、用電排行、問答服務）。當使用者輸入問題時，後端會計算語意向量，判斷是直接從資料庫拿答案，還是導向官方網站。
3. **資料庫 Supabase (數據層)**：負責「記憶與儲存」。這是一個 PostgreSQL 資料庫，但它安裝了 `pgvector` 外掛，所以除了能用 SQL 存取傳統的電力統計數字，還能用來存取經過數學向量化 (Embedding) 的 FAQ 問題特徵。
4. **Docker 容器化 (運行環境)**：負責「貨櫃封裝」。我們將前端、後端、資料庫的運行環境與依賴套件（如 Python 庫、Node 模組）分別封裝成獨立的貨櫃（Container）。無論是在您的 Windows 電腦還是雲端伺服器，只要執行 Docker，系統就能以一模一樣的設定啟動，避免了「在我的電腦可以跑，在你的電腦就不行」的經典問題。

---

## 🛠️ 二、 核心開發工具的角色與分工

在專案中，您會看到許多工具，它們各自扮演著不可或缺的角色：

| 工具名稱 | 扮演角色 | 白話用途說明 |
| :--- | :--- | :--- |
| **Vite** | 前端編譯/打包器 | 傳統 React 啟動與編譯非常慢。Vite 採用極速的預編譯機制，讓前端能在 1 秒內啟動，並在程式碼修改時（熱重載 HMR）即時在瀏覽器看到效果。 |
| **Alembic** | 資料庫版本遷移工具 | 當您修改了 Python 的資料模型（Schema，例如新增一個欄位）時，不需要手動去資料庫下 SQL 修改。Alembic 會像 Git 一樣記錄資料庫的「版本歷史」，自動生成遷移腳本（Migration Script）並升級資料庫結構，確保本機與雲端資料庫結構一致。 |
| **SQLAlchemy** | ORM (對象關係映射) | 讓開發者可以用 Python 的物件導向語法（例如 `session.query(PowerGeneration)`）來操作資料庫，而不用手動寫一堆複雜且容易出錯的 `SELECT * FROM ...` SQL 語句。 |
| **Uvicorn / Gunicorn** | ASGI 伺服器 | FastAPI 本身只是代碼，需要一個伺服器來監聽 Port 並處理 HTTPS 請求。Uvicorn 是一個極速的非同步伺服器，負責在本機或生產環境中運行 FastAPI 應用；Gunicorn 則作為行程管理器（Process Manager）在生產環境管理多個 Uvicorn 行程，保證系統不崩潰。 |
| **Nginx** | 反向代理與網頁伺服器 | 前端 React 打包出來後只是靜態的 HTML/JS/CSS 檔案。Nginx 負責在雲端「分發」這些網頁給用戶，同時作為反向代理，將 `/api` 開頭的請求轉發給後端的 FastAPI 服務，解決跨域與路由問題。 |
| **Recharts** | 聲明式圖表庫 | 基於 SVG 的 React 圖表庫。它與 React 狀態（State）高度連動，只需將資料庫查出來的 JSON 丟給它，它就能自動畫出漂亮的自適應圖表與豐富的 Hover Tooltip。 |

---

## 📊 三、 數據的生命旅程：從政府 CSV 到前端圖表

本系統的資料流（Data Flow）運作路徑如下：

```
[政府開放平台/台電官網 CSV] 
       ↓ 
[Python ETL 腳本] (清理亂碼、民國年轉西元年、單位標準化為「億度」)
       ↓
[PostgreSQL / Supabase] (結構化寫入資料表，建立年度/月份/能源索引)
       ↓
[FastAPI REST API] (SQLAlchemy 自動查詢並過濾，轉換為 JSON 格式)
       ↓
[前端 Axios / Fetch] (跨域發起 HTTPS 請求，獲取 JSON 數據)
       ↓
[Recharts 渲染] (解析 JSON，動態生成 SVG 圖表與 YoY 增減標籤)
```

---

## 💬 四、 面試官必問的 6 大硬核問題與回答套路

如果您去面試，面試官一定會針對系統的「工程實踐細節」進行追問。以下為您準備了擬真的回答套路：

### Q1：你的前端部署在 GitHub Pages，後端在 Render，這會產生跨域 (CORS) 問題，你是如何解決的？
* **面試官想聽的**：你對 Web 安全機制（同源政策）的理解，以及 CORS 的設定細節。
* **推薦回答**：
  > 「因為前端託管在 GitHub Pages (`cocolate00.github.io`)，而後端在 Render (`onrender.com`)，兩者域名不同，瀏覽器會因為同源政策（Same-Origin Policy）攔截請求。
  > 我在 FastAPI 後端中使用了 `CORSMiddleware` 中介軟體，將前端的網址加入到 `allow_origins` 白名單中，並允許 `GET`、`POST` 等必要方法與 Headers。同時，在生產環境的 Docker 配置中，我利用環境變數 `FRONTEND_URL` 動態傳遞前端域名，確保在開發環境與雲端正式環境下，CORS 策略都是安全且最小權限開啟的。」

### Q2：為什麼你要使用 Docker Compose？它解決了什麼問題？
* **面試官想聽的**：容器化的實際價值，以及你在開發效率與環境隔離上的考量。
* **推薦回答**：
  > 「Docker Compose 解決了『環境一致性』與『服務編排』的痛點。本專案包含 React 前端、FastAPI 後端與 PostgreSQL 資料庫三個服務。如果不用 Docker Compose，開發者必須在本地安裝 Node.js、Python 虛擬環境與 PostgreSQL 軟體，且常會因為版本不一致或 Port 衝突導致配置失敗。
  > 透過 `docker-compose.yml`，我將這三個服務打包成一個互相隔離的網路組，開發者只需下一行指令 `docker compose up`，就能自動拉取映像檔、綁定 Port 口、掛載資料夾，在一分鐘內還原整套系統的運作環境。」

### Q3：當資料庫結構 (Schema) 改變時，你如何進行版本控制？
* **面試官想聽的**：資料庫遷移（Migration）的管理能力，避免手動改 Schema 導致本機與雲端不一致的業餘做法。
* **推薦回答**：
  > 「我使用 **SQLAlchemy** 定義資料模型，並搭配 **Alembic** 進行資料庫版本遷移控制。當需要新增資料表（如 RAG 向量表 `document_chunks`）時，我會在 Python 中定義 Model，然後執行 `alembic revision --autogenerate`，Alembic 會自動比對當前 Python 代碼與資料庫的 Schema 差異，生成一個帶有時間戳的遷移腳本（包含 `upgrade` 和 `downgrade` 方法）。
  > 在部署至雲端正式環境（如 Supabase）時，後端容器啟動前會先執行 `alembic upgrade head`，自動將雲端資料庫結構更新至最新版本，這完全避免了手動下 SQL 修改資料庫結構所帶來的資料遺失或環境不一致風險。」

### Q4：在 CI/CD (GitHub Actions) 中，你是如何注入正式環境 API 網址的？
* **面試官想聽的**：前端靜態建置時環境變數的注入時機（Build-time vs Run-time）。
* **推薦回答**：
  > 「因為 React 前端在建置（Vite build）時會將環境變數直接寫死打包進 JS 檔案中（屬於 Build-time 變數），所以無法在瀏覽器執行時才動態讀取雲端環境變數。
  > 我在 GitHub Actions 工作流中，利用 `env:` 區塊在執行 `npm run build` 前，將正式環境的後端 API 網址 `VITE_API_URL` 注入到系統環境變數中。另外，為了解決 YAML 轉義可能殘留引號導致 Nginx 解析出 `%22%22` 錯誤路由的 Bug，我採用了 YAML 字典格式 `VITE_API_URL: https://taiwan-electricity-dashboard.onrender.com` 進行精確傳遞，確保建置出來的靜態網頁能正確呼叫雲端後端。」

### Q5：如何設計自動化測試？你 Mock 了哪些部分？為什麼要 Mock？
* **面試官想聽的**：測試驅動開發 (TDD) 的概念，以及對測試邊界與 API 成本控制的理解。
* **推薦回答**：
  > 「我使用 **pytest** 與 **httpx** 建立了自動化單元與整合測試。核心測試重點在於驗證問答 API 的 **『0-Token 語意快取攔截邏輯』** 是否正常運作。
  > 在測試中，我 Mock（模擬）掉了 `EmbeddingService`。因為如果每次跑測試都去呼叫真實的 Gemini Embedding API，會產生網路延遲、消耗 API 額度（產生費用），且在無網路環境下測試會失敗。我透過 pytest fixture，在測試啟動前攔截 Embedding 呼叫，讓它直接回傳一組固定的浮點數向量。這樣我便能模擬『強匹配命中（相似度 >= 90%）』與『未匹配（相似度 < 90%）』兩種情境，確保在 100% 離線、0 成本的狀況下，驗證 API 路由的代碼邏輯正確性。」

### Q6：Render 免費版主機會自動休眠，你是如何解決冷啟動延遲的？
* **面試官想聽的**：對雲端免費資源限制的應變能力，以及主動優化用戶體驗的思維。
* **推薦回答**：
  > 「Render.com 的免費 Web Service 在 15 分鐘無人存取後會自動進入休眠休止狀態。當下一位使用者拜訪網站時，主機需要重新啟動 Docker 容器，這會造成高達 30 到 50 秒的『冷啟動 (Cold Start)』延遲，嚴重破壞使用者體驗。
  > 為了解決這個問題，我設計了兩個機制：
  > 第一，在後端提供一個極輕量、不查詢資料庫的 `/api/health` 健康檢查端點。
  > 第二，配置 **UptimeRobot 每 5 分鐘對該端點發送一次 GET 請求**。這顆『外部心跳』會持續喚醒後端容器，強迫 Render 認為系統一直處於活躍狀態，成功以零成本實現了 24/7 的即時回應。」
