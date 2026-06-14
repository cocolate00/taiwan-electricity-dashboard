# 📂 「台灣電力觀測站」專案說明文件地圖 (Documentation Map)

歡迎來到「台灣電力觀測站」說明文件目錄。本目錄完整記錄了本專案從初始化、UI 清新重構、自動化測試至正式生產環境分離式雲端部署的全部技術細節與工程實踐。

為了方便您（或面試官、未來的開發者）快速導覽，我們將文件整理如下：

---

## 🗺️ 文件目錄索引 (Documentation Index)

### 🌐 1. 系統架構與設計說明 (System Architecture)
* **[系統設計與架構說明書 (system_design.md)](system_design.md)**
  * **核心內容**：多雲分離式部署拓撲圖（Mermaid）、0-Token 語意快取攔截流程圖、資料庫 Schema 與向量索引設計、自動化測試系統架構。
  * **適合對象**：技術面試官、架構師、高級工程師。
* **[詳細開發架構解析 (development_architecture.md)](development_architecture.md)**
  * **核心內容**：AI 繪製的內部開發架構圖、前端 React 組件交互關係、後端三層式架構設計說明（Controller, Service, Repository）。
  * **適合對象**：對代碼實作細節與軟體工程分層有興趣的面試官、想快速學習元件架構的新手。
* **[技術棧系統架構圖 (tech_stack_architecture.md)](tech_stack_architecture.md)**
  * **核心內容**：AI 繪製的包含 React, FastAPI, Docker, PostgreSQL 官方代表圖標的實體架構視覺圖，以及精心著色美化後的 Mermaid 技術串接流向圖。
  * **適合對象**：準備面試簡報 (Slides) 或 GitHub README 展示的開發者。



### 🎓 2. 新手學習與面試實戰 (Interview & Learning)
* **[開發者學習與面試實戰指南 (developer_interview_guide.md)](developer_interview_guide.md)**
  * **核心內容**：專案技術棧的零基礎白話解析、各前端與後端工具的角色分工、資料的生命旅程流向，以及面試官必問的 6 大硬核問題與回答套路（如 CORS、Docker Compose、Alembic 遷移、CI/CD 變數注入、Pytest Mock 等）。
  * **適合對象**：專案開發新手、準備面試的開發者。

### 📑 3. AI 開發教訓與防錯指引 (Lessons Learned)
* **[AI 開發防錯教訓與未來指引手冊 (ai_lessons_learned.md)](ai_lessons_learned.md)**
  * **核心內容**：從頭到尾踩過的 9 大技術坑（如 IPv6 限制、變數引號轉義等）、AI 忽略中文註解的深度分析、強迫 AI 遵守規約的黃金指令，以及繁體中文台灣用語對照表。
  * **適合對象**：接手本專案的 AI 助理（我或其他 AI 程式助手）。

### 📜 4. 歷史軌跡與進度追蹤 (Development History)
* **[完整歷史開發日誌 (development_log.md)](development_log.md)** *(原 walkthrough.md)*
  * **核心內容**：從 Step 1 至 Step 34 每日開發時序日誌、關鍵 UI/UX 升級說明（清新主題、大字體、Sparkline Popover、2026年動態月度加總、百科跳轉與 hover 目標說明卡等）。
* **[任務追蹤清單歷史完整版 (task.md)](task.md)**
  * **核心內容**：Phase 1 到 Phase 9 完整任務清單 progress 追蹤。

---

## 🚀 專案展示亮點 (Highlights)
* **多雲免費架構**：React (GitHub Pages) + FastAPI (Render Docker 容器) + Supabase (PostgreSQL + pgvector)。
* **防休眠機制**：使用 UptimeRobot 心跳監控維持免費 Render 容器 24/7 甦醒，破除冷啟動延遲。
* **0-Token 快取**：FAQ 相似度 $\ge 0.90$ 物理攔截，0 呼叫成本，回應時間 $< 0.05$ 秒。
* **測試驅動**：使用 `pytest` + `httpx`，在 100% 離線 Mock 狀態下驗證 RAG 邏輯 100% 通過。
