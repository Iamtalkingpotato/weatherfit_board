import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Tag, X, Edit2, Trash2 } from 'lucide-react';
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getAllCustomerCoupons, getCampaigns, getCustomers,
} from '../api/logApi';
import { useDialog } from '../context/DialogContext';
import { ChartDetailPanel, DetailData } from './ChartDetailPanel';

const COUPON_CREATED_KEY = 'coupon_just_created';

// ─── Constants ────────────────────────────────────────────────────────────
const COUPON_TYPE_LABEL: Record<string, string> = { PERCENT: '비율 할인', AMOUNT: '금액 할인' };
const COUPON_STATUS_LABEL: Record<string, string> = { ACTIVE: '활성', INACTIVE: '비활성', EXPIRED: '만료' };
const CUSTOMER_COUPON_STATUS_LABEL: Record<string, string> = { ISSUED: '발급', USED: '사용완료', EXPIRED: '만료' };
const CATEGORY_LABEL: Record<string, string> = { OUTER: '아우터', TOP: '상의', BOTTOM: '하의', ACCESSORY: '악세서리' };

// ─── Interfaces ────────────────────────────────────────────────────────────
interface Coupon {
  id: number;
  couponName: string;
  description: string;
  type: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validDays: number;
  targetCategory?: string;
  campaignId?: number;
  linkedCampaignIds?: number[];
  issuedCount: number;
  usedCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt?: string;
}

interface CustomerCoupon {
  id: number;
  customerId: number;
  couponId: number;
  issuedAt: string;
  expiredAt: string;
  usedAt?: string;
  status: 'ISSUED' | 'USED' | 'EXPIRED';
}

// ─── Date helper ──────────────────────────────────────────────────────────
/** "yyyy-mm-dd" → "yy-mm-dd" / datetime → "yy-mm-dd hh:mm:ss" */
function fmtDate(raw: string | null | undefined): string {
  if (!raw) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.slice(2);
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const yy = String(d.getFullYear()).slice(2);
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yy}-${mo}-${dd} ${hh}:${mi}:${ss}`;
  } catch { return raw; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-700 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
  EXPIRED:  'bg-red-100 text-red-700 border-red-200',
};

const CUSTOMER_COUPON_BADGE: Record<string, string> = {
  ISSUED:  'bg-blue-100 text-blue-700',
  USED:    'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

// ─── Form types ────────────────────────────────────────────────────────────
type CouponFormData = {
  name: string;
  description: string;
  type: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  validDays: number;
  targetCategory: string;
  campaignId: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const EMPTY_FORM: CouponFormData = {
  name: '',
  description: '',
  type: 'PERCENT',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  validDays: 30,
  targetCategory: '',
  campaignId: '',
  status: 'ACTIVE',
};

const CATEGORY_OPTIONS = [
  { label: '전체', value: '' },
  { label: '아우터', value: 'OUTER' },
  { label: '상의', value: 'TOP' },
  { label: '하의', value: 'BOTTOM' },
  { label: '악세서리', value: 'ACCESSORY' },
];

// ─── Coupon Form ───────────────────────────────────────────────────────────
function CouponForm({
  initial,
  campaigns,
  onSave,
  onCancel,
}: {
  initial: Coupon | null;
  campaigns: any[];
  onSave: (c: Omit<Coupon, 'id'> & { id?: number }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CouponFormData>(
    initial
      ? {
          name: initial.couponName,
          description: initial.description,
          type: initial.type,
          discountValue: initial.discountValue,
          minOrderAmount: initial.minOrderAmount,
          maxDiscountAmount: initial.maxDiscountAmount ?? 0,
          validDays: initial.validDays,
          targetCategory: initial.targetCategory ?? '',
          campaignId: initial.campaignId != null ? String(initial.campaignId) : '',
          status: initial.status === 'EXPIRED' ? 'INACTIVE' : initial.status,
        }
      : { ...EMPTY_FORM },
  );

  const set = <K extends keyof CouponFormData>(key: K, value: CouponFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const dialog = useDialog();

  const handleSave = async () => {
    if (!form.name.trim()) { await dialog.alert('쿠폰명을 입력하세요', '입력 오류'); return; }
    if (form.discountValue <= 0) { await dialog.alert('할인값을 입력하세요', '입력 오류'); return; }
    const now = new Date().toISOString();
    onSave({
      ...(initial?.id !== undefined ? { id: initial.id } : {}),
      couponName: form.name,
      description: form.description,
      type: form.type,
      discountValue: form.discountValue,
      minOrderAmount: form.minOrderAmount,
      maxDiscountAmount: form.type === 'PERCENT' && form.maxDiscountAmount > 0 ? form.maxDiscountAmount : undefined,
      validDays: form.validDays,
      targetCategory: form.targetCategory || undefined,
      campaignId: form.campaignId ? Number(form.campaignId) : undefined,
      issuedCount: initial?.issuedCount ?? 0,
      usedCount: initial?.usedCount ?? 0,
      status: form.status,
      createdAt: initial?.createdAt ?? now,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {initial ? '쿠폰 수정' : '새 쿠폰 등록'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
          <X size={16} /> 닫기
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> 쿠폰 기본 정보
        </h3>

        {/* 쿠폰명 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">쿠폰명</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* 설명 */}
        <div className="flex gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0 pt-1.5">설명</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={2}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* 할인 유형 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">할인 유형</label>
          <div className="flex gap-4">
            {(['PERCENT', 'AMOUNT'] as const).map(t => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="couponType"
                  value={t}
                  checked={form.type === t}
                  onChange={() => set('type', t)}
                  className="accent-blue-600"
                />
                {COUPON_TYPE_LABEL[t]}
              </label>
            ))}
          </div>
        </div>

        {/* 할인값 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">할인값</label>
          <input
            type="number"
            value={form.discountValue}
            onChange={e => set('discountValue', Number(e.target.value))}
            onFocus={e => e.target.select()}
            min={0}
            className="w-32 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-500">{form.type === 'PERCENT' ? '%' : '원'}</span>
        </div>

        {/* 최소 주문 금액 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">최소 주문 금액</label>
          <input
            type="number"
            value={form.minOrderAmount}
            onChange={e => set('minOrderAmount', Number(e.target.value))}
            onFocus={e => e.target.select()}
            min={0}
            className="w-32 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-500">원</span>
        </div>

        {/* 최대 할인 금액 (PERCENT만) */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">최대 할인 금액</label>
          <input
            type="number"
            value={form.maxDiscountAmount}
            onChange={e => set('maxDiscountAmount', Number(e.target.value))}
            onFocus={e => e.target.select()}
            min={0}
            disabled={form.type !== 'PERCENT'}
            className="w-32 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400"
          />
          <span className="text-sm text-gray-500">원</span>
          {form.type !== 'PERCENT' && <span className="text-xs text-gray-400">(비율 할인 전용)</span>}
        </div>

        {/* 유효 기간 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">유효 기간</label>
          <input
            type="number"
            value={form.validDays}
            onChange={e => set('validDays', Number(e.target.value))}
            onFocus={e => e.target.select()}
            min={1}
            className="w-32 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-500">일</span>
        </div>

        {/* 적용 카테고리 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">적용 카테고리</label>
          <select
            value={form.targetCategory}
            onChange={e => set('targetCategory', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-40"
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* 연결 캠페인 (읽기 전용 — 캠페인 페이지에서 연결 설정) */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">연결 캠페인</label>
          <div className="px-3 py-1.5 text-sm rounded border border-gray-200 bg-gray-50 text-gray-700 min-w-[180px]">
            {form.campaignId
              ? campaigns.find(c => String(c.id) === String(form.campaignId))?.campaignName ?? `캠페인 #${form.campaignId}`
              : <span className="text-gray-400">없음 (캠페인에서 설정)</span>
            }
          </div>
        </div>

        {/* 상태 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">상태</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-32"
          >
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-4">
        <button
          onClick={onCancel}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          ✓ 저장하기
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export function CouponPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddNew = searchParams.get('addNew') === 'true';

  const [list, setList] = useState<Coupon[]>([]);
  const [ccList, setCcList] = useState<CustomerCoupon[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const dialog = useDialog();

  useEffect(() => {
    Promise.all([
      getCoupons().catch(() => []),
      getAllCustomerCoupons().catch(() => []),
      getCampaigns().catch(() => []),
      getCustomers().catch(() => []),
    ]).then(([coupons, cc, camps, custs]) => {
      setList(Array.isArray(coupons) ? coupons : []);
      setCcList(Array.isArray(cc) ? cc : []);
      setCampaigns(Array.isArray(camps) ? camps : []);
      setCustomers(Array.isArray(custs) ? custs : []);
    });
  }, []);

  // ?addNew=true 이면 바로 새 쿠폰 등록 폼 오픈
  const [view, setView] = useState<'list' | 'form' | 'issued'>(() => isAddNew ? 'form' : 'list');
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [issuedSearch, setIssuedSearch] = useState('');
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [couponPage, setCouponPage] = useState(1);
  const PAGE_SIZE = 10;
  const ISSUED_LIMIT = 50;

  // ccList 기준으로 쿠폰별 실제 발급/사용 건수 집계
  const couponStats = useMemo(() => {
    const map: Record<number, { issued: number; used: number }> = {};
    for (const cc of ccList) {
      if (!map[cc.couponId]) map[cc.couponId] = { issued: 0, used: 0 };
      map[cc.couponId].issued += 1;
      if (cc.status === 'USED') map[cc.couponId].used += 1;
    }
    return map;
  }, [ccList]);

  // Stats — ccList 실제 데이터 기준
  const activeCoupons = list.filter(c => c.status === 'ACTIVE').length;
  const totalIssued = ccList.length;
  const totalUsed = ccList.filter(cc => cc.status === 'USED').length;
  const avgUsageRate = totalIssued > 0 ? Math.round((totalUsed / totalIssued) * 100) : 0;

  const handleNew = () => { setEditing(null); setView('form'); };
  const handleEdit = (c: Coupon) => { setEditing(c); setView('form'); };
  const handleShowIssued = (c: Coupon) => { setSelectedCoupon(c); setIssuedSearch(''); setView('issued'); };
  const handleCancel = () => {
    if (isAddNew) {
      // 캠페인에서 넘어온 경우 → 캠페인 폼으로 돌아가기
      navigate('/campaign?view=form');
    } else {
      setView('list');
    }
  };

  const handleSave = async (c: Omit<Coupon, 'id'> & { id?: number }) => {
    let couponId = c.id;
    if (couponId !== undefined) {
      await updateCoupon(couponId, c);
    } else {
      const created = await createCoupon(c);
      couponId = created?.id;
    }

    // 캠페인에서 새 쿠폰 만들기 흐름: 캠페인 페이지로 돌아가기
    if (isAddNew && couponId !== undefined) {
      sessionStorage.setItem(COUPON_CREATED_KEY, String(couponId));
      navigate('/campaign?view=form');
      return;
    }

    const data = await getCoupons();
    setList(Array.isArray(data) ? data : []);
    setView('list');
  };

  const handleDelete = async (id: number) => {
    const ok = await dialog.confirm('쿠폰을 삭제하시겠습니까?', {
      title: '쿠폰 삭제', confirmLabel: '삭제', destructive: true,
    });
    if (!ok) return;
    await deleteCoupon(id);
    setList(prev => prev.filter(c => c.id !== id));
    if (view === 'form') setView('list');
  };

  if (view === 'form') {
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg"><Tag size={20} className="text-orange-600" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">쿠폰 관리</h1>
            <p className="text-gray-500 text-sm">쿠폰 등록 및 발급 관리</p>
          </div>
          <button
            onClick={handleCancel}
            className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            ← 목록으로
          </button>
        </div>
        <CouponForm initial={editing} campaigns={campaigns} onSave={handleSave} onCancel={handleCancel} />
      </div>
    );
  }

  if (view === 'issued' && selectedCoupon) {
    const custMap = Object.fromEntries(customers.map(c => [String(c.id), c.name ?? c.email ?? String(c.id)]));
    const issuedForCoupon = ccList.filter(cc => cc.couponId === selectedCoupon.id);
    const searchLower = issuedSearch.trim().toLowerCase();
    const filteredIssued = searchLower
      ? issuedForCoupon.filter(cc => {
          const name = (custMap[String(cc.customerId)] ?? String(cc.customerId)).toLowerCase();
          return name.includes(searchLower);
        })
      : issuedForCoupon;
    const displayIssued = filteredIssued.slice(0, ISSUED_LIMIT);

    return (
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg"><Tag size={20} className="text-orange-600" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">발급 현황</h1>
            <p className="text-gray-500 text-sm">
              <span className="font-medium text-gray-700">{selectedCoupon.couponName}</span>
              <span className="ml-1.5 text-gray-400 font-mono text-xs">#{selectedCoupon.id}</span>
            </p>
          </div>
          <button
            onClick={() => setView('list')}
            className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            ← 목록으로
          </button>
        </div>

        {/* 검색 */}
        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="고객명 검색..."
            value={issuedSearch}
            onChange={e => setIssuedSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-56"
          />
          <span className="text-xs text-gray-400">
            {filteredIssued.length > ISSUED_LIMIT
              ? `상위 ${ISSUED_LIMIT}건 표시 (전체 ${filteredIssued.length}건)`
              : `총 ${filteredIssued.length}건`}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {([
                    ['No',    'text-center'],
                    ['고객명', 'text-left'],
                    ['발급일', 'text-right'],
                    ['만료일', 'text-right'],
                    ['사용일', 'text-right'],
                    ['상태',   'text-center'],
                  ] as [string, string][]).map(([h, align]) => (
                    <th key={h} className={`px-3 py-2.5 ${align} text-xs font-medium text-gray-500 whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayIssued.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">발급 내역이 없습니다</td></tr>
                ) : (
                  displayIssued.map((cc, i) => (
                    <tr key={cc.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-center text-gray-500 text-xs">{i + 1}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">{custMap[String(cc.customerId)] ?? cc.customerId}</td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">{fmtDate(cc.issuedAt)}</td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">{fmtDate(cc.expiredAt)}</td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">{fmtDate(cc.usedAt)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CUSTOMER_COUPON_BADGE[cc.status]}`}>
                          {CUSTOMER_COUPON_STATUS_LABEL[cc.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            {filteredIssued.length > ISSUED_LIMIT
              ? `상위 ${ISSUED_LIMIT}건만 표시됩니다 — 검색으로 범위를 좁히세요`
              : `총 ${filteredIssued.length}건`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg"><Tag size={20} className="text-orange-600" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">쿠폰 관리</h1>
          <p className="text-gray-500 text-sm">쿠폰 등록 및 발급 관리</p>
        </div>
        <button
          onClick={handleNew}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={15} /> 새 쿠폰 등록
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: '총 쿠폰 종류', value: `${activeCoupons}개`, sub: '활성 쿠폰', color: 'bg-orange-500', accentColor: '#f97316',
            onClick: () => {
              const rows = list.filter(c => c.status === 'ACTIVE').map(c => ({
                '쿠폰명': c.couponName,
                '유형': c.type === 'PERCENT' ? `${c.discountValue}%` : `₩${c.discountValue.toLocaleString()}`,
                '적용범위': c.targetCategory ? (CATEGORY_LABEL[c.targetCategory] ?? c.targetCategory) : '전체',
                '발급/사용': `${c.issuedCount}건 / ${c.usedCount}건`,
                '유효기간': `${c.validDays}일`,
              }));
              setDetail({ title: '활성 쿠폰 목록', subtitle: `총 ${rows.length}개`, color: '#f97316', columns: ['쿠폰명', '유형', '적용범위', '발급/사용', '유효기간'], rows });
            }
          },
          { label: '총 발급 건수', value: `${totalIssued}건`, sub: '누적 발급', color: 'bg-blue-500', accentColor: '#3b82f6',
            onClick: () => {
              const custMap = Object.fromEntries(customers.map(c => [String(c.id), c.name]));
              const rows = [...ccList]
                .sort((a, b) => String(b.issuedAt ?? '').localeCompare(String(a.issuedAt ?? '')))
                .map(cc => ({
                  '고객명': custMap[String(cc.customerId)] ?? cc.customerId,
                  '쿠폰명': list.find(c => c.id === cc.couponId)?.couponName ?? cc.couponId,
                  '발급일': fmtDate(cc.issuedAt),
                  '만료일': fmtDate(cc.expiredAt),
                  '상태': CUSTOMER_COUPON_STATUS_LABEL[cc.status] ?? cc.status,
                }));
              setDetail({ title: '발급 현황', subtitle: `총 ${rows.length}건`, color: '#3b82f6', columns: ['고객명', '쿠폰명', '발급일', '만료일', '상태'], rows });
            }
          },
          { label: '총 사용 완료', value: `${totalUsed}건`, sub: '누적 사용', color: 'bg-green-500', accentColor: '#10b981',
            onClick: () => {
              const custMap = Object.fromEntries(customers.map(c => [String(c.id), c.name]));
              const rows = [...ccList.filter(cc => cc.status === 'USED')]
                .sort((a, b) => String(b.usedAt ?? b.issuedAt ?? '').localeCompare(String(a.usedAt ?? a.issuedAt ?? '')))
                .map(cc => ({
                  '고객명': custMap[String(cc.customerId)] ?? cc.customerId,
                  '쿠폰명': list.find(c => c.id === cc.couponId)?.couponName ?? cc.couponId,
                  '발급일': fmtDate(cc.issuedAt),
                  '사용일': fmtDate(cc.usedAt),
                }));
              setDetail({ title: '사용 완료 내역', subtitle: `총 ${rows.length}건`, color: '#10b981', columns: ['고객명', '쿠폰명', '발급일', '사용일'], rows });
            }
          },
          { label: '평균 사용률', value: `${avgUsageRate}%`, sub: '발급 대비 사용', color: 'bg-purple-500', accentColor: '#8b5cf6',
            onClick: () => {
              const rows = list
                .filter(c => (couponStats[c.id]?.issued ?? 0) > 0)
                .sort((a, b) => {
                  const ra = (couponStats[a.id]?.used ?? 0) / (couponStats[a.id]?.issued ?? 1);
                  const rb = (couponStats[b.id]?.used ?? 0) / (couponStats[b.id]?.issued ?? 1);
                  return rb - ra;
                })
                .map(c => {
                  const s = couponStats[c.id] ?? { issued: 0, used: 0 };
                  return {
                    '쿠폰명': c.couponName,
                    '발급수': `${s.issued}건`,
                    '사용수': `${s.used}건`,
                    '사용률': `${Math.round((s.used / s.issued) * 100)}%`,
                    '상태': COUPON_STATUS_LABEL[c.status] ?? c.status,
                  };
                });
              setDetail({ title: '쿠폰별 사용률', subtitle: `평균 ${avgUsageRate}%`, color: '#8b5cf6', columns: ['쿠폰명', '발급수', '사용수', '사용률', '상태'], rows });
            }
          },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={s.onClick}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${s.color} w-2.5 h-2.5 rounded-full`} />
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Coupon List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {([
                    ['No',        'text-center'],
                    ['쿠폰명',    'text-left'],
                    ['할인값',    'text-right'],
                    ['최소주문',  'text-right'],
                    ['적용범위',  'text-left'],
                    ['유효기간',  'text-right'],
                    ['연결 캠페인', 'text-left'],
                    ['발급/사용', 'text-right'],
                    ['상태',      'text-center'],
                    ['',          'text-left'],
                  ] as [string, string][]).map(([h, align]) => (
                    <th key={h} className={`px-3 py-2.5 ${align} text-xs font-medium text-gray-500 whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.length === 0 ? (
                  <tr><td colSpan={12} className="text-center py-12 text-gray-400">쿠폰이 없습니다</td></tr>
                ) : (
                  list.slice((couponPage - 1) * PAGE_SIZE, couponPage * PAGE_SIZE).map((c, i) => {
                    const stats = couponStats[c.id] ?? { issued: 0, used: 0 };
                    const usageRate = stats.issued > 0 ? Math.round((stats.used / stats.issued) * 100) : 0;
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleShowIssued(c)}
                      >
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">{i + 1}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 max-w-[200px]">
                          <span className="truncate">{c.couponName}</span>
                          <span className="ml-1.5 text-xs text-gray-400 font-mono">#{c.id}</span>
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-gray-800 whitespace-nowrap font-medium">
                          {c.type === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}원`}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">
                          {c.minOrderAmount > 0 ? `${c.minOrderAmount.toLocaleString()}원` : '-'}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {c.targetCategory ? (CATEGORY_LABEL[c.targetCategory] ?? c.targetCategory) : '전체'}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">{c.validDays}일</td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {c.linkedCampaignIds && c.linkedCampaignIds.length > 0
                            ? c.linkedCampaignIds.map(id => `#${id}`).join(', ')
                            : '-'}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-gray-700 whitespace-nowrap">
                          {stats.issued}건 / {stats.used}건
                          {stats.issued > 0 && (
                            <span className="ml-1 text-gray-400">({usageRate}%)</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[c.status]}`}>
                            {COUPON_STATUS_LABEL[c.status]}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(c)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span>총 {list.length}건</span>
            {Math.ceil(list.length / PAGE_SIZE) > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setCouponPage(p => Math.max(1, p - 1))} disabled={couponPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40">◀</button>
                {Array.from({ length: Math.ceil(list.length / PAGE_SIZE) }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - couponPage) <= 2)
                  .map(p => (
                    <button key={p} onClick={() => setCouponPage(p)}
                      className={`px-2.5 py-1 border rounded ${couponPage === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}>
                      {p}
                    </button>
                  ))}
                <button onClick={() => setCouponPage(p => Math.min(Math.ceil(list.length / PAGE_SIZE), p + 1))} disabled={couponPage === Math.ceil(list.length / PAGE_SIZE)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40">▶</button>
              </div>
            )}
          </div>
        </div>
      <ChartDetailPanel data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
