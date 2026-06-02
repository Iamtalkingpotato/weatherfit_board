import { useState, useEffect, useMemo } from 'react';
import { UserX, RefreshCw, Trash2, Plus, Pencil, ToggleLeft, ToggleRight, X } from 'lucide-react';
import {
  getAnonymousUsers,
  deleteAnonymousUser,
  getCoupons,
  getAnonymousPopupRules,
  createAnonymousPopupRule,
  updateAnonymousPopupRule,
  deleteAnonymousPopupRule,
  toggleAnonymousPopupRule,
} from '../api/logApi';
import { useDialog } from '../context/DialogContext';

interface AnonymousUser {
  id: number;
  anonymousId: string;
  ip: string;
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  popupShown: boolean;
  popupClicked: boolean;
  converted: boolean;
  createdAt: string;
}

interface PopupRule {
  id: number;
  ruleType: 'visit_count' | 'repeat_interval';
  threshold: number;
  message: string;
  couponId: number | null;
  couponName: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Coupon {
  id: number;
  couponName: string;
}

interface RuleForm {
  ruleType: 'visit_count' | 'repeat_interval';
  threshold: string;
  message: string;
  couponId: string;
}

const EMPTY_RULE_FORM: RuleForm = {
  ruleType: 'visit_count',
  threshold: '',
  message: '',
  couponId: '',
};

function BoolBadge({ value, trueLabel = 'O', falseLabel = 'X' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return value ? (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{trueLabel}</span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{falseLabel}</span>
  );
}

function formatDateTime(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function RuleTypeBadge({ type }: { type: string }) {
  const isVisit = type === 'visit_count';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isVisit ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
      {isVisit ? '방문 횟수 도달' : 'N회마다 반복'}
    </span>
  );
}

export function AnonymousUsersPage() {
  const { confirm, alert } = useDialog();
  const [users, setUsers] = useState<AnonymousUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Popup rules state
  const [rules, setRules] = useState<PopupRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PopupRule | null>(null);
  const [ruleForm, setRuleForm] = useState<RuleForm>(EMPTY_RULE_FORM);
  const [ruleSubmitting, setRuleSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getAnonymousUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(e => setError(e?.message ?? '데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  const loadRules = () => {
    setRulesLoading(true);
    getAnonymousPopupRules()
      .then(data => setRules(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setRulesLoading(false));
  };

  const handleDelete = async (anonymousId: string) => {
    const ok = await confirm(
      `UUID ${anonymousId.slice(0, 8)}... 를 삭제하시겠습니까?\n다음 방문 시 새 UUID가 생성됩니다.`,
      { title: 'UUID 삭제', confirmLabel: '삭제', cancelLabel: '취소', destructive: true }
    );
    if (!ok) return;
    setDeletingId(anonymousId);
    try {
      await deleteAnonymousUser(anonymousId);
      setUsers(prev => prev.filter(u => u.anonymousId !== anonymousId));
    } catch {
      await alert('삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setEditingRule(null);
    setRuleForm(EMPTY_RULE_FORM);
    setModalOpen(true);
  };

  const openEditModal = (rule: PopupRule) => {
    setEditingRule(rule);
    setRuleForm({
      ruleType: rule.ruleType,
      threshold: String(rule.threshold),
      message: rule.message,
      couponId: rule.couponId != null ? String(rule.couponId) : '',
    });
    setModalOpen(true);
  };

  const handleRuleSubmit = async () => {
    if (!ruleForm.threshold || !ruleForm.message.trim()) {
      await alert('기준 횟수와 팝업 멘트를 입력해주세요.');
      return;
    }
    setRuleSubmitting(true);
    const payload = {
      ruleType: ruleForm.ruleType,
      threshold: Number(ruleForm.threshold),
      message: ruleForm.message.trim(),
      couponId: ruleForm.couponId ? Number(ruleForm.couponId) : null,
    };
    try {
      if (editingRule) {
        await updateAnonymousPopupRule(editingRule.id, payload);
      } else {
        await createAnonymousPopupRule(payload);
      }
      setModalOpen(false);
      loadRules();
    } catch {
      await alert('저장에 실패했습니다.');
    } finally {
      setRuleSubmitting(false);
    }
  };

  const handleRuleDelete = async (rule: PopupRule) => {
    const ok = await confirm(
      `"${rule.message.slice(0, 20)}..." 규칙을 삭제하시겠습니까?`,
      { title: '규칙 삭제', confirmLabel: '삭제', cancelLabel: '취소', destructive: true }
    );
    if (!ok) return;
    try {
      await deleteAnonymousPopupRule(rule.id);
      setRules(prev => prev.filter(r => r.id !== rule.id));
    } catch {
      await alert('삭제에 실패했습니다.');
    }
  };

  const handleRuleToggle = async (rule: PopupRule) => {
    try {
      const updated = await toggleAnonymousPopupRule(rule.id);
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: updated?.isActive ?? !r.isActive } : r));
    } catch {
      await alert('상태 변경에 실패했습니다.');
    }
  };

  useEffect(() => {
    load();
    loadRules();
    getCoupons().then(data => setCoupons(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const sorted = useMemo(
    () => [...users].sort((a, b) => b.visitCount - a.visitCount),
    [users],
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-100">
            <UserX size={22} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">비로그인 사용자</h1>
            <p className="text-sm text-gray-500">회원 가입 없이 방문한 익명 사용자 목록</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '전체 방문자', value: users.length, color: 'blue' },
          { label: '팝업 노출', value: users.filter(u => u.popupShown).length, color: 'purple' },
          { label: '팝업 클릭', value: users.filter(u => u.popupClicked).length, color: 'orange' },
          { label: '회원 전환', value: users.filter(u => u.converted).length, color: 'green' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-2xl font-semibold text-${card.color}-600 mt-1`}>{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            <RefreshCw size={16} className="animate-spin mr-2" /> 불러오는 중...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
        ) : sorted.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">UUID (앞 8자리)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">IP</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">방문수 ↓</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">최초 방문일</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">최근 방문일</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">팝업 노출</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">팝업 클릭</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">회원 전환</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {user.anonymousId?.slice(0, 8) ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.ip}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-blue-600">{user.visitCount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(user.firstVisit)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(user.lastVisit)}</td>
                    <td className="px-4 py-3 text-center"><BoolBadge value={user.popupShown} /></td>
                    <td className="px-4 py-3 text-center"><BoolBadge value={user.popupClicked} /></td>
                    <td className="px-4 py-3 text-center">
                      <BoolBadge value={user.converted} trueLabel="전환" falseLabel="미전환" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(user.anonymousId)}
                        disabled={deletingId === user.anonymousId}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                        title="UUID 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && sorted.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            총 {sorted.length.toLocaleString()}명 · 방문수 내림차순 정렬
          </div>
        )}
      </div>

      {/* 비로그인 팝업 설정 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">비로그인 팝업 설정</h2>
            <p className="text-sm text-gray-500 mt-0.5">비로그인 사용자에게 표시할 팝업 규칙을 관리합니다.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            규칙 추가
          </button>
        </div>

        {rulesLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            <RefreshCw size={16} className="animate-spin mr-2" /> 불러오는 중...
          </div>
        ) : rules.length === 0 ? (
          <div className="flex items-center justify-center py-12 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
            등록된 팝업 규칙이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`bg-white border rounded-xl p-4 space-y-3 transition-opacity ${rule.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <RuleTypeBadge type={rule.ruleType} />
                  <button
                    onClick={() => handleRuleToggle(rule)}
                    className="text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                    title={rule.isActive ? '비활성화' : '활성화'}
                  >
                    {rule.isActive
                      ? <ToggleRight size={22} className="text-blue-500" />
                      : <ToggleLeft size={22} />}
                  </button>
                </div>

                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-xs w-16 shrink-0">기준 횟수</span>
                    <span className="font-semibold">{rule.threshold}회</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-gray-400 text-xs w-16 shrink-0 pt-0.5">팝업 멘트</span>
                    <span className="text-gray-700 leading-snug line-clamp-2">{rule.message}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-xs w-16 shrink-0">연결 쿠폰</span>
                    {rule.couponName
                      ? <span className="text-blue-600 text-xs font-medium">{rule.couponName}</span>
                      : <span className="text-gray-400 text-xs">없음</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={12} /> 수정
                  </button>
                  <button
                    onClick={() => handleRuleDelete(rule)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors ml-auto"
                  >
                    <Trash2 size={12} /> 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 규칙 추가/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {editingRule ? '팝업 규칙 수정' : '팝업 규칙 추가'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 규칙 유형 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">규칙 유형</label>
                <div className="flex gap-4">
                  {([
                    { value: 'visit_count', label: '방문 횟수 도달' },
                    { value: 'repeat_interval', label: 'N회마다 반복' },
                  ] as const).map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input
                        type="radio"
                        name="ruleType"
                        value={opt.value}
                        checked={ruleForm.ruleType === opt.value}
                        onChange={() => setRuleForm(f => ({ ...f, ruleType: opt.value }))}
                        className="accent-blue-600"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 기준 횟수 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">기준 횟수</label>
                <input
                  type="number"
                  min={1}
                  value={ruleForm.threshold}
                  onChange={e => setRuleForm(f => ({ ...f, threshold: e.target.value }))}
                  placeholder="예: 3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* 팝업 멘트 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">팝업 멘트</label>
                <textarea
                  rows={3}
                  value={ruleForm.message}
                  onChange={e => setRuleForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="팝업에 표시할 메시지를 입력하세요."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              {/* 연결 쿠폰 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">연결 쿠폰</label>
                <select
                  value={ruleForm.couponId}
                  onChange={e => setRuleForm(f => ({ ...f, couponId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="">없음</option>
                  {coupons.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.couponName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleRuleSubmit}
                disabled={ruleSubmitting}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {ruleSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
