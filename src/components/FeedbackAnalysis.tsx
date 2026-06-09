import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllFeedbacks, getCustomers, getRegions } from '../api/logApi';

interface TemperatureFeedback {
  id?: number;
  customerId?: number;
  feedback?: string;
  temperature?: number;
  humidity?: number;
  weatherCondition?: string;
  feedbackDate?: string;
  createdAt?: string;
  regionName?: string;
}

const FEEDBACK_LABEL: Record<string, string> = { HOT: '덥다', COLD: '춥다', PERFECT: '적당했다' };
const WEATHER_LABEL: Record<string, string> = {
  CLEAR: '맑음', CLOUDY: '흐림', PARTLY_CLOUDY: '구름 조금',
  RAIN: '비', SNOW: '눈', FOG: '안개', WIND: '바람', THUNDER: '천둥번개',
  SLEET: '진눈깨비', HAIL: '우박', DUST: '황사', SMOKE: '연기',
};
import { TrendingUp, TrendingDown, Minus, Search, Activity, RefreshCw, Calendar } from 'lucide-react';
import { ChartDetailPanel, DetailData } from './ChartDetailPanel';

type RangeType = 'today' | '7d' | 'custom';

function toLocalDateStr(d: Date): string {
  return d.toLocaleDateString('sv-SE');
}

const fbDate = (f: any): string => f.feedbackDate ?? f.createdAt ?? '';

export function FeedbackAnalysis() {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [feedbacks, setFeedbacks] = useState<TemperatureFeedback[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState('');

  // ── 날짜 필터 ─────────────────────────────────────────────────────────────
  const [rangeType, setRangeType] = useState<RangeType>('today');
  const todayStr = toLocalDateStr(new Date());
  const [customStart, setCustomStart] = useState(toLocalDateStr(new Date(Date.now() - 29 * 86400000)));
  const [customEnd,   setCustomEnd]   = useState(todayStr);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const t = toLocalDateStr(new Date());
    if (rangeType === 'today') return { rangeStart: t, rangeEnd: t };
    if (rangeType === '7d')    return { rangeStart: toLocalDateStr(new Date(Date.now() - 6 * 86400000)), rangeEnd: t };
    return { rangeStart: customStart || t, rangeEnd: customEnd || t };
  }, [rangeType, customStart, customEnd]);

  // 날짜 필터 적용된 피드백
  const allFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const raw = f.feedbackDate ?? f.createdAt;
      if (!raw) return false;
      const d = String(raw).slice(0, 10).replace(/\./g, '-');
      return d >= rangeStart && d <= rangeEnd;
    });
  }, [feedbacks, rangeStart, rangeEnd]);

  const load = () => {
    setLoading(true);
    Promise.all([getAllFeedbacks(), getCustomers(), getRegions()]).then(([fbs, custs, regs]) => {
      setFeedbacks(Array.isArray(fbs) ? fbs : []);
      setCustomers(Array.isArray(custs) ? custs : []);
      setRegions(Array.isArray(regs) ? regs : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const total   = allFeedbacks.length;
  const hot     = allFeedbacks.filter(f => f.feedback === 'HOT').length;
  const cold    = allFeedbacks.filter(f => f.feedback === 'COLD').length;
  const perfect = allFeedbacks.filter(f => f.feedback === 'PERFECT').length;

  const stats = [
    { name:'전체',    count: total,   pct: '100',                                           icon: Activity,     bg:'bg-gray-50',  iconBg:'bg-gray-500',  text:'text-gray-600',  color:'#6b7280', fbKey: null    },
    { name:'덥다',    count: hot,     pct: total ? ((hot/total)*100).toFixed(1) : '0',      icon: TrendingUp,   bg:'bg-red-50',   iconBg:'bg-red-500',   text:'text-red-600',   color:'#ef4444', fbKey: 'HOT'   },
    { name:'춥다',    count: cold,    pct: total ? ((cold/total)*100).toFixed(1) : '0',     icon: TrendingDown, bg:'bg-blue-50',  iconBg:'bg-blue-500',  text:'text-blue-600',  color:'#3b82f6', fbKey: 'COLD'  },
    { name:'적당했다', count: perfect, pct: total ? ((perfect/total)*100).toFixed(1) : '0',  icon: Minus,        bg:'bg-green-50', iconBg:'bg-green-500', text:'text-green-600', color:'#10b981', fbKey: 'PERFECT'},
  ];

  const custMap = useMemo(
    () => Object.fromEntries(customers.map(c => [String(c.id), c.name])),
    [customers],
  );

  const tempData = useMemo(() => {
    const tempMap: Record<string, Record<string, number>> = {};
    allFeedbacks.forEach(f => {
      const temp = f.temperature ?? 0;
      const range = `${Math.floor(temp/5)*5}~${Math.floor(temp/5)*5+5}°C`;
      if (!tempMap[range]) tempMap[range] = { 덥다:0, 춥다:0, 적당했다:0 };
      const label = FEEDBACK_LABEL[f.feedback];
      if (label) tempMap[range][label]++;
    });
    return Object.entries(tempMap)
      .map(([range, v]) => ({ range, ...v }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));
  }, [allFeedbacks]);

  const cityData = useMemo(() => {
    const cityMap: Record<string, Record<string, number>> = {};
    allFeedbacks.forEach(f => {
      const city = f.regionName ?? '기타';
      if (!cityMap[city]) cityMap[city] = { 덥다:0, 춥다:0, 적당했다:0 };
      const label = FEEDBACK_LABEL[f.feedback];
      if (label) cityMap[city][label]++;
    });
    return Object.entries(cityMap).map(([city, v]) => ({ city, ...v }));
  }, [allFeedbacks]);

  const buildDetailRows = (list: TemperatureFeedback[]) =>
    [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).map(f => ({
      '고객명': custMap[String(f.customerId)] ?? '-',
      '지역': f.regionName ?? '-',
      '실제온도': `${f.temperature ?? '-'}°C`,
      '날짜': fbDate(f) || '-',
    }));
  const detailColumns = ['고객명', '지역', '실제온도', '날짜'];

  const sortedFeedbacks = useMemo(
    () => [...allFeedbacks].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)),
    [allFeedbacks],
  );
  const filteredTable = useMemo(() => {
    if (!tableSearch.trim()) return sortedFeedbacks.slice(0, 50);
    const q = tableSearch.trim().toLowerCase();
    return sortedFeedbacks.filter(f => {
      const name = (custMap[String(f.customerId)] ?? '').toLowerCase();
      const date = fbDate(f).toLowerCase();
      const weather = (WEATHER_LABEL[f.weatherCondition] ?? f.weatherCondition ?? '').toLowerCase();
      const fb = (FEEDBACK_LABEL[f.feedback] ?? f.feedback ?? '').toLowerCase();
      return name.includes(q) || date.includes(q) || weather.includes(q) || fb.includes(q);
    });
  }, [sortedFeedbacks, tableSearch, custMap]);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">온도 피드백 분석</h1>
          <p className="text-gray-500 text-sm">고객이 느끼는 체감 온도 분석</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 날짜 필터 */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {([
              { key: 'today',  label: '오늘' },
              { key: '7d',     label: '7일'  },
              { key: 'custom', label: '원하는 기간' },
            ] as { key: RangeType; label: string }[]).map(btn => (
              <button
                key={btn.key}
                onClick={() => setRangeType(btn.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  rangeType === btn.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {rangeType === 'custom' && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Calendar size={13} className="text-gray-400 shrink-0" />
              <input
                type="date"
                value={customStart}
                max={customEnd}
                min={toLocalDateStr(new Date(new Date(customEnd).getTime() - 5 * 365 * 86400000))}
                onChange={e => setCustomStart(e.target.value)}
                className="text-xs border-none outline-none bg-transparent text-gray-700 cursor-pointer"
              />
              <span className="text-gray-300 text-xs">~</span>
              <input
                type="date"
                value={customEnd}
                min={customStart}
                max={toLocalDateStr(new Date(new Date(customStart).getTime() + 5 * 365 * 86400000))}
                onChange={e => setCustomEnd(e.target.value)}
                className="text-xs border-none outline-none bg-transparent text-gray-700 cursor-pointer"
              />
            </div>
          )}

          {/* 새로고침 */}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">데이터를 불러오는 중...</div>
      ) : feedbacks.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">데이터가 없습니다</div>
      ) : (
        <>
          {total === 0 && (
            <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              선택한 기간에 피드백 데이터가 없습니다.
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div
                  key={s.name}
                  className={`${s.bg} rounded-xl p-5 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => {
                    const list = s.fbKey ? allFeedbacks.filter(f => f.feedback === s.fbKey) : allFeedbacks;
                    const rows = buildDetailRows(list);
                    const title = s.name === '전체' ? '전체 피드백 상세' : `"${s.name}" 피드백 상세`;
                    setDetail({ title, subtitle: `총 ${rows.length}건`, color: s.color, columns: detailColumns, rows });
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className={`${s.iconBg} p-2.5 rounded-lg text-white`}><Icon size={18} /></div>
                    <span className={`text-xl font-bold ${s.text}`}>{s.name === '전체' ? `${total}건` : `${s.pct}%`}</span>
                  </div>
                  <p className="text-sm text-gray-600">{s.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{s.count}건</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">지역(시)별 피드백</h2>
            {cityData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">데이터 없음</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cityData} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="city"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    tickFormatter={(value: string) =>
                      value.replace('특별자치도', '').replace('특별자치시', '').replace('광역시', '').replace('특별시', '')
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="덥다" fill="#ef4444" stackId="a" cursor="pointer"
                    onClick={(data: any) => {
                      const rows = buildDetailRows(allFeedbacks.filter(f => (f.regionName ?? '기타') === data.city && f.feedback === 'HOT'));
                      setDetail({ title: `${data.city} — "덥다" 피드백`, subtitle: `총 ${rows.length}건`, color: '#ef4444', columns: detailColumns, rows });
                    }}
                  />
                  <Bar dataKey="적당했다" fill="#10b981" stackId="a" cursor="pointer"
                    onClick={(data: any) => {
                      const rows = buildDetailRows(allFeedbacks.filter(f => (f.regionName ?? '기타') === data.city && f.feedback === 'PERFECT'));
                      setDetail({ title: `${data.city} — "적당했다" 피드백`, subtitle: `총 ${rows.length}건`, color: '#10b981', columns: detailColumns, rows });
                    }}
                  />
                  <Bar dataKey="춥다" fill="#3b82f6" stackId="a" radius={[4,4,0,0]} cursor="pointer"
                    onClick={(data: any) => {
                      const rows = buildDetailRows(allFeedbacks.filter(f => (f.regionName ?? '기타') === data.city && f.feedback === 'COLD'));
                      setDetail({ title: `${data.city} — "춥다" 피드백`, subtitle: `총 ${rows.length}건`, color: '#3b82f6', columns: detailColumns, rows });
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">온도 구간별 피드백 분포</h2>
            {tempData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">데이터 없음</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="덥다" fill="#ef4444" stackId="a" cursor="pointer"
                    onClick={(data: any) => {
                      const [minStr] = (data.range as string).split('~');
                      const minT = parseInt(minStr); const maxT = minT + 5;
                      const rows = buildDetailRows(allFeedbacks.filter(f => (f.temperature ?? 0) >= minT && (f.temperature ?? 0) < maxT && f.feedback === 'HOT'));
                      setDetail({ title: `${data.range} — "덥다" 피드백`, subtitle: `총 ${rows.length}건`, color: '#ef4444', columns: detailColumns, rows });
                    }}
                  />
                  <Bar dataKey="적당했다" fill="#10b981" stackId="a" cursor="pointer"
                    onClick={(data: any) => {
                      const [minStr] = (data.range as string).split('~');
                      const minT = parseInt(minStr); const maxT = minT + 5;
                      const rows = buildDetailRows(allFeedbacks.filter(f => (f.temperature ?? 0) >= minT && (f.temperature ?? 0) < maxT && f.feedback === 'PERFECT'));
                      setDetail({ title: `${data.range} — "적당했다" 피드백`, subtitle: `총 ${rows.length}건`, color: '#10b981', columns: detailColumns, rows });
                    }}
                  />
                  <Bar dataKey="춥다" fill="#3b82f6" stackId="a" radius={[4,4,0,0]} cursor="pointer"
                    onClick={(data: any) => {
                      const [minStr] = (data.range as string).split('~');
                      const minT = parseInt(minStr); const maxT = minT + 5;
                      const rows = buildDetailRows(allFeedbacks.filter(f => (f.temperature ?? 0) >= minT && (f.temperature ?? 0) < maxT && f.feedback === 'COLD'));
                      setDetail({ title: `${data.range} — "춥다" 피드백`, subtitle: `총 ${rows.length}건`, color: '#3b82f6', columns: detailColumns, rows });
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900">최근 피드백 상세</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="고객명, 날짜, 날씨, 피드백 검색..."
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {tableSearch ? `${filteredTable.length}건` : `상위 50건 / 전체 ${total}건`}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    {([
                      ['날짜',    'text-right', ''],
                      ['고객',    'text-left',  ''],
                      ['지역',    'text-left',  'w-24 max-w-[6rem]'],
                      ['실제온도', 'text-right', 'w-20'],
                      ['습도',    'text-right',  ''],
                      ['날씨',    'text-left',   ''],
                      ['피드백',  'text-center', ''],
                    ] as [string, string, string][]).map(([h, align, w]) => (
                      <th key={h} className={`${align} ${w} py-3 px-3 font-medium`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTable.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">데이터가 없습니다</td>
                    </tr>
                  ) : filteredTable.map((f, i) => {
                    const fbLabel = FEEDBACK_LABEL[f.feedback] ?? f.feedback;
                    return (
                      <tr key={f.id ?? i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-right">{fbDate(f) || '-'}</td>
                        <td className="py-2.5 px-3 font-medium">{custMap[String(f.customerId)] ?? '-'}</td>
                        <td className="py-2.5 px-3 text-gray-500 w-24 max-w-[6rem] truncate">{f.regionName ?? '-'}</td>
                        <td className="py-2.5 px-3 text-right w-20">{f.temperature != null ? `${f.temperature}°C` : '-'}</td>
                        <td className="py-2.5 px-3 text-right text-gray-500">{f.humidity != null ? `${f.humidity}%` : '-'}</td>
                        <td className="py-2.5 px-3 text-gray-500">{WEATHER_LABEL[f.weatherCondition] ?? f.weatherCondition ?? '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${f.feedback === 'PERFECT' ? 'bg-green-100 text-green-800' : f.feedback === 'HOT' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {fbLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <ChartDetailPanel data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
