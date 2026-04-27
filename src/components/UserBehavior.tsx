import { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { behaviorLogs, ACTION_LABEL, customers } from '../data/mockData';
import { Eye, MousePointer, Heart, ShoppingCart, ShoppingBag, Clock, Activity } from 'lucide-react';
import { ChartDetailPanel, DetailData } from './ChartDetailPanel';

export function UserBehavior() {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const TARGET_ACTIONS = ['VIEW','SCROLL','WISHLIST','CART','PURCHASE'] as const;
  const ACTION_COLORS: Record<string, string> = { VIEW:'#3b82f6', SCROLL:'#8b5cf6', WISHLIST:'#ec4899', CART:'#10b981', PURCHASE:'#f59e0b' };
  const ACTION_ICONS:  Record<string, any>    = { VIEW: Eye, SCROLL: Activity, WISHLIST: Heart, CART: ShoppingCart, PURCHASE: ShoppingBag };

  const actionStats = TARGET_ACTIONS.map(a => ({
    action: ACTION_LABEL[a],
    count: behaviorLogs.filter(l => l.action === a).length,
    color: ACTION_COLORS[a],
    icon:  ACTION_ICONS[a],
  }));

  const avgDuration = (() => {
    const logs = behaviorLogs.filter(l => l.duration);
    return logs.length ? Math.round(logs.reduce((s, l) => s + (l.duration||0), 0) / logs.length) : 0;
  })();
  const avgScroll = (() => {
    const logs = behaviorLogs.filter(l => l.scrollDepth);
    return logs.length ? Math.round(logs.reduce((s, l) => s + (l.scrollDepth||0), 0) / logs.length) : 0;
  })();
  const viewCount = behaviorLogs.filter(l => l.action === 'VIEW').length;

  // 시간대별
  const hourlyMap: Record<number, number> = {};
  behaviorLogs.forEach(l => {
    const h = new Date(l.timestamp).getHours();
    hourlyMap[h] = (hourlyMap[h] || 0) + 1;
  });
  const hourlyData = Array.from({length: 24}, (_, h) => ({ hour: `${h}시`, count: hourlyMap[h] || 0 }));

  // 퍼널
  const funnelData = [
    { stage:'상품 조회',  count: behaviorLogs.filter(l => l.action === 'VIEW').length,     color:'#3b82f6' },
    { stage:'스크롤/탐색', count: behaviorLogs.filter(l => l.action === 'SCROLL').length,   color:'#8b5cf6' },
    { stage:'찜하기',     count: behaviorLogs.filter(l => l.action === 'WISHLIST').length,  color:'#ec4899' },
    { stage:'장바구니',   count: behaviorLogs.filter(l => l.action === 'CART').length,      color:'#10b981' },
    { stage:'구매완료',   count: behaviorLogs.filter(l => l.action === 'PURCHASE').length,  color:'#f59e0b' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">전체 고객 행동 분석</h1>
        <p className="text-gray-500 text-sm">고객의 웹사이트 내 행동 패턴</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label:'평균 체류시간',    value:`${avgDuration}초`, icon: Clock,    color:'bg-blue-500' },
          { label:'평균 스크롤 깊이', value:`${avgScroll}%`,    icon: Activity, color:'bg-purple-500' },
          { label:'총 페이지 조회',  value:`${viewCount}회`,   icon: Eye,      color:'bg-orange-500' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">행동 타입별 분포</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={actionStats.map(a => ({ name: a.action, value: a.count, color: a.color }))}
                cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}
                cursor="pointer"
                onClick={(data: any) => {
                  const custMap = Object.fromEntries(customers.map(c => [c.id, c.name]));
                  const actionKey = Object.entries({ VIEW:'조회', SCROLL:'스크롤', WISHLIST:'찜', CART:'장바구니', PURCHASE:'구매' }).find(([,v]) => v === data.name)?.[0] ?? '';
                  const rows = behaviorLogs
                    .filter(l => l.action === actionKey)
                    .slice(0, 50)
                    .map(l => ({
                      '고객명': custMap[l.customerId] ?? '-',
                      '페이지': l.pageUrl,
                      '체류시간': l.duration ? `${l.duration}초` : '-',
                      '시각': l.timestamp.slice(11, 16),
                    }));
                  setDetail({
                    title: `${data.name} 행동 로그`,
                    subtitle: `총 ${behaviorLogs.filter(l => l.action === actionKey).length}건 (최대 50건 표시)`,
                    color: ACTION_COLORS[actionKey],
                    columns: ['고객명', '페이지', '체류시간', '시각'],
                    rows,
                  });
                }}>
                {actionStats.map(a => <Cell key={a.action} fill={a.color} cursor="pointer" />)}
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
              <Bar dataKey="count" fill="#8b5cf6" radius={[3,3,0,0]} cursor="pointer"
                onClick={(data: any) => {
                  const hour = parseInt(data.hour);
                  const custMap = Object.fromEntries(customers.map(c => [c.id, c.name]));
                  const logs = behaviorLogs.filter(l => new Date(l.timestamp).getHours() === hour);
                  const rows = logs.map(l => ({
                    '고객명': custMap[l.customerId] ?? '-',
                    '행동': ACTION_LABEL[l.action] ?? l.action,
                    '페이지': l.pageUrl,
                    '시각': l.timestamp.slice(11, 16),
                  }));
                  setDetail({
                    title: `${data.hour} 활동 로그`,
                    subtitle: `총 ${rows.length}건`,
                    color: '#8b5cf6',
                    columns: ['고객명', '행동', '페이지', '시각'],
                    rows,
                  });
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">구매 퍼널 분석</h2>
        <p className="text-sm text-gray-500 mb-5">상품 발견 → 구매까지의 전환 흐름</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="stage" type="category" width={85} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[0,4,4,0]} cursor="pointer"
              onClick={(data: any) => {
                const stageToAction: Record<string, string> = { '상품 조회':'VIEW', '스크롤/탐색':'SCROLL', '찜하기':'WISHLIST', '장바구니':'CART', '구매완료':'PURCHASE' };
                const actionKey = stageToAction[data.stage] ?? '';
                const custMap = Object.fromEntries(customers.map(c => [c.id, c.name]));
                const rows = behaviorLogs
                  .filter(l => l.action === actionKey)
                  .map(l => ({
                    '고객명': custMap[l.customerId] ?? '-',
                    '페이지': l.pageUrl,
                    '시각': l.timestamp.slice(0, 16).replace('T', ' '),
                  }));
                const prev = funnelData.find(f => f.stage === data.stage);
                setDetail({
                  title: `${data.stage} 단계 상세`,
                  subtitle: `${data.count}명`,
                  color: prev?.color,
                  columns: ['고객명', '페이지', '시각'],
                  rows,
                });
              }}>
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
      <ChartDetailPanel data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
