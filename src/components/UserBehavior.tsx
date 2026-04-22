import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { behaviorLogs, customers } from '../data/mockData';
import { Eye, MousePointer, Heart, ShoppingCart, ShoppingBag, Clock, Activity } from 'lucide-react';

export function UserBehavior() {
  // 5가지 행동만
  const TARGET_ACTIONS = ['view','scroll','wishlist','cart','purchase'] as const;
  const ACTION_LABELS: Record<string, string> = { view:'조회', scroll:'스크롤', wishlist:'찜', cart:'장바구니', purchase:'구매' };
  const ACTION_COLORS: Record<string, string> = { view:'#3b82f6', scroll:'#8b5cf6', wishlist:'#ec4899', cart:'#10b981', purchase:'#f59e0b' };
  const ACTION_ICONS: Record<string, any> = { view: Eye, scroll: Activity, wishlist: Heart, cart: ShoppingCart, purchase: ShoppingBag };

  const actionStats = TARGET_ACTIONS.map(a => ({
    action: ACTION_LABELS[a],
    count: behaviorLogs.filter(l => l.action === a).length,
    color: ACTION_COLORS[a],
    icon: ACTION_ICONS[a],
  }));

  const avgDuration = (() => {
    const logs = behaviorLogs.filter(l => l.duration);
    return logs.length ? Math.round(logs.reduce((s, l) => s + (l.duration||0), 0) / logs.length) : 0;
  })();
  const avgScroll = (() => {
    const logs = behaviorLogs.filter(l => l.scrollDepth);
    return logs.length ? Math.round(logs.reduce((s, l) => s + (l.scrollDepth||0), 0) / logs.length) : 0;
  })();
  const viewCount = behaviorLogs.filter(l => l.action === 'view').length;

  // 시간대별
  const hourlyMap: Record<number, number> = {};
  behaviorLogs.forEach(l => {
    const h = new Date(l.timestamp).getHours();
    hourlyMap[h] = (hourlyMap[h] || 0) + 1;
  });
  const hourlyData = Array.from({length: 24}, (_, h) => ({ hour: `${h}시`, count: hourlyMap[h] || 0 }));

  // 퍼널
  const funnelData = [
    { stage:'상품 조회',  count: behaviorLogs.filter(l => l.action === 'view').length,     color:'#3b82f6' },
    { stage:'스크롤/탐색', count: behaviorLogs.filter(l => l.action === 'scroll').length,   color:'#8b5cf6' },
    { stage:'찜하기',     count: behaviorLogs.filter(l => l.action === 'wishlist').length,  color:'#ec4899' },
    { stage:'장바구니',   count: behaviorLogs.filter(l => l.action === 'cart').length,      color:'#10b981' },
    { stage:'구매완료',   count: behaviorLogs.filter(l => l.action === 'purchase').length,  color:'#f59e0b' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">전체 고객 행동 분석</h1>
        <p className="text-gray-500 text-sm">고객의 웹사이트 내 행동 패턴</p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label:'평균 체류시간', value:`${avgDuration}초`, icon: Clock, color:'bg-blue-500' },
          { label:'평균 스크롤 깊이', value:`${avgScroll}%`, icon: Activity, color:'bg-purple-500' },
          { label:'총 페이지 조회', value:`${viewCount}회`, icon: Eye, color:'bg-orange-500' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4">
              <div className={`${m.color} p-3 rounded-lg text-white`}><Icon size={22} /></div>
              <div>
                <p className="text-sm text-gray-500">{m.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 행동 타입별 분포 + 시간대별 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">행동 타입별 분포</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={actionStats.map(a => ({ name: a.action, value: a.count, color: a.color }))}
                cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {actionStats.map(a => <Cell key={a.action} fill={a.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {actionStats.map(a => {
              const Icon = a.icon;
              return (
                <div key={a.action} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-gray-50 border border-gray-200">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  <Icon size={12} />
                  <span>{a.action} {a.count}건</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">시간대별 활동</h2>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [v, '건수']} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 구매 퍼널 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">구매 퍼널 분석</h2>
        <p className="text-sm text-gray-500 mb-5">상품 발견 → 구매까지의 전환 흐름</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="stage" type="category" width={85} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[0,4,4,0]}>
              {funnelData.map(e => <Cell key={e.stage} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-5 grid grid-cols-5 gap-3">
          {funnelData.map((s, i) => {
            const rate = i > 0 ? ((s.count / funnelData[i-1].count) * 100).toFixed(0) : '100';
            return (
              <div key={s.stage} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-xl font-bold text-gray-900">{s.count}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.stage}</div>
                {i > 0 && <div className="text-xs text-gray-400 mt-1">전환 {rate}%</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
