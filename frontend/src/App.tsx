import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, Loader2, BarChart3, MessageSquare } from 'lucide-react';
import logoUrl from './logo.png';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import EnergySourcesPage from './pages/EnergySourcesPage';

interface HealthResponse {
  status: string;
}

export default function App() {
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sources' | 'chat'>('dashboard');
  // 情境連動：從 Dashboard 帶入的自動提問內容
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');

  // 當 initialChatPrompt 被設定時，自動跳轉至 AI Chat 頁面
  useEffect(() => {
    if (initialChatPrompt) {
      setActiveTab('chat');
    }
  }, [initialChatPrompt]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const envUrl = (import.meta as any).env.VITE_API_URL;
        const apiUrl = envUrl !== undefined ? envUrl : 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/health`);
        if (res.ok) {
          const data: HealthResponse = await res.json();
          if (data.status === 'ok') {
            setHealthStatus('success');
          } else {
            setHealthStatus('error');
            setErrorMessage('API returned status not ok');
          }
        } else {
          setHealthStatus('error');
          setErrorMessage(`HTTP error: ${res.status}`);
        }
      } catch (err) {
        setHealthStatus('error');
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 md:p-6 font-sans antialiased selection:bg-cyan-200 selection:text-slate-900">
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center py-5 gap-4 border-b border-slate-200 pb-6 mb-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="台灣電力觀測站" className="w-12 h-12 object-contain" />
          <span className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-wider select-none">
            台灣電力觀測站
          </span>
        </div>

        {/* Navigation Tabs (Only show if backend connection is success) */}
        {healthStatus === 'success' && (
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <BarChart3 className="w-4 h-4" />
              電力儀表板
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'sources' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Activity className="w-4 h-4" />
              電力來源百科
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <MessageSquare className="w-4 h-4" />
              AI 能源問答
            </button>
          </div>
        )}

        {/* Backend Connection Status Badge */}
        <div className="flex items-center gap-2">
          {healthStatus === 'loading' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-sm font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
              API 連線中
            </span>
          )}
          {healthStatus === 'success' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-bold shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              系統連線成功
            </span>
          )}
          {healthStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold shadow-sm">
              <XCircle className="w-3.5 h-3.5" />
              API 連線失敗
            </span>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-start items-center">
        {healthStatus === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
            <p className="text-slate-500 text-sm font-medium">正在偵測後端服務狀態，請稍候...</p>
          </div>
        )}

        {healthStatus === 'error' && (
          <div className="w-full max-w-2xl py-12 flex flex-col items-center">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 mb-2">無法連接到後端服務</h2>
              <p className="text-slate-500 text-sm font-medium">請確認您的容器設定或 API 金鑰配置。</p>
            </div>
            
            <div className="w-full p-5 rounded-2xl bg-rose-50 border border-rose-250 text-rose-800 text-sm font-mono text-left overflow-x-auto mb-8 shadow-sm">
              <div className="font-bold mb-2">⚠️ 診斷錯誤詳細資訊：</div>
              <code>{errorMessage}</code>
            </div>

            <div className="w-full p-6 rounded-2xl bg-white border border-slate-200 text-left text-sm space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">🛠️ 快速排查建議：</h4>
              <ul className="list-disc list-inside space-y-2 text-slate-650">
                <li>請確認您已在終端機執行了 <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">docker compose up -d</code>。</li>
                <li>檢查 <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">.env</code> 檔案中的 <code className="text-cyan-600 font-semibold">GEMINI_API_KEY</code> 設定是否正確。</li>
                <li>可執行指令 <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">docker compose ps</code> 確認後端容器狀態。</li>
              </ul>
            </div>
          </div>
        )}

        {healthStatus === 'success' && (
          <div className="w-full">
            {activeTab === 'dashboard' && (
              <DashboardPage 
                onAskAI={(prompt: string) => setInitialChatPrompt(prompt)} 
                onNavigateToSources={() => setActiveTab('sources')}
              />
            )}
            {activeTab === 'sources' && (
              <EnergySourcesPage 
                onAskAI={(prompt: string) => setInitialChatPrompt(prompt)} 
              />
            )}
            {activeTab === 'chat' && (
              <ChatPage
                initialPrompt={initialChatPrompt}
                onPromptConsumed={() => setInitialChatPrompt('')}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto border-t border-slate-200 text-center py-6 mt-12 text-sm text-slate-400 z-10 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 台灣電力資料 Dashboard & RAG AI 系統. All rights reserved.</p>
        <p>Powered by FastAPI, React & Gemini API</p>
      </footer>
    </div>
  );
}
