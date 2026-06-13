import { useState } from 'react';
import { 
  BookOpen, AlertTriangle, ShieldAlert, Zap, Leaf, Flame, Cpu,
  Info, Award, Compass, RefreshCw
} from 'lucide-react';

interface EnergyDetail {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  mechanism: string;
  taiwanStatus: string;
  isImported: boolean;
  importRate?: string;
  importSources?: string;
  safetyDays?: string;
  share2025: string; // 2025年發電占比
  shareDescription: string;
  pros: string[];
  cons: string[];
  dataSource: string;
  dataSourceUrl: string;
}

export default function EnergySourcesPage({ onAskAI }: { onAskAI?: (prompt: string) => void }) {
  const [activeTab, setActiveTab] = useState<'encyclopedia' | 'challenges'>('encyclopedia');
  const [selectedEnergy, setSelectedEnergy] = useState<string>('gas');

  const energyDetails: Record<string, EnergyDetail> = {
    gas: {
      id: 'gas',
      name: '天然氣 (燃氣)',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      mechanism: '利用液化天然氣 (LNG) 燃燒產生的高壓高溫氣體推動氣渦輪發電機發電；並可結合蒸氣渦輪進行複循環發電，熱效率高且碳排較燃煤減半。',
      taiwanStatus: '目前為台灣發電結構占比第一的主力來源（約占 40%~44%）。台灣本島設有永安（一接）、台中（二接）兩大液化天然氣接收站，目前正積極興建大潭（三接），以因應「以氣代煤」的國家能源轉型政策。',
      isImported: true,
      importRate: '99.3%',
      importSources: '卡達、澳洲、俄羅斯、美國',
      safetyDays: '7 ~ 11 天 (夏季高負載時更短)',
      share2025: '47.8%',
      shareDescription: '2025年發電占比第一主力機組',
      pros: [
        '碳排放量與空污物約為燃煤發電的一半。',
        '起停反應迅速（15~30分鐘），極適合擔任應對再生能源波動的救援調度電源。',
        '建廠週期較核電與大型煤電廠短。'
      ],
      cons: [
        '燃料幾乎全數仰賴船運進口，海上運輸極易受地緣政治衝突或颱風影響。',
        '安全存量天數極低（7~11天），面臨海上封鎖時極度脆弱。',
        '發電成本高度受國際天然氣期貨價格波動影響。'
      ],
      dataSource: '台灣電力公司 - 歷年發購電量統計',
      dataSourceUrl: 'https://www.taipower.com.tw'
    },
    coal: {
      id: 'coal',
      name: '燃煤',
      icon: Flame,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      mechanism: '燃燒煤炭加熱鍋爐產生高壓高溫蒸氣，推動汽輪發電機運轉產生電能。',
      taiwanStatus: '長期為台灣的主要基載發電主力（占比約 35%~39%），提供穩定的低成本電源。指標廠區包括台電台中發電廠（中火，世界級大型煤電廠之一）、達興電廠及麥寮民營電廠。',
      isImported: true,
      importRate: '100%',
      importSources: '澳洲、印尼、俄羅斯',
      safetyDays: '30 天以上',
      share2025: '35.4%',
      shareDescription: '2025年發電占比第二主力基載',
      pros: [
        '發電成本在所有火力發電中最低，能有效平抑電價。',
        '安全存量天數長（30天以上），燃料來源多元，相較天然氣更具備國防安全韌性。',
        '發電極度穩定，不受氣候影響。'
      ],
      cons: [
        '二氧化碳排放量居所有發電形式之首，是溫室效應的主要推手。',
        '燃燒會產生懸浮微粒 (PM2.5)、硫氧化物及氮氧化物，面臨極大環保爭議與地方減煤壓力。',
        '老舊煤電機組面臨除役與環保轉型的迫切需求。'
      ],
      dataSource: '台灣電力公司 - 歷年發購電量統計',
      dataSourceUrl: 'https://www.taipower.com.tw'
    },
    solar: {
      id: 'solar',
      name: '太陽光電',
      icon: Zap,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      mechanism: '利用半導體材料的光電效應，將太陽光輻射直接轉換成直流電，再經由逆變器 (Inverter) 轉換為交流電併入電網。',
      taiwanStatus: '為台灣裝置容量成長最快的再生能源，截至 2025 年底全台累計裝置量已突破 15 GW。主要分布在日照充足的中南部，形式包括屋頂型、地面型、漁電共生及滯洪池水面型。',
      isImported: false,
      share2025: '5.5%',
      shareDescription: '2025年發電量 159.75 億度 (占再生能源 42%)',
      pros: [
        '發電過程完全無溫室氣體與空污排放，且無燃料成本。',
        '夏日白天中午為發電高峰，能完美對齊並壓低夏季冷氣空調的「日尖峰負載」。',
        '建置規模具彈性，可實現分散式區域發電，降低電網傳輸損耗。'
      ],
      cons: [
        '受氣候與晝夜限制，夜間發電量歸零，梅雨季及陰雨天出力大幅下滑。',
        '土地需求量大，易與農業、漁業及生態保育產生衝突。',
        '光電板老舊後的回收處理在未來是一大環保課題。'
      ],
      dataSource: '經濟部能源署 - 再生能源推廣與裝置量統計',
      dataSourceUrl: 'https://ea01.moeaea.gov.tw'
    },
    wind: {
      id: 'wind',
      name: '風力發電',
      icon: Leaf,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      mechanism: '利用風力吹動風力發電機的葉片旋轉，透過增速齒輪箱帶動發電機產生電能。分為陸域風力與離岸風力。',
      taiwanStatus: '台灣海峽被評為世界級的優良離岸風場。政府目前正全力推動第三階段離岸風力區塊開發，多個大型離岸風場如苗栗外海、彰化外海案場均已陸續併網發電。',
      isImported: false,
      share2025: '4.2%',
      shareDescription: '2025年發電量 122.02 億度',
      pros: [
        '完全無碳排放與空氣污染，且不消耗水資源。',
        '台灣秋冬季東北季風盛行，此時風力出力極大，能有效彌補冬季太陽光電減少的缺口。',
        '發電效率高，離岸風機單機容量大。'
      ],
      cons: [
        '發電受風速與風向限制，具高度間歇性。特別是夏季用電尖峰時，常因無風而導致風電出力極低。',
        '建置與維護成本極高，離岸風機需面對颱風、地震及海纜腐蝕等嚴苛海洋環境。',
        '陸域風機面臨低頻噪音爭議；離岸風機則面臨中華白海豚保育與漁民補償問題。'
      ],
      dataSource: '經濟部能源署 - 離岸風電推廣實績統計',
      dataSourceUrl: 'https://ea01.moeaea.gov.tw'
    },
    nuclear: {
      id: 'nuclear',
      name: '核能',
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      mechanism: '利用可裂變物質 (如鈾-235) 進行受控核分裂鏈反應，釋放巨大熱能將水加熱為蒸氣，推動汽輪發電機發電。',
      taiwanStatus: '配合政府非核家園政策，核一廠與核二廠已如期除役，核三廠也已逐步進入除役規劃，目前核能發電占台灣總體發電比重已降至 5% 以下。',
      isImported: true,
      importRate: '100%',
      importSources: '美國、加拿大、歐洲',
      safetyDays: '1.5 年 (每批燃料可運轉 18 個月)',
      share2025: '1.1%',
      shareDescription: '核三機組除役中，占比降至歷史低點',
      pros: [
        '發電穩定性極高，可提供不間斷的巨量廉價基載電力。',
        '運轉期間幾乎零碳排放，無空污與懸浮微粒問題。',
        '燃料能量密度極高，安全存量天數長達 1.5 年以上，不易受短期地緣政治海上封鎖影響。'
      ],
      cons: [
        '核廢料（特別是高放射性用過核子燃料）的最終處置場選址與技術在台灣面臨強大抗爭與難題。',
        '地處環太平洋地震帶，大眾對核子事故的安全疑慮高。',
        '電廠除役期長達 25 年以上，且後續除役與建廠拆除費用極為龐大。'
      ],
      dataSource: '行政院核能安全委員會 - 核能安全與運轉實績',
      dataSourceUrl: 'https://www.nusc.gov.tw'
    },
    hydro: {
      id: 'hydro',
      name: '慣常水力',
      icon: Compass,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      mechanism: '利用水往低處流的重力位能，推動水輪機旋轉帶動發電機產生電能。主要建於山區河川上游。',
      taiwanStatus: '台灣水力發電歷史悠久，大甲溪流域與濁水溪流域設有多個梯級水力發電廠。慣常水力多做為調節用電尖峰之用。',
      isImported: false,
      share2025: '1.9%',
      shareDescription: '2025年發電量 55 億度 (第一線緊急調度水源)',
      pros: [
        '起動速度極快（能在5~10分鐘內從靜止達到滿載），是電網應急、跳機事故時的「第一線救援主力」。',
        '發電完全無碳排，運轉壽命極長，成本極低。',
        '水力水庫兼具防洪、灌溉、民生用水調節等多元效益。'
      ],
      cons: [
        '發電量完全受梅雨、颱風等自然降雨天候制約，乾旱年份發電量會急劇下滑。',
        '山區建廠會對河流生態、魚類洄游造成阻礙，且水庫泥沙淤積會降低使用壽命。',
        '適合開發的優良水利場址在台灣已趨近飽和。'
      ],
      dataSource: '台灣電力公司 - 大甲溪/濁水溪水力機組運轉日誌',
      dataSourceUrl: 'https://www.taipower.com.tw'
    }
  };

  const reserveLights = [
    { name: '綠燈 (供電充裕)', range: '備轉容量率 >= 10%', color: 'bg-emerald-500', text: '系統供電非常充裕，能輕鬆應對突發跳機。' },
    { name: '黃燈 (供電吃緊)', range: '備轉容量率 6% ~ 10%', color: 'bg-amber-400', text: '系統供電機組稍嫌緊湊，若有大型機組意外跳機，系統會面臨警戒。' },
    { name: '橘燈 (供電警戒)', range: '系統備轉容量 < 90萬瓩 (約 < 2.5%)', color: 'bg-orange-500', text: '供電極度緊澀。若有大型機組跳機，系統將面臨限電危機。' },
    { name: '紅燈 (限電準備)', range: '系統備轉容量 < 50萬瓩', color: 'bg-rose-500', text: '限電邊緣。系統隨時可能啟動工業大戶減載或卸載。' },
    { name: '黑燈 (開始限電)', range: '系統備轉容量 = 0', color: 'bg-slate-900', text: '分區輪流限電或緊急卸載以防範全台電網大崩潰。' }
  ];

  const currentEnergy = energyDetails[selectedEnergy];

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-cyan-600" />
            電力來源百科與供電窘迫挑戰
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            帶您了解台灣各類型電力來源的生產機制、高依存度進口現況，以及電網正面臨的窘迫危機。
          </p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 self-start">
          <button
            onClick={() => setActiveTab('encyclopedia')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'encyclopedia'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            電力來源小百科
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'challenges'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            台灣供電挑戰 (窘迫現況)
          </button>
        </div>
      </div>

      {activeTab === 'encyclopedia' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Energy Selector Buttons */}
          <div className="lg:col-span-1 space-y-2.5">
            <span className="text-sm font-black text-slate-400 block px-2 uppercase tracking-wider">選擇電力來源</span>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {Object.values(energyDetails).map((energy) => {
                const Icon = energy.icon;
                const isSelected = selectedEnergy === energy.id;
                return (
                  <button
                    key={energy.id}
                    onClick={() => setSelectedEnergy(energy.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border font-bold text-sm transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-600 text-white shadow-md scale-[1.01]'
                        : 'bg-white border-slate-200 text-slate-650 hover:border-slate-350 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500 text-white' : `${energy.bgColor} ${energy.color}`}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{energy.name}</span>
                    </div>
                    {energy.isImported && (
                      <span className={`text-xs px-2 py-0.5 rounded-md font-extrabold ${isSelected ? 'bg-cyan-700 text-cyan-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        進口
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Card */}
          <div className="lg:col-span-3 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between animate-fade-in min-h-[520px]">
            <div className="space-y-6">
              {/* Header inside detailed card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${currentEnergy.bgColor} ${currentEnergy.color}`}>
                    <currentEnergy.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800">{currentEnergy.name}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">運作原理與台灣現況介紹</p>
                  </div>
                </div>

                {onAskAI && (
                  <button
                    onClick={() => onAskAI(`請詳細分析台灣的${currentEnergy.name}發發電來源、現況瓶頸以及其在整體國家能源政策中的角色。`)}
                    className="flex items-center gap-1.5 text-sm px-3.5 py-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 hover:bg-cyan-100 transition-all font-extrabold self-start sm:self-center"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    向 AI 諮詢此能源
                  </button>
                )}
              </div>

              {/* Focus stats cards (2025 Share & Import Dependency) - VERY BOLD & BIG FONTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2025 Share Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">2025 年發電占比</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-cyan-600">{currentEnergy.share2025}</span>
                    <span className="text-sm text-slate-450 font-bold">全台占比</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{currentEnergy.shareDescription}</p>
                </div>

                {/* Import Status Card */}
                <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                  currentEnergy.isImported ? 'bg-rose-50/60 border-rose-100' : 'bg-emerald-50/60 border-emerald-100'
                }`}>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">燃料來源自給率</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${currentEnergy.isImported ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {currentEnergy.isImported ? `${currentEnergy.importRate} 進口` : '100% 自主'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {currentEnergy.isImported 
                      ? `安全存量僅約 ${currentEnergy.safetyDays}` 
                      : '本土純天然自主綠色能源'
                    }
                  </p>
                </div>
              </div>

              {/* Import Safety Warning Box (For coal, gas, nuclear) */}
              {currentEnergy.isImported && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                  <ShieldAlert className="w-5.5 h-5.5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-rose-800 leading-relaxed">
                    <span className="font-extrabold text-sm block mb-1">⚠️ 能源安全國防警戒</span>
                    台灣 {currentEnergy.name} 燃料 **{currentEnergy.importRate}** 仰賴船運進口，主要來自 **{currentEnergy.importSources}**。
                    國內天然氣及煤炭安全存量期限極短（液化天然氣僅約 **{currentEnergy.safetyDays}**），在地緣政治封鎖或極端氣候封鎖下，斷網風險極高。
                  </div>
                </div>
              )}

              {/* Grid content: Mechanism & Status - LARGER FONTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2.5">
                  <h4 className="font-black text-base md:text-lg text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-cyan-500 rounded-full inline-block" />
                    發電機制與物理原理
                  </h4>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100">
                    {currentEnergy.mechanism}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-black text-base md:text-lg text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-cyan-500 rounded-full inline-block" />
                    台灣發展現況與主要廠區
                  </h4>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100">
                    {currentEnergy.taiwanStatus}
                  </p>
                </div>
              </div>

              {/* Pros and Cons - LARGER FONTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2.5">
                  <h4 className="font-black text-base md:text-lg text-emerald-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block" />
                    發電主要優勢
                  </h4>
                  <ul className="space-y-2.5 pl-1.5">
                    {currentEnergy.pros.map((pro, index) => (
                      <li key={index} className="text-sm md:text-base text-slate-600 flex items-start gap-2">
                        <span className="text-emerald-500 font-extrabold mt-0.5">•</span>
                        <span className="leading-relaxed">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-black text-base md:text-lg text-rose-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-rose-500 rounded-full inline-block" />
                    主要瓶頸與隱憂
                  </h4>
                  <ul className="space-y-2.5 pl-1.5">
                    {currentEnergy.cons.map((con, index) => (
                      <li key={index} className="text-sm md:text-base text-slate-600 flex items-start gap-2">
                        <span className="text-rose-500 font-extrabold mt-0.5">•</span>
                        <span className="leading-relaxed">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Source Tag */}
            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-4 mt-6">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-300" />
                官方數據出處：
                <a 
                  href={currentEnergy.dataSourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-600 font-semibold hover:underline"
                >
                  {currentEnergy.dataSource}
                </a>
              </span>
              <span>中華民國 115 年最新電力統計</span>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Taiwan Grid Challenges */
        <div className="space-y-8 animate-fade-in">
          {/* Introduction Alert Box */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-250 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">⚠️ 警示：台灣電能面臨的轉型與供電窘迫</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  在「非核家園」與「高碳排燃煤退役」的政策大方向下，由於高科技製造業產能迅速擴張，使得全台供電系統的容錯率降至歷史低點，電網正面臨嚴峻的系統性考驗。
                </p>
              </div>
            </div>
            {onAskAI && (
              <button
                onClick={() => onAskAI('請說明目前台灣電網有哪些最急迫的供電威脅？並請分析半導體擴廠、夜尖峰、與進口依存度的多重風險。')}
                className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-605 transition-all font-extrabold shadow-sm shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                詢問 AI 供電挑戰
              </button>
            )}
          </div>

          {/* Grid: 3 Major Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Challenge 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-black text-slate-800 text-base">1. 進口依存度高與海上封鎖隱憂</h3>
                <p className="text-sm text-slate-550 leading-relaxed">
                  台灣 **95.8%** 的能源均仰賴進口。其中，發電占比達八成以上的「燃煤」與「天然氣」發電，燃料分別為 **100%** 與 **99.3%** 船運進口。燃氣發電（天然氣）的安全存量僅有 **7~11 天**。在極端氣候、颱風，或地緣政治緊張導致海上交通受阻時，全台發電將在數天內陷入癱瘓，面臨國防安全的致命弱點。
                </p>
              </div>
              <div className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-2">
                資料來源：經濟部能源署 - 能源供給概況
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold">
                  <Cpu className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-black text-slate-800 text-base">2. AI 與半導體先進製程用電暴增</h3>
                <p className="text-sm text-slate-550 leading-relaxed">
                  作為全球半導體代工重鎮，台灣 3 奈米及更先進製程（如耗電巨大的 EUV 曝光機設備）以及 AI 運算所需的資料中心 (Data Center) 紛紛擴充。這使得高科技電子業已佔據工業用電的 **40% 以上**。預估全台用電量年均成長率將從過往的 1% 大幅跳升至 **1.7% ~ 2.5%**，拉高了總體電網的基載需求負荷。
                </p>
              </div>
              <div className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-2">
                資料來源：經濟部能源署 - 全國電力供需報告
              </div>
            </div>

            {/* Challenge 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <RefreshCw className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-black text-slate-800 text-base">3. 「日尖峰」移轉至「夜尖峰」挑戰</h3>
                <p className="text-sm text-slate-550 leading-relaxed">
                  隨著太陽光電在白天中午大放異彩（占比曾破 25%），白天的電力供應充沛。然而，在傍晚 **17:00 ~ 21:00** 太陽下山、光電產能快速歸零時，恰逢民眾下班回家的民生用電高峰。此時電網供電壓力極大，被稱為「夜尖峰」。台電必須調度起停迅速的燃氣機組、水力及儲能系統補位，稍有延遲即可能導致區域斷電。
                </p>
              </div>
              <div className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-2">
                資料來源：台灣電力公司 - 電力調度運行實績
              </div>
            </div>
          </div>

          {/* Section: Five Color Lights */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <span className="w-2.5 h-5 bg-cyan-500 rounded-full inline-block" />
                台電備轉容量率「五色供電警示燈號」
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                備轉容量率是衡量「當天電網到底有多安全」的指標，數值越低，代表系統應對緊急跳機事件的容錯空間越小。
              </p>
            </div>

            {/* Interactive Color Indicator Bar */}
            <div className="w-full flex h-6 rounded-full overflow-hidden border border-slate-200">
              <div className="w-[40%] bg-emerald-500 h-full cursor-help hover:opacity-90" title="綠燈 (>= 10%)" />
              <div className="w-[30%] bg-amber-400 h-full cursor-help hover:opacity-90" title="黃燈 (6%~10%)" />
              <div className="w-[15%] bg-orange-500 h-full cursor-help hover:opacity-90" title="橘燈 (< 2.5%)" />
              <div className="w-[10%] bg-rose-500 h-full cursor-help hover:opacity-90" title="紅燈" />
              <div className="w-[5%] bg-slate-900 h-full cursor-help hover:opacity-90" title="黑燈" />
            </div>

            {/* List explaining lights */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {reserveLights.map((light, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex flex-col justify-between space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${light.color}`} />
                    <span className="font-bold text-slate-800">{light.name}</span>
                  </div>
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200 font-mono text-xs text-slate-650 mb-1.5">
                      {light.range}
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {light.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-150 text-sm text-cyan-800 leading-relaxed font-medium">
              💡 **電力科普小知識**：全台一天的用電在尖峰時約有 **4,000 萬瓩 (kW)**。在備轉容量率為 10%（綠燈）時，代表台電當天隨時留有約 **400 萬瓩** 的發電容量未開動，一旦最大的發電機組（如核三廠 95 萬瓩）跳機，電網可以瞬間補上，不影響用戶。若降為黃燈甚至橘燈，一有大機組跳機，就極可能引發電網連鎖卸載，造成大停電。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
