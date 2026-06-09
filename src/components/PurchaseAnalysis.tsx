import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllPurchases, getCustomers, getProducts } from '../api/logApi';

const CATEGORY_LABEL: Record<string, string> = { OUTER: '아우터', TOP: '상의', BOTTOM: '하의', ACCESSORY: '악세서리' };
const STATUS_LABEL: Record<string, string> = { PURCHASED: '구매완료', WISHLIST: '찜', CART: '장바구니', VIEW_ONLY: '조회만함' };
const STYLE_LABEL: Record<string, string> = {
  CASUAL: '캐주얼',
  FORMAL: '포멀',
  SPORTY: '스포티',
  STREET: '스트릿',
  MINIMAL: '미니멀',
};
import { ShoppingBag, Heart, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { ChartDetailPanel, DetailData } from './ChartDetailPanel';

const parseDate = (raw: string): Date => new Date(raw.replace(/\./g, '-').replace(' ', 'T'));

/** "yy-mm-dd hh:mm:ss" 형식으로 변환 */
const fmtDate = (raw: string | null | undefined): string => {
  if (!raw) return '-';
  try {
    const d = parseDate(raw);
    if (isNaN(d.getTime())) return raw;
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  } catch { return raw; }
};
const pDate = (p: any): string => fmtDate(p.purchasedAt ?? p.purchaseDate ?? p.createdAt);

/** 최신순 정렬 헬퍼 */
const byDateDesc = (a: any, b: any): number => {
  const ra = a.purchasedAt ?? a.purchaseDate ?? a.createdAt ?? '';
  const rb = b.purchasedAt ?? b.purchaseDate ?? b.createdAt ?? '';
  const da = ra ? parseDate(ra).getTime() : 0;
  const db = rb ? parseDate(rb).getTime() : 0;
  return db - da;
};

const styleLabel = (style: string) => {
  const key = String(style ?? '').trim().replace(/[\s-]+/g, '_').toUpperCase();
  return STYLE_LABEL[key] ?? style ?? '-';
};

export function PurchaseAnalysis() {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllPurchases().catch(() => []),
      getCustomers().catch(() => []),
      getProducts().catch(() => []),
    ])
      .then(([purs, custs, prods]) => {
        setAllPurchases(Array.isArray(purs) ? purs : []);
        setCustomers(Array.isArray(custs) ? custs : []);
        setProducts(Array.isArray(prods) ? prods : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const purchased = allPurchases.filter(p => p.status === 'PURCHASED');
  const wishlist  = allPurchases.filter(p => p.status === 'WISHLIST');
  const cart      = allPurchases.filter(p => p.status === 'CART');
  const totalRev  = purchased.reduce((s, p) => s + (p.price ?? 0), 0);
  const avgOrder  = purchased.length ? Math.round(totalRev / purchased.length) : 0;
  const potential = [...wishlist, ...cart].reduce((s, p) => s + (p.price ?? 0), 0);

  const custMap = Object.fromEntries(customers.map(c => [String(c.id), c.name]));

  const statusData = [
    { name: STATUS_LABEL['PURCHASED'], value: purchased.length, color:'#10b981' },
    { name: STATUS_LABEL['WISHLIST'],  value: wishlist.length,  color:'#f59e0b' },
    { name: STATUS_LABEL['CART'],      value: cart.length,      color:'#3b82f6' },
  ].filter(d => d.value > 0);

  const topProducts = (() => {
    const map: Record<string, { productId: string; count: number; revenue: number }> = {};
    purchased.forEach(p => {
      const pid = String(p.productId);
      if (!map[pid]) map[pid] = { productId: pid, count: 0, revenue: 0 };
      map[pid].count++;
      map[pid].revenue += p.price ?? 0;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => {
        const prod = products.find(pr => pr.id === Number(item.productId));
        return {
          name:     prod?.productName ?? item.productId,
          category: prod?.category ?? '',
          style:    prod?.style ?? '-',
          image:    prod?.imageUrl ?? '',
          count:    item.count,
          revenue:  item.revenue,
        };
      });
  })();

  const topStyles = (() => {
    const map: Record<string, number> = {};
    purchased.forEach(p => {
      const style = products.find(pr => pr.id === Number(p.productId))?.style ?? p.style;
      if (style) map[style] = (map[style] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 5)
      .map(([style, count]) => ({ style, count }));
  })();

  const categoryData = (() => {
    const map: Record<string, number> = {};
    topProducts.forEach(p => {
      const key = CATEGORY_LABEL[p.category] ?? p.category;
      if (key) map[key] = (map[key] || 0) + p.revenue;
    });
    return Object.entries(map).map(([category, revenue]) => ({ category, revenue })).sort((a, b) => b.revenue - a.revenue);
  })();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">구매 분석</h1>
        <p className="text-gray-500 text-sm">구매·찜·장바구니 현황</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">데이터를 불러오는 중...</div>
      ) : allPurchases.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">데이터가 없습니다</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: STATUS_LABEL['PURCHASED'], value:`${purchased.length}건`, sub:`장바구니 전환율 ${(purchased.length + cart.length) ? ((purchased.length/(purchased.length + cart.length))*100).toFixed(1) : 0}%`, icon: ShoppingBag, color:'bg-green-500', statusKey:'PURCHASED', accentColor:'#10b981' },
              { label: STATUS_LABEL['WISHLIST'],  value:`${wishlist.length}건`,  sub:`행동 전환율 ${allPurchases.length ? (((cart.length + purchased.length)/allPurchases.length)*100).toFixed(1) : 0}%`,                             icon: Heart,        color:'bg-pink-500',  statusKey:'WISHLIST',  accentColor:'#f59e0b' },
              { label: STATUS_LABEL['CART'],      value:`${cart.length}건`,      sub:`이탈률 ${(purchased.length + cart.length) ? ((cart.length/(purchased.length + cart.length))*100).toFixed(1) : 0}%`,                               icon: ShoppingCart, color:'bg-blue-500',  statusKey:'CART',      accentColor:'#3b82f6' },
            ].map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    const rows = [...allPurchases.filter(p => p.status === m.statusKey)]
                      .sort(byDateDesc)
                      .map(p => {
                        const prod = products.find(pr => pr.id === Number(p.productId));
                        return { '고객명': custMap[String(p.customerId)] ?? '-', '상품': prod?.productName ?? p.productId ?? '-', '금액': `₩${(p.price ?? 0).toLocaleString()}`, '날짜': pDate(p) };
                      });
                    setDetail({ title: `${m.label} 목록`, subtitle: `총 ${rows.length}건`, color: m.accentColor, columns: ['고객명', '상품', '금액', '날짜'], rows });
                  }}>
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
              { label:'총 매출', value:`₩${totalRev.toLocaleString()}`, sub:'실제 발생 매출', icon: DollarSign, grad:'from-green-50 to-emerald-50', border:'border-green-200', text:'text-green-900',
                onClick: () => {
                  const rows = [...purchased].sort(byDateDesc).map(p => ({ '고객명': custMap[String(p.customerId)] ?? '-', '상품': products.find(pr => pr.id === Number(p.productId))?.productName ?? '-', '금액': `₩${(p.price ?? 0).toLocaleString()}`, '날짜': pDate(p) }));
                  setDetail({ title: '총 매출 구매 내역', subtitle: `₩${totalRev.toLocaleString()}`, color: '#10b981', columns: ['고객명', '상품', '금액', '날짜'], rows });
                }
              },
              { label:'평균 주문금액', value:`₩${avgOrder.toLocaleString()}`, sub:'구매당 평균', icon: TrendingUp, grad:'from-blue-50 to-indigo-50', border:'border-blue-200', text:'text-blue-900',
                onClick: () => {
                  const rows = [...purchased].sort(byDateDesc).map(p => ({ '고객명': custMap[String(p.customerId)] ?? '-', '상품': products.find(pr => pr.id === Number(p.productId))?.productName ?? '-', '금액': `₩${(p.price ?? 0).toLocaleString()}`, '날짜': pDate(p) }));
                  setDetail({ title: '구매 금액 상세', subtitle: `평균 ₩${avgOrder.toLocaleString()}`, color: '#3b82f6', columns: ['고객명', '상품', '금액', '날짜'], rows });
                }
              },
              { label:'잠재 매출', value:`₩${potential.toLocaleString()}`, sub:'찜+장바구니 합', icon: Heart, grad:'from-orange-50 to-amber-50', border:'border-orange-200', text:'text-orange-900',
                onClick: () => {
                  const rows = [...wishlist, ...cart].sort(byDateDesc).map(p => ({ '고객명': custMap[String(p.customerId)] ?? '-', '상품': products.find(pr => pr.id === Number(p.productId))?.productName ?? '-', '금액': `₩${(p.price ?? 0).toLocaleString()}`, '상태': STATUS_LABEL[p.status] ?? p.status }));
                  setDetail({ title: '잠재 매출 목록', subtitle: `₩${potential.toLocaleString()}`, color: '#f97316', columns: ['고객명', '상품', '금액', '상태'], rows });
                }
              },
            ].map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className={`bg-gradient-to-br ${m.grad} rounded-xl p-5 border ${m.border} cursor-pointer hover:shadow-md transition-shadow`} onClick={m.onClick}>
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
              <ResponsiveContainer width="100%" height={260}>
                <PieChart margin={{ top: 24, right: 48, bottom: 24, left: 48 }}>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={true}>
                    {statusData.map(e => (
                      <Cell key={e.name} fill={e.color} cursor="pointer" style={{ outline: 'none' }}
                        onClick={() => {
                          const statusKey = Object.entries(STATUS_LABEL).find(([,v]) => v === e.name)?.[0] ?? '';
                          const rows = [...allPurchases.filter(p => p.status === statusKey)]
                            .sort(byDateDesc)
                            .map(p => {
                              const prod = products.find(pr => pr.id === Number(p.productId));
                              return { '고객명': custMap[String(p.customerId)] ?? '-', '상품': prod?.productName ?? p.productId, '금액': `₩${(p.price ?? 0).toLocaleString()}`, '날짜': pDate(p) };
                            });
                          setDetail({ title: `${e.name} 목록`, subtitle: `총 ${rows.length}건`, color: e.color, columns: ['고객명', '상품', '금액', '날짜'], rows });
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 매출</h2>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">데이터가 없습니다</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} />
                    <Tooltip formatter={(v: number) => [`₩${v.toLocaleString()}`, '매출']} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} cursor="pointer"
                      onClick={(data: any) => {
                        const catKey = Object.entries(CATEGORY_LABEL).find(([,v]) => v === data.category)?.[0] ?? '';
                        const rows = [...purchased
                          .filter(p => (products.find(pr => pr.id === Number(p.productId))?.category ?? p.category) === catKey)]
                          .sort(byDateDesc)
                          .map(p => {
                            const prod = products.find(pr => pr.id === Number(p.productId));
                            return { '고객명': custMap[String(p.customerId)] ?? '-', '상품': prod?.productName ?? '-', '금액': `₩${(p.price ?? 0).toLocaleString()}`, '날짜': pDate(p) };
                          });
                        setDetail({ title: `${data.category} 구매 상세`, subtitle: `총 ₩${data.revenue?.toLocaleString()}`, color: '#10b981', columns: ['고객명', '상품', '금액', '날짜'], rows });
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 상품 TOP 10</h2>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">데이터가 없습니다</div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
                      ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{i+1}</span>
                    {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{CATEGORY_LABEL[p.category] ?? p.category} · {styleLabel(p.style)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{p.count}회</p>
                      <p className="text-xs text-gray-400">₩{p.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 스타일 TOP 5</h2>
            {topStyles.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">데이터가 없습니다</div>
            ) : (
              <div className="space-y-3">
                {topStyles.map((s, i) => {
                  const max = topStyles[0].count;
                  return (
                    <div key={s.style} className="flex items-center gap-3">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
                        ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{i+1}</span>
                      <span className="w-20 text-sm font-medium text-gray-900">{styleLabel(s.style)}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${(s.count/max)*100}%` }} />
                      </div>
                      <span className="w-10 text-right text-sm text-gray-500">{s.count}건</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      <ChartDetailPanel data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
