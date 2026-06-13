# 全站文字大小重構與可讀性優化實作計畫

為了解決系統在不同解析度下「很多字體過小（如 10px、11px 或 12px）」的可讀性問題，本計畫旨在進行一次系統性的字體調整。我們將全站小於 14px (text-sm) 的文字進行分級提升，確保其符合「清新簡潔、可讀性佳」的 UI/UX 設計美學。

---

## 🛠️ 規劃與調整分級表

為了讓全站字體大小有一致的格調，我們定義以下字體大小調整對照：

| 類別與原 Class | 建議調整 Class | 適用場景 |
| :--- | :--- | :--- |
| **微小標籤** <br> `text-[10px]` / `text-[11px]` | `text-xs` (12px) | YoY 增減正負值、圖表內的微小備註、資料來源標記。 |
| **輔助說明與按鈕** <br> `text-xs` (12px) | `text-sm` (14px) | KPI 卡片輔助說明、圖表單位、各類功能按鈕（問 AI、匯出 CSV、Tab 切換）、頁尾資訊。 |
| **卡片與內容正文** <br> `text-xs` / `text-sm` | `text-sm` (14px) / `text-base` (16px) | 供電挑戰三張卡片正文、百科原理與瓶頸正文、免責聲明、對話氣泡內文。 |
| **小標題與卡片標題** <br> `text-sm` / `text-base` | `text-base` (16px) / `text-lg` (18px) | 指標小標題、區塊副標題、對話氣泡內標題。 |

---

## 📋 具體程式碼 Proposed Changes

### 1. App.tsx (外層版面與 Footer)
- **[MODIFY]** [App.tsx](file:///c:/Users/kejun/Desktop/Project/electric/frontend/src/App.tsx)
  - 將 L95, L101, L107 (API 連線狀態 Badge) 的 `text-xs` 提升為 `text-sm`。
  - 將 L139-142 (連線錯誤排查條目) 的 `text-xs` 提升為 `text-sm`。
  - 將 L171 (頁尾 Footer 版權宣告) 的 `text-xs` 提升為 `text-sm`。

### 2. DashboardPage.tsx (電力儀表板)
- **[MODIFY]** [DashboardPage.tsx](file:///c:/Users/kejun/Desktop/Project/electric/frontend/src/pages/DashboardPage.tsx)
  - 將四大 KPI 指標卡片下方的輔助說明文字 (L910, L949, L988, L1027) 從 `text-xs` 提升為 `text-sm`。
  - 將卡片右側與圖表 Tooltip 中的「相較去年同期增減」文字由 `text-[10px]` 提升為 `text-xs`；YoY 的百分比與數值 (L195, L271) 由 `text-[10px]` 提升至 `text-xs font-semibold`。
  - 將圖表控制按鈕 (L849, L857) 及篩選器按鈕 (L873) 由 `text-xs` 提升至 `text-sm`。
  - 將「單位：億度/占比」等圖表右上角標籤 (L1102, L1179, L1307) 由 `text-xs` 提升至 `text-sm`，並加粗。
  - 將「問 AI」與「匯出 CSV」按鈕 (L1090, L1097, L1174, L1295, L1302) 的字體從 `text-xs` 提升至 `text-sm`，按鈕稍微加大以提供更好的點擊反饋。
  - 將圖表底部的「數據洞察」文字 (L1062, L1270, L1438) 由 `text-xs` 提升至 `text-sm`。
  - 將電網自用損耗率趨勢圖底部的科普正文 (L1511, L1516, L1519) 由 `text-xs` 提升至 `text-sm`。

### 3. EnergySourcesPage.tsx (電力百科與挑戰)
- **[MODIFY]** [pages/EnergySourcesPage.tsx](file:///c:/Users/kejun/Desktop/Project/electric/frontend/src/pages/EnergySourcesPage.tsx)
  - 將 Tab 切換按鈕 (L215, L226) 由 `text-xs` 提升至 `text-sm`。
  - 將電力來源側邊選擇欄標題 (L242) 由 `text-xs` 提升至 `text-sm`；「進口」Badge (L264) 由 `text-[10px]` 提升至 `text-xs`。
  - 將詳細卡片內的運作原理提示 (L285) 與「向 AI 諮詢此能源」按鈕 (L292) 由 `text-xs` 提升至 `text-sm`。
  - 將 KPI 指標卡片標題 (L304, L316) 由 `text-xs` 提升至 `text-sm`；輔助描述 (L307, L309, L322) 提升至 `text-sm`。
  - 將資料來源官方出處 (L401) 由 `text-[10px]` 提升至 `text-xs`。
  - 將供電挑戰的三張大卡片正文 (L452, L468, L484) 由 `text-xs` 提升至 `text-sm`。
  - 將供電挑戰底部數據來源 (L456, L472, L488) 由 `text-[10px]` 提升至 `text-xs`。
  - 將備轉容量五色燈號卡片標題與說明 (L501, L518) 的 `text-xs` 提升至 `text-sm`；卡片內百分比範圍 (L524) 由 `text-[10px]` 提升至 `text-xs font-mono`。
  - 將備轉容量底部科普小知識正文 (L535) 由 `text-xs` 提升至 `text-sm`。

### 4. ChatPage.tsx (AI 對話頁)
- **[MODIFY]** [pages/ChatPage.tsx](file:///c:/Users/kejun/Desktop/Project/electric/frontend/src/pages/ChatPage.tsx)
  - 將 AI 圖表右上角的「單位：億度」標籤 (L71) 由 `text-xs` 提升至 `text-sm`。
  - 將對話結尾的參考資料來源標籤 (L305) 由 `text-[10px]` 提升至 `text-xs`。
  - 將對話結束後的「您可能也想問」標題 (L325) 由 `text-[10px]` 提升至 `text-xs`；推薦問題按鈕 (L337) 由 `text-xs` 提升至 `text-sm`。
  - 將底部免責聲明與備註 (L390) 由 `text-[10px]` 提升至 `text-xs`。

---

## 🔬 驗證計劃

### 自動化 / 建置驗證
- 在 `frontend` 容器中執行 `npm run build`，確保無 TypeScript 型別或語法錯誤。

- 進入 AI 問答，檢查對話結束後的推薦問題按鈕、參考資料來源標籤與底部免責聲明的字體，確認可讀性高。

---

# 後端 API 與 RAG 語意檢索自動化測試實作計畫

為了解決後端 API 穩定性，並自動驗證 AI RAG 問答系統中的「FAQ 語意快取攔截器」與「非 FAQ 問答官方來源引導機制」，本計畫旨在重構問答 API 並建立一套以 `pytest` 驅動的後端自動化測試套件。

## 🛠️ 後端問答邏輯重構 Proposed Changes

### [MODIFY] [chat.py](file:///c:/Users/kejun/Desktop/Project/electric/backend/app/api/chat.py)
* **FAQ 強匹配（相似度 $\ge 0.90$）**：維持不變，直接從資料庫撈出該問答對與圖表並直接回傳（Token = 0，LLM = 否）。
* **FAQ 未匹配或低於閥值（相似度 $< 0.90$）**：**移除**傳統的政策與科普文件檢索（pgvector 檢索），且**不呼叫** LLM 生成回答。改為直接回傳友好的官方網站引導訊息，並在 `sources` 欄位中附上台灣電力公司官網、經濟部能源署官網、國家再生能源憑證中心官網的連結（Token = 0，LLM = 否）。

---

## 🧪 測試套件 Proposed Changes

### [MODIFY] [requirements.txt](file:///c:/Users/kejun/Desktop/Project/electric/backend/requirements.txt)
* 追加 `pytest>=8.0.0` 與 `httpx>=0.27.0`。

### [NEW] backend/tests (自動化測試套件)

#### [NEW] [conftest.py](file:///c:/Users/kejun/Desktop/Project/electric/backend/tests/conftest.py)
* 配置 FastAPI 的 `TestClient` fixture。
* 設計全域的 `mock_embedding_service`，攔截外部 API 向量化調用（提供預設向量以支援相似度比對測試），同時避免消耗真實 Embedding API 額度。

#### [NEW] [test_health.py](file:///c:/Users/kejun/Desktop/Project/electric/backend/tests/test_health.py)
* 測試 `/api/health` 路由，確保返回狀態為 `"ok"`。

#### [NEW] [test_charts.py](file:///c:/Users/kejun/Desktop/Project/electric/backend/tests/test_charts.py)
* 測試 `/api/charts/generation` 與 `/api/charts/industry-consumption` 的連線與回應格式。

#### [NEW] [test_chat.py](file:///c:/Users/kejun/Desktop/Project/electric/backend/tests/test_chat.py)
* 測試 `/api/chat` 的問答功能：
  * **強匹配 FAQ 攔截測試**：Mock embedding 使其匹配資料庫中的某筆 FAQ (相似度 $\ge 0.90$)，驗證 API 成功回傳 FAQ 內容，且 LLM 未被呼叫。
  * **官方引導轉送測試**：Mock embedding 使其相似度 $< 0.90$，驗證系統直接返回制式官方引導訊息與 3 個官方 Sources 連結，且 LLM 未被呼叫。

---

## Verification Plan

### Automated Tests
* 在後端容器內部執行測試命令：
  `docker compose exec backend pytest -v`
* 確保所有單元測試皆 100% 通過。

---

# 本地生產環境模擬部署計畫

為了驗證系統在正式環境的效能、確保 Nginx 靜態分發與 API 反向代理正常運作，本計畫新增了一套本地生產環境（Production）部署方案。

## 🛠️ 生產環境 Proposed Changes

### [NEW] [nginx.conf](file:///c:/Users/kejun/Desktop/Project/electric/frontend/nginx.conf)
* 配置前端 Nginx 伺服器，監聽 `80` Port。
* 設定靜態分發 React 的 `dist/`，並加入 `try_files` 機制支援 SPA 路由。
* 設定反向代理 `/api` 請求至後端 `http://backend:8000`，解決 CORS 問題。

### [NEW] [Dockerfile.prod](file:///c:/Users/kejun/Desktop/Project/electric/frontend/Dockerfile.prod)
* 前端多階段構建（Multi-stage build）：
  * **Stage 1 (builder)**：使用 Node 鏡像編譯 React 程式碼，將 `VITE_API_URL` 設定為空字串，以在生產環境中自動改用相對路徑。
  * **Stage 2**：使用 Nginx 鏡像，將 Stage 1 的 `dist/` 靜態檔案複製入 html 目錄，並套用 `nginx.conf`。

### [NEW] [docker-compose.prod.yml](file:///c:/Users/kejun/Desktop/Project/electric/docker-compose.prod.yml)
* 編排正式環境容器組（包含 `energy_db_prod`、`energy_backend_prod`、`energy_frontend_prod`）。
* 對外僅暴露前端 Nginx 服務的 `3080:80` Port，保障後端及資料庫不直接對外開放。
* 後端啟動指令（CMD）重寫，移除 `--reload` 參數以提升生產效能。
* 獨立資料庫 volume（`db_prod_data`）與連接埠（`5433`），確保與開發環境完全隔離、互不干涉。

## 🔬 部署驗證計劃
1. 執行 `docker compose -f docker-compose.prod.yml up --build -d` 啟動容器。
2. 執行 Alembic 遷移與 seeding 初始化生產資料庫。
3. 瀏覽器開啟 `http://localhost:3080`，手動驗證 Dashboard 載入速度與 AI 問答功能。


