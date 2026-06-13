import { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';
import { Send, Loader2, Sparkles, Bot, User, BarChart3, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; source_url: string }[];
  chartData?: ChartData | null;
}

interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  unit: string;
  xAxisKey: string;
  series: { key: string; name: string; color: string }[];
  data: Record<string, any>[];
}

const CHART_COLORS = ['#06b6d4', '#10b981', '#f97316', '#6366f1', '#eab308', '#ec4899'];

// 從 AI 回答的 markdown 文字中解析 [chart_data] JSON block
const parseChartData = (content: string): { text: string; chart: ChartData | null } => {
  const regex = /```json \[chart_data\]\s*([\s\S]*?)```/;
  const match = content.match(regex);
  if (!match) return { text: content, chart: null };

  const cleanText = content.replace(regex, '').trim();
  try {
    const chart = JSON.parse(match[1].trim()) as ChartData;
    return { text: cleanText, chart };
  } catch {
    return { text: cleanText, chart: null };
  }
};

// 將 markdown 文字簡易渲染為 HTML 結構
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="font-bold text-slate-800 text-sm mt-3 mb-1">{line.replace('### ', '')}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="font-bold text-slate-800 text-base mt-3 mb-1">{line.replace('## ', '')}</h2>;
    if (line.startsWith('# ')) return <h1 key={i} className="font-bold text-slate-800 text-lg mt-3 mb-1">{line.replace('# ', '')}</h1>;
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <li key={i} className="ml-4 list-disc text-slate-700" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-slate-800">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />;
  });
};

// 動態 Recharts 圖表渲染元件
const DynamicChart = ({ chart }: { chart: ChartData }) => {
  if (!chart || !chart.data || chart.data.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-cyan-600" />
        <span className="text-sm font-bold text-slate-700">{chart.title}</span>
        <span className="text-sm text-slate-550 bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-semibold">
          單位：{chart.unit}
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'pie' ? (
            <PieChart>
              <Pie
                data={chart.data}
                nameKey={chart.xAxisKey || 'name'}
                dataKey="value"
                cx="50%" cy="50%"
                outerRadius={80}
                paddingAngle={2}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {chart.data.map((_: any, idx: number) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: any) => [`${v} ${chart.unit}`]}
              />
            </PieChart>
          ) : chart.type === 'bar' ? (
            <BarChart data={chart.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={chart.xAxisKey || 'label'} fontSize={11} tickLine={false} stroke="#94a3b8" />
              <YAxis fontSize={11} tickLine={false} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: any) => [`${v} ${chart.unit}`]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              {chart.series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : (
            // 預設：折線圖 (line)
            <LineChart data={chart.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={chart.xAxisKey || 'label'} fontSize={11} tickLine={false} stroke="#94a3b8" />
              <YAxis fontSize={11} tickLine={false} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: any) => [`${v} ${chart.unit}`]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              {chart.series.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ChatPageProps {
  initialPrompt: string;
  onPromptConsumed: () => void;
}

export default function ChatPage({ initialPrompt, onPromptConsumed }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const envUrl = (import.meta as any).env.VITE_API_URL;
  const apiUrl = envUrl !== undefined ? envUrl : 'http://localhost:8080';

  // 自動滾動到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 情境連動：若收到 initialPrompt 則自動送出
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInput(initialPrompt);
      // 短暫延遲以確保元件已完全掛載
      const timer = setTimeout(() => {
        handleSend(initialPrompt);
        onPromptConsumed();
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const history = newMessages
        .slice(0, -1)
        .reduce<{ prompt: string; response: string }[]>((acc, msg, idx, arr) => {
          if (msg.role === 'user' && arr[idx + 1]?.role === 'assistant') {
            acc.push({ prompt: msg.content, response: arr[idx + 1].content });
          }
          return acc;
        }, []);

      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();

      // 解析 AI 回答中的圖表數據
      const { text: cleanText, chart } = parseChartData(data.answer || '');

      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanText,
        sources: data.sources || [],
        chartData: chart,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    '台灣再生能源 2025 年的政策目標是什麼？目前達成率如何？',
    '為什麼高科技半導體業是台灣最大的用電產業？',
    '夏季電力輸配損耗率為什麼比冬季高？',
    '台灣智慧電網政策有哪些具體目標？',
  ];

  return (
    <div className="w-full flex flex-col h-[calc(100vh-160px)] min-h-[600px]">
      {/* 聊天訊息區域 */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {/* 歡迎畫面（無訊息時顯示） */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-center py-8">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">台灣電力觀測站 · AI 能源顧問</h2>
              <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                基於台灣電力政策文件與能源科普知識庫的 AI 助理。您可以詢問用電趨勢、再生能源政策、電網效率等問題。
              </p>
            </div>

            {/* 建議問題快速選項 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all text-sm text-slate-700 font-medium group"
                >
                  <span className="text-cyan-500 mr-2 group-hover:scale-110 inline-block transition-transform">💡</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 訊息泡泡 */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[78%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              {/* 訊息氣泡本體 */}
              <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="space-y-1">{renderMarkdown(msg.content)}</div>
                )}
              </div>

              {/* AI 動態圖表（若有） */}
              {msg.role === 'assistant' && msg.chartData && (
                <DynamicChart chart={msg.chartData} />
              )}

              {/* 參考來源（若有） */}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.sources.map((s, si) => (
                    <span
                      key={si}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-semibold"
                    >
                      📄 {s.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {/* 對話結束後的推薦問題 */}
        {messages.length > 0 && !loading && messages[messages.length - 1].role === 'assistant' && (
          <div className="flex flex-col gap-2.5 mt-2 pl-11 animate-fade-in">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> 您可能也想問：
            </span>
            <div className="flex flex-wrap gap-2 max-w-4xl animate-fade-in">
              {[
                '請說明目前台灣電網有哪些最急迫的供電威脅？並請分析半導體擴廠、夜尖峰、與進口依存度的多重風險。',
                '台灣再生能源 2025 年的政策目標是什麼？目前達成率如何？',
                '為什麼高科技半導體業是台灣最大的用電產業？'
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-md hover:scale-[1.01] transition-all text-sm text-slate-700 font-bold shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading 動畫 */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
              <span className="text-sm text-slate-500">AI 正在思考與查詢知識庫...</span>
            </div>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>連線發生錯誤：{error}，請稍後再試。</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 輸入區域 */}
      <div className="border-t border-slate-200 bg-white pt-4">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="詢問台灣電力、能源政策或用電趨勢問題... (Enter 送出，Shift+Enter 換行)"
            rows={2}
            className="flex-1 resize-none px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center font-medium">
          台灣電力觀測站基於台灣電力統計數據與政策文件，回答僅供參考，請以官方來源為準。
        </p>
      </div>
    </div>
  );
}
