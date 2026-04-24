import { useState } from 'react';
import { Users, ShoppingCart, Heart, TrendingUp, DollarSign, ThermometerSun, Tag } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats, revenueTimeSeries, purchaseData, temperatureFeedbacks, getRegion, STATUS_LABEL, FEEDBACK_LABEL, coupons } from '../data/mockData';

const PERIOD_LABELS = ['일별','주별','월별','연별'] as const;
type Period = typeof PERIOD_LABELS[number];

export function Dashboard() {
  const stats = getDashboardStats();
  const [revPeriod, setRevPeriod] = useState<Period>('일별');
  const [selectedCity, setSelectedCity] = useState<string>('전체');

  const revData = revPeriod === '일별' ? revenueTimeSeries.daily
    : revPeriod === '주별' ? revenueTimeSeries.weekly
    : revPeriod === '월별' ? revenueTimeSeries.monthly
    : revenueTimeSeries.yearly;

  const prevRevenue = revData.length >= 2 ? revData[revData.length - 2].revenue : 0;
  const curRevenue  = revData[revData.length - 1]?.revenue ?? 0;
  const revChange   = prevRevenue > 0 ? (((curRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : '0';

  // 지역별 피드백
  const cities = ['전체', ...Array.from(new Set(temperatureFeedbacks.map(f => getRegion(f.regionId)?.city ?? '기타')))];
  const filteredFeedbacks = selectedCity === '전체'
    ? temperatureFeedbacks
    : temperatureFeedbacks.filter(f => getRegion(f.regionId)?.city === selectedCity);

  const feedbackData = [
    { name: FEEDBACK_LABEL['HOT'],     value: filteredFeedbacks.filter(f => f.feedback === 'HOT').length,     color: '#ef4444' },
    { name: FEEDBACK_LABEL['COLD'],    value: filteredFeedbacks.filter(f => f.feedback === 'COLD').length,    color: '#3b82f6' },
    { name: FEEDBACK_LABEL['PERFECT'], value: filteredFeedbacks.filter(f => f.feedback === 'PERFECT').length, color: '#10b981' },
  ];

  const purchaseStatusData = [
    { name: STATUS_LABEL['PURCHASED'], value: purchaseData.filter(p => p.status === 'PURCHASED').length, color:'#10b981' },
    { name: STATUS_LABEL['WISHLIST'],  value: purchaseData.filter(p => p.status === 'WISHLIST').length,  color:'#f59e0b' },
    { name: STATUS_LABEL['CART'],      value: purchaseData.filter(p => p.status === 'CART').length,      color:'#3b82f6' },
    { name: STATUS_LABEL['VIEW_ONLY'], value: purchaseData.filter(p => p.status === 'VIEW_ONLY').length, color:'#6b7280' },
  ];

  const statCards = [
    { name: '전체 고객',   value: `${stats.totalCustomers}명`,  icon: Users,          color: 'bg-blue-500' },
    { name: '구매 완료',   value: `${stats.totalPurchases}건`,  icon: ShoppingCart,   color: 'bg-purple-500' },
    { name: '찜 목록',     value: `${stats.totalWishlist}건`,   icon: Heart,          color: 'bg-pink-500' },
    { name: '온도 피드백', value: `${stats.totalFeedbacks}건`,  icon: ThermometerSun, color: 'bg-green-500' },
    { name: '발급 쿠폰',   value: `${coupons.reduce((s,c)=>s+c.issuedCount,0)}건`, icon: Tag, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">대시보드</h1>
        <p className="text-gray-500 text-sm">WeatherFit 전체 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${s.color} p-2.5 rounded-lg text-white`}><Icon size={20} /></div>
                <p className="text-sm text-gray-500">{s.name}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">총 매출 추이</h2>
            <div className="flex items-center gap-2 mt-1">
              <DollarSign size={16} className="text-green-500" />
              <span className="text-xl font-semibold text-gray-900">₩{stats.totalRevenue.toLocaleString()}</span>
              <span className={`text-sm font-medium flex items-center gap-0.5 ${Number(revChange) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                <TrendingUp size={14} />
                {revChange}%
              </span>
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
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={revData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} />
            <Tooltip formatter={(v: number) => [`₩${v.toLocaleString()}`, '매출']} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">온도 피드백 분포</h2>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={feedbackData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {feedbackData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">구매 상태 분포</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={purchaseStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {purchaseStatusData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
