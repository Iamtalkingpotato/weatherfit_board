import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search, User, Mail, Calendar, Award, Phone, TrendingUp, MessageSquare } from 'lucide-react';
import { getCustomers, getCustomerPurchases, getCustomerPreferences, getColors, getRegions, getProducts, getCustomerCoupons, getCoupons } from '../api/logApi';

// ─── Label constants ───────────────────────────────────────────────────────────
const GENDER_LABEL: Record<string, string> = { MALE: '남성', FEMALE: '여성' };
const MEMBERSHIP_LABEL: Record<string, string> = { BASIC: '일반', SILVER: '실버', GOLD: '골드', VIP: 'VIP' };
const MEMBERSHIP_BADGE: Record<string, string> = {
  BASIC:  'bg-gray-100 text-gray-600',
  SILVER: 'bg-blue-100 text-blue-700',
  GOLD:   'bg-yellow-100 text-yellow-700',
  VIP:    'bg-purple-100 text-purple-700',
};
const STATUS_LABEL: Record<string, string> = { PURCHASED: '구매완료', WISHLIST: '찜', CART: '장바구니', VIEW_ONLY: '조회만함' };
const STYLE_LABEL: Record<string, string> = {
  CASUAL: '캐주얼',
  FORMAL: '포멀',
  SPORTY: '스포티',
  STREET: '스트릿',
  MINIMAL: '미니멀',
};
const CATEGORY_LABEL: Record<string, string> = { OUTER: '아우터', TOP: '상의', BOTTOM: '하의', ACCESSORY: '악세서리' };

// 대소문자/공백/구분자 차이를 흡수해서 라벨 조회
const styleLabel = (s: string) => {
  const key = String(s ?? '').trim().replace(/[\s-]+/g, '_').toUpperCase();
  return STYLE_LABEL[key] ?? STYLE_LABEL[String(s ?? '').trim().toUpperCase()] ?? s ?? '-';
};
const catLabel   = (c: string) => CATEGORY_LABEL[c?.toUpperCase()] ?? CATEGORY_LABEL[c] ?? c ?? '-';

// ─── UI color maps ─────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  'PURCHASED': 'bg-green-100 text-green-800',
  'WISHLIST':  'bg-pink-100 text-pink-800',
  'CART':      'bg-blue-100 text-blue-800',
  'VIEW_ONLY': 'bg-gray-100 text-gray-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDatetime(raw: string | null | undefined): string {
  if (!raw) return '-';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

const coldLabel = (v: number) => {
  if (v === 1) return '많이 추위탐';
  if (v === 2) return '추위탐';
  if (v === 3) return '보통';
  if (v === 4) return '더위탐';
  if (v === 5) return '많이 더위탐';
  return '-';
};

const TABS_DEF = ['기본', '선호', '구매', '찜', '장바구니', '쿠폰'] as const;
type Tab = typeof TABS_DEF[number];

export function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('전체');
  const initialCustomerId = searchParams.get('customerId');
  const [selectedId, setSelectedId] = useState<number | null>(initialCustomerId ? Number(initialCustomerId) : null);
  const [tab, setTab] = useState<Tab>('기본');
  const [itemSearch, setItemSearch] = useState('');

  const [customers, setCustomers] = useState<any[]>([]);
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);

  useEffect(() => {
    getCustomers().then(data => setCustomers(Array.isArray(data) ? data : [])).catch(() => setCustomers([]));
    getRegions().then(data => setRegions(Array.isArray(data) ? data : [])).catch(() => setRegions([]));
    getProducts().then(data => setProducts(Array.isArray(data) ? data : [])).catch(() => setProducts([]));
    getColors().then(data => setColors(Array.isArray(data) ? data : [])).catch(() => setColors([]));
    getCoupons().then(data => setAllCoupons(Array.isArray(data) ? data : [])).catch(() => setAllCoupons([]));
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    setAllPurchases([]);
    setPreferences(null);
    setCoupons([]);
    Promise.all([
      getCustomerPurchases(selectedId).catch(() => []),
      getCustomerPreferences(selectedId).catch(() => null),
    ]).then(([purs, prefs]) => {
      setAllPurchases(Array.isArray(purs) ? purs : []);
      // null 이면 빈 객체로 설정해 "불러오는 중..." 상태 탈출
      setPreferences(prefs ?? { top_styles: [], top_colors: [], top_categories: [] });
    });
    getCustomerCoupons(selectedId).then(data => setCoupons(Array.isArray(data) ? data : []));
  }, [selectedId]);

  useEffect(() => { setItemSearch(''); }, [tab, selectedId]);

  const filtered = customers.filter(c => {
    const region = regions.find(r => r.id === c.regionId);
    const fullName = region ? `${region.city} ${region.district}` : '';
    const matchSearch = (c.name ?? '').includes(search) || (c.email ?? '').includes(search) || fullName.includes(search);
    const matchGender = filterGender === '전체' || GENDER_LABEL[c.gender] === filterGender;
    return matchSearch && matchGender;
  });

  const selected  = selectedId !== null ? customers.find(c => c.id === selectedId) : null;

  const sortDesc = (arr: any[]) =>
    [...arr].sort((a, b) => {
      const ta = a.purchasedAt ?? a.purchaseDate ?? '';
      const tb = b.purchasedAt ?? b.purchaseDate ?? '';
      if (!ta) return 1;
      if (!tb) return -1;
      return tb.localeCompare(ta);
    });

  const purchases = sortDesc(allPurchases.filter(p => p.status === 'PURCHASED'));
  const wishlist  = sortDesc(allPurchases.filter(p => p.status === 'WISHLIST'));
  const cart      = sortDesc(allPurchases.filter(p => p.status === 'CART'));

  const TABS = TABS_DEF;

  // ── 선호 API 파서: 단순 값 배열 OR {value, count} 객체 배열 모두 지원 ────
  const parsePrefs = {
    styles: (raw: any[]): [string, number | null][] =>
      raw.map(item => typeof item === 'object' && item !== null
        ? [item.style ?? item.value ?? item.name ?? '', item.count ?? item.cnt ?? null]
        : [String(item), null]),
    colors: (raw: any[]): [number, number | null][] =>
      raw.map(item => typeof item === 'object' && item !== null
        ? [item.colorId ?? item.id ?? item.color_id ?? 0, item.count ?? item.cnt ?? null]
        : [Number(item), null]),
    categories: (raw: any[]): [string, number | null][] =>
      raw.map(item => typeof item === 'object' && item !== null
        ? [item.category ?? item.value ?? item.name ?? '', item.count ?? item.cnt ?? null]
        : [String(item), null]),
  };

  // 공통 필터+슬라이스 (검색어 적용 → 상위 10건)
  const filterItems = (items: any[]) => {
    const q = itemSearch.toLowerCase();
    return (q ? items.filter(p => {
      const prod = products.find(pr => pr.id === Number(p.productId));
      const rawCategory = (prod?.category ?? p.category ?? '').toLowerCase();
      const rawStyle    = (prod?.style    ?? p.style    ?? '').toLowerCase();
      const labelCategory = (CATEGORY_LABEL[prod?.category ?? p.category ?? ''] ?? '').toLowerCase();
      const labelStyle    = (STYLE_LABEL[prod?.style ?? p.style ?? '']           ?? '').toLowerCase();
      return (
        (prod?.productName ?? p.productName ?? '').toLowerCase().includes(q) ||
        rawCategory.includes(q)   || labelCategory.includes(q) ||
        rawStyle.includes(q)      || labelStyle.includes(q)    ||
        (p.size ?? '').toLowerCase().includes(q)
      );
    }) : items).slice(0, 10);
  };


  return (
    <div>
      {/* ── 헤더 (4번: mb-8→mb-4, text-3xl→text-2xl) */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">고객 관리</h1>
        <p className="text-gray-500 text-sm">고객 정보 및 활동 내역</p>
      </div>

      {/* ── 메인 그리드 (4번: gap-6→gap-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── 고객 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type="text" placeholder="이름, 이메일, 지역 검색..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-1.5">
              {['전체', '남성', '여성'].map(g => (
                <button key={g} onClick={() => setFilterGender(g)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${filterGender === g ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          {/* 4번: max-h 뷰포트 기반으로 동적 설정 */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {filtered.map(c => (
              <button key={c.id}
                onClick={() => { const id = Number(c.id); setSelectedId(id); setTab('기본'); setSearchParams({ customerId: String(id) }, { replace: true }); }}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedId === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                <p className={`font-medium text-sm mb-0.5 ${c.isFraud ? 'text-red-600' : 'text-gray-900'}`}>
                  {c.name}
                  {c.isFraud && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">부정</span>}
                </p>
                <p className="text-xs text-gray-500 mb-1">{c.email}</p>
                {/* 등급 배지 */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${MEMBERSHIP_BADGE[c.membershipLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                    {MEMBERSHIP_LABEL[c.membershipLevel] ?? c.membershipLevel}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── 고객 상세 */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">

              {/* 탭 (1번: 피드백 삭제, 2번: 옷장 삭제) */}
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {t}
                    {t === '구매'    && purchases.length > 0 && <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 rounded-full">{purchases.length}</span>}
                    {t === '찜'      && wishlist.length  > 0 && <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 rounded-full">{wishlist.length}</span>}
                    {t === '장바구니' && cart.length      > 0 && <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 rounded-full">{cart.length}</span>}
                    {t === '쿠폰'    && coupons.length   > 0 && <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 rounded-full">{coupons.length}</span>}
                  </button>
                ))}
              </div>

              {/* 4번: p-6→p-4 */}
              <div className="p-4">

                {/* ── 기본 정보 */}
                {tab === '기본' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { icon: User,     color: 'bg-blue-100 text-blue-600',     label: '이름',     value: selected.name,                                                              span: 1 },
                        { icon: Mail,     color: 'bg-green-100 text-green-600',   label: '이메일',   value: selected.email,                                                             span: 1 },
                        { icon: Phone,    color: 'bg-purple-100 text-purple-600', label: '전화번호', value: selected.phone ?? '-',                                                      span: 1 },
                        { icon: Calendar, color: 'bg-orange-100 text-orange-600', label: '생년월일', value: selected.birthDate ?? '-',                                                  span: 1 },
                        { icon: Award,    color: 'bg-yellow-100 text-yellow-600', label: '등급',     value: MEMBERSHIP_LABEL[selected.membershipLevel] ?? selected.membershipLevel,     span: 2,
                          nextLabel: selected.nextMembershipLevel && selected.nextMembershipLevel !== selected.membershipLevel
                            ? `→ ${MEMBERSHIP_LABEL[selected.nextMembershipLevel] ?? selected.nextMembershipLevel} 예정`
                            : undefined },
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className={`flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl ${item.span === 2 ? 'col-span-2' : ''}`}>
                            <div className={`p-1.5 rounded-lg ${item.color}`}><Icon size={14} /></div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">{item.label}</p>
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {item.value}
                                {item.nextLabel && <span className="ml-1.5 text-xs text-gray-400 font-normal">{item.nextLabel}</span>}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* 총 구매금액 · 총 피드백 수 */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600"><TrendingUp size={14} /></div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">총 구매금액</p>
                          <p className="font-medium text-gray-900 text-sm truncate">₩{(selected.totalPurchaseAmount ?? 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                        <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600"><MessageSquare size={14} /></div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">총 피드백 수</p>
                          <p className="font-medium text-gray-900 text-sm truncate">{selected.totalFeedbackCount ?? 0}건</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '성별',       value: GENDER_LABEL[selected.gender] ?? selected.gender },
                        { label: '활동량',     value: selected.activityLevel === 'HIGH' ? '높음' : selected.activityLevel === 'MEDIUM' ? '보통' : '낮음' },
                        { label: '추위 민감도', value: coldLabel(selected.coldSensitivity) },
                        { label: '선호 스타일', value: styleLabel(selected.preferredStyle) },
                      ].map(item => (
                        <div key={item.label} className="p-2.5 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                          <p className="font-medium text-sm">{item.value}</p>
                        </div>
                      ))}
                      <div className="col-span-4 grid grid-cols-3 gap-2">
                        {[
                          { label: '가입일',     value: selected.joinDate ?? '-' },
                          { label: '최근 로그인', value: selected.lastLoginDate ?? '-' },
                          { label: '휴면 일수',  value: (() => { if (!selected.lastLoginDate) return '-'; const d = Math.floor((Date.now() - new Date(selected.lastLoginDate).getTime()) / 86400000); return d > 0 ? `${d}일` : '-'; })() },
                        ].map(item => (
                          <div key={item.label} className="p-2.5 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                            <p className="font-medium text-sm">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl p-3.5 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">동의 정보</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: '마케팅 활용', val: selected.marketingConsent },
                          { label: '푸시 알림',   val: selected.pushConsent },
                          { label: '이메일',      val: selected.emailConsent },
                          { label: 'SMS',         val: selected.smsConsent },
                        ].map(item => (
                          <div key={item.label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${item.val ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.val ? 'bg-green-500' : 'bg-gray-300'}`} />
                            {item.label}
                          </div>
                        ))}
                      </div>
                      {selected.isFraud && (
                        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                          ⚠️ 부정 사용자로 등록된 고객입니다
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 선호 */}
                {tab === '선호' && (
                  preferences === null ? (
                    <div className="text-center py-10 text-gray-400 text-sm">데이터를 불러오는 중...</div>
                  ) : (
                    <div className="space-y-3">
                      {/* 선호 스타일 */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">선호 스타일</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(preferences.top_styles) && preferences.top_styles.length > 0
                            ? parsePrefs.styles(preferences.top_styles).map(([s, cnt]) => (
                                <span key={s} className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                  {styleLabel(s)}
                                  {cnt !== null && <span className="text-purple-400 font-normal">{cnt}건</span>}
                                </span>
                              ))
                            : <span className="text-xs text-gray-400">데이터 없음</span>}
                        </div>
                      </div>
                      {/* 선호 색상 */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">선호 색상</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(preferences.top_colors) && preferences.top_colors.length > 0
                            ? parsePrefs.colors(preferences.top_colors).map(([cId, cnt]) => {
                                const col = colors.find(c => c.id === cId);
                                return (
                                  <span key={cId} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                    {col?.hexCode && <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: col.hexCode }} />}
                                    {col?.colorName ?? `색상 ${cId}`}
                                    {cnt !== null && <span className="text-blue-400 font-normal">{cnt}건</span>}
                                  </span>
                                );
                              })
                            : <span className="text-xs text-gray-400">데이터 없음</span>}
                        </div>
                      </div>
                      {/* 선호 카테고리 */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">선호 카테고리</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(preferences.top_categories) && preferences.top_categories.length > 0
                            ? parsePrefs.categories(preferences.top_categories).map(([cat, cnt]) => (
                                <span key={cat} className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                  {catLabel(cat)}
                                  {cnt !== null && <span className="text-green-400 font-normal">{cnt}건</span>}
                                </span>
                              ))
                            : <span className="text-xs text-gray-400">데이터 없음</span>}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* ── 구매 — 리스트 형태 유지 */}
                {tab === '구매' && (() => {
                  const items = filterItems(purchases);
                  if (purchases.length === 0 && !itemSearch) {
                    return <div className="text-center py-10 text-gray-400">구매 내역이 없습니다</div>;
                  }
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">총 {purchases.length}건{itemSearch && ` · 검색결과 ${filterItems(purchases).length}건`}</p>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                          <input type="text" placeholder="상품명, 카테고리, 스타일 검색..." value={itemSearch}
                            onChange={e => setItemSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
                        </div>
                      </div>
                      {items.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">검색 결과가 없습니다</div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {items.map((p, i) => {
                              const prod = products.find(pr => pr.id === Number(p.productId));
                              return (
                                <div key={p.id ?? i} className="flex gap-3 p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50">
                                  {prod?.imageUrl && <img src={prod.imageUrl} alt={prod.productName} className="w-14 h-14 object-cover rounded-lg shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h3 className="font-medium text-gray-900 text-sm truncate">{prod?.productName ?? p.productName ?? p.productId ?? '-'}</h3>
                                      <span className={`ml-2 shrink-0 px-2 py-0.5 rounded text-xs ${statusColors[p.status] ?? 'bg-gray-100 text-gray-600'}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {catLabel(prod?.category ?? p.category ?? '')} · {styleLabel(prod?.style ?? p.style ?? '')}{p.size ? ` · ${p.size}` : ''}
                                    </p>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-gray-400">{fmtDatetime(p.purchasedAt ?? p.purchaseDate)}</span>
                                      <span className="font-semibold text-sm text-gray-900">₩{(p.price ?? 0).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {!itemSearch && purchases.length > 10 && (
                            <p className="text-xs text-gray-400 text-center mt-3">상위 10건만 표시 · 검색으로 더 찾아보세요</p>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}

                {/* ── 쿠폰 */}
                {tab === '쿠폰' && (
                  <div className="space-y-2">
                    {coupons.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">보유 쿠폰이 없습니다</div>
                    ) : (
                      coupons.map((cc, i) => {
                        const STATUS_MAP: Record<string, { label: string; color: string }> = {
                          ISSUED:  { label: '미사용',   color: 'bg-green-100 text-green-700' },
                          USED:    { label: '사용완료', color: 'bg-gray-100 text-gray-500'   },
                          EXPIRED: { label: '만료',     color: 'bg-red-100 text-red-500'     },
                        };
                        const s = STATUS_MAP[cc.status] ?? { label: cc.status, color: 'bg-gray-100 text-gray-500' };
                        const couponInfo = allCoupons.find(c => c.id === cc.couponId);
                        return (
                          <div key={cc.id ?? i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>{s.label}</span>
                                <span className="text-xs text-gray-700 font-medium truncate">
                                  {couponInfo?.couponName ?? `쿠폰 ID #${cc.couponId}`}
                                </span>
                              </div>
                              {couponInfo && (
                                <p className="text-xs text-purple-600 font-medium mb-1">
                                  {couponInfo.type === 'PERCENT'
                                    ? `${couponInfo.discountValue}% 할인`
                                    : `${couponInfo.discountValue?.toLocaleString()}원 할인`}
                                  {couponInfo.minOrderAmount > 0 && ` · ${couponInfo.minOrderAmount.toLocaleString()}원 이상`}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">발급일: {cc.issuedAt?.slice(0, 10) ?? '-'}</p>
                              <p className="text-xs text-gray-500">만료일: {cc.expiredAt?.slice(0, 10) ?? '-'}</p>
                              {cc.usedAt && <p className="text-xs text-gray-400">사용일: {cc.usedAt.slice(0, 10)}</p>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ── 찜 / 장바구니 — 3번: 2열 그리드 (2개×5줄=10개) */}
                {(tab === '찜' || tab === '장바구니') && (() => {
                  const rawItems = tab === '찜' ? wishlist : cart;
                  const items = filterItems(rawItems);
                  if (rawItems.length === 0 && !itemSearch) {
                    return <div className="text-center py-10 text-gray-400">내역이 없습니다</div>;
                  }
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">총 {rawItems.length}건{itemSearch && ` · 검색결과 ${items.length}건`}</p>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                          <input type="text" placeholder="상품명, 카테고리, 스타일 검색..." value={itemSearch}
                            onChange={e => setItemSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
                        </div>
                      </div>
                      {items.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">검색 결과가 없습니다</div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            {items.map((p, i) => {
                              const prod = products.find(pr => pr.id === Number(p.productId));
                              return (
                                <div key={p.id ?? i} className="flex gap-2.5 p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50">
                                  {prod?.imageUrl
                                    ? <img src={prod.imageUrl} alt={prod.productName} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                                    : <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-xs truncate leading-tight">
                                      {prod?.productName ?? p.productName ?? p.productId ?? '-'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {catLabel(prod?.category ?? p.category ?? '')}
                                    </p>
                                    <p className="font-semibold text-xs text-gray-800 mt-0.5">
                                      ₩{(p.price ?? 0).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {!itemSearch && rawItems.length > 10 && (
                            <p className="text-xs text-gray-400 text-center mt-3">상위 10건만 표시 · 검색으로 더 찾아보세요</p>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <User size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-700 mb-1">고객을 선택하세요</h3>
              <p className="text-sm text-gray-400">왼쪽에서 고객을 클릭하면 상세 정보를 볼 수 있어요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
