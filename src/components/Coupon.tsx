import { useState } from 'react';
import { Plus, Tag, X, Edit2, Trash2 } from 'lucide-react';
import {
  coupons as initialCoupons,
  customerCoupons as initialCustomerCoupons,
  campaigns,
  customers,
  getCoupon,
  Coupon,
  CustomerCoupon,
  COUPON_TYPE_LABEL,
  COUPON_STATUS_LABEL,
  CUSTOMER_COUPON_STATUS_LABEL,
  CATEGORY_LABEL,
} from '../data/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────

function uid() { return 'CPN' + Math.random().toString(36).slice(2, 8).toUpperCase(); }

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
  type: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  validDays: number;
  targetCategory: string;
  campaignId: string; // 연결 캠페인 ID
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
  onSave,
  onCancel,
}: {
  initial: Coupon | null;
  onSave: (c: Coupon) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CouponFormData>(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          type: initial.type,
          discountValue: initial.discountValue,
          minOrderAmount: initial.minOrderAmount,
          maxDiscountAmount: initial.maxDiscountAmount ?? 0,
          validDays: initial.validDays,
          targetCategory: initial.targetCategory ?? '',
          campaignId: initial.campaignId ?? '',
          status: initial.status === 'EXPIRED' ? 'INACTIVE' : initial.status,
        }
      : { ...EMPTY_FORM },
  );

  const set = <K extends keyof CouponFormData>(key: K, value: CouponFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim()) { alert('쿠폰명을 입력하세요'); return; }
    if (form.discountValue <= 0) { alert('할인값을 입력하세요'); return; }
    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? uid(),
      name: form.name,
      description: form.description,
      type: form.type,
      discountValue: form.discountValue,
      minOrderAmount: form.minOrderAmount,
      maxDiscountAmount: form.type === 'PERCENT' && form.maxDiscountAmount > 0 ? form.maxDiscountAmount : undefined,
      validDays: form.validDays,
      targetCategory: form.targetCategory || undefined,
      campaignId: form.campaignId || undefined,
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
            {(['PERCENT', 'FIXED'] as const).map(t => (
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

        {/* 연결 캠페인 */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-600 shrink-0">연결 캠페인</label>
          <select
            value={form.campaignId}
            onChange={e => set('campaignId', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-72"
          >
            <option value="">없음</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>[{c.id}] {c.name}</option>
            ))}
          </select>
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
  const [list, setList] = useState<Coupon[]>(initialCoupons);
  const [ccList] = useState<CustomerCoupon[]>(initialCustomerCoupons);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [tab, setTab] = useState<'coupons' | 'issued'>('coupons');

  // Stats
  const activeCoupons = list.filter(c => c.status === 'ACTIVE').length;
  const totalIssued = list.reduce((s, c) => s + c.issuedCount, 0);
  const totalUsed = list.reduce((s, c) => s + c.usedCount, 0);
  const withIssued = list.filter(c => c.issuedCount > 0);
  const avgUsageRate = withIssued.length > 0
    ? Math.round(withIssued.reduce((s, c) => s + (c.usedCount / c.issuedCount) * 100, 0) / withIssued.length)
    : 0;

  const handleNew = () => { setEditing(null); setView('form'); };
  const handleEdit = (c: Coupon) => { setEditing(c); setView('form'); };
  const handleCancel = () => setView('list');

  const handleSave = (c: Coupon) => {
    setList(prev => prev.some(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]);
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('쿠폰을 삭제하시겠습니까?')) return;
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
        <CouponForm initial={editing} onSave={handleSave} onCancel={handleCancel} />
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
          { label: '총 쿠폰 종류', value: `${activeCoupons}개`, sub: '활성 쿠폰', color: 'bg-orange-500' },
          { label: '총 발급 건수', value: `${totalIssued}건`, sub: '누적 발급', color: 'bg-blue-500' },
          { label: '총 사용 완료', value: `${totalUsed}건`, sub: '누적 사용', color: 'bg-green-500' },
          { label: '평균 사용률', value: `${avgUsageRate}%`, sub: '발급 대비 사용', color: 'bg-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${s.color} w-2.5 h-2.5 rounded-full`} />
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {([['coupons', '쿠폰 목록'], ['issued', '발급 현황']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Coupon List Tab */}
      {tab === 'coupons' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['No', '쿠폰 ID', '쿠폰명', '유형', '할인값', '최소주문', '적용범위', '유효기간', '연결 캠페인', '발급/사용', '상태', ''].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.length === 0 ? (
                  <tr><td colSpan={12} className="text-center py-12 text-gray-400">쿠폰이 없습니다</td></tr>
                ) : (
                  list.map((c, i) => {
                    const linkedCampaign = c.campaignId ? campaigns.find(cam => cam.id === c.campaignId) : null;
                    const usageRate = c.issuedCount > 0 ? Math.round((c.usedCount / c.issuedCount) * 100) : 0;
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEdit(c)}
                      >
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">{i + 1}</td>
                        <td className="px-3 py-3 text-xs font-mono text-gray-700 whitespace-nowrap">{c.id}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 max-w-[180px] truncate">{c.name}</td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{COUPON_TYPE_LABEL[c.type]}</td>
                        <td className="px-3 py-3 text-xs text-gray-800 whitespace-nowrap font-medium">
                          {c.type === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}원`}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {c.minOrderAmount > 0 ? `${c.minOrderAmount.toLocaleString()}원` : '-'}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {c.targetCategory ? (CATEGORY_LABEL[c.targetCategory] ?? c.targetCategory) : '전체'}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.validDays}일</td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {linkedCampaign ? linkedCampaign.name : '-'}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">
                          {c.issuedCount}건 / {c.usedCount}건
                          {c.issuedCount > 0 && (
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
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">총 {list.length}건</div>
        </div>
      )}

      {/* Issued Tab */}
      {tab === 'issued' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['No', '고객명', '쿠폰명', '발급일', '만료일', '사용일', '상태'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ccList.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">발급 내역이 없습니다</td></tr>
                ) : (
                  ccList.map((cc, i) => {
                    const customer = customers.find(c => c.id === cc.customerId);
                    const coupon = getCoupon(cc.couponId);
                    return (
                      <tr key={cc.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">{i + 1}</td>
                        <td className="px-3 py-3 text-sm text-gray-900">{customer?.name ?? cc.customerId}</td>
                        <td className="px-3 py-3 text-xs text-gray-700 max-w-[180px] truncate">{coupon?.name ?? cc.couponId}</td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{cc.issuedAt}</td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{cc.expiredAt}</td>
                        <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{cc.usedAt ?? '-'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CUSTOMER_COUPON_BADGE[cc.status]}`}>
                            {CUSTOMER_COUPON_STATUS_LABEL[cc.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">총 {ccList.length}건</div>
        </div>
      )}
    </div>
  );
}
