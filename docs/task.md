# 任務清單 (Task List - 歷史完整版)

本清單完整記錄了「台灣電力觀測站」專案從初始化開發、數據導入、UI 清新重構、問答優化到正式雲端部署的所有階段任務進度。

---

## 🟢 Phase 1: 專案骨架初始化與故障排除
- [x] **建立 Docker 容器骨架**
  - [x] 建立前端 React + Vite 專案。
  - [x] 建立後端 Python + FastAPI 專案。
  - [x] 配置 PostgreSQL + pgvector 資料庫服務。
- [x] **排除連接埠衝突**
  - [x] 將後端埠口改為 `8080`，前端埠口改為 `3000`，解決 Host 埠口佔用與 Windows 權限封鎖問題。
  - [x] 執行 `docker compose up --build -d` 成功啟動並驗證 `/api/health` 正常連線。

---

## 🟢 Phase 2: 官方資料獲取與下載自動化
- [x] **研究官方數據規格**
  - [x] 研究政府開放資料平台與台電電力統計專區 API。
  - [x] 實作 Python 編解碼處理，克服 big5 / utf-8 中文亂碼。
- [x] **實作自動下載腳本**
  - [x] 撰寫並執行 `download_raw_data.py`。
  - [x] 成功將三份關鍵電力數據（發電量、用電量、部門用電）下載並存入 `data/raw/`。

---

## 🟢 Phase 3: 資料庫 Schema 遷移與 Seeding
- [x] **資料表 Model 建立與遷移**
  - [x] 新增 SQLAlchemy ORM 模型（發電、用電、行業分類）。
  - [x] 實作 Alembic 自動遷移，成功生成資料庫 schema 並同步。
- [x] **數據匯入與 Seeding**
  - [x] 實作 `seed_structured_data.py` 資料庫灌入腳本。
  - [x] 成功寫入 399 筆發電量及 462 筆用電消費歷史紀錄至 Supabase。

---

## 🟢 Phase 4: 數據 API 與前端 Recharts 圖表開發
- [x] **後端 REST API 路由控制器**
  - [x] 開發 `/api/charts` 發電與用電統計查詢 API。
- [x] **前端圖表組件開發**
  - [x] 串接 Recharts 開發多維度電力統計圖表。
  - [x] 實作發電量歷史趨勢（Area）、用電部門大水庫（Donut）、電力輸配損耗自用率趨勢等。

---

## 🟢 Phase 5: UI/UX 清新重構與功能深化
- [x] **轉化為「簡單清新」明亮風格**
  - [x] 背景全面改為 `bg-slate-50`，卡片改為純白底色 (`bg-white`)、細邊框 (`border-slate-200`) 與柔和陰影。
  - [x] 提升全站文字大小，改進字體可讀性。
- [x] **互動細節優化**
  - [x] 實作頂部四大 KPI 卡片滑鼠移入時彈出微型波形圖 (Sparkline Popover)。
  - [x] 實作發電走勢圖點擊跳轉「電力來源百科」分頁功能。
  - [x] 實作「僅顯示綠色能源」切換時與 PieChart 同步連動過濾。

---

## 🟢 Phase 6: 全站文字大小與可讀性重構優化
- [x] **調整 App.tsx 字體**
  - [x] 調整 Header API 連線狀態 Badge 的字體。
  - [x] 調整排查指南字體。
  - [x] 調整 Footer 版權宣告字體。
- [x] **調整 DashboardPage.tsx 字體**
  - [x] 調整 KPI 卡片輔助描述字體。
  - [x] 調整同比去年同期增減 YoY 與百分比字體。
  - [x] 調整圖表控制按鈕與篩選按鈕字體。
  - [x] 調整圖表單位/比例標籤字體。
  - [x] 調整「問 AI」與「匯出 CSV」按鈕字體。
  - [x] 調整底部科普與數據洞察文字字體。
- [x] **調整 EnergySourcesPage.tsx 字體**
  - [x] 調整 Tab 切換按鈕字體。
  - [x] 調整電力來源側欄選擇按鈕與「進口」標記字體。
  - [x] 調整詳細卡片內的運作原理、主要優勢與瓶頸正文字體。
  - [x] 調整 KPI 卡片與資料來源標籤字體。
  - [x] 調整 3 張供電挑戰大卡片正文與資料出處字體。
  - [x] 調整五色警示燈號說明與底部科普文字字體。
- [x] **調整 ChatPage.tsx 字體**
  - [x] 調整 AI 圖表單位標籤字體。
  - [x] 調整對話參考資料標籤字體。
  - [x] 調整對話結尾「您可能也想問」推薦按鈕與標題字體。
  - [x] 調整底部免責聲明字體。
- [x] **編譯與手動測試**
  - [x] 在 `energy_frontend` 容器中執行 `npm run build`，確保無編譯錯誤。
  - [x] 手動比對全站頁面，確認字體清晰、佈局協調。

---

## 🟢 Phase 7: 後端 API 重構與自動化測試建置
- [x] **更新後端依賴與環境**
  - [x] 在 `backend/requirements.txt` 中追加 `pytest` 與 `httpx`。
  - [x] 在 `backend` 容器中安裝依賴。
- [x] **重構問答 API (chat.py)**
  - [x] 修改 `backend/app/api/chat.py` 的問答邏輯。
  - [x] 當語意相似度 $< 0.90$ 時直接返回官方引導訊息與 Sources，降低 Token 並杜絕 AI 幻覺。
- [x] **建立測試套件**
  - [x] 新增 `backend/tests/conftest.py` 提供 `TestClient` 與 Mock 向量產生器。
  - [x] 新增 `backend/tests/test_health.py` 測試 `/api/health`。
  - [x] 新增 `backend/tests/test_charts.py` 測試 Charts API。
  - [x] 新增 `backend/tests/test_chat.py` 測試 FAQ 強匹配與低相似度引導轉送。
- [x] **測試執行與驗證**
  - [x] 在容器中執行 `pytest -v`，確保 100% 通過。
  - [x] 更新 `docs/walkthrough.md` 紀錄修改成效。

---

## 🟢 Phase 8: 本地生產環境模擬部署
- [x] **建立生產環境 Docker 與 Nginx 設定**
  - [x] 新增 `frontend/nginx.conf` 設定前端路由分發與 API 反向代理。
  - [x] 新增 `frontend/Dockerfile.prod` 優化多階段建置 React 靜態檔案。
  - [x] 新增 `docker-compose.prod.yml` 配置生產環境容器組。
  - [x] 在背景啟動 `docker compose -f docker-compose.prod.yml up --build -d`。
- [x] **初始化生產資料庫**
  - [x] 執行 Alembic 資料庫遷移命令建表（與 Alembic stamp head 同步）。
  - [x] 執行 Seeding 腳本導入 399 筆發電、462 筆用電以及 28 筆 FAQs 數據。
- [x] **手動功能測試與文件更新**
  - [x] 生產環境對接準備就緒，映射至宿主機 `3080` Port。

---

## 🟢 Phase 9: 正式雲端分離式部署與面試系統架構設計
- [x] **多雲正式環境配置與部署**
  - [x] 建立 `frontend/Dockerfile.prod` 與 `docker-compose.prod.yml` 排除本機資料庫依賴，節省雲端記憶體。
  - [x] 前端 React 透過 GitHub Actions 與 Pages 工作流建置，成功發布至 GitHub Pages，並精確注入生產端 Render API 網址。
  - [x] 後端 FastAPI 於 Render.com 成功通過 Docker 容器化部署並上線 (Live)。
  - [x] 雲端 Supabase PostgreSQL 資料庫順利開啟 `pgvector` 套件，並以 Alembic 完成遷移與建表。
- [x] **雲端連線故障排除與 Bug 修正**
  - [x] **IPv6 限制修復**：排除 Supabase 直連網址在 Docker 內部的 IPv6 解析連線失敗錯誤，將資料庫連線改用 Supabase 支援 IPv4 的 Session Pooler 網址。
  - [x] **CI/CD 環境變數引號轉義修正**：修正 GitHub Actions 建置時 Nginx 將 `VITE_API_URL` 解析出雙引號導致 %22 的問題，確保前端能安全跨域 (CORS) 呼叫後端 API。
- [x] **繪製面試專用系統設計圖與說明書**
  - [x] 使用 AI 圖像生成工具繪製出符合清新明亮風格的**系統架構概念藍圖**。
  - [x] 建立 `docs/system_design.md`，以 Mermaid 繪製多雲部署拓撲圖與 0-Token 語意快取攔截流程圖。
  - [x] 整理面試高頻提問的「技術亮點說詞」，協助在面試官前完美展示系統亮點。
