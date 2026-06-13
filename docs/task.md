# 任務清單 (Task List)

## Phase 6: 全站文字大小與可讀性重構優化

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
  - [x] 調整對話參考資料標籤字體.
  - [x] 調整對話結尾「您可能也想問」推薦按鈕與標題字體。
  - [x] 調整底部免責聲明字體。

- [x] **編譯與手動測試**
  - [x] 在 `energy_frontend` 容器中執行 `npm run build`，確保無編譯錯誤。
  - [x] 手動比對全站頁面，確認字體清晰、佈局協調。

## Phase 7: 後端 API 重構與自動化測試建置

- [x] **更新後端依賴與環境**
  - [x] 在 `backend/requirements.txt` 中追加 `pytest` 與 `httpx`。
  - [x] 在 `backend` 容器中安裝依賴。

- [x] **重構問答 API (chat.py)**
  - [x] 修改 `backend/app/api/chat.py` 的問答邏輯。
  - [x] 當語意相似度 $< 0.90$ 時直接返回官方引導訊息與 Sources，移除 pgvector 一般檢索與 LLM 呼叫。

- [x] **建立測試套件**
  - [x] 新增 `backend/tests/conftest.py` 提供 `TestClient` 與 Mock 向量產生器。
  - [x] 新增 `backend/tests/test_health.py` 測試 `/api/health`。
  - [x] 新增 `backend/tests/test_charts.py` 測試 Charts API。
  - [x] 新增 `backend/tests/test_chat.py` 測試 FAQ 強匹配與低相似度引導轉送。

- [x] **測試執行與驗證**
  - [x] 在容器中執行 `pytest -v`，確保 100% 通過。
  - [x] 更新 `docs/walkthrough.md` 紀錄修改成效。

## Phase 8: 本地生產環境模擬部署

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
  - [x] 更新 `docs/walkthrough.md` 與本 `task.md`。

