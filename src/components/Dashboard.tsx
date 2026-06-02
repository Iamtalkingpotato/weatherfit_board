import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getLogStats, getSuccessLogs, getFailLogs, getDashboardSummary, getAllFeedbacks, getAllPurchases, getCustomers, getCampaigns, getCoupons, getProducts, getRegions } from '../api/logApi';
import { Users, TrendingUp, TrendingDown, DollarSign, Tag, X, Search, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDetailPanel, DetailData } from './ChartDetailPanel';

const FEEDBACK_LABEL: Record<string, string> = { HOT: '덥다', COLD: '춥다', PERFECT: '적당했다' };
const STATUS_LABEL: Record<string, string>   = { PURCHASED: '구매완료', WISHLIST: '찜', CART: '장바구니', VIEW_ONLY: '조회만함' };

const PERIOD_LABELS = ['일별','주별','월별','연별'] as const;
type Period = typeof PERIOD_LABELS[number];

const pDate = (p: any): string => p.purchasedAt ?? p.purchaseDate ?? '';
const fbDate = (f: any): string => f.feedbackDate ?? f.createdAt ?? '';
// "2026-06-01T11:10:35" → "26-06-01 11:10:35"
function formatDate(raw: string): string {
  if (!raw) return '-';
  const clean = raw.replace('T', ' ').replace(/\.\d+/, '').replace(/Z$/, '');
  return clean.slice(2);
}

function buildRevenueSeries(purchased: any[], period: Period) {
  const map: Record<string, number> = {};
  purchased.forEach(p => {
    const d = pDate(p);
    if (!d) return;
    let key: string;
    if (period === '일별')      key = d.slice(5, 10);
    else if (period === '월별') key = d.slice(2, 7);
    else if (period === '연별') key = d.slice(0, 4);
    else {
      const dt = new Date(d);
      key = `${dt.getMonth()+1}월${Math.ceil(dt.getDate()/7)}주`;
    }
    map[key] = (map[key] || 0) + (p.price ?? 0);
  });
  return Object.entries(map)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function matchDate(p: any, dateStr: string, period: Period): boolean {
  const d = pDate(p);
  if (!d) return false;
  if (period === '일별') return d.slice(5, 10) === dateStr;
  if (period === '월별') return d.slice(2, 7) === dateStr;
  if (period === '연별') return d.slice(0, 4) === dateStr;
  const dt = new Date(d);
  return `${dt.getMonth()+1}월${Math.ceil(dt.getDate()/7)}주` === dateStr;
}

export function Dashboard() {
  const [pipelineStats, setPipelineStats] = useState({ successCount: 0, failCount: 0 });
  const [successLogs, setSuccessLogs]     = useState<any[]>([]);
  const [failLogs, setFailLogs]           = useState<any[]>([]);
  const [summary, setSummary]             = useState<any>(null);
  const [customers, setCustomers]         = useState<any[]>([]);
  const [purchases, setPurchases]         = useState<any[]>([]);
  const [feedbacks, setFeedbacks]         = useState<any[]>([]);
  const [campaigns, setCampaigns]         = useState<any[]>([]);
  const [coupons, setCoupons]             = useState<any[]>([]);
  const [products, setProducts]           = useState<any[]>([]);
  const [regions, setRegions]             = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);

  const [revPeriod, setRevPeriod]       = useState<Period>('일별');
  const [selectedCity, setSelectedCity] = useState<string>('전체');
  const [detail, setDetail]             = useState<DetailData | null>(null);

  const navigate = useNavigate();

  const fetchAll = useCallback(() => {
    setLoading(true);
    getLogStats().then(data => setPipelineStats(data)).catch(() => {});
    getSuccessLogs().then(data => setSuccessLogs(Array.isArray(data) ? data : [])).catch(() => {});
    getFailLogs().then(data => setFailLogs(Array.isArray(data) ? data : [])).catch(() => {});
    getCampaigns().then(data => setCampaigns(Array.isArray(data) ? data : [])).catch(() => {});
    getCoupons().then(data => setCoupons(Array.isArray(data) ? data : [])).catch(() => {});
    getProducts().then(data => setProducts(Array.isArray(data) ? data : [])).catch(() => {});
    getRegions().then(data => setRegions(Array.isArray(data) ? data : [])).catch(() => {});
    getCustomers().then(data => setCustomers(Array.isArray(data) ? data : [])).catch(() => setCustomers([]));
    Promise.all([
      getDashboardSummary().catch(() => null),
      getAllPurchases().catch(() => []),
      getAllFeedbacks().catch(() => []),
    ]).then(([sum, purs, fbs]) => {
      setSummary(sum);
      setPurchases(Array.isArray(purs) ? purs : []);
      setFeedbacks(Array.isArray(fbs) ? fbs : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── 파생 데이터 ──────────────────────────────────────────
  const custMap = useMemo(
    () => Object.fromEntries(customers.map(c => [String(c.id), c.name])),
    [customers]
  );

  const purchased = useMemo(() => purchases.filter(p => p.status === 'PURCHASED'), [purchases]);

  const totalRevenue = summary?.totalRevenue
    ?? purchased.reduce((s, p) => s + (p.price ?? 0), 0);

  const totalCustomers = summary?.totalCustomers ?? customers.length;

  const today = new Date().toISOString().slice(0, 10);
  const todayRevenue = purchased
    .filter(p => pDate(p)?.startsWith(today))
    .reduce((s, p) => s + (p.price ?? 0), 0);

  const revData = useMemo(
    () => buildRevenueSeries(purchased, revPeriod),
    [purchased, revPeriod]
  );
  const prevRevenue = revData.length >= 2 ? revData[revData.length - 2].revenue : 0;
  const curRevenue  = revData[revData.length - 1]?.revenue ?? 0;
  const revChange   = prevRevenue > 0 ? (((curRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : '0';

  const cities = useMemo(() => {
    const set = new Set(feedbacks.map(f => f.regionName ?? '기타'));
    return ['전체', ...Array.from(set)];
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() =>
    selectedCity === '전체'
      ? feedbacks
      : feedbacks.filter(f => (f.regionName ?? '기타') === selectedCity),
    [feedbacks, selectedCity]
  );

  const feedbackData = [
    { name: FEEDBACK_LABEL['HOT'],     value: filteredFeedbacks.filter(f => f.feedback === 'HOT').length,     color: '#ef4444' },
    { name: FEEDBACK_LABEL['COLD'],    value: filteredFeedbacks.filter(f => f.feedback === 'COLD').length,    color: '#3b82f6' },
    { name: FEEDBACK_LABEL['PERFECT'], value: filteredFeedbacks.filter(f => f.feedback === 'PERFECT').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const purchaseStatusData = [
    { name: STATUS_LABEL['PURCHASED'], value: purchases.filter(p => p.status === 'PURCHASED').length, color:'#10b981' },
    { name: STATUS_LABEL['WISHLIST'],  value: purchases.filter(p => p.status === 'WISHLIST').length,  color:'#f59e0b' },
    { name: STATUS_LABEL['CART'],      value: purchases.filter(p => p.status === 'CART').length,      color:'#3b82f6' },
    { name: STATUS_LABEL['VIEW_ONLY'], value: purchases.filter(p => p.status === 'VIEW_ONLY').length, color:'#6b7280' },
  ].filter(d => d.value > 0);

  const activeCampaignCount = campaigns.filter(c => c.status === '실행중').length;
  const activeCouponCount   = coupons.filter(c => c.status === 'ACTIVE').length;

  // ── 카드 클릭 핸들러 ─────────────────────────────────────
  const handleCardClick = (name: string) => {
    if (name === '전체 고객') {
      setDetail({
        title: '전체 고객 목록', subtitle: `총 ${customers.length}명`, color: '#3b82f6',
        columns: ['이름', '이메일', '생년월일', '멤버십', '가입일'],
        rows: customers.map(c => ({
          '이름': c.name, '이메일': c.email, '생년월일': c.birthDate ?? '-',
          '멤버십': c.membershipLevel, '가입일': c.joinDate ?? '-',
        })),
      });
    } else if (name === '총 매출(누적)') {
      const rows = purchased
        .filter(p => pDate(p)?.startsWith(today))
        .map(p => ({
          '고객명': custMap[String(p.customerId)] ?? '-',
          '상품': products.find(prod => prod.id === Number(p.productId))?.productName ?? p.productId ?? '-',
          '금액': `₩${(p.price ?? 0).toLocaleString()}`,
          '구매일': formatDate(pDate(p)),
        }))
        .sort((a, b) => String(b['구매일'] ?? '').localeCompare(String(a['구매일'] ?? '')));
      setDetail({
        title: `오늘(${today}) 매출 내역`,
        subtitle: rows.length > 0
          ? `총 ${rows.length}건 · ₩${todayRevenue.toLocaleString()}`
          : '오늘 매출 없음',
        color: '#6366f1',
        columns: ['고객명', '상품', '금액', '구매일'],
        rows,
      });
    } else if (name === '실행중인 캠페인') {
      navigate('/campaign');
    } else if (name === '활성 쿠폰') {
      navigate('/coupon');
    }
  };

  const openAllPipelineLogs = () => {
    Promise.all([
      getSuccessLogs().catch(() => []),
      getFailLogs().catch(() => []),
    ]).then(([successData, failData]: any[]) => {
      const successRows = (Array.isArray(successData) ? successData : []).map((r: any) => ({
        status: '성공',
        id: r.id,
        topic: r.topic,
        dataType: r.dataType ?? '-',
        failReason: '-',
        rawMessage: r.rawMessage,
        processedAt: r.processedAt,   // 정렬용 원본 보존
      }));
      const failRows = (Array.isArray(failData) ? failData : []).map((r: any) => ({
        status: '실패',
        id: r.id,
        topic: r.topic,
        dataType: r.failType ?? '-',
        failReason: r.failReason ?? '-',
        rawMessage: r.rawMessage,
        processedAt: r.processedAt,   // 정렬용 원본 보존
      }));
      const rows = [...successRows, ...failRows]
        .sort((a, b) => String(b.processedAt ?? '').localeCompare(String(a.processedAt ?? '')))
        .map(r => ({ ...r, processedAt: formatDate(r.processedAt) }));  // 정렬 후 포맷

      setDetail({
        title: '파이프라인 로그 전체',
        subtitle: `성공 ${successRows.length}건 · 실패 ${failRows.length}건`,
        color: '#10b981',
        wide: true,
        columns: ['status', 'id', 'topic', 'failReason', 'dataType', 'rawMessage', 'processedAt'],
        rows,
        filters: [
          { label: '성공만', column: 'status', value: '성공', color: '#10b981' },
          { label: '실패만', column: 'status', value: '실패', color: '#ef4444' },
        ],
      });
    });
  };

  // ── 렌더 ────────────────────────────────────────────────
  const PipelineIcon   = pipelineStats.failCount > 0 ? TrendingDown : TrendingUp;
  const pipelineIconBg = pipelineStats.failCount > 0 ? 'bg-red-500' : 'bg-emerald-500';

  const statCards = [
    { name: '전체 고객',      value: loading ? '…' : `${totalCustomers}명`,               subtitle: undefined,                                   icon: Users,      color: 'bg-blue-500' },
    { name: '총 매출(누적)',   value: loading ? '…' : `₩${totalRevenue.toLocaleString()}`, subtitle: loading ? undefined : `오늘 ₩${todayRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-indigo-500' },
    { name: '실행중인 캠페인', value: `${activeCampaignCount}개`,                           subtitle: undefined,                                   icon: TrendingUp, color: 'bg-violet-500' },
    { name: '활성 쿠폰',      value: `${activeCouponCount}개`,                              subtitle: undefined,                                   icon: Tag,        color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">대시보드</h1>
          <p className="text-gray-500 text-sm">WeatherFit 전체 현황</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(s.name)}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`${s.color} p-2.5 rounded-lg text-white`}><Icon size={20} /></div>
                <p className="text-sm text-gray-500">{s.name}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
              {s.subtitle !== undefined && (
                <p className="text-sm font-medium mt-0.5 text-gray-400">{s.subtitle}</p>
              )}
            </div>
          );
        })}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={openAllPipelineLogs}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`${pipelineIconBg} p-2.5 rounded-lg text-white`}><PipelineIcon size={20} /></div>
            <p className="text-sm text-gray-500">파이프라인</p>
          </div>
          <p className="text-xl font-semibold text-emerald-600">성공 {pipelineStats.successCount}건</p>
          <p className={`text-sm font-medium mt-0.5 ${pipelineStats.failCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>실패 {pipelineStats.failCount}건</p>
        </div>
      </div>

      {/* 매출 추이 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">총 매출 추이</h2>
            <div className="flex items-center gap-2 mt-1">
              <DollarSign size={16} className="text-green-500" />
              <span className="text-xl font-semibold text-gray-900">
                {loading ? '…' : `₩${totalRevenue.toLocaleString()}`}
              </span>
              {!loading && revData.length >= 2 && (
                <span className={`text-sm font-medium flex items-center gap-0.5 ${Number(revChange) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {Number(revChange) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Number(revChange) >= 0 ? '+' : ''}{revChange}%
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {PERIOD_LABELS.map(p => (
              <button key={p} onClick={() => setRevPeriod(p)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${revPeriod === p ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-60 flex items-center justify-center text-gray-400 text-sm">데이터를 불러오는 중...</div>
        ) : revData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-gray-400 text-sm">데이터가 없습니다</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} />
              <Tooltip formatter={(v: number) => [`₩${v.toLocaleString()}`, '매출']} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} cursor="pointer"
                onClick={(barData: any) => {
                  const dateStr: string = barData.date;
                  const rows = purchased
                    .filter(p => matchDate(p, dateStr, revPeriod))
                    .map(p => ({
                      '고객명': custMap[String(p.customerId)] ?? '-',
                      '금액': `₩${(p.price ?? 0).toLocaleString()}`,
                      '구매일': formatDate(pDate(p)),
                    }))
                    .sort((a, b) => String(b['구매일'] ?? '').localeCompare(String(a['구매일'] ?? '')));
                  const totalAmt = rows.reduce((s, r) => s + Number(String(r['금액']).replace(/[₩,]/g, '')), 0);
                  setDetail({
                    title: `${dateStr} 구매 상세`,
                    subtitle: `총 ${rows.length}건 · ₩${totalAmt.toLocaleString()}`,
                    color: '#3b82f6',
                    columns: ['고객명', '금액', '구매일'],
                    rows,
                  });
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 파이프라인 현황 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">파이프라인 현황</h2>
          <button onClick={openAllPipelineLogs} className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">
            전체보기
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-2.5 pr-6 font-medium text-gray-500 whitespace-nowrap">처리시각</th>
              <th className="pb-2.5 pr-6 font-medium text-gray-500 whitespace-nowrap">토픽</th>
              <th className="pb-2.5 font-medium text-gray-500">메시지</th>
            </tr>
          </thead>
          <tbody>
            {successLogs.slice(0, 5).map((log, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 pr-6 text-gray-500 whitespace-nowrap">{formatDate(log.processedAt)}</td>
                <td className="py-2.5 pr-6 text-gray-700 whitespace-nowrap">{log.topic}</td>
                <td className="py-2.5 text-gray-600">
                  {log.rawMessage?.length > 50 ? `${log.rawMessage.slice(0, 50)}…` : log.rawMessage}
                </td>
              </tr>
            ))}
            {successLogs.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-gray-400">데이터 없음</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 피드백 + 구매 상태 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">온도 피드백 분포</h2>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">데이터를 불러오는 중...</div>
          ) : feedbackData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">데이터가 없습니다</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={feedbackData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {feedbackData.map(e => (
                    <Cell key={e.name} fill={e.color} cursor="pointer" style={{ outline: 'none' }}
                      onClick={() => {
                        const fbKey = e.name === '덥다' ? 'HOT' : e.name === '춥다' ? 'COLD' : 'PERFECT';
                        const rows = filteredFeedbacks
                          .filter(f => f.feedback === fbKey)
                          .map(f => ({
                            '고객명': custMap[String(f.customerId)] ?? '-',
                            '실제온도': `${f.temperature ?? '-'}°C`,
                            '날짜': formatDate(fbDate(f)),
                            '지역': f.regionName ?? '-',
                          }))
                          .sort((a, b) => String(b['날짜'] ?? '').localeCompare(String(a['날짜'] ?? '')));
                        setDetail({
                          title: `"${e.name}" 피드백 고객 목록`,
                          subtitle: `${selectedCity !== '전체' ? selectedCity + ' · ' : ''}총 ${rows.length}건`,
                          color: e.color,
                          columns: ['고객명', '실제온도', '날짜', '지역'],
                          rows,
                        });
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">구매 상태 분포</h2>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">데이터를 불러오는 중...</div>
          ) : purchaseStatusData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">데이터가 없습니다</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={purchaseStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[4,4,0,0]} cursor="pointer"
                  onClick={(barData: any) => {
                    const statusKey = Object.entries(STATUS_LABEL).find(([,v]) => v === barData.name)?.[0];
                    const rows = purchases
                      .filter(p => p.status === statusKey)
                      .map(p => ({
                        '고객명': custMap[String(p.customerId)] ?? '-',
                        '금액': `₩${(p.price ?? 0).toLocaleString()}`,
                        '날짜': formatDate(pDate(p)),
                      }))
                      .sort((a, b) => String(b['날짜'] ?? '').localeCompare(String(a['날짜'] ?? '')));
                    setDetail({
                      title: `${barData.name} 목록`,
                      subtitle: `총 ${rows.length}건`,
                      color: purchaseStatusData.find(d => d.name === barData.name)?.color,
                      columns: ['고객명', '금액', '날짜'],
                      rows,
                    });
                  }}>
                  {purchaseStatusData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <ChartDetailPanel data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
