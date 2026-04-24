import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { purchaseData, getTopProducts, getTopStyles, CATEGORY_LABEL, STATUS_LABEL } from '../data/mockData';
import { ShoppingBag, Heart, ShoppingCart, Eye, DollarSign, TrendingUp } from 'lucide-react';

export function PurchaseAnalysis() {
  const purchased = purchaseData.filter(p => p.status === 'PURCHASED');
  const wishlist  = purchaseData.filter(p => p.status === 'WISHLIST');
  const cart      = purchaseData.filter(p => p.status === 'CART');
  const viewOnly  = purchaseData.filter(p => p.status === 'VIEW_ONLY');
  const totalRev  = purchased.reduce((s, p) => s + p.price, 0);
  const avgOrder  = purchased.length ? Math.round(totalRev / purchased.length) : 0;
  const potential = [...wishlist, ...cart].reduce((s, p) => s + p.price, 0);

  const statusData = [
    { name: STATUS_LABEL['PURCHASED'], value: purchased.length, color:'#10b981' },
    { name: STATUS_LABEL['WISHLIST'],  value: wishlist.length,  color:'#f59e0b' },
    { name: STATUS_LABEL['CART'],      value: cart.length,      color:'#3b82f6' },
    { name: STATUS_LABEL['VIEW_ONLY'], value: viewOnly.length,  color:'#6b7280' },
  ];

  const catRev: Record<string, number> = {};
  purchased.forEach(p => {
    // category comes via product lookup inside getTopProducts — use separate pass here
  });
  // use a separate tally with product lookup
  const catRevMap: Record<string, number> = {};
  purchased.forEach(p => {
    const prod = (window as any).__wfProducts?.find((x: any) => x.id === p.productId);
    // fallback: use getTopProducts data for chart
  });
  const topProducts = getTopProducts(10);
  const topStyles   = getTopStyles(5);

  // Build category revenue from topProducts
  const categoryData = (() => {
    const map: Record<string, number> = {};
    topProducts.forEach(p => {
      const key = CATEGORY_LABEL[p.category] ?? p.category;
      map[key] = (map[key] || 0) + p.revenue;
    });
    return Object.entries(map).map(([category, revenue]) => ({ category, revenue })).sort((a, b) => b.revenue - a.revenue);
  })();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">구매 분석</h1>
        <p className="text-gray-500 text-sm">구매·찜·장바구니 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: STATUS_LABEL['PURCHASED'], value:`${purchased.length}건`, sub:`전환율 ${((purchased.length/purchaseData.length)*100).toFixed(1)}%`, icon: ShoppingBag, color:'bg-green-500' },
          { label: STATUS_LABEL['WISHLIST'],  value:`${wishlist.length}건`,  sub:`비율 ${((wishlist.length/purchaseData.length)*100).toFixed(1)}%`,   icon: Heart,        color:'bg-pink-500' },
          { label: STATUS_LABEL['CART'],      value:`${cart.length}건`,      sub:`비율 ${((cart.length/purchaseData.length)*100).toFixed(1)}%`,       icon: ShoppingCart, color:'bg-blue-500' },
          { label: STATUS_LABEL['VIEW_ONLY'], value:`${viewOnly.length}건`,  sub:'이탈 개선 필요',                                                    icon: Eye,          color:'bg-gray-500' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className={`${m.color} p-2 rounded-lg text-white`}><Icon size={18} /></div>
                <p className="text-sm text-gray-500">{m.label}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label:'총 매출',       value:`₩${totalRev.toLocaleString()}`,   sub:'실제 발생 매출', icon: DollarSign, grad:'from-green-50 to-emerald-50', border:'border-green-200', text:'text-green-900' },
          { label:'평균 주문금액', value:`₩${avgOrder.toLocaleString()}`,   sub:'구매당 평균',    icon: TrendingUp,  grad:'from-blue-50 to-indigo-50',   border:'border-blue-200',  text:'text-blue-900' },
          { label:'잠재 매출',    value:`₩${potential.toLocaleString()}`,   sub:'찜+장바구니 합', icon: Heart,       grad:'from-orange-50 to-amber-50',  border:'border-orange-200', text:'text-orange-900' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className={`bg-gradient-to-br ${m.grad} rounded-xl p-5 border ${m.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={m.text} />
                <p className={`text-sm font-medium ${m.text}`}>{m.label}</p>
              </div>
              <p className={`text-2xl font-semibold ${m.text}`}>{m.value}</p>
              <p className="text-xs opacity-70 mt-1">{m.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">구매 상태 분포</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {statusData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 매출</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} />
              <Tooltip formatter={(v: number) => [`₩${v.toLocaleString()}`, '매출']} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 상품 TOP 10</h2>
        <div className="space-y-2">
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
                ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{i+1}</span>
              <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{CATEGORY_LABEL[p.category] ?? p.category} · {p.style}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">{p.count}회</p>
                <p className="text-xs text-gray-400">₩{p.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 스타일 TOP 5</h2>
        <div className="space-y-3">
          {topStyles.map((s, i) => {
            const max = topStyles[0].count;
            return (
              <div key={s.style} className="flex items-center gap-3">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
                  ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{i+1}</span>
                <span className="w-20 text-sm font-medium text-gray-900">{s.style}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${(s.count/max)*100}%` }} />
                </div>
                <span className="w-10 text-right text-sm text-gray-500">{s.count}건</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
