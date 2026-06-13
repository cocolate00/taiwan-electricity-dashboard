import { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Loader2, AlertCircle, Calendar, Zap, Leaf, Flame, Cpu, Download, MessageCircle } from 'lucide-react';

interface GenerationData {
  year: number;
  month: number;
  energy_type: string;
  generation_gwh: number;
  percentage: number;
}

interface ConsumptionData {
  industry: string;
  consumption_gwh: number;
  percentage: number;
}

const ENERGY_COLORS: { [key: string]: string } = {
  coal: '#4b5563',           // Gray 600 (燃煤 - 火力深灰)
  gas: '#ea580c',            // Orange 600 (燃氣 - 火力橘紅)
  oil: '#9ca3af',            // Gray 400 (燃油 - 火力淺灰)
  nuclear: '#f59e0b',        // Amber 500 (核能 - 中性黃色)
  solar: '#10b981',          // Emerald 500 (太陽光電 - 綠能翠綠)
  wind: '#06b6d4',           // Cyan 500 (風力 - 綠能青色)
  hydro: '#0284c7',          // Sky 600 (慣常水力 - 綠能水藍)
  geothermal: '#14b8a6',     // Teal 500 (地熱 - 綠能青綠)
  biomass: '#34d399',        // Emerald 400 (生質能 - 綠能明綠)
  waste: '#047857',          // Emerald 700 (廢棄物 - 綠能深綠)
  pumped_storage: '#cbd5e1'  // Slate 300 (抽蓄水力 - 中性冷灰)
};

const ENERGY_NAMES: { [key: string]: string } = {
  coal: '燃煤',
  gas: '燃氣',
  oil: '燃油',
  nuclear: '核能',
  solar: '太陽光電',
  wind: '風力',
  hydro: '慣常水力',
  geothermal: '地熱',
  biomass: '生質能',
  waste: '廢棄物',
  pumped_storage: '抽蓄水力'
};

const SECTOR_NAMES: { [key: string]: string } = {
  energy_sector: '能源自用',
  transport_sector: '運輸部門',
  agricultural_sector: '農業部門',
  service_sector: '商業與服務業',
  residential_sector: '民生與住宅',
  industrial_sector: '工業部門(合計)'
};



const formatToBillionKwh = (val: number) => {
  const billion = val / 100;
  if (billion >= 100) {
    return billion.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " 億度";
  } else if (billion >= 1) {
    return billion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " 億度";
  } else {
    return billion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 }) + " 億度";
  }
};

const formatBillionValOnly = (val: number) => {
  const billion = val / 100;
  if (billion >= 100) {
    return billion.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  } else if (billion >= 1) {
    return billion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return billion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  }
};

// 台灣再生能源政策目標占比（2020-2026年）
const RENEWABLE_POLICY_TARGETS: Record<number, number> = {
  2020: 5.0, 2021: 6.0, 2022: 8.0, 2023: 9.0,
  2024: 12.0, 2025: 15.0, 2026: 16.0
};

const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-80 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200 w-full p-6 text-center">
    <AlertCircle className="w-8 h-8 text-slate-350 mb-2 shrink-0" />
    <p className="text-slate-400 text-xs font-semibold leading-relaxed">{message}</p>
  </div>
);

// 通用 CSV 匯出工具函數
const exportToCSV = (data: Record<string, any>[], fileName: string, columnMap: Record<string, string>) => {
  if (!data || data.length === 0) return;
  const headers = Object.values(columnMap).join(',');
  const rows = data.map(row =>
    Object.keys(columnMap).map(key => {
      const val = row[key] ?? '';
      // 帶有逗號或引號的欄位加上引號包覆
      return typeof val === 'string' && (val.includes(',') || val.includes('"'))
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  ).join('\n');
  // 加入 BOM 以確保 Excel 正確顯示繁體中文
  const blob = new Blob(['\uFEFF' + headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const SECTOR_COLORS: { [key: string]: string } = {
  energy_sector: '#64748b',       // Slate
  transport_sector: '#eab308',    // Yellow
  agricultural_sector: '#22c55e',  // Green
  service_sector: '#a855f7',      // Purple
  residential_sector: '#ec4899',  // Pink
  industrial_sector: '#06b6d4'    // Cyan
};

const AreaChartCustomTooltip = ({ active, payload, label, pivotedData }: any) => {
  if (active && payload && payload.length) {
    const currentItem = payload[0].payload;
    const currentYear = currentItem.year;
    const currentMonth = currentItem.month;
    
    // 計算該時間點所有能源的總和
    const totalVal = payload.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

    return (
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg text-sm text-slate-800 space-y-2 w-[460px]">
        <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-xs text-slate-400 font-normal">相較去年同期增減</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-72 overflow-y-auto pr-1">
          {payload.map((item: any) => {
            const energyKey = item.dataKey;
            const currentVal = item.value;

            const prevYearItem = pivotedData.find(
              (d: any) => d.year === currentYear - 1 && d.month === currentMonth
            );
            const prevVal = prevYearItem ? prevYearItem[energyKey] : null;

            let diffStr = '';
            let diffColor = 'text-slate-450';
            if (prevVal !== undefined && prevVal !== null) {
              const diff = currentVal - prevVal;
              const diffBillion = diff / 100;
              let pctStr = '';
              if (prevVal > 0) {
                const pct = (diff / prevVal) * 100;
                pctStr = pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
              } else if (prevVal === 0 && currentVal > 0) {
                pctStr = '+100.0%';
              } else {
                pctStr = '0.0%';
              }

              if (diff > 0) {
                diffStr = `+${diffBillion.toFixed(2)} 億度 (${pctStr})`;
                diffColor = 'text-rose-500 font-semibold';
              } else if (diff < 0) {
                diffStr = `${diffBillion.toFixed(2)} 億度 (${pctStr})`;
                diffColor = 'text-emerald-600 font-semibold';
              } else {
                diffStr = `持平 (${pctStr})`;
                diffColor = 'text-slate-450';
              }
            } else {
              diffStr = '無比對';
            }

            const share = totalVal > 0 ? (currentVal / totalVal) * 100 : 0;

            return (
              <div key={energyKey} className="flex items-center justify-between text-xs py-1 border-b border-slate-100/50">
                <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold truncate">{item.name}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="font-bold text-slate-900">{formatBillionValOnly(currentVal)} 億度 ({share.toFixed(1)}%)</div>
                  <div className={`text-xs font-semibold ${diffColor}`}>{diffStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const ConsumptionChartCustomTooltip = ({ active, payload, label, pivotedData }: any) => {
  if (active && payload && payload.length) {
    const currentItem = payload[0].payload;
    const currentYear = currentItem.year;
    const currentMonth = currentItem.month;
    
    // 計算該時間點所有部門用電的總和
    const totalVal = payload.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

    return (
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg text-sm text-slate-800 space-y-2 min-w-[320px]">
        <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-xs text-slate-400 font-normal">相較去年同期增減</span>
        </div>
        <div className="space-y-1.5 pr-1">
          {payload.map((item: any) => {
            const sectorKey = item.dataKey;
            const currentVal = item.value;

            const prevYearItem = pivotedData.find(
              (d: any) => d.year === currentYear - 1 && d.month === currentMonth
            );
            const prevVal = prevYearItem ? prevYearItem[sectorKey] : null;

            let diffStr = '';
            let diffColor = 'text-slate-450';
            if (prevVal !== undefined && prevVal !== null) {
              const diff = currentVal - prevVal;
              const diffBillion = diff / 100;
              let pctStr = '';
              if (prevVal > 0) {
                const pct = (diff / prevVal) * 100;
                pctStr = pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
              } else if (prevVal === 0 && currentVal > 0) {
                pctStr = '+100.0%';
              } else {
                pctStr = '0.0%';
              }

              if (diff > 0) {
                diffStr = `+${diffBillion.toFixed(2)} 億度 (${pctStr})`;
                diffColor = 'text-rose-500 font-semibold';
              } else if (diff < 0) {
                diffStr = `${diffBillion.toFixed(2)} 億度 (${pctStr})`;
                diffColor = 'text-emerald-600 font-semibold';
              } else {
                diffStr = `持平 (${pctStr})`;
                diffColor = 'text-slate-450';
              }
            } else {
              diffStr = '無歷史比對';
            }

            const share = totalVal > 0 ? (currentVal / totalVal) * 100 : 0;

            return (
              <div key={sectorKey} className="flex items-center justify-between text-xs py-1 border-b border-slate-100/50 last:border-0">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatBillionValOnly(currentVal)} 億度 ({share.toFixed(1)}%)</div>
                  <div className={`text-xs font-semibold ${diffColor}`}>{diffStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const SupplyDemandCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg text-sm text-slate-800 space-y-2 min-w-[280px]">
        <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">{label}</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 font-semibold">總發購電量:</span>
            <span className="font-bold text-slate-900">{data.generation.toLocaleString()} GWh</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 font-semibold">總用電量:</span>
            <span className="font-bold text-slate-900">{data.consumption.toLocaleString()} GWh</span>
          </div>
          <div className="flex items-center justify-between py-0.5 border-t border-slate-100 pt-1.5">
            <span className="text-slate-500 font-semibold">供需差額 (線損/自用):</span>
            <span className="font-bold text-slate-900">{data.loss.toLocaleString()} GWh</span>
          </div>
          <div className="flex items-center justify-between py-0.5 text-indigo-600 font-extrabold border-t border-slate-100 pt-1.5">
            <span>損耗與自用率:</span>
            <span>{data.lossRate.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedPieLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name }: any) => {
  if (index >= 3) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#475569" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${name} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};

export default function DashboardPage({ 
  onAskAI, 
  onNavigateToSources 
}: { 
  onAskAI?: (prompt: string) => void; 
  onNavigateToSources?: () => void;
}) {
  const [genRawData, setGenRawData] = useState<GenerationData[]>([]);
  const [conRawData, setConRawData] = useState<ConsumptionData[]>([]);
  
  const [timeMode, setTimeMode] = useState<'annual' | 'monthly'>('annual');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [showRenewablesOnly, setShowRenewablesOnly] = useState<boolean>(false);

  const [loadingGen, setLoadingGen] = useState<boolean>(true);
  const [loadingCon, setLoadingCon] = useState<boolean>(true);
  const [errorGen, setErrorGen] = useState<string>('');
  const [errorCon, setErrorCon] = useState<string>('');

  const [conHistoryData, setConHistoryData] = useState<any[]>([]);
  const [loadingConHistory, setLoadingConHistory] = useState<boolean>(true);
  const [errorConHistory, setErrorConHistory] = useState<string>('');

  const [hoveredKPI, setHoveredKPI] = useState<string | null>(null);
  const [showTargetExplanation, setShowTargetExplanation] = useState<boolean>(false);
  
  const envUrl = (import.meta as any).env.VITE_API_URL;
  const apiUrl = envUrl !== undefined ? envUrl : 'http://localhost:8080';

  // Fetch Generation Data
  useEffect(() => {
    const fetchGeneration = async () => {
      try {
        setLoadingGen(true);
        const res = await fetch(`${apiUrl}/api/charts/generation`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const json = await res.json();
        
        // 對 2026 年的 month === 0 的發電資料進行動態加總
        let rawGen = json.data as GenerationData[];
        const m2026 = rawGen.filter(d => d.year === 2026 && d.month > 0);
        if (m2026.length > 0) {
          const energySums: { [type: string]: number } = {};
          m2026.forEach(d => {
            energySums[d.energy_type] = (energySums[d.energy_type] || 0) + d.generation_gwh;
          });
          const totalGen = energySums['total'] || 1;
          const cleanedGen = rawGen.filter(d => !(d.year === 2026 && d.month === 0));
          const new2026Annual: GenerationData[] = Object.keys(energySums).map(type => ({
            year: 2026,
            month: 0,
            energy_type: type,
            generation_gwh: energySums[type],
            percentage: totalGen > 0 ? (energySums[type] / totalGen) * 100 : 0
          }));
          rawGen = [...cleanedGen, ...new2026Annual];
        }
        setGenRawData(rawGen);
        
        // Extract unique years
        const years = Array.from(new Set(rawGen.map((d: any) => d.year))) as number[];
        setAvailableYears(years.sort((a, b) => b - a));
        setErrorGen('');
      } catch (err) {
        setErrorGen(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingGen(false);
      }
    };
    fetchGeneration();
  }, [apiUrl]);

  // Fetch Consumption Data
  useEffect(() => {
    const fetchConsumption = async () => {
      try {
        setLoadingCon(true);
        const res = await fetch(`${apiUrl}/api/charts/industry-consumption?year=${selectedYear}&month=${selectedMonth}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const json = await res.json();
        setConRawData(json.data);
        setErrorCon('');
      } catch (err) {
        setErrorCon(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingCon(false);
      }
    };
    fetchConsumption();
  }, [apiUrl, selectedYear, selectedMonth]);

  // Fetch Consumption History
  useEffect(() => {
    const fetchConsumptionHistory = async () => {
      try {
        setLoadingConHistory(true);
        const res = await fetch(`${apiUrl}/api/charts/consumption-history`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const json = await res.json();
        
        // 對 2026 年的 month === 0 的歷史用電資料進行動態加總
        let rawConHist = json.data;
        const m2026Con = rawConHist.filter((d: any) => d.year === 2026 && d.month > 0);
        if (m2026Con.length > 0) {
          const indSums: { [ind: string]: number } = {};
          m2026Con.forEach((d: any) => {
            indSums[d.industry] = (indSums[d.industry] || 0) + d.consumption_gwh;
          });
          const totalCon = indSums['total'] || 1;
          const cleanedConHist = rawConHist.filter((d: any) => !(d.year === 2026 && d.month === 0));
          const new2026Annual = Object.keys(indSums).map(ind => ({
            year: 2026,
            month: 0,
            industry: ind,
            consumption_gwh: indSums[ind],
            percentage: totalCon > 0 ? (indSums[ind] / totalCon) * 100 : 0
          }));
          rawConHist = [...cleanedConHist, ...new2026Annual];
        }
        setConHistoryData(rawConHist);
        setErrorConHistory('');
      } catch (err) {
        setErrorConHistory(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingConHistory(false);
      }
    };
    fetchConsumptionHistory();
  }, [apiUrl]);

  // Update available months when year changes
  useEffect(() => {
    if (genRawData.length === 0) return;
    const months = Array.from(
      new Set(
        genRawData
          .filter(d => d.year === selectedYear)
          .map(d => d.month)
      )
    ) as number[];
    setAvailableMonths(months.sort((a, b) => a - b));

    // Reset selected month if not available
    if (!months.includes(selectedMonth)) {
      setSelectedMonth(months[0] || 0);
    }
  }, [genRawData, selectedYear, selectedMonth]);

  // 當選定年份無月份資料時，若處於月度細部趨勢模式，自動切回年度趨勢模式
  useEffect(() => {
    if (genRawData.length === 0) return;
    const hasMonthly = genRawData.some(d => d.year === selectedYear && d.month > 0);
    if (!hasMonthly && timeMode === 'monthly') {
      setTimeMode('annual');
    }
  }, [selectedYear, genRawData, timeMode]);

  // Pivot data for Recharts stacked area chart
  const getPivotedGenerationData = () => {
    const filtered = genRawData.filter(d => {
      if (timeMode === 'annual') {
        return d.month === 0;
      } else {
        return d.year === selectedYear && d.month > 0;
      }
    });

    const map: { [key: string]: any } = {};
    filtered.forEach(d => {
      const key = `${d.year}-${d.month}`;
      if (!map[key]) {
        map[key] = {
          year: d.year,
          month: d.month,
          label: d.month === 0 ? `${d.year}年` : `${d.year}年${d.month}月`
        };
      }
      
      const isRenewable = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'waste'].includes(d.energy_type);
      if (d.energy_type !== 'total') {
        if (!showRenewablesOnly || isRenewable) {
          map[key][d.energy_type] = parseFloat(d.generation_gwh.toFixed(2));
        }
      }
    });

    return Object.values(map).sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  };

  // Prepare data for Pie Chart (Energy Mix) for the selected period
  const getPieChartData = () => {
    const targetPeriod = genRawData.filter(d => d.year === selectedYear && d.month === selectedMonth);
    const renewables = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'waste'];
    
    // 過濾出要顯示的能源項目
    const filteredPeriod = targetPeriod.filter(d => {
      if (d.energy_type === 'total') return false;
      const isRenewable = renewables.includes(d.energy_type);
      return !showRenewablesOnly || isRenewable;
    });

    // 動態計算當期所選項目的總發電量，以精確呈現各項目的佔比
    const currentTotal = filteredPeriod.reduce((sum, d) => sum + d.generation_gwh, 0);

    return filteredPeriod
      .map(d => ({
        name: ENERGY_NAMES[d.energy_type] || d.energy_type,
        value: parseFloat(d.generation_gwh.toFixed(2)),
        percentage: currentTotal > 0 ? (d.generation_gwh / currentTotal) * 100 : 0,
        key: d.energy_type
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  // 1. Sectoral split (大部門用電佔比 - Donut Chart)
  const getSectorChartData = () => {
    const sectorKeys = [
      'energy_sector', 'transport_sector', 'agricultural_sector', 
      'service_sector', 'residential_sector', 'industrial_sector'
    ];
    return conRawData
      .filter(d => sectorKeys.includes(d.industry))
      .map(d => ({
        name: SECTOR_NAMES[d.industry] || d.industry,
        value: parseFloat(d.consumption_gwh.toFixed(2)),
        percentage: d.percentage,
        key: d.industry
      }))
      .sort((a, b) => b.value - a.value);
  };



  // Calculate Top KPIs
  const getKPIs = () => {
    const periodGen = genRawData.filter(d => d.year === selectedYear && d.month === selectedMonth);
    const totalGenRec = periodGen.find(d => d.energy_type === 'total');
    const totalGen = totalGenRec ? totalGenRec.generation_gwh : 0;

    // Renewables Sum
    const renewables = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'waste'];
    const renewableShare = periodGen
      .filter(d => renewables.includes(d.energy_type))
      .reduce((sum, d) => sum + d.percentage, 0);

    // Fossils Sum
    const fossils = ['coal', 'gas', 'oil'];
    const fossilShare = periodGen
      .filter(d => fossils.includes(d.energy_type))
      .reduce((sum, d) => sum + d.percentage, 0);

    // Electronics Share of Total Consumption
    const totalConRec = conRawData.find(d => d.industry === 'total');
    const totalCon = totalConRec ? totalConRec.consumption_gwh : 1;
    const elecRec = conRawData.find(d => d.industry === 'electronics');
    const elecCon = elecRec ? elecRec.consumption_gwh : 0;
    const elecShare = (elecCon / totalCon) * 100;

    return {
      totalGen: (totalGen / 100).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " 億度",
      renewableShare: renewableShare.toFixed(1),
      fossilShare: fossilShare.toFixed(1),
      elecShare: elecShare.toFixed(1),
      elecBillionKwh: (elecCon / 100).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " 億度"
    };
  };

  const getKPITrendData = (kpiType: 'totalGen' | 'renewableShare' | 'fossilShare' | 'elecShare') => {
    const isMonthly = selectedMonth > 0;
    let trendData: { label: string; value: number }[] = [];
    
    if (isMonthly) {
      const yearGen = genRawData.filter(d => d.year === selectedYear && d.month > 0);
      const yearCon = conHistoryData.filter(d => d.year === selectedYear && d.month > 0);
      const uniqueMonths = Array.from(new Set(yearGen.map(d => d.month))).sort((a, b) => a - b);
      
      trendData = uniqueMonths.map(m => {
        const periodGen = yearGen.filter(d => d.month === m);
        const periodCon = yearCon.filter(d => d.month === m);
        
        let val = 0;
        if (kpiType === 'totalGen') {
          const totalGenRec = periodGen.find(d => d.energy_type === 'total');
          val = totalGenRec ? totalGenRec.generation_gwh : 0;
        } else if (kpiType === 'renewableShare') {
          const renewables = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'waste'];
          val = periodGen
            .filter(d => renewables.includes(d.energy_type))
            .reduce((sum, d) => sum + d.percentage, 0);
        } else if (kpiType === 'fossilShare') {
          const fossils = ['coal', 'gas', 'oil'];
          val = periodGen
            .filter(d => fossils.includes(d.energy_type))
            .reduce((sum, d) => sum + d.percentage, 0);
        } else if (kpiType === 'elecShare') {
          const totalConRec = periodCon.find(d => d.industry === 'total');
          const totalCon = totalConRec ? totalConRec.consumption_gwh : 1;
          const elecRec = periodCon.find(d => d.industry === 'electronics');
          const elecCon = elecRec ? elecRec.consumption_gwh : 0;
          val = (elecCon / totalCon) * 100;
        }
        
        return {
          label: `${m}月`,
          value: parseFloat(val.toFixed(1))
        };
      });
    } else {
      const allYears = Array.from(new Set(genRawData.map(d => d.year))).sort((a, b) => a - b);
      
      trendData = allYears.map(y => {
        const periodGen = genRawData.filter(d => d.year === y && d.month === 0);
        const periodCon = conHistoryData.filter(d => d.year === y && d.month === 0);
        
        let val = 0;
        if (kpiType === 'totalGen') {
          const totalGenRec = periodGen.find(d => d.energy_type === 'total');
          val = totalGenRec ? totalGenRec.generation_gwh : 0;
        } else if (kpiType === 'renewableShare') {
          const renewables = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'waste'];
          val = periodGen
            .filter(d => renewables.includes(d.energy_type))
            .reduce((sum, d) => sum + d.percentage, 0);
        } else if (kpiType === 'fossilShare') {
          const fossils = ['coal', 'gas', 'oil'];
          val = periodGen
            .filter(d => fossils.includes(d.energy_type))
            .reduce((sum, d) => sum + d.percentage, 0);
        } else if (kpiType === 'elecShare') {
          const totalConRec = periodCon.find(d => d.industry === 'total');
          const totalCon = totalConRec ? totalConRec.consumption_gwh : 1;
          const elecRec = periodCon.find(d => d.industry === 'electronics');
          const elecCon = elecRec ? elecRec.consumption_gwh : 0;
          val = (elecCon / totalCon) * 100;
        }
        
        return {
          label: `${y}年`,
          value: parseFloat(val.toFixed(1))
        };
      });
    }

    // 針對高科技電子業占比，過濾掉前面為 0 的資料點，從有資料的第一點開始繪製
    if (kpiType === 'elecShare') {
      const firstValidIdx = trendData.findIndex(d => d.value > 0);
      if (firstValidIdx !== -1) {
        return trendData.slice(firstValidIdx);
      }
    }

    return trendData;
  };;

  const pivotedGen = getPivotedGenerationData();
  
  // Pivot data for Recharts stacked area chart of consumption
  const getPivotedConsumptionData = () => {
    const filtered = conHistoryData.filter(d => {
      if (timeMode === 'annual') {
        return d.month === 0;
      } else {
        return d.year === selectedYear && d.month > 0;
      }
    });

    const sectorKeys = [
      'energy_sector', 'transport_sector', 'agricultural_sector', 
      'service_sector', 'residential_sector', 'industrial_sector'
    ];

    const map: { [key: string]: any } = {};
    filtered.forEach(d => {
      if (!sectorKeys.includes(d.industry)) return;
      const key = `${d.year}-${d.month}`;
      if (!map[key]) {
        map[key] = {
          year: d.year,
          month: d.month,
          label: d.month === 0 ? `${d.year}年` : `${d.year}年${d.month}月`
        };
      }
      map[key][d.industry] = parseFloat(d.consumption_gwh.toFixed(2));
    });

    return Object.values(map).sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  };

  const getCombinedSupplyDemandData = () => {
    const genTotal = genRawData.filter(d => d.energy_type === 'total' && (timeMode === 'annual' ? d.month === 0 : d.month > 0));
    const conTotal = conHistoryData.filter(d => d.industry === 'total' && (timeMode === 'annual' ? d.month === 0 : d.month > 0));

    const map: { [key: string]: any } = {};

    genTotal.forEach(d => {
      const key = `${d.year}-${d.month}`;
      map[key] = {
        year: d.year,
        month: d.month,
        label: d.month === 0 ? `${d.year}年` : `${d.year}年${d.month}月`,
        generation: parseFloat(d.generation_gwh.toFixed(2))
      };
    });

    conTotal.forEach(d => {
      const key = `${d.year}-${d.month}`;
      if (map[key]) {
        map[key].consumption = parseFloat(d.consumption_gwh.toFixed(2));
        const loss = map[key].generation - map[key].consumption;
        map[key].loss = parseFloat(loss.toFixed(2));
        map[key].lossRate = map[key].generation > 0 
          ? parseFloat(((loss / map[key].generation) * 100).toFixed(2)) 
          : 0;
      }
    });

    return Object.values(map)
      .filter((d: any) => d.generation !== undefined && d.consumption !== undefined)
      .sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
  };

  const pivotedCon = getPivotedConsumptionData();
  const combinedSupplyDemand = getCombinedSupplyDemandData();
  const pieData = getPieChartData();
  const sectorData = getSectorChartData();
  const kpis = getKPIs();
  const hasMonthlyData = genRawData.some(d => d.year === selectedYear && d.month > 0);

  const activeSectors = [
    'industrial_sector', 'residential_sector', 'service_sector', 
    'transport_sector', 'agricultural_sector', 'energy_sector'
  ];

  // Find active energy types
  const activeEnergyTypes = Array.from(
    new Set(
      genRawData
        .filter(d => d.energy_type !== 'total')
        .map(d => d.energy_type)
    )
  ).filter(type => {
    const isRenewable = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'waste'].includes(type);
    return !showRenewablesOnly || isRenewable;
  });

  // 依據歷史總發電量 (generation_gwh) 對 activeEnergyTypes 進行降冪排序
  activeEnergyTypes.sort((a, b) => {
    const sumA = genRawData
      .filter(d => d.energy_type === a)
      .reduce((sum, d) => sum + d.generation_gwh, 0);
    const sumB = genRawData
      .filter(d => d.energy_type === b)
      .reduce((sum, d) => sum + d.generation_gwh, 0);
    return sumB - sumA;
  });

  const isPartial = selectedYear === 2026;
  const timeLabel = `${selectedYear}年${selectedMonth === 0 ? (isPartial ? '1-4月動態累計' : '全年度累計') : `${selectedMonth}月份`}`;

  return (
    <div className="w-full space-y-12 pb-16">
      
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <span>查詢維度設定</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-500">年份：</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-850 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-500">月份：</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-850 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m === 0 ? '全年度統計' : `${m}月份`}</option>
              ))}
            </select>
            {!hasMonthlyData && (
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-lg">
                ℹ️ 該年僅提供年度數據
              </span>
            )}
          </div>

          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-250/50">
            <button
              onClick={() => setTimeMode('annual')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${timeMode === 'annual' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              年度歷史趨勢
            </button>
            <button
              onClick={() => setTimeMode('monthly')}
              disabled={!hasMonthlyData}
              title={!hasMonthlyData ? "該年份無月度細部數據" : ""}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                !hasMonthlyData 
                  ? 'opacity-40 cursor-not-allowed text-slate-400' 
                  : timeMode === 'monthly' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              月度細部趨勢 {!hasMonthlyData && "(無數據)"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRenewablesOnly(!showRenewablesOnly)}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold border transition-all flex items-center gap-1.5 ${
              showRenewablesOnly 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md scale-[1.02]' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
            }`}
          >
            <Leaf className={`w-3.5 h-3.5 transition-transform ${showRenewablesOnly ? 'scale-110' : ''}`} />
            {showRenewablesOnly ? '✅ 僅顯示綠色能源' : '僅顯示綠色能源'}
          </button>
        </div>
      </div>

      {/* SECTION 1: 核心發用電指標 (Key Indicators) */}
      <section className="space-y-4 border-t border-slate-200/60 pt-6">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-cyan-500 rounded-full inline-block" />
            核心發用電指標 ({timeLabel})
          </h2>
          <p className="text-sm text-slate-500 mt-1">呈現所選年份內的全國宏觀發電與代表性用電數據指針</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI 1 */}
          <div 
            onMouseEnter={() => setHoveredKPI('totalGen')}
            onMouseLeave={() => setHoveredKPI(null)}
            className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-400">當期發購電量</span>
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-800 leading-none">{kpis.totalGen}</h4>
              <p className="text-sm text-slate-400 mt-2">全國電力生產與買進之總和</p>
            </div>
            
            {hoveredKPI === 'totalGen' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 h-44 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 pointer-events-none transition-all duration-200">
                <div className="text-xs font-bold text-slate-800 mb-2 flex justify-between">
                  <span>發電總量走勢 (GWh)</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {selectedMonth > 0 ? `${selectedYear}年各月` : '歷年趨勢'}
                  </span>
                </div>
                <div className="w-full h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getKPITrendData('totalGen')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" fontSize={8} tickLine={false} />
                      <YAxis fontSize={8} width={25} tickLine={false} domain={['auto', 'auto']} />
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#ecfeff" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* KPI 2 */}
          <div 
            onMouseEnter={() => setHoveredKPI('renewableShare')}
            onMouseLeave={() => setHoveredKPI(null)}
            className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-400">綠色能源占比</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Leaf className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-black text-emerald-600 leading-none">{kpis.renewableShare}%</h4>
              <p className="text-sm text-slate-400 mt-2">風、光、水及生質廢棄物等加總</p>
            </div>

            {hoveredKPI === 'renewableShare' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 h-44 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 pointer-events-none transition-all duration-200">
                <div className="text-xs font-bold text-slate-800 mb-2 flex justify-between">
                  <span>綠色能源占比走勢 (%)</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {selectedMonth > 0 ? `${selectedYear}年各月` : '歷年趨勢'}
                  </span>
                </div>
                <div className="w-full h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getKPITrendData('renewableShare')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" fontSize={8} tickLine={false} />
                      <YAxis fontSize={8} width={25} tickLine={false} domain={['auto', 'auto']} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" fill="#ecfdf5" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* KPI 3 */}
          <div 
            onMouseEnter={() => setHoveredKPI('fossilShare')}
            onMouseLeave={() => setHoveredKPI(null)}
            className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-400">火力發電依賴</span>
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-black text-orange-600 leading-none">{kpis.fossilShare}%</h4>
              <p className="text-sm text-slate-400 mt-2">煤炭、天然氣與燃油發電佔比</p>
            </div>

            {hoveredKPI === 'fossilShare' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 h-44 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 pointer-events-none transition-all duration-200">
                <div className="text-xs font-bold text-slate-800 mb-2 flex justify-between">
                  <span>火力發電依賴走勢 (%)</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {selectedMonth > 0 ? `${selectedYear}年各月` : '歷年趨勢'}
                  </span>
                </div>
                <div className="w-full h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getKPITrendData('fossilShare')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" fontSize={8} tickLine={false} />
                      <YAxis fontSize={8} width={25} tickLine={false} domain={['auto', 'auto']} />
                      <Area type="monotone" dataKey="value" stroke="#f97316" fill="#fff7ed" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* KPI 4 */}
          <div 
            onMouseEnter={() => setHoveredKPI('elecShare')}
            onMouseLeave={() => setHoveredKPI(null)}
            className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-400">高科技電子業占比</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-black text-indigo-655 leading-none">{kpis.elecShare}%</h4>
              <p className="text-sm text-slate-400 mt-2">用電總量：{kpis.elecBillionKwh}</p>
            </div>

            {hoveredKPI === 'elecShare' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 h-44 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 pointer-events-none transition-all duration-200">
                <div className="text-xs font-bold text-slate-800 mb-2 flex justify-between">
                  <span>電子業用電佔比走勢 (%)</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {selectedMonth > 0 ? `${selectedYear}年各月` : '歷年趨勢'}
                  </span>
                </div>
                <div className="w-full h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getKPITrendData('elecShare')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" fontSize={8} tickLine={false} />
                      <YAxis fontSize={8} width={25} tickLine={false} domain={['auto', 'auto']} />
                      <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#e0e7ff" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: 供給端：發電來源與結構趨勢 (Supply Side) */}
      <section className="space-y-4 border-t border-slate-200/60 pt-6">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-cyan-500 rounded-full inline-block" />
            供給端：發電來源與結構趨勢
          </h2>
          <p className="text-sm text-slate-500 mt-1">分析各類型能源在不同年份的發電量消長趨勢與當期占比結構</p>
          <div className="mt-2 text-sm font-semibold text-cyan-700 bg-cyan-50/50 px-3 py-2 rounded-xl border border-cyan-100/50 inline-block w-fit">
            💡 燃煤與燃氣合計為我國主要發電主力（合計佔八成以上），再生能源占比正逐步呈上升趨勢。
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Trend */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-base text-slate-850 flex items-center gap-2 flex-wrap">
                  {timeMode === 'annual' ? '歷史年度發電走勢' : '單月發電歷史明細'}
                  {selectedYear === 2026 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                      ⚠️ 2026 年為當期累計
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100 animate-pulse">
                    💡 點擊圖表任一處前往電力來源百科
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportToCSV(
                      pivotedGen.map(d => ({ ...d, label: d.label })),
                      `台灣發電走勢_${selectedYear}`,
                      { label: '年度', ...Object.fromEntries(activeEnergyTypes.map(t => [t, ENERGY_NAMES[t] || t])) }
                    )}
                    className="flex items-center gap-1 text-sm px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-all font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />匯出 CSV
                  </button>
                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`請分析 ${selectedYear} 年台灣各類能源的發電走勢，考慮燃煤與綠能發電的比例變化，並請附上台灣近年來能源政策的背景說明。`)}
                      className="flex items-center gap-1 text-sm px-3.5 py-2 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 hover:bg-cyan-100 transition-all font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />問 AI
                    </button>
                  )}
                  <span className="text-sm text-slate-450 font-bold bg-slate-50 px-2.5 py-1 rounded-lg">單位：億度</span>
                </div>
              </div>
              
              {loadingGen ? (
                <div className="flex h-80 items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                </div>
              ) : errorGen ? (
                <div className="flex h-80 items-center justify-center text-rose-500 gap-2 font-medium">
                  <AlertCircle className="w-5 h-5" />
                  <span>資料讀取失敗: {errorGen}</span>
                </div>
              ) : pivotedGen.length === 0 ? (
                <ChartEmptyState message="目前篩選條件下無發電走勢資料，請切換年份或月份" />
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={pivotedGen} 
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                      onClick={() => onNavigateToSources?.()}
                      style={{ cursor: 'pointer' }}
                    >
                      <defs>
                        {activeEnergyTypes.map(type => (
                          <linearGradient key={type} id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ENERGY_COLORS[type] || '#ccc'} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={ENERGY_COLORS[type] || '#ccc'} stopOpacity={0.02}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `${val / 100}`} />
                      <Tooltip content={(props) => <AreaChartCustomTooltip {...props} pivotedData={pivotedGen} />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px', color: '#475569' }} />
                      {activeEnergyTypes.map(type => (
                        <Area
                          key={type}
                          type="monotone"
                          dataKey={type}
                          name={ENERGY_NAMES[type] || type}
                          stackId="1"
                          stroke={ENERGY_COLORS[type] || '#ccc'}
                          strokeWidth={1.5}
                          fill={`url(#grad-${type})`}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Energy Mix Pie */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-base text-slate-850 flex items-center gap-2">
                  {selectedYear}年{selectedMonth === 0 ? '全年' : `${selectedMonth}月`}能源結構
                  {selectedYear === 2026 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                      當期累計
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`請說明 ${selectedYear} 年台灣的綠能發電占比現況，以及與國家政策目標的比較。當前綠能發電占比約為 ${kpis.renewableShare}%。`)}
                      className="flex items-center gap-1 text-sm px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-all font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />問 AI 綠能政策
                    </button>
                  )}
                  <span className="text-sm text-slate-450 font-bold bg-slate-50 px-2.5 py-1 rounded-lg">占比</span>
                </div>
              </div>

              {loadingGen ? (
                <div className="flex h-72 items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                </div>
              ) : pieData.length === 0 ? (
                <ChartEmptyState message="目前篩選條件下無能源結構佔比資料" />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                          label={renderCustomizedPieLabel}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ENERGY_COLORS[entry.key] || '#ccc'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                          itemStyle={{ fontSize: '13px', color: '#334155' }}
                          formatter={(value: any, name: any) => [`${formatToBillionKwh(value)}`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend list */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-h-36 overflow-y-auto mt-2 text-xs border-t border-slate-150 pt-4">
                    {pieData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ENERGY_COLORS[item.key] }} />
                        <span className="truncate font-semibold">{item.name} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>

                  {/* 綠能政策目標達成率進度條 */}
                  {(() => {
                    const target = RENEWABLE_POLICY_TARGETS[selectedYear];
                    const actual = parseFloat(kpis.renewableShare);
                    if (!target) return null;
                    const pct = Math.min((actual / target) * 100, 100);
                    const achieved = actual >= target;
                    return (
                      <div 
                        onMouseEnter={() => setShowTargetExplanation(true)}
                        onMouseLeave={() => setShowTargetExplanation(false)}
                        className="relative w-full mt-4 pt-4 border-t border-slate-100 cursor-help"
                      >
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-bold text-slate-600">綠能政策目標達成率</span>
                          <span className={`font-extrabold ${achieved ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {pct.toFixed(1)}% {achieved ? '✅ 已達成' : '⏳ 追趕中'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${achieved ? 'bg-emerald-500' : 'bg-amber-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>實際綠能占比：{actual.toFixed(1)}%</span>
                          <span>{selectedYear}年目標：{target.toFixed(1)}%</span>
                        </div>
                        {selectedMonth > 0 && (
                          <div className="text-[10px] text-amber-600 mt-1.5 text-center font-medium bg-amber-50 py-0.5 rounded border border-amber-100/50">
                            ⚠️ 政策目標為年度平均基準，單月占比僅供參考
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-2 leading-relaxed border-t border-slate-100/50 pt-1.5">
                          💡 註：我國原定 2025 年達成再生能源發電占比 20.0% 的目標。因近年產業用電大幅增加及建設進度影響，經濟部已將 20% 目標時程延後至 2026 年底達成。此處各年份目標為調整後的務實年度預期值。
                        </div>

                        {/* 懸浮解說卡片：歷史原訂 vs 下修後預期 */}
                        {showTargetExplanation && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 pointer-events-none transition-all duration-200 text-xs text-slate-600 space-y-2.5 leading-relaxed">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                              <span>📊 綠能政策目標深度解析</span>
                            </div>
                            <p>
                              💡 <strong>歷史原訂目標 (20.0%)</strong>：政府於 2016 年啟動轉型時，目標於 <strong>2025 年達到再生能源占比 20.0%</strong>。然而，因近年國內經濟成長強勁、半導體大廠擴建致用電需求大增，加上建設進度受影響，原訂目標確定延後。
                            </p>
                            <p>
                              💡 <strong>下修後務實預期 (15.0%)</strong>：經濟部隨後將 20% 目標時程調整延至 <strong>2026 年底</strong> 達成。此處採用的目標（如 2025 年的 15.0%、2026 年的 16.0%），為滾動下修後之務實年度預期值。
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: 需求端：用電部門歷史趨勢與結構 (Demand Side) */}
      <section className="space-y-4 border-t border-slate-200/60 pt-6">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-cyan-500 rounded-full inline-block" />
            需求端：用電部門歷史趨勢與結構
          </h2>
          <p className="text-sm text-slate-500 mt-1">分析各部門（工業、住宅、商業等）的用電歷史走勢與當期占比結構</p>
          <div className="mt-2 text-sm font-semibold text-cyan-700 bg-cyan-50/50 px-3 py-2 rounded-xl border border-cyan-100/50 inline-block w-fit">
            💡 工業部門（製造業）長期為全台用電佔比第一大戶（佔過半用電），其中 2025 年高科技電子及電力設備業（含半導體）更獨佔全台總用電量達 22.4%；住宅與服務業用電在夏季月份常因空調負載而有顯著增長。
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consumption History Area Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-base text-slate-850 flex items-center gap-2">
                  {timeMode === 'annual' ? '歷史年度用電走勢' : '單月用電歷史明細'}
                  {selectedYear === 2026 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                      ⚠️ 2026 年為當期累計
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportToCSV(
                      pivotedCon,
                      `台灣用電走勢_${selectedYear}`,
                      { label: '年度', industrial_sector: '工業部門', residential_sector: '住宅部門', service_sector: '商業服務', transport_sector: '運輸部門', agricultural_sector: '農業部門', energy_sector: '能源自用' }
                    )}
                    className="flex items-center gap-1 text-sm px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-all font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />匯出 CSV
                  </button>
                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`請分析 ${selectedYear} 年台灣各部門用電走勢，為何工業部門的用電量最大？請須提及半導體產業與電子業的影響。`)}
                      className="flex items-center gap-1 text-sm px-3.5 py-2 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 hover:bg-cyan-100 transition-all font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />問 AI
                    </button>
                  )}
                  <span className="text-sm text-slate-450 font-bold bg-slate-50 px-2.5 py-1 rounded-lg">單位：億度</span>
                </div>
              </div>

              {loadingConHistory ? (
                <div className="flex h-80 items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                </div>
              ) : errorConHistory ? (
                <div className="flex h-80 items-center justify-center text-rose-500 gap-2 font-medium">
                  <AlertCircle className="w-5 h-5" />
                  <span>資料讀取失敗: {errorConHistory}</span>
                </div>
              ) : pivotedCon.length === 0 ? (
                <ChartEmptyState message="目前篩選條件下無用電部門走勢資料，請切換年份" />
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pivotedCon} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        {activeSectors.map(type => (
                          <linearGradient key={type} id={`grad-con-${type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SECTOR_COLORS[type] || '#ccc'} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={SECTOR_COLORS[type] || '#ccc'} stopOpacity={0.02}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `${val / 100}`} />
                      <Tooltip content={(props) => <ConsumptionChartCustomTooltip {...props} pivotedData={pivotedCon} />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px', color: '#475569' }} />
                      {activeSectors.map(type => (
                        <Area
                          key={type}
                          type="monotone"
                          dataKey={type}
                          name={SECTOR_NAMES[type] || type}
                          stackId="1"
                          stroke={SECTOR_COLORS[type] || '#ccc'}
                          strokeWidth={1.5}
                          fill={`url(#grad-con-${type})`}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Sectoral Split (Donut Chart) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-base text-slate-850 flex items-center gap-2">
                  {selectedYear}年{selectedMonth === 0 ? '全年' : `${selectedMonth}月`}部門用電大水庫比例
                  {selectedYear === 2026 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                      當期累計
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-450 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg">跨部門比較</span>
              </div>

              {loadingCon ? (
                <div className="flex h-72 items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                </div>
              ) : errorCon ? (
                <div className="flex h-72 items-center justify-center text-rose-500 font-medium">
                  <AlertCircle className="w-5 h-5" />
                  <span>資料讀取失敗</span>
                </div>
              ) : sectorData.length === 0 ? (
                <ChartEmptyState message="目前篩選條件下無用電分類比例資料" />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={renderCustomizedPieLabel}
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SECTOR_COLORS[entry.key] || '#ccc'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                          itemStyle={{ fontSize: '13px', color: '#334155' }}
                          formatter={(value: any, name: any, props: any) => [
                            `${formatToBillionKwh(value)} (${props.payload.percentage.toFixed(1)}%)`, name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legends */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-h-36 overflow-y-auto mt-2 text-xs border-t border-slate-150 pt-4">
                    {sectorData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: SECTOR_COLORS[item.key] }} />
                        <span className="truncate font-semibold">{item.name} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: 供需平衡：電力輸配損耗與自用率 (Supply-Demand Balance) */}
      <section className="space-y-4 border-t border-slate-200/60 pt-6">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-cyan-500 rounded-full inline-block" />
            供需平衡：電力輸配損耗與自用率趨勢
          </h2>
          <p className="text-sm text-slate-500 mt-1">分析歷年或歷月全國總發購電量與總用電量之間的線路損耗與自用電占比波動</p>
          <div className="mt-2 text-sm font-semibold text-cyan-700 bg-cyan-50/50 px-3 py-2 rounded-xl border border-cyan-100/50 inline-block w-fit">
            💡 全國電網線路損耗與自用率維持在 4%~8% 國際高效水準；夏季常因高溫「熱阻效應」及用電大負載使線損顯著增加。
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Combined Supply & Demand Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-base text-slate-850 flex items-center gap-2">
                  電力輸配損耗與自用率走勢
                  {selectedYear === 2026 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                      ⚠️ 2026 年為當期累計
                    </span>
                  )}
                </span>
                <span className="text-sm text-slate-450 font-bold bg-slate-50 px-2.5 py-1 rounded-lg">單位：百分比 (%)</span>
              </div>

              {loadingGen || loadingConHistory ? (
                <div className="flex h-80 items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                </div>
              ) : combinedSupplyDemand.length === 0 ? (
                <ChartEmptyState message="目前篩選條件下無電網損耗自用率走勢資料" />
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={combinedSupplyDemand} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad-lossRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip content={<SupplyDemandCustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px', color: '#475569' }} />
                      <Area 
                        type="monotone" 
                        dataKey="lossRate" 
                        name="電力輸配損耗與自用率" 
                        stroke="#6366f1" 
                        strokeWidth={2.5} 
                        fill="url(#grad-lossRate)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Supply & Demand Info Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-base text-slate-850">電網效率與自用損耗說明</span>
              </div>
              
              <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-855 mb-1.5">⚡ 什麼是電力輸配損耗與自用率？</h4>
                  <p className="text-sm">這是指發電廠產出（或外購）的總電力在電網傳輸、變壓，以及電廠自用、抽蓄蓄能中所耗損或自我消費的比例。此百分比越低，代表全國電網的輸配電傳輸效率越高。</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-855 mb-1.5">📈 損耗與自用率變化趨勢</h4>
                  <p className="text-sm">
                    <strong>歷年趨勢</strong>：台灣電力系統的損耗與自用率通常穩定在 4.0% ~ 8.0% 之間。隨著輸配電網路全面升級、變電所汰舊換新，長期的電力輸送效率呈現穩步進步態勢。
                  </p>
                  <p className="text-sm mt-1.5">
                    <strong>月度波動</strong>：在月度數據中，通常夏季月份（如 7、8 月）的損耗率會略微上升。這是因為夏季氣溫偏高會使電線電阻增加，且空調大負載使得電流傳輸的熱損耗呈指數級增加，展現出夏季電網的傳輸負荷與壓力。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
