import { useState } from 'react';
import { Search, User, Mail, MapPin, Calendar, Award, Phone, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { customers, purchaseData, temperatureFeedbacks, wardrobeItems, getCustomerPreferences } from '../data/mockData';

const membershipColors: Record<string, string> = {
  'VIP':  'bg-purple-100 text-purple-800 border-purple-200',
  '골드': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '실버': 'bg-gray-100 text-gray-700 border-gray-200',
  '일반': 'bg-blue-100 text-blue-800 border-blue-200',
};

const feedbackColors: Record<string, string> = {
  '덥다': 'bg-red-100 text-red-800',
  '춥다': 'bg-blue-100 text-blue-800',
  '적당했다': 'bg-green-100 text-green-800',
};

const statusColors: Record<string, string> = {
  '구매완료': 'bg-green-100 text-green-800',
  '찜': 'bg-pink-100 text-pink-800',
  '장바구니': 'bg-blue-100 text-blue-800',
  '조회만함': 'bg-gray-100 text-gray-700',
};

export function Customers() {
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('전체');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'기본'|'옷장'|'선호'|'피드백'|'구매'|'찜'|'장바구니'>('기본');

  const filtered = customers.filter(c => {
    const matchSearch = c.name.includes(search) || c.email.includes(search) || c.location.includes(search);
    const matchGender = filterGender === '전체' || c.gender === filterGender;
    return matchSearch && matchGender;
  });

  const selected = selectedId ? customers.find(c => c.id === selectedId) : null;
  const feedbacks  = selectedId ? temperatureFeedbacks.filter(f => f.customerId === selectedId) : [];
  const allPurchases = selectedId ? purchaseData.filter(p => p.customerId === selectedId) : [];
  const purchases  = allPurchases.filter(p => p.status === '구매완료');
  const wishlist   = allPurchases.filter(p => p.status === '찜');
  const cart       = allPurchases.filter(p => p.status === '장바구니');
  const wardrobe   = selectedId ? wardrobeItems.filter(w => w.customerId === selectedId) : [];
  const prefs      = selectedId ? getCustomerPreferences(selectedId) : null;

  // 피드백 추이 (날짜별)
  const feedbackTrend = feedbacks
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(f => ({ date: f.date.substring(5), feelsLike: f.feelsLikeTemp, actual: f.actualTemp }));

  const TABS = ['기본','옷장','선호','피드백','구매','찜','장바구니'] as const;

  const PreferenceBlock = ({ title, data }: { title: string; data: { styles: [string,number][]; colors: [string,number][] } }) => (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="font-medium text-gray-800 mb-3">{title}</h4>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5">스타일 TOP 5</p>
        <div className="flex flex-wrap gap-1.5">
          {data.styles.length ? data.styles.map(([s, c]) => (
            <span key={s} className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs">{s} ({c})</span>
          )) : <span className="text-xs text-gray-400">데이터 없음</span>}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1.5">색상 TOP 5</p>
        <div className="flex flex-wrap gap-1.5">
          {data.colors.length ? data.colors.map(([c, n]) => (
            <span key={c} className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs">{c} ({n})</span>
          )) : <span className="text-xs text-gray-400">데이터 없음</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">고객 관리</h1>
        <p className="text-gray-500 text-sm">고객 정보 및 활동 내역</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="이름, 이메일, 지역 검색..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-1.5">
              {['전체','남성','여성'].map(g => (
                <button key={g} onClick={() => setFilterGender(g)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${filterGender === g ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {filtered.map(c => (
              <button key={c.id} onClick={() => { setSelectedId(c.id); setTab('기본'); }}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedId === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs border ${membershipColors[c.membershipLevel]}`}>{c.membershipLevel}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{c.email}</p>
                <p className="text-xs text-gray-400">{c.location} · {c.gender} · {c.age}세</p>
              </button>
            ))}
          </div>
        </div>

        {/* 상세 */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* 탭 */}
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {t}
                    {t === '구매' && purchases.length > 0 && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 rounded-full">{purchases.length}</span>}
                    {t === '찜' && wishlist.length > 0 && <span className="ml-1 text-xs bg-pink-100 text-pink-700 px-1.5 rounded-full">{wishlist.length}</span>}
                    {t === '장바구니' && cart.length > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 rounded-full">{cart.length}</span>}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* 기본 정보 */}
                {tab === '기본' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: User,     color: 'bg-blue-100 text-blue-600',   label: '이름',   value: selected.name },
                      { icon: Mail,     color: 'bg-green-100 text-green-600', label: '이메일', value: selected.email },
                      { icon: Phone,    color: 'bg-purple-100 text-purple-600', label: '전화번호', value: selected.phone },
                      { icon: MapPin,   color: 'bg-red-100 text-red-600',     label: '지역',   value: selected.location },
                      { icon: Calendar, color: 'bg-orange-100 text-orange-600', label: '가입일', value: selected.joinDate },
                      { icon: Award,    color: 'bg-yellow-100 text-yellow-600', label: '등급',  value: selected.membershipLevel },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className={`p-2 rounded-lg ${item.color}`}><Icon size={16} /></div>
                          <div>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="font-medium text-gray-900 text-sm">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 옷장 */}
                {tab === '옷장' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">등록된 옷 {wardrobe.length}개</p>
                    {wardrobe.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">등록된 옷이 없습니다</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {wardrobe.map(w => (
                          <div key={w.id} className="p-3 border border-gray-200 rounded-xl bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">{w.category}</span>
                              <span className="text-xs text-gray-400">{w.registeredDate}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">{w.style}</span>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{w.color}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 선호도 */}
                {tab === '선호' && prefs && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">구매 내역 + 옷장 데이터 기반 상위 5개 집계</p>
                    <PreferenceBlock title="상의" data={prefs.tops} />
                    <PreferenceBlock title="하의" data={prefs.bottoms} />
                    <PreferenceBlock title="겉옷 / 아우터" data={prefs.outer} />
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-800 mb-3">전체 종합</h4>
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1.5">선호 카테고리</p>
                        <div className="flex flex-wrap gap-1.5">
                          {prefs.overall.categories.map(([c, n]) => (
                            <span key={c} className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs">{c} ({n})</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 피드백 추이 */}
                {tab === '피드백' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">총 {feedbacks.length}건</p>
                    {feedbacks.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">피드백 내역이 없습니다</div>
                    ) : (
                      <>
                        <div className="mb-6">
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={feedbackTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} domain={[-5, 35]} />
                              <Tooltip formatter={(v: number, name: string) => [`${v}°C`, name === 'feelsLike' ? '체감온도' : '실제온도']} />
                              <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="actual" />
                              <Line type="monotone" dataKey="feelsLike" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} name="feelsLike" />
                            </LineChart>
                          </ResponsiveContainer>
                          <div className="flex gap-4 justify-center text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" />실제온도</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block border-dashed" />체감온도</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {feedbacks.sort((a,b) => b.date.localeCompare(a.date)).map(f => (
                            <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <div className="text-xs text-gray-400 w-16 shrink-0">{f.date.substring(5)}</div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-700">{f.actualTemp}°C / 체감 {f.feelsLikeTemp}°C · {f.weatherCondition}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{f.recommendedOutfit.join(', ')}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-xs ${feedbackColors[f.feedback]}`}>{f.feedback}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 구매 / 찜 / 장바구니 공통 렌더 */}
                {(['구매','찜','장바구니'] as const).includes(tab as any) && (() => {
                  const items = tab === '구매' ? purchases : tab === '찜' ? wishlist : cart;
                  return items.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">내역이 없습니다</div>
                  ) : (
                    <div className="space-y-3">
                      {items.map(p => (
                        <div key={p.id} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                          <img src={p.productImage} alt={p.productName} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-900 text-sm truncate">{p.productName}</h3>
                              <span className={`ml-2 shrink-0 px-2 py-0.5 rounded text-xs ${statusColors[p.status]}`}>{p.status}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{p.category} · {p.style} · {p.color}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-400">{p.date}</span>
                              <span className="font-semibold text-sm text-gray-900">₩{p.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-200 text-center">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">고객을 선택하세요</h3>
              <p className="text-sm text-gray-400">왼쪽에서 고객을 클릭하면 상세 정보를 볼 수 있어요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
