import { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Clock, Activity, ShoppingBag, Trophy } from 'lucide-react';
import { ChartDetailPanel, DetailData } from './ChartDetailPanel';
import {
  getBehaviorConversionRate,
  getBehaviorDetail,
  getBehaviorHourly,
  getBehaviorPopularPages,
  getBehaviorPopularProducts,
  getBehaviorSummary,
  getBehaviorTypeCounts,
  getBehaviorWishlistConversion,
  getProducts,
} from '../api/logApi';

// ─── 라벨 ────────────────────────────────────────────────────────────────────
const ACTION_LABEL: Record<string, string> = {
  VIEW: '조회',            SCROLL: '스크롤',           LOGIN: '로그인',
  page_view: '페이지 조회', product_view: '상품 조회',  outfit_view: '코디 조회',
  search: '검색',          add_to_cart: '장바구니',     wishlist_add: '찜 추가',
  wishlist_remove: '찜 취소', wardrobe_add: '옷장 추가', feedback: '피드백',
  purchase: '구매',
  WISHLIST: '찜', CART: '장바구니', PURCHASE: '구매',
};

// ─── 색상 ────────────────────────────────────────────────────────────────────
const ACTION_COLORS: Record<string, string> = {
  VIEW: '#3b82f6',      SCROLL: '#8b5cf6',       LOGIN: '#64748b',
  page_view: '#3b82f6', product_view: '#06b6d4',  outfit_view: '#a78bfa',
  search: '#f97316',    add_to_cart: '#10b981',   wishlist_add: '#ec4899',
  wishlist_remove: '#f87171', wardrobe_add: '#84cc16', feedback: '#fbbf24',
  purchase: '#f59e0b',
  WISHLIST: '#ec4899',  CART: '#10b981',          PURCHASE: '#f59e0b',
};
const DEFAULT_COLOR = '#94a3b8';
const BAR_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f97316'];
const hasPage = (l: any) => String(l.pageUrl ?? '').trim() !== '';

// ─── 상세 컬럼 ────────────────────────────────────────────────────────────────
const DURATION_TYPES = new Set(['VIEW', 'page_view', 'product_view']);
const SCROLL_TYPES   = new Set(['SCROLL']);

const WISHLIST_TYPES = new Set(['wishlist_add', 'wishlist_remove', 'WISHLIST']);
const PURCHASE_TYPES = new Set(['purchase', 'PURCHASE']);

const getColumns = (eventType: string | null): string[] => {
  if (eventType && DURATION_TYPES.has(eventType)) return ['고객명', '페이지', '체류시간', '시각'];
  if (eventType && SCROLL_TYPES.has(eventType))   return ['고객명', '페이지', '스크롤깊이', '시각'];
  if (eventType && (WISHLIST_TYPES.has(eventType) || PURCHASE_TYPES.has(eventType)))
    return ['고객명', '상품', '시각'];
  return ['고객명', '페이지', '시각'];
};

/** 백엔드 "yyyy.MM.dd HH:mm:ss" → "yy-mm-dd hh:mm:ss" */
function formatTime(raw: string | null | undefined): string {
  if (!raw) return '-';
  try {
    const clean = raw.replace(/\./g, '-');
    const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return raw;
    const [, yyyy, mo, dd, hh, mi, ss = '00'] = m;
    return `${yyyy.slice(2)}-${mo}-${dd} ${hh}:${mi}:${ss}`;
  } catch { return raw; }
}

const buildRow = (l: any, columns: string[]): Record<string, string> => {
  const all: Record<string, string> = {
    '고객명':    l.customerName ?? '-',
    '페이지':    l.pageUrl      ?? '-',
    '체류시간':  l.duration     ? `${l.duration}초`    : '-',
    '스크롤깊이': l.scrollDepth  ? `${l.scrollDepth}%` : '-',
    '시각':      formatTime(l.time ?? l.createdAt ?? l.timestamp),
    '상품':      l.itemName ?? l.productName ?? (l.itemId ? `상품 #${l.itemId}` : (l.pageUrl ?? '-')),
  };
  return Object.fromEntries(columns.map(c => [c, all[c] ?? '-']));
};

// pageUrl → pathname 파싱
const parsePathname = (url: string): string => {
  try { return new URL(url).pathname; }
  catch { return url; }
};

// ─── 타입 ────────────────────────────────────────────────────────────────────
type Summary        = { totalViews: number; avgDuration: number; avgScrollDepth: number };
type TypeCount      = { eventType: string; count: number };
type HourlyItem     = { hour: string; count: number };
type Conversion     = { sessionCount: number; purchaseConversionRate: number };
type PopularProduct = { itemId: number; count: number; name: string; brand: string; imageUrl: string; category: string };
type PopularPage    = { pageUrl: string; count: number };
type WishlistConv   = { wishlistCount: number; purchaseCount: number; conversionRate: number };

// ─── 날짜 필터 ───────────────────────────────────────────────────────────────
const DAY_FILTERS: { label: string; days: number }[] = [
  { label: '전체', days: 0  },
  { label: '오늘', days: 1  },
  { label: '7일',  days: 7  },
  { label: '30일', days: 30 },
];

const WISHLIST_DAY_FILTERS: { label: string; days: number }[] = [
  { label: '오늘', days: 1  },
  { label: '7일',  days: 7  },
  { label: '30일', days: 30 },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
export function UserBehavior() {
  const [loading,         setLoading]         = useState(true);
  const [detail,          setDetail]          = useState<DetailData | null>(null);
  const [dayFilter,       setDayFilter]       = useState(0);
  const [summary,         setSummary]         = useState<Summary | null>(null);
  const [typeCounts,      setTypeCounts]      = useState<TypeCount[]>([]);
  const [hourlyData,      setHourlyData]      = useState<HourlyItem[]>([]);
  const [conversion,      setConversion]      = useState<Conversion | null>(null);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [popularPages,    setPopularPages]    = useState<PopularPage[]>([]);
  const [wishlistConv,    setWishlistConv]    = useState<WishlistConv | null>(null);

  // ── 시간대별 활동 순위 (전날부터 30일, 고정) ─────────────────────────────────
  const [hourlyRanking, setHourlyRanking] = useState<{ hour: string; count: number; rank: number }[]>([]);

  // ── 인기 상품 카테고리 필터 ────────────────────────────────────────────────────
  const [popCategoryFilter, setPopCategoryFilter] = useState('전체');
  const [allPopularProducts, setAllPopularProducts] = useState<PopularProduct[]>([]);

  // ── 찜 전환율 독립 필터 (기본 오늘, localStorage 유지) ──────────────────────────
  const [wishlistDays, setWishlistDaysState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wf_wishlist_days');
      return saved ? Number(saved) : 1;   // 기본값: 오늘(1)
    } catch { return 1; }
  });
  const [wishlistCustom, setWishlistCustom] = useState<boolean>(() => {
    try { return localStorage.getItem('wf_wishlist_custom') === '1'; } catch { return false; }
  });
  const [wishlistFromDate, setWishlistFromDateState] = useState<string>(() => {
    try { return localStorage.getItem('wf_wishlist_from') ?? ''; } catch { return ''; }
  });
  const [wishlistIndepData, setWishlistIndepData] = useState<WishlistConv | null>(null);
  const [wishlistLoading,   setWishlistLoading]   = useState(false);

  /** 찜 필터 setter (localStorage 동기 저장) */
  const setWishlistDays = (v: number) => {
    setWishlistDaysState(v);
    try { localStorage.setItem('wf_wishlist_days', String(v)); } catch {}
  };
  const setWishlistFromDate = (v: string) => {
    setWishlistFromDateState(v);
    try { localStorage.setItem('wf_wishlist_from', v); } catch {}
  };
  const setWishlistCustomAndSave = (v: boolean) => {
    setWishlistCustom(v);
    try { localStorage.setItem('wf_wishlist_custom', v ? '1' : '0'); } catch {}
  };

  // ── 8개 API 동시 호출 (dayFilter 변경 시 재호출) ─────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getBehaviorSummary(dayFilter).catch(() => null),
      getBehaviorTypeCounts(dayFilter).catch(() => []),
      getBehaviorHourly(dayFilter).catch(() => []),
      getBehaviorConversionRate(dayFilter).catch(() => null),
      getBehaviorPopularProducts(dayFilter).catch(() => []),
      getBehaviorPopularPages(dayFilter).catch(() => []),
      getBehaviorWishlistConversion(dayFilter).catch(() => null),
      getProducts().catch(() => []),
    ]).then(([sum, types, hourly, conv, popProds, popPages, wishConv, prods]) => {
      setSummary(sum ?? null);
      setTypeCounts(Array.isArray(types) ? types : []);

      // hour가 0~23 숫자로 올 수 있으므로 24시간 전체 보장
      const rawHourly: { hour: number; count: number }[] = Array.isArray(hourly) ? hourly : [];
      const hourMap: Record<number, number> = {};
      rawHourly.forEach(h => { hourMap[Number(h.hour)] = h.count; });
      setHourlyData(Array.from({ length: 24 }, (_, h) => ({ hour: `${h}시`, count: hourMap[h] ?? 0 })));

      setConversion(conv ?? null);

      // 인기 상품에 상품명 + 카테고리 매핑 (전체 저장 후 카테고리별 필터용)
      const prodList = Array.isArray(prods) ? prods : [];
      const rawPops: { itemId: number; count: number }[] = Array.isArray(popProds) ? popProds : [];
      const mappedAll = rawPops.slice(0, 50).map(p => {
        const prod = prodList.find((pr: any) => Number(pr.id) === Number(p.itemId));
        return {
          ...p,
          name:     prod?.productName ?? `상품 #${p.itemId}`,
          brand:    prod?.brand ?? '-',
          imageUrl: prod?.imageUrl ?? '',
          category: prod?.category ?? '기타',
        };
      });
      setAllPopularProducts(mappedAll);
      setPopularProducts(mappedAll.slice(0, 5));

      setPopularPages(Array.isArray(popPages) ? popPages.slice(0, 5) : []);
      setWishlistConv(wishConv ?? null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [dayFilter]);

  // ── 시간대별 활동 순위: 전날부터 30일 고정 ──────────────────────────────────
  useEffect(() => {
    getBehaviorHourly(30).then(data => {
      const raw: { hour: number; count: number }[] = Array.isArray(data) ? data : [];
      const hourMap: Record<number, number> = {};
      raw.forEach(h => { hourMap[Number(h.hour)] = (hourMap[Number(h.hour)] ?? 0) + h.count; });
      const ranked = Array.from({ length: 24 }, (_, h) => ({ h, count: hourMap[h] ?? 0 }))
        .filter(x => x.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map((x, i) => ({ rank: i + 1, hour: `${x.h}시`, count: x.count }));
      setHourlyRanking(ranked);
    }).catch(() => {});
  }, []);

  // ── 찜 전환율 독립 조회 ──────────────────────────────────────────────────────
  useEffect(() => {
    let days = wishlistDays;
    if (wishlistCustom && wishlistFromDate) {
      const diffMs = Date.now() - new Date(wishlistFromDate).getTime();
      days = Math.max(1, Math.ceil(diffMs / 86400000));
    }
    setWishlistLoading(true);
    getBehaviorWishlistConversion(days)
      .then(d => setWishlistIndepData(d ?? null))
      .catch(() => setWishlistIndepData(null))
      .finally(() => setWishlistLoading(false));
  }, [wishlistDays, wishlistCustom, wishlistFromDate]);

  // ── 상세 팝업 열기 ──────────────────────────────────────────────────────────
  const openDetail = async (
    eventType: string | null,
    title: string,
    subtitle: string,
    color: string,
    hour?: number,
    filterDays?: number,   // 백엔드에 days 파라미터로 전달
  ) => {
    const data = await getBehaviorDetail({ type: eventType, hour, days: filterDays }).catch(() => []);
    let allRows: any[] = Array.isArray(data) ? data : [];
    // 백엔드가 days=1을 "지난 24시간"으로 처리하므로, 오늘 버튼일 때 오늘 날짜만 필터링
    if (filterDays === 1) {
      const todayPrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      allRows = allRows.filter(l => {
        const raw = String(l.time ?? l.createdAt ?? l.timestamp ?? '');
        return raw.startsWith(todayPrefix);
      });
    }
    // 최신순 정렬
    allRows.sort((a, b) => {
      const ta = String(a.time ?? a.createdAt ?? a.timestamp ?? '');
      const tb = String(b.time ?? b.createdAt ?? b.timestamp ?? '');
      return tb.localeCompare(ta);
    });
    const columns = getColumns(eventType);
    setDetail({ title, subtitle, color, columns, rows: allRows.map(l => buildRow(l, columns)) });
  };

  // ── 퍼널 데이터 ─────────────────────────────────────────────────────────────
  const sumOf = (...types: string[]) =>
    typeCounts.filter(t => types.includes(t.eventType)).reduce((s, t) => s + t.count, 0);

  const funnelData = [
    { stage: '상품 조회', count: sumOf('product_view', 'VIEW'),    color: '#3b82f6', fetchType: 'product_view' },
    { stage: '코디 조회', count: sumOf('outfit_view'),             color: '#a78bfa', fetchType: 'outfit_view'  },
    { stage: '장바구니',  count: sumOf('add_to_cart', 'CART'),     color: '#10b981', fetchType: 'add_to_cart'  },
    { stage: '찜하기',    count: sumOf('wishlist_add', 'WISHLIST'), color: '#ec4899', fetchType: 'wishlist_add' },
    { stage: '구매완료',  count: sumOf('purchase', 'PURCHASE'),    color: '#f59e0b', fetchType: 'purchase'     },
  ];

  const activeTypes = typeCounts.filter(t => t.count > 0);
  const hasData     = !loading && (summary !== null || activeTypes.length > 0);

  // 구매 전환율 표시값 (0이면 "-")
  const convRateDisplay =
    !conversion || conversion.purchaseConversionRate === 0
      ? '-'
      : `${conversion.purchaseConversionRate}%`;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* 헤더 + 날짜 필터 */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">전체 고객 행동 분석</h1>
          <p className="text-gray-500 text-sm">고객의 웹사이트 내 행동 패턴</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
          {DAY_FILTERS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setDayFilter(days)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dayFilter === days
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          데이터를 불러오는 중...
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          데이터가 없습니다
        </div>
      ) : (
        <>
          {/* ── 1. 요약 카드 2×2 ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-5">
            {[
              {
                label: '총 세션 수',
                value: `${(conversion?.sessionCount ?? 0).toLocaleString()}회`,
                Icon: Eye,
                color: 'bg-blue-500',
                onClick: () => openDetail(null, '세션 상세', `총 ${(conversion?.sessionCount ?? 0).toLocaleString()}회`, '#3b82f6'),
              },
              {
                label: '평균 체류시간',
                value: `${summary?.avgDuration ?? 0}초`,
                Icon: Clock,
                color: 'bg-purple-500',
                onClick: () => openDetail('page_view', '체류시간 상세', `평균 ${summary?.avgDuration ?? 0}초`, '#8b5cf6'),
              },
              {
                label: '평균 스크롤 깊이',
                value: `${summary?.avgScrollDepth ?? 0}%`,
                Icon: Activity,
                color: 'bg-pink-500',
                onClick: () => openDetail('SCROLL', '스크롤 깊이 상세', `평균 ${summary?.avgScrollDepth ?? 0}%`, '#ec4899'),
              },
              {
                label: '구매 전환율',
                value: convRateDisplay,
                Icon: ShoppingBag,
                color: 'bg-orange-500',
                onClick: () => openDetail('purchase', '구매 전환 상세', `전환율 ${convRateDisplay}`, '#f59e0b'),
              },
            ].map(({ label, value, Icon, color, onClick }) => (
              <div key={label}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow min-h-[5.5rem]"
                onClick={onClick}>
                <div className={`${color} p-3 rounded-xl text-white shrink-0`}><Icon size={20} /></div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 2행: 행동 타입별 분포(가로 막대) + 시간대별 활동 ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            {/* 행동 타입별 분포 — 가로 막대 차트 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-4">행동 타입별 분포</h2>
              {activeTypes.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-400 text-sm">데이터 없음</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(240, activeTypes.length * 36)}>
                  <BarChart
                    data={activeTypes.map(t => ({
                      name:  ACTION_LABEL[t.eventType] ?? t.eventType,
                      count: t.count,
                      type:  t.eventType,
                    }))}
                    layout="vertical"
                    margin={{ left: 4, right: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => [`${v.toLocaleString()}건`]}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer"
                      onClick={(data: any) => openDetail(
                        data.type,
                        `${data.name} 행동 로그`,
                        `총 ${data.count.toLocaleString()}건`,
                        ACTION_COLORS[data.type] ?? DEFAULT_COLOR,
                      )}>
                      {activeTypes.map(t => (
                        <Cell key={t.eventType} fill={ACTION_COLORS[t.eventType] ?? DEFAULT_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 시간대별 활동 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-4">시간대별 활동</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString()}건`]}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} cursor="pointer"
                    onClick={(data: any) => {
                      const h = parseInt(data.hour);
                      openDetail(null, `${data.hour} 활동 상세`, `${data.count.toLocaleString()}건`, '#8b5cf6', h);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* 최근 30일 시간대별 활동 순위 */}
              {hourlyRanking.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Trophy size={13} className="text-yellow-500" />
                    <span className="text-xs font-semibold text-gray-700">최근 30일 활동 많은 시간대 순위</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {hourlyRanking.map(({ rank, hour, count }) => (
                      <div key={hour} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50">
                        <span className={`text-xs font-bold w-5 text-center ${
                          rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-gray-400'
                        }`}>{rank}</span>
                        <span className="text-xs font-medium text-gray-700 w-10">{hour}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-purple-400"
                            style={{ width: `${Math.round((count / hourlyRanking[0].count) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 shrink-0">{count.toLocaleString()}건</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 3행: 구매 퍼널 + 인기 상품 ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            {/* 구매 퍼널 */}
            <div className="bg-white rounded-xl p-5 pb-3 shadow-sm border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-1">구매 퍼널 분석</h2>
              <p className="text-xs text-gray-500 mb-3">상품 발견 → 구매까지의 전환 흐름</p>
              <ResponsiveContainer width="100%" height={175}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="stage" type="category" width={72} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString()}건`]}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer"
                    onClick={(data: any) => {
                      const stage = funnelData.find(f => f.stage === data.stage);
                      if (!stage) return;
                      openDetail(stage.fetchType, `${data.stage} 단계 상세`, `${data.count.toLocaleString()}건`, stage.color);
                    }}>
                    {funnelData.map(e => <Cell key={e.stage} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-5 gap-1.5">
                {funnelData.map((s, i) => {
                  const rate = i > 0 && funnelData[i - 1].count > 0
                    ? ((s.count / funnelData[i - 1].count) * 100).toFixed(0)
                    : '100';
                  return (
                    <div key={s.stage} className="text-center py-2 px-1 bg-gray-50 rounded-xl">
                      <div className="text-sm font-bold text-gray-900">{s.count.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-600 mt-0.5">{s.stage}</div>
                      {i > 0 && <div className="text-[10px] text-gray-400 mt-0.5">전환 {rate}%</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 많이 본 상품 TOP 5 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-base font-semibold text-gray-900">많이 본 상품 TOP 5</h2>
                <div className="flex items-center gap-1 flex-wrap">
                  {['전체', ...Array.from(new Set(allPopularProducts.map(p => p.category).filter(Boolean)))].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setPopCategoryFilter(cat);
                        const filtered = cat === '전체' ? allPopularProducts : allPopularProducts.filter(p => p.category === cat);
                        setPopularProducts(filtered.slice(0, 5));
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        popCategoryFilter === cat
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {popularProducts.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-gray-400 text-sm">데이터 없음</div>
              ) : (
                <div className="space-y-2">
                  {popularProducts.map((product, index) => (
                    <div key={product.itemId} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white'
                        : index === 1 ? 'bg-gray-400 text-white'
                        : index === 2 ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-200" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{product.brand}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-gray-900">{product.count.toLocaleString()}회</p>
                        <p className="text-xs text-gray-400">조회수</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 4행: 인기 페이지 + 찜 전환율 ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* 인기 페이지 TOP 5 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-4">인기 페이지 TOP 5</h2>
              {popularPages.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-400 text-sm">데이터 없음</div>
              ) : (
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart
                    data={popularPages.map(p => ({ name: parsePathname(p.pageUrl), count: p.count }))}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v: number) => [`${v.toLocaleString()}건`]}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {popularPages.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 찜 전환율 — 독립 기간 필터 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-base font-semibold text-gray-900">찜 전환율</h2>
                <div className="flex items-center gap-1 flex-wrap">
                  {WISHLIST_DAY_FILTERS.map(({ label, days }) => (
                    <button
                      key={days}
                      onClick={() => { setWishlistDays(days); setWishlistCustomAndSave(false); setWishlistFromDate(''); }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        !wishlistCustom && wishlistDays === days
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => setWishlistCustomAndSave(!wishlistCustom)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      wishlistCustom
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    직접입력
                  </button>
                </div>
              </div>

              {wishlistCustom && (
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                  <span className="shrink-0">시작일</span>
                  <input
                    type="date"
                    value={wishlistFromDate}
                    max={new Date(Date.now() - 86400000).toISOString().slice(0, 10)}
                    onChange={e => setWishlistFromDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                  <span className="text-gray-400">~ 오늘</span>
                  {wishlistFromDate && (
                    <span className="text-pink-500 font-medium">
                      ({Math.max(1, Math.ceil((Date.now() - new Date(wishlistFromDate).getTime()) / 86400000))}일간)
                    </span>
                  )}
                </div>
              )}

              {wishlistLoading ? (
                <div className="flex items-center justify-center h-28 text-gray-400 text-sm">불러오는 중...</div>
              ) : !wishlistIndepData ? (
                <div className="flex items-center justify-center h-28 text-gray-400 text-sm">데이터 없음</div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: '찜 추가 수',
                      value: wishlistIndepData.wishlistCount.toLocaleString(),
                      cls: 'bg-pink-50 border-pink-200 text-pink-700',
                      clickable: true,
                      onClick: () => {
                        const days = wishlistCustom && wishlistFromDate
                          ? Math.max(1, Math.ceil((Date.now() - new Date(wishlistFromDate).getTime()) / 86400000))
                          : wishlistDays;
                        openDetail('wishlist_add', '찜 추가 로그', `${wishlistIndepData.wishlistCount.toLocaleString()}건`, '#ec4899', undefined, days);
                      },
                    },
                    {
                      label: '구매 전환 수',
                      value: wishlistIndepData.purchaseCount.toLocaleString(),
                      cls: 'bg-green-50 border-green-200 text-green-700',
                      clickable: true,
                      onClick: () => {
                        const days = wishlistCustom && wishlistFromDate
                          ? Math.max(1, Math.ceil((Date.now() - new Date(wishlistFromDate).getTime()) / 86400000))
                          : wishlistDays;
                        openDetail('purchase', '구매 전환 로그', `${wishlistIndepData.purchaseCount.toLocaleString()}건`, '#10b981', undefined, days);
                      },
                    },
                    {
                      label: '전환율',
                      value: wishlistIndepData.conversionRate === 0 ? '-' : `${wishlistIndepData.conversionRate}%`,
                      cls: 'bg-purple-50 border-purple-200 text-purple-700',
                      clickable: false,
                      onClick: undefined,
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      onClick={item.onClick}
                      className={`rounded-xl border p-4 text-center ${item.cls} ${item.clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    >
                      <p className="text-xs opacity-70 mb-2">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                      {item.clickable && <p className="text-[10px] opacity-50 mt-1">클릭하여 상세 보기</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ChartDetailPanel data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
