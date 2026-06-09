import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Plus, ChevronRight, ChevronDown, Search, X, Trash2,
  Users, Megaphone, CheckSquare, Square, Settings,
  Tag, MessageSquare,
} from 'lucide-react';
import {
  getCampaigns, createCampaign, updateCampaign, deleteCampaign,
  getCoupons, getCustomers, getAllFeedbacks, getAllPurchases,
  issueCampaignCoupons, getProducts,
} from '../api/logApi';
import { useCodeContext, TreeNode, fieldToTreeNode } from '../context/CodeContext';
import { useDialog } from '../context/DialogContext';
import { uid } from '../utils/uid';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CampaignFilterCondition {
  id: string;
  fieldNo?: number;
  fieldId: string;
  fieldLabel: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'select';
  operator: string;
  value: string;
  dateRange?: 'all' | 'campaign';
}

interface CampaignAction {
  id?: number;
  actionType: 'COUPON' | 'POPUP' | 'SMS';
  couponId?: number | null;
  popupMessage?: string;
  smsMessage?: string;
}

interface Campaign {
  id: number;
  campaignName: string;
  description: string;
  category1: string;
  category2: string;
  status: string;
  startDate: string;
  endDate: string;
  graceDays: number;
  customerType: string;
  visibility: string;
  tags: string;
  department: string;
  createdBy: string;
  filterSubject: string;
  createdAt?: string;
  filterConditions?: string | CampaignFilterCondition[] | null;
  actions: CampaignAction[];
  emailAction?: { subject: string; body: string };
  emailSubject?: string | null;
  emailBody?: string | null;
  popupMessage?: string | null;
}

type CustomerStat = Record<string, any>;

function findFieldNode(tree: TreeNode[], fieldId: string): TreeNode | undefined {
  for (const n of tree) {
    if (n.type === 'field' && n.id === fieldId) return n;
    if (n.children) {
      const found = findFieldNode(n.children, fieldId);
      if (found) return found;
    }
  }
  return undefined;
}

// ─── Operators ────────────────────────────────────────────────────────────────

const OPERATORS: Record<string, { label: string; value: string }[]> = {
  number: [{ label: '≥', value: '>=' }, { label: '>', value: '>' }, { label: '≤', value: '<=' }, { label: '<', value: '<' }],
  string: [{ label: '= (같음)', value: '=' }, { label: '≠ (다름)', value: '!=' }, { label: 'LIKE', value: 'LIKE' }],
  date:   [{ label: '≥', value: '>=' }, { label: '>', value: '>' }, { label: '≤', value: '<=' }, { label: '<', value: '<' }, { label: '=', value: '=' }],
  select: [{ label: '= (같음)', value: '=' }, { label: '≠ (다름)', value: '!=' }, { label: 'IN (복수선택)', value: 'IN' }],
};

// 필터 주제 탭은 CodeContext의 Field.filterSubject에서 동적으로 생성됨

const COUPON_CREATED_KEY = 'coupon_just_created';

// ─── Status ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  '설계중':     'bg-gray-100 text-gray-600',
  '설계완료':   'bg-blue-100 text-blue-700',
  '실행중':    'bg-green-100 text-green-700',
  '실행정지중': 'bg-yellow-100 text-yellow-700',
  '실행완료':  'bg-purple-100 text-purple-700',
  // 기존 DB 데이터 하위 호환
  '진행중':   'bg-green-100 text-green-700',
  '진행완료':  'bg-purple-100 text-purple-700',
};

/** 기존 DB 값('진행중'/'진행완료')도 새 레이블로 표시 */
function displayStatus(s: string): string {
  if (s === '진행중')  return '실행중';
  if (s === '진행완료') return '실행완료';
  return s ?? '';
}

/** 폼 초기화 시 상태 정규화 */
function normalizeStatus(s: string): string {
  return displayStatus(s || '설계중');
}

/**
 * 날짜 기준으로 캠페인의 실질적 상태를 계산한다.
 * 스케줄러 실행 전이라도 프론트에서 즉시 반영.
 */
function computeStatus(stored: string, startDate?: string | null, endDate?: string | null): string {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (endDate && today > endDate) return '실행완료';
  const inPeriod = (!startDate || today >= startDate) && (!endDate || today <= endDate);
  if (inPeriod && stored !== '실행정지중') return '실행중';
  return displayStatus(stored || '설계중');
}

// ─── Type display ─────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = { number: '숫자', date: '날짜', string: '텍스트', select: '선택' };
const TYPE_COLOR: Record<string, string> = {
  number: 'bg-blue-100 text-blue-700',
  date:   'bg-green-100 text-green-700',
  string: 'bg-orange-100 text-orange-700',
  select: 'bg-purple-100 text-purple-700',
};
const TYPE_ROW: Record<string, { row: string; dot: string }> = {
  number: { row: 'bg-blue-50 border border-blue-200',     dot: 'bg-blue-500'   },
  date:   { row: 'bg-green-50 border border-green-200',   dot: 'bg-green-500'  },
  string: { row: 'bg-orange-50 border border-orange-200', dot: 'bg-orange-400' },
  select: { row: 'bg-purple-50 border border-purple-200', dot: 'bg-purple-500' },
};

function getPlaceholder(dataType: string) {
  if (dataType === 'number') return '숫자 입력 (예: 20)';
  if (dataType === 'date')   return 'YYYY-MM-DD (예: 2024-01-01)';
  return '텍스트 입력 (예: 서울)';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function hasMatch(node: TreeNode, q: string): boolean {
  if (!q) return true;
  if (node.label.includes(q)) return true;
  return node.children?.some(c => hasMatch(c, q)) ?? false;
}

function parseFilterConditions(raw: Campaign['filterConditions']): CampaignFilterCondition[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stringifyFilterConditions(conditions: CampaignFilterCondition[]): string {
  return JSON.stringify(conditions ?? []);
}

// ─── Match helpers ────────────────────────────────────────────────────────────

function matchNum(actual: number, op: string, val: number): boolean {
  if (op === '>')  return actual >  val;
  if (op === '>=') return actual >= val;
  if (op === '<')  return actual <  val;
  if (op === '<=') return actual <= val;
  if (op === '=')  return actual === val;
  if (op === '!=') return actual !== val;
  return true;
}

function matchStr(actual: string, op: string, value: string): boolean {
  if (op === '=')    return actual === value;
  if (op === '!=')   return actual !== value;
  if (op === 'LIKE') return actual.includes(value);
  if (op === '>=')   return actual >= value;
  if (op === '>')    return actual >  value;
  if (op === '<=')   return actual <= value;
  if (op === '<')    return actual <  value;
  return true;
}

const FEEDBACK_COUNT_FIELDS = new Set([
  'feedbackCount', 'hotFeedbackCount', 'coldFeedbackCount', 'perfectFeedbackCount',
]);

const DATE_RANGE_FIELDS = new Set([
  'purchaseCount', 'totalPurchaseAmount', 'cartCount', 'wishlistCount',
  'feedbackCount', 'coldFeedbackCount', 'hotFeedbackCount', 'perfectFeedbackCount',
]);

function matchCondition(cs: CustomerStat, cond: CampaignFilterCondition, sinceDate?: string): boolean {
  if (!cond.value) return true;

  // 캠페인 시작일 이후 필터 — 피드백 집계 필드에만 적용 (handleIssueCoupons 경로용)
  if (cond.dateRange === 'campaign' && sinceDate && FEEDBACK_COUNT_FIELDS.has(cond.fieldId)) {
    const rawFbs: any[] = cs._feedbacks ?? [];
    const filtered = rawFbs.filter((f: any) => {
      const d: string = f.feedbackDate ?? (f.createdAt ?? '').slice(0, 10);
      return d >= sinceDate;
    });
    let count: number;
    switch (cond.fieldId) {
      case 'hotFeedbackCount':     count = filtered.filter((f: any) => f.feedback === 'HOT').length;     break;
      case 'coldFeedbackCount':    count = filtered.filter((f: any) => f.feedback === 'COLD').length;    break;
      case 'perfectFeedbackCount': count = filtered.filter((f: any) => f.feedback === 'PERFECT').length; break;
      default:                     count = filtered.length;
    }
    return matchNum(count, cond.operator, Number(cond.value));
  }

  const actualValue = cs[cond.fieldId];
  if (actualValue === null || actualValue === undefined) return false;
  if (typeof actualValue === 'number') {
    // select 연산자(IN, =, !=)도 숫자 필드에서 동작하도록
    if (cond.operator === 'IN') {
      const vals = cond.value.split(',').filter(Boolean).map(v => Number(v.trim()));
      return vals.includes(actualValue);
    }
    if (cond.operator === '=' || cond.operator === '!=') {
      const eq = actualValue === Number(cond.value);
      return cond.operator === '=' ? eq : !eq;
    }
    return matchNum(actualValue, cond.operator, Number(cond.value));
  }
  if (typeof actualValue === 'string')  return matchStr(actualValue, cond.operator, cond.value);
  if (typeof actualValue === 'boolean') return String(actualValue) === cond.value;
  if (Array.isArray(actualValue)) {
    const vals = cond.value.split(',').filter(Boolean);
    if (cond.operator === 'IN') return vals.some(v => (actualValue as string[]).includes(v));
    if (cond.operator === '=')  return (actualValue as string[]).includes(cond.value);
    if (cond.operator === '!=') return !(actualValue as string[]).includes(cond.value);
  }
  return true;
}

// ─── Category Combobox ────────────────────────────────────────────────────────

const CATEGORY_HISTORY_KEY = 'wf_campaign_categories';

function readCategoryHistory(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORY_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToCategoryHistory(val: string) {
  if (!val.trim()) return;
  const history = readCategoryHistory();
  const next = [val, ...history.filter(v => v !== val)].slice(0, 50);
  localStorage.setItem(CATEGORY_HISTORY_KEY, JSON.stringify(next));
}

function CategoryCombobox({
  value,
  onChange,
  extraSuggestions = [],
}: {
  value: string;
  onChange: (v: string) => void;
  extraSuggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>(() => readCategoryHistory());

  const allSuggestions = useMemo(() => {
    const seen = new Set<string>();
    return [...history, ...extraSuggestions].filter(s => {
      if (!s || seen.has(s)) return false;
      seen.add(s);
      return true;
    });
  }, [history, extraSuggestions]);

  const filtered = useMemo(() => {
    if (!value) return allSuggestions.slice(0, 10);
    return allSuggestions.filter(s => s.includes(value)).slice(0, 10);
  }, [allSuggestions, value]);

  const handleSelect = (val: string) => {
    onChange(val);
    saveToCategoryHistory(val);
    setHistory(readCategoryHistory());
    setOpen(false);
  };

  const handleChange = (val: string) => {
    onChange(val);
    setOpen(true);
  };

  return (
    <div className="relative w-52">
      <input
        type="text"
        value={value}
        placeholder="분류 입력 (예: 조기정착)"
        onChange={e => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={e => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter' && value.trim()) {
            saveToCategoryHistory(value);
            setHistory(readCategoryHistory());
            setOpen(false);
          }
        }}
        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tree node component ──────────────────────────────────────────────────────

function TreeItem({
  node, expanded, onToggle, onAdd, query, fieldNumbers, usedFieldIds,
}: {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (node: TreeNode) => void;
  query: string;
  fieldNumbers: Map<string, number>;
  usedFieldIds: Set<string>;
}) {
  if (!hasMatch(node, query)) return null;

  if (node.type === 'field') {
    if (usedFieldIds.has(node.id)) return null;
    const typeColor: Record<string, string> = { number: 'bg-blue-500', string: 'bg-orange-400', date: 'bg-green-500', select: 'bg-purple-500' };
    const dt  = node.dataType ?? 'string';
    const num = fieldNumbers.get(node.id);
    return (
      <div
        className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 cursor-pointer hover:bg-blue-50 rounded text-xs text-gray-700 group"
        onClick={() => onAdd(node)}
      >
        <span className={`shrink-0 w-4 h-4 rounded-sm ${typeColor[dt]} text-white flex items-center justify-center text-[8px] font-bold`}>
          {num ?? '·'}
        </span>
        <span className="flex-1 truncate">{node.label}</span>
        <span className="opacity-0 group-hover:opacity-100 text-blue-400 text-[10px]">+ 추가</span>
      </div>
    );
  }

  const open = query ? true : expanded.has(node.id);
  return (
    <div>
      <div
        className="flex items-center gap-1 px-1 py-0.5 cursor-pointer hover:bg-gray-100 rounded text-xs font-medium text-gray-800 select-none"
        onClick={() => onToggle(node.id)}
      >
        {open ? <ChevronDown size={11} className="shrink-0 text-gray-400" /> : <ChevronRight size={11} className="shrink-0 text-gray-400" />}
        <span className="truncate">{node.label}</span>
      </div>
      {open && node.children && (
        <div className="ml-3 border-l border-gray-100 pl-1">
          {node.children.map(c => (
            <TreeItem key={c.id} node={c} expanded={expanded} onToggle={onToggle} onAdd={onAdd} query={query} fieldNumbers={fieldNumbers} usedFieldIds={usedFieldIds} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Multi-select combobox ────────────────────────────────────────────────────

function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (value: string, checked: boolean) => {
    onChange(checked ? [...selected, value] : selected.filter(s => s !== value));
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-[140px]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-gray-300 rounded px-2 py-0.5 text-xs bg-white text-left flex items-center gap-1 flex-wrap min-h-[26px] hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">-- 선택 --</span>
        ) : (
          selected.map(v => {
            const label = options.find(o => o.value === v)?.label ?? v;
            return (
              <span key={v} className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-[10px] font-medium">
                {label}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); toggle(v, false); }}
                  className="hover:text-blue-900 leading-none"
                >×</button>
              </span>
            );
          })
        )}
        <span className="ml-auto text-gray-400 shrink-0">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-full overflow-hidden">
          {options.map(o => (
            <label
              key={o.value}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-xs text-gray-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={e => toggle(o.value, e.target.checked)}
                className="accent-blue-500"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Draft persistence key ────────────────────────────────────────────────────

const DRAFT_KEY = 'campaign_form_draft';

// ─── Navigate-to-codes button ─────────────────────────────────────────────────

function NavigateToCodesButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1 py-2 text-[11px] text-blue-500 hover:bg-blue-50 transition-colors"
    >
      <Plus size={11} /> 새 필드 추가 및 수정
    </button>
  );
}

// ─── Filter builder ───────────────────────────────────────────────────────────

function FilterBuilder({
  conditions, onChange, filterSubject, onSubjectChange, onNavigateToCodes, customerStats, onFinalQuery,
  campaignStartDate, rawPurchases, rawFeedbacks,
}: {
  conditions: CampaignFilterCondition[];
  onChange: (c: CampaignFilterCondition[]) => void;
  filterSubject: string;
  onSubjectChange: (s: string) => void;
  onNavigateToCodes: () => void;
  customerStats: CustomerStat[];
  onFinalQuery?: (customerIds: number[]) => void;
  campaignStartDate?: string;
  rawPurchases?: any[];
  rawFeedbacks?: any[];
}) {
  const { fields, filterSubjects: allSubjects } = useCodeContext();

  const dynamicTree = useMemo<TreeNode[]>(
    () => fields.filter(f => f.active).map(fieldToTreeNode),
    [fields]
  );

  /** 관리 페이지에서 설정한 주제 목록 기반으로 탭 생성 */
  const filterSubjectTabs = useMemo(
    () => ['전체', ...allSubjects],
    [allSubjects]
  );

  /** 선택된 주제로 트리 필터링 */
  const filteredTree = useMemo(() => {
    if (!filterSubject || filterSubject === '전체') return dynamicTree;
    const matchingIds = new Set(
      fields.filter(f => f.active && f.filterSubject === filterSubject).map(f => f.id)
    );
    return dynamicTree.filter(n => matchingIds.has(n.id));
  }, [dynamicTree, fields, filterSubject]);

  const fieldOptions = useMemo(() => {
    const result: Record<string, { label: string; value: string }[]> = {};
    for (const n of dynamicTree) {
      if (n.type === 'field' && n.dataType === 'select' && n.selectOptions) {
        result[n.id] = n.selectOptions;
      }
    }
    return result;
  }, [dynamicTree]);

  const fieldNumbers = useMemo(
    () => new Map(fields.filter(f => f.active).map(f => [f.id, f.fieldNo])),
    [fields]
  );

  const usedFieldIds = useMemo(() => new Set(conditions.map(c => c.fieldId)), [conditions]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['customer', 'weatherfit', 'feedback', 'purchase']));
  const [treeQuery, setTreeQuery] = useState('');
  const [queryResult, setQueryResult] = useState<{ total: number; customers: CustomerStat[] } | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addCondition = (node: TreeNode) => {
    if (node.type !== 'field') return;
    const isSelect = node.dataType === 'select';
    const ops = OPERATORS[isSelect ? 'select' : (node.dataType ?? 'string')];
    const fieldNo = fields.find(f => f.id === node.id)?.fieldNo;
    onChange([
      ...conditions,
      {
        id:         uid(),
        fieldNo,
        fieldId:    node.id,
        fieldLabel: node.label,
        dataType:   isSelect ? 'string' : (node.dataType ?? 'string'),
        operator:   ops[0].value,
        value:      '',
        dateRange:  'all',
      },
    ]);
  };

  const updateCondition = (id: string, patch: Partial<CampaignFilterCondition>) => {
    onChange(conditions.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const runQuery = () => {
    const t0 = performance.now();

    const hasCampaignRange = conditions.some(c => c.dateRange === 'campaign');

    const effectiveStats = hasCampaignRange && campaignStartDate && rawPurchases && rawFeedbacks
      ? customerStats.map(cs => {
          const startD = campaignStartDate;
          const myPurchases = rawPurchases.filter(
            p => String(p.customerId) === String(cs.id)
               && p.status === 'PURCHASED'
               && (p.purchasedAt ?? '').slice(0, 10) >= startD
          );
          const myFeedbacks = rawFeedbacks.filter(
            f => String(f.customerId) === String(cs.id)
               && (f.createdAt ?? f.feedbackDate ?? '').slice(0, 10) >= startD
          );
          return {
            ...cs,
            purchaseCount:        myPurchases.length,
            totalPurchaseAmount:  myPurchases.reduce((s: number, p: any) => s + (p.price ?? 0), 0),
            cartCount:            rawPurchases.filter(p => String(p.customerId) === String(cs.id) && p.status === 'CART' && (p.purchasedAt ?? '').slice(0, 10) >= startD).length,
            wishlistCount:        rawPurchases.filter(p => String(p.customerId) === String(cs.id) && p.status === 'WISHLIST' && (p.purchasedAt ?? '').slice(0, 10) >= startD).length,
            feedbackCount:        myFeedbacks.length,
            coldFeedbackCount:    myFeedbacks.filter((f: any) => f.feedback === 'COLD').length,
            hotFeedbackCount:     myFeedbacks.filter((f: any) => f.feedback === 'HOT').length,
            perfectFeedbackCount: myFeedbacks.filter((f: any) => f.feedback === 'PERFECT').length,
          };
        })
      : customerStats;

    const matched = effectiveStats.filter(cs =>
      conditions.every(cond => matchCondition(cs, cond))
    );
    setQueryResult({ total: matched.length, customers: matched });
    setElapsed(Math.round(performance.now() - t0));
    onFinalQuery?.(matched.map(cs => Number(cs.id)));
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden text-sm">
      {/* 필터 주제 탭 (필드 관리에서 설정한 주제 기반 동적 생성) */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <span className="text-xs text-gray-500 shrink-0 mr-1">필터 주제</span>
        {filterSubjectTabs.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onSubjectChange(s)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              filterSubject === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onChange([])}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 text-gray-500"
        >
          조건 초기화
        </button>
      </div>

      {/* body */}
      <div className="flex" style={{ minHeight: 300 }}>
        {/* left: filtered tree */}
        <div className="w-52 shrink-0 border-r border-gray-200 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-1 border border-gray-200 rounded px-2 py-1 bg-white">
              <Search size={11} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 text-xs outline-none placeholder:text-gray-300"
                placeholder="필드 검색"
                value={treeQuery}
                onChange={e => setTreeQuery(e.target.value)}
              />
              {treeQuery && (
                <button type="button" onClick={() => setTreeQuery('')}><X size={11} className="text-gray-400" /></button>
              )}
            </div>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><span className="w-3.5 h-3.5 rounded-sm bg-blue-500 text-white flex items-center justify-center text-[7px] font-bold inline-flex">1</span> 숫자</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><span className="w-3.5 h-3.5 rounded-sm bg-purple-500 text-white flex items-center justify-center text-[7px] font-bold inline-flex">2</span> 선택</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><span className="w-3.5 h-3.5 rounded-sm bg-green-500 text-white flex items-center justify-center text-[7px] font-bold inline-flex">3</span> 날짜</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><span className="w-3.5 h-3.5 rounded-sm bg-orange-400 text-white flex items-center justify-center text-[7px] font-bold inline-flex">4</span> 텍스트</span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5">
            {filteredTree.map(node => (
              <TreeItem key={node.id} node={node} expanded={expanded} onToggle={toggleExpanded} onAdd={addCondition} query={treeQuery} fieldNumbers={fieldNumbers} usedFieldIds={usedFieldIds} />
            ))}
          </div>
          <div className="border-t border-gray-200">
            <NavigateToCodesButton onClick={onNavigateToCodes} />
          </div>
        </div>

        {/* right: conditions + result */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
          <div className="border border-gray-200 rounded">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
              <ChevronDown size={12} /> AND 조건 그룹
              <span className="ml-auto text-gray-400 font-normal">왼쪽 필드를 클릭해서 추가</span>
            </div>
            <div className="p-2 space-y-1.5 min-h-[80px]">
              {conditions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  왼쪽 트리에서 항목을 클릭하면 조건이 추가됩니다
                </p>
              ) : (
                conditions.map(cond => {
                  const opts     = fieldOptions[cond.fieldId];
                  const isSelect = !!opts;
                  const ops      = OPERATORS[isSelect ? 'select' : (cond.dataType ?? 'string')] ?? OPERATORS.string;
                  const fieldNode = findFieldNode(dynamicTree, cond.fieldId);
                  const dt        = fieldNode?.dataType ?? (isSelect ? 'select' : (cond.dataType ?? 'string'));

                  const isDateRangeField = DATE_RANGE_FIELDS.has(cond.fieldId);

                  const rowStyle = TYPE_ROW[dt] ?? TYPE_ROW.string;
                  return (
                    <div key={cond.id} className={`flex items-center gap-2 rounded px-2 py-1.5 flex-wrap ${rowStyle.row}`}>
                      <span className={`shrink-0 w-3.5 h-3.5 rounded-sm text-white flex items-center justify-center text-[8px] ${rowStyle.dot}`}>■</span>
                      <span className="text-xs text-gray-800 w-32 truncate shrink-0 font-medium">{cond.fieldLabel}</span>

                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${TYPE_COLOR[dt] ?? TYPE_COLOR.string}`}>
                        {TYPE_LABEL[dt] ?? '텍스트'}
                      </span>

                      <select
                        value={cond.operator}
                        onChange={e => updateCondition(cond.id, { operator: e.target.value, value: '' })}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none min-w-[96px]"
                      >
                        {ops.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>

                      {isSelect && cond.operator !== 'IN' ? (
                        <select
                          value={cond.value}
                          onChange={e => updateCondition(cond.id, { value: e.target.value })}
                          className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none flex-1 min-w-[100px]"
                        >
                          <option value="">-- 선택 --</option>
                          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : isSelect && cond.operator === 'IN' ? (
                        <MultiSelect
                          options={opts}
                          selected={cond.value.split(',').filter(Boolean)}
                          onChange={vals => updateCondition(cond.id, { value: vals.join(',') })}
                        />
                      ) : (
                        <input
                          type={dt === 'number' ? 'number' : dt === 'date' ? 'date' : 'text'}
                          value={cond.value}
                          onChange={e => updateCondition(cond.id, { value: e.target.value })}
                          placeholder={getPlaceholder(dt)}
                          className="border border-gray-300 rounded px-2 py-0.5 text-xs flex-1 min-w-[80px] focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      )}

                      {isDateRangeField && (
                        <select
                          value={cond.dateRange ?? 'all'}
                          onChange={e => updateCondition(cond.id, { dateRange: e.target.value as 'all' | 'campaign' })}
                          className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none"
                        >
                          <option value="all">전체 기간</option>
                          <option value="campaign">캠페인 시작일 이후</option>
                        </select>
                      )}

                      <button type="button" onClick={() => deleteCondition(cond.id)} className="shrink-0 text-red-400 hover:text-red-600 ml-auto">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 조회 결과 — 큼직하게 표시 */}
          {queryResult !== null && (
            <div className={`rounded-lg border overflow-hidden ${queryResult.total === 0 ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50'}`}>
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${queryResult.total === 0 ? 'border-gray-200 bg-gray-100' : 'border-green-200 bg-green-100'}`}>
                <Users size={16} className={queryResult.total === 0 ? 'text-gray-400' : 'text-green-600'} />
                <span className={`text-sm font-bold ${queryResult.total === 0 ? 'text-gray-500' : 'text-green-800'}`}>
                  매칭 고객: {queryResult.total.toLocaleString()}명
                </span>
                {elapsed !== null && <span className="text-xs text-gray-400 ml-1">({elapsed}ms)</span>}
              </div>
              {queryResult.customers.length > 0 && (
                <div className="p-3 max-h-52 overflow-y-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {queryResult.customers.slice(0, 30).map((cs, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-green-200 rounded-full text-xs text-green-800 font-medium shadow-sm">
                        {cs.name}
                        {cs.membershipLevel && (
                          <span className="text-[10px] text-green-500">{cs.membershipLevel}</span>
                        )}
                      </span>
                    ))}
                    {queryResult.total > 30 && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-green-200 rounded-full text-xs text-green-700 font-bold">
                        +{(queryResult.total - 30).toLocaleString()}명 더
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* bottom bar */}
      <div className="flex items-center justify-end px-3 py-2 bg-gray-50 border-t border-gray-200">
        <button type="button" onClick={runQuery} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium">
          <Users size={14} /> 최종 조회
        </button>
      </div>
    </div>
  );
}

// ─── Campaign form ────────────────────────────────────────────────────────────

type CampaignFormData = Omit<Campaign, 'id' | 'department' | 'createdBy' | 'createdAt' | 'filterConditions'> & {
  filterConditions: CampaignFilterCondition[];
};

function makeEmptyForm(): CampaignFormData {
  return {
    category1: '',
    category2: '',
    campaignName: '',
    description: '',
    status: '설계중',
    startDate: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 9 * 60 * 60 * 1000 + 14 * 86400000).toISOString().slice(0, 10),
    graceDays: 0,
    customerType: '개인',
    visibility: '비공개',
    tags: '',
    filterSubject: '전체',
    filterConditions: [],
    actions: [],
    emailAction: undefined,
  };
}

function CampaignForm({
  initial,
  coupons,
  customerStats,
  categoryOptions,
  rawPurchases,
  rawFeedbacks,
  onSave,
  onCancel,
}: {
  initial: Campaign | null;
  coupons: any[];
  customerStats: CustomerStat[];
  categoryOptions: string[];
  rawPurchases: any[];
  rawFeedbacks: any[];
  onSave: (c: Campaign) => Promise<void>;
  onCancel: () => void;
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState<CampaignFormData>(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const { form: saved } = JSON.parse(raw);
        sessionStorage.removeItem(DRAFT_KEY);
        return saved;
      } catch { /* fall through */ }
    }
    return initial
      ? {
          category1: initial.category1 ?? '',
          category2: initial.category2 ?? '',
          campaignName: initial.campaignName ?? '',
          description: initial.description ?? '',
          status: normalizeStatus(initial.status ?? '설계중'),
          startDate: initial.startDate ?? new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10),
          endDate: initial.endDate ?? new Date(Date.now() + 9 * 60 * 60 * 1000 + 14 * 86400000).toISOString().slice(0, 10),
          graceDays: initial.graceDays ?? 0,
          customerType: initial.customerType ?? '개인',
          visibility: initial.visibility ?? '비공개',
          tags: initial.tags ?? '',
          filterSubject: initial.filterSubject ?? '전체',
          filterConditions: parseFilterConditions(initial.filterConditions),
          actions: (() => {
            const base = initial.actions ?? [];
            const hasPopup = base.some(a => a.actionType === 'POPUP');
            if (!hasPopup && initial.popupMessage) {
              return [...base, { actionType: 'POPUP' as const, popupMessage: initial.popupMessage }];
            }
            if (hasPopup && initial.popupMessage) {
              return base.map(a =>
                a.actionType === 'POPUP' && !a.popupMessage
                  ? { ...a, popupMessage: initial.popupMessage! }
                  : a
              );
            }
            return base;
          })(),
          emailAction: initial.emailSubject != null
            ? { subject: initial.emailSubject, body: initial.emailBody ?? '' }
            : undefined,
        }
      : makeEmptyForm();
  });

  const dialog = useDialog();

  const set = <K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // 쿠폰 페이지에서 새로 만든 쿠폰 ID → COUPON 액션으로 자동 추가
  useEffect(() => {
    const justCreated = sessionStorage.getItem(COUPON_CREATED_KEY);
    if (justCreated) {
      sessionStorage.removeItem(COUPON_CREATED_KEY);
      const newId = Number(justCreated);
      if (newId) {
        setForm(prev => {
          const alreadyHasCoupon = prev.actions.some(a => a.actionType === 'COUPON');
          if (alreadyHasCoupon) return prev;
          return { ...prev, actions: [...prev.actions, { actionType: 'COUPON', couponId: newId }] };
        });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoToCodes = () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ editing: initial, form }));
    navigate('/codes');
  };

  /** 새 쿠폰 만들기 → 쿠폰 페이지로 이동 (드래프트 저장) */
  const handleAddNewCoupon = () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ editing: initial, form }));
    navigate('/coupon?addNew=true');
  };

  // ─── 액션 핸들러 ───────────────────────────────────────────────────────────

  const handleAddAction = (type: 'COUPON' | 'POPUP' | 'SMS') => {
    // POPUP/SMS는 타입별 1개, COUPON은 여러 개 허용
    if (type !== 'COUPON' && form.actions.some(a => a.actionType === type)) return;
    set('actions', [...form.actions, { actionType: type }]);
  };

  const handleRemoveAction = (type: 'COUPON' | 'POPUP' | 'SMS') => {
    set('actions', form.actions.filter(a => a.actionType !== type));
  };

  const handleRemoveActionAt = (index: number) => {
    set('actions', form.actions.filter((_, i) => i !== index));
  };

  const handleUpdateAction = (type: 'COUPON' | 'POPUP' | 'SMS', patch: Partial<CampaignAction>) => {
    set('actions', form.actions.map(a => a.actionType === type ? { ...a, ...patch } : a));
  };

  const handleUpdateActionAt = (index: number, patch: Partial<CampaignAction>) => {
    set('actions', form.actions.map((a, i) => i === index ? { ...a, ...patch } : a));
  };

  const handleFinalQuery = (_customerIds: number[]) => {
    if (!initial?.id) return;
    updateCampaign(initial.id, {
      ...initial,
      actions: form.actions,
      filterSubject: form.filterSubject,
      filterConditions: stringifyFilterConditions(form.filterConditions ?? []),
    }).catch(err => console.error('최종 조회 저장 실패:', err));
  };

  const handleIssueCoupons = async () => {
    const couponAction = form.actions.find(a => a.actionType === 'COUPON');
    if (!couponAction?.couponId) {
      await dialog.alert('COUPON 액션에 쿠폰을 선택한 후 발급하세요.', '쿠폰 발급 오류');
      return;
    }
    if (!initial?.id) {
      await dialog.alert('캠페인을 먼저 저장한 후 발급하세요.', '쿠폰 발급 오류');
      return;
    }

    const conditions = form.filterConditions ?? [];
    const hasCampaignRange = conditions.some(c => c.dateRange === 'campaign');
    const effectiveStats = hasCampaignRange && form.startDate
      ? customerStats.map(cs => {
          const startD = form.startDate;
          const myPurchases = rawPurchases.filter(
            p => String(p.customerId) === String(cs.id)
               && p.status === 'PURCHASED'
               && (p.purchasedAt ?? '').slice(0, 10) >= startD
          );
          const myFeedbacks = rawFeedbacks.filter(
            f => String(f.customerId) === String(cs.id)
               && (f.createdAt ?? f.feedbackDate ?? '').slice(0, 10) >= startD
          );
          return {
            ...cs,
            purchaseCount:        myPurchases.length,
            totalPurchaseAmount:  myPurchases.reduce((s: number, p: any) => s + (p.price ?? 0), 0),
            cartCount:            rawPurchases.filter(p => String(p.customerId) === String(cs.id) && p.status === 'CART' && (p.purchasedAt ?? '').slice(0, 10) >= startD).length,
            wishlistCount:        rawPurchases.filter(p => String(p.customerId) === String(cs.id) && p.status === 'WISHLIST' && (p.purchasedAt ?? '').slice(0, 10) >= startD).length,
            feedbackCount:        myFeedbacks.length,
            coldFeedbackCount:    myFeedbacks.filter((f: any) => f.feedback === 'COLD').length,
            hotFeedbackCount:     myFeedbacks.filter((f: any) => f.feedback === 'HOT').length,
            perfectFeedbackCount: myFeedbacks.filter((f: any) => f.feedback === 'PERFECT').length,
          };
        })
      : customerStats;

    const matched = effectiveStats.filter(cs =>
      conditions.every(cond => matchCondition(cs, cond))
    );
    if (matched.length === 0) {
      await dialog.alert('필터 조건에 해당하는 고객이 없습니다.', '쿠폰 발급');
      return;
    }

    const ok = await dialog.confirm(
      `필터 조건에 매칭된 ${matched.length}명에게 쿠폰을 발급하시겠습니까?`,
      { title: '쿠폰 발급 실행', confirmLabel: '발급' }
    );
    if (!ok) return;

    try {
      const customerIds = matched.map(cs => cs.id);
      const result = await issueCampaignCoupons(initial.id, { customerIds } as any);
      await dialog.alert(
        `발급 완료: ${result.issuedCount}명\n중복 제외: ${result.skippedCount}명`,
        '쿠폰 발급 완료'
      );
    } catch (e: any) {
      const msg = e?.message ?? '쿠폰 발급 중 오류가 발생했습니다.';
      await dialog.alert(msg, '오류');
    }
  };

  const handleSave = async () => {
    if (!form.campaignName.trim()) {
      await dialog.alert('캠페인 명을 입력하세요', '입력 오류');
      return;
    }
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      await dialog.alert('종료 일자는 시작 일자보다 빠를 수 없습니다.', '입력 오류');
      return;
    }

    // 분류 입력값 저장 이력에 추가
    if (form.category1.trim()) saveToCategoryHistory(form.category1.trim());

    // 날짜 기준 실질 상태 계산
    const _today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const _afterEnd  = !!(form.endDate && _today > form.endDate);
    const _inPeriod  = (!form.startDate || _today >= form.startDate) && (!form.endDate || _today <= form.endDate);
    let effectiveStatus = form.status;
    if (_afterEnd) effectiveStatus = '실행완료';
    else if (_inPeriod && form.status !== '실행정지중') effectiveStatus = '실행중';

    const popupAction = form.actions.find(a => a.actionType === 'POPUP');

    const payload: Campaign = {
      ...form,
      id: initial?.id ?? 0,
      department: initial?.department ?? '마케팅팀',
      createdBy:  initial?.createdBy  ?? 'admin',
      createdAt:  initial?.createdAt,
      filterConditions: stringifyFilterConditions(form.filterConditions ?? []),
      status: effectiveStatus,
      emailSubject: form.emailAction?.subject ?? null,
      emailBody:    form.emailAction?.body    ?? null,
      popupMessage: popupAction?.popupMessage ?? null,
    };

    try {
      await onSave(payload);
      sessionStorage.removeItem(DRAFT_KEY);
      await dialog.alert('캠페인이 저장되었습니다.', '저장 완료');
    } catch (e) {
      console.error('캠페인 저장 오류:', e);
      await dialog.alert('캠페인 저장 중 오류가 발생했습니다. 콘솔과 서버 로그를 확인하세요.', '저장 오류');
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(DRAFT_KEY);
    onCancel();
  };

  // 기간 판단 (상태 UI 분기용)
  const _todayStr      = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const periodBeforeStart = !!(form.startDate && _todayStr < form.startDate);
  const periodAfterEnd    = !!(form.endDate && _todayStr > form.endDate);
  const periodInProgress  = !periodBeforeStart && !periodAfterEnd;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {initial ? '캠페인 수정' : '새 캠페인 등록'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
          <X size={16} /> 닫기
        </button>
      </div>

      {/* 기초 정보 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> 캠페인 기초 정보
        </h3>

        {/* 분류 — 단일 입력 with 자동완성 */}
        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">캠페인 분류</label>
          <CategoryCombobox
            value={form.category1}
            onChange={v => set('category1', v)}
            extraSuggestions={categoryOptions}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">캠페인 명</label>
          <input type="text" value={form.campaignName} onChange={e => set('campaignName', e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>

        <div className="flex gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0 pt-1.5">캠페인 설명</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={3}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">상태</label>
          {periodAfterEnd ? (
            // 종료 후 → 읽기 전용
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS['실행완료']}`}>실행완료</span>
          ) : periodInProgress ? (
            // 수행 기간 중 → 실행중 / 일시정지 토글
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[form.status === '실행정지중' ? '실행정지중' : '실행중']}`}>
                {form.status === '실행정지중' ? '실행정지중' : '실행중'}
              </span>
              {form.status === '실행정지중' ? (
                <button type="button" onClick={() => set('status', '실행중')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">▶ 재개</button>
              ) : (
                <button type="button" onClick={() => set('status', '실행정지중')}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">⏸ 일시정지</button>
              )}
            </div>
          ) : (
            // 시작 전 → 설계중 / 설계완료 선택 가능
            <div className="flex gap-4">
              {(['설계중', '설계완료'] as const).map(v => (
                <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input type="radio" name="status" value={v}
                    checked={form.status === v || (v === '설계중' && !['설계완료'].includes(form.status))}
                    onChange={() => set('status', v)} className="accent-blue-600" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v]}`}>{v}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="w-28 text-sm text-gray-600 shrink-0">수행 일자</label>
          <input
            type="date"
            value={form.startDate}
            min={new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)}
            onChange={e => {
              const newStart = e.target.value;
              const oldStart = form.startDate;
              const oldEnd   = form.endDate;
              if (oldStart && oldEnd && newStart) {
                const gapDays = Math.round((new Date(oldEnd).getTime() - new Date(oldStart).getTime()) / 86400000);
                if (gapDays >= 0) {
                  const newEnd = new Date(new Date(newStart).getTime() + gapDays * 86400000)
                    .toISOString().slice(0, 10);
                  setForm(prev => ({ ...prev, startDate: newStart, endDate: newEnd }));
                  return;
                }
              }
              set('startDate', newStart);
            }}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={e => {
              if (form.startDate && e.target.value < form.startDate) return;
              set('endDate', e.target.value);
            }}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-500">종료 후</span>
          <input type="number" value={form.graceDays} onChange={e => set('graceDays', Number(e.target.value))}
            className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          <span className="text-sm text-gray-500">일 후까지 실적 인정</span>
        </div>
      </div>

      {/* 고객 필터 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> 고객 필터 설정
          <span className="text-xs font-normal text-gray-400 ml-1">실제 고객 데이터 기반 조건 설정 · AND 결합</span>
        </h3>
        <FilterBuilder
          conditions={form.filterConditions ?? []}
          onChange={v => set('filterConditions', v)}
          filterSubject={form.filterSubject}
          onSubjectChange={v => set('filterSubject', v)}
          onNavigateToCodes={handleGoToCodes}
          customerStats={customerStats}
          onFinalQuery={handleFinalQuery}
          campaignStartDate={form.startDate}
          rawPurchases={rawPurchases}
          rawFeedbacks={rawFeedbacks}
        />
      </div>

      {/* 캠페인 액션 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" /> 캠페인 액션 설정
          <span className="text-xs font-normal text-gray-400 ml-1">캠페인 실행 시 수행할 액션 · 쿠폰 복수 가능</span>
        </h3>

        {/* 등록된 액션 목록 */}
        {form.actions.length > 0 && (
          <div className="space-y-3">
            {form.actions.map((action, index) => {
              if (action.actionType === 'COUPON') {
                const cp = coupons.find(c => c.id === action.couponId);
                return (
                  <div key={action.id ?? `coupon-${index}`} className="rounded-xl border border-purple-200 bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                        <Tag size={11} /> COUPON
                      </span>
                      <span className="text-xs text-gray-500">쿠폰 발급</span>
                      <button type="button" onClick={() => handleRemoveActionAt(index)} className="ml-auto text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={action.couponId ?? ''}
                        onChange={e => handleUpdateActionAt(index, { couponId: e.target.value ? Number(e.target.value) : null })}
                        className="border border-purple-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 flex-1 min-w-[200px]"
                      >
                        <option value="">쿠폰 선택...</option>
                        {coupons.filter(c => c.status !== 'EXPIRED').map(c => (
                          <option key={c.id} value={c.id}>
                            [{c.id}] {c.couponName} ({c.type === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue?.toLocaleString()}원`} 할인)
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddNewCoupon}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-300 text-purple-700 rounded text-sm hover:bg-purple-50 whitespace-nowrap"
                      >
                        <Plus size={14} /> 새 쿠폰 만들기
                      </button>
                    </div>
                    {cp && (
                      <p className="text-xs text-purple-600 pl-1">
                        선택됨: {cp.couponName} · {cp.type === 'PERCENT' ? `${cp.discountValue}% 할인` : `${cp.discountValue?.toLocaleString()}원 할인`} · 유효 {cp.validDays}일
                      </p>
                    )}
                  </div>
                );
              }
              if (action.actionType === 'POPUP') {
                return (
                  <div key="POPUP" className="rounded-xl border border-blue-200 bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        <MessageSquare size={11} /> POPUP
                      </span>
                      <span className="text-xs text-gray-500">팝업 노출</span>
                      <button type="button" onClick={() => handleRemoveActionAt(index)} className="ml-auto text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={action.popupMessage ?? ''}
                      onChange={e => handleUpdateActionAt(index, { popupMessage: e.target.value })}
                      placeholder="팝업에 표시할 메시지를 입력하세요..."
                      className="w-full border border-blue-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* 이메일 액션 카드 */}
        {form.emailAction !== undefined && (
          <div className="rounded-xl border border-orange-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                ✉️ EMAIL
              </span>
              <span className="text-xs text-gray-500">이메일 발송</span>
              <button type="button" onClick={() => set('emailAction', undefined)} className="ml-auto text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">이메일 제목</label>
              <input
                type="text"
                value={form.emailAction.subject}
                onChange={e => set('emailAction', { ...form.emailAction!, subject: e.target.value })}
                placeholder="예: [WeatherFit] 오늘의 특별 혜택을 확인하세요!"
                className="w-full border border-orange-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">이메일 본문</label>
              <textarea
                value={form.emailAction.body}
                onChange={e => set('emailAction', { ...form.emailAction!, body: e.target.value })}
                placeholder="고객님께 전달할 광고 메시지를 입력하세요..."
                rows={4}
                className="w-full border border-orange-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* 액션 추가 버튼 */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="w-28 text-sm text-gray-600 shrink-0">액션 추가</label>
          {/* 쿠폰: 항상 추가 가능 */}
          <button
            type="button"
            onClick={() => handleAddAction('COUPON')}
            className="flex items-center gap-1 px-3 py-1.5 border rounded text-sm transition-colors border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Plus size={13} /> 🎫 쿠폰 발급
          </button>
          {/* 팝업: 1개만 */}
          {([
            { type: 'POPUP', label: '💬 팝업 노출', color: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
          ] as const).map(({ type, label, color }) => {
            const exists = form.actions.some(a => a.actionType === type);
            return (
              <button
                key={type}
                type="button"
                disabled={exists}
                onClick={() => handleAddAction(type)}
                className={`flex items-center gap-1 px-3 py-1.5 border rounded text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
              >
                <Plus size={13} /> {label}
              </button>
            );
          })}
          <button
            type="button"
            disabled={form.emailAction !== undefined}
            onClick={() => set('emailAction', { subject: '', body: '' })}
            className={`flex items-center gap-1 px-3 py-1.5 border rounded text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              border-orange-300 text-orange-700 hover:bg-orange-50`}
          >
            <Plus size={13} /> ✉️ 이메일 발송
          </button>
        </div>

        {/* 쿠폰 수동 발급 버튼 */}
        {initial?.id && form.actions.some(a => a.actionType === 'COUPON' && a.couponId) && (
          <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
            <label className="w-28 text-sm text-gray-600 shrink-0">수동 발급</label>
            <button
              type="button"
              onClick={handleIssueCoupons}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              <Users size={14} /> 지금 수동 발급
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pb-4">
        <button onClick={handleCancel}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          취소
        </button>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          ✓ 저장하기
        </button>
      </div>
    </div>
  );
}

// ─── Campaign list ────────────────────────────────────────────────────────────

function CampaignList({
  list, coupons, onNew, onEdit, onDelete,
}: {
  list: Campaign[];
  coupons: any[];
  onNew: () => void;
  onEdit: (c: Campaign) => void;
  onDelete: (id: number) => void;
}) {
  const [checked, setChecked]           = useState<Set<number>>(new Set());
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE = 10;

  const STATUS_OPTIONS = ['전체', '설계중', '설계완료', '실행중', '실행정지중', '실행완료'];

  const couponMap = useMemo(
    () => Object.fromEntries(coupons.map(c => [String(c.id), c])),
    [coupons]
  );

  const filtered = useMemo(() => list.filter(c => {
    const matchSearch = !search || (c.campaignName ?? '').includes(search) || String(c.id).includes(search) || (c.category1 ?? '').includes(search);
    const computed = computeStatus(c.status, c.startDate, c.endDate);
    const matchStatus = statusFilter === '전체' || computed === statusFilter;
    return matchSearch && matchStatus;
  }), [list, search, statusFilter]);

  // 필터 변경 시 1페이지로 초기화
  useEffect(() => { setPage(1); setChecked(new Set()); }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const dialog = useDialog();

  const toggleAll = () => checked.size === paginated.length ? setChecked(new Set()) : setChecked(new Set(paginated.map(c => c.id)));
  const toggleOne = (id: number) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleBulkDelete = async () => {
    const ok = await dialog.confirm(`${checked.size}개 캠페인을 삭제하시겠습니까?`, {
      title: '캠페인 삭제',
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!ok) return;
    checked.forEach(id => onDelete(id));
    setChecked(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" placeholder="캠페인 명, ID 검색..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 w-56" />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {checked.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-100">
            <Trash2 size={14} /> 선택 삭제 ({checked.size})
          </button>
        )}
        <button onClick={onNew}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus size={15} /> 새 캠페인
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 w-10">No</th>
                <th className="px-3 py-2.5 text-center w-8">
                  <button onClick={toggleAll}>
                    {checked.size === paginated.length && paginated.length > 0
                      ? <CheckSquare size={14} className="text-blue-500" />
                      : <Square size={14} className="text-gray-400" />}
                  </button>
                </th>
                {([
                  ['캠페인 ID',   'text-center'],
                  ['분류',        'text-left'],
                  ['캠페인 명',   'text-left'],
                  ['상태',        'text-center'],
                  ['시작 일자',   'text-right'],
                  ['종료 일자',   'text-right'],
                  ['캠페인 액션', 'text-left'],
                  ['기안 일자',   'text-right'],
                ] as [string, string][]).map(([h, align]) => (
                  <th key={h} className={`px-3 py-2.5 ${align} text-xs font-medium text-gray-500 whitespace-nowrap`}>{h}</th>
                ))}
                <th className="px-3 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400 text-sm">캠페인이 없습니다</td></tr>
              ) : (
                paginated.map((c, i) => {
                  const category = [c.category1, c.category2].filter(Boolean).join(' / ') || '-';
                  const actions  = c.actions ?? [];
                  const computedStatus = computeStatus(c.status, c.startDate, c.endDate);

                  return (
                    <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onEdit(c)}>
                      <td className="px-3 py-3 text-center text-gray-500 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-3 py-3 text-center" onClick={e => { e.stopPropagation(); toggleOne(c.id); }}>
                        {checked.has(c.id) ? <CheckSquare size={14} className="text-blue-500 mx-auto" /> : <Square size={14} className="text-gray-400 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-mono text-gray-700 whitespace-nowrap">{c.id}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{category}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 max-w-[200px] truncate">{c.campaignName}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[computedStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                          {computedStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">{fmtDate(c.startDate)}</td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">{fmtDate(c.endDate)}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap max-w-[180px]">
                        {(() => {
                          const couponActions = actions.filter(a => a.actionType === 'COUPON');
                          const hasPopup = actions.some(a => a.actionType === 'POPUP');
                          const hasEmail = c.emailSubject != null;
                          const badges: React.ReactNode[] = [];
                          if (couponActions.length > 0) badges.push(
                            <span key="COUPON" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px]">
                              🎫 쿠폰{couponActions.length > 1 ? `(${couponActions.length})` : ''}
                            </span>
                          );
                          if (hasPopup) badges.push(
                            <span key="POPUP" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">
                              💬 팝업
                            </span>
                          );
                          if (hasEmail) badges.push(
                            <span key="EMAIL" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px]">
                              ✉️ 이메일
                            </span>
                          );
                          return badges.length > 0
                            ? <div className="flex flex-wrap gap-1">{badges}</div>
                            : <span className="text-gray-400">-</span>;
                        })()}
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                      <td className="px-3 py-3 text-center" onClick={e => { e.stopPropagation(); onDelete(c.id); }}>
                        <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>총 {filtered.length}건</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40">◀</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2)
                .map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-2.5 py-1 border rounded ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40">▶</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CampaignPage() {
  const [list, setList]           = useState<Campaign[]>([]);
  const [coupons, setCoupons]     = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts]   = useState<any[]>([]);

  useEffect(() => {
    getCampaigns().then(data => setList(Array.isArray(data) ? data : [])).catch(() => setList([]));
    getCoupons().then(data => setCoupons(Array.isArray(data) ? data : [])).catch(() => setCoupons([]));
    getCustomers().then(data => setCustomers(Array.isArray(data) ? data : [])).catch(() => setCustomers([]));
    getAllFeedbacks().then(data => setFeedbacks(Array.isArray(data) ? data : [])).catch(() => setFeedbacks([]));
    getAllPurchases().then(data => setPurchases(Array.isArray(data) ? data : [])).catch(() => setPurchases([]));
    getProducts().then(data => setProducts(Array.isArray(data) ? data : [])).catch(() => setProducts([]));
  }, []);

  /** 기존 캠페인에서 사용된 분류 목록 (자동완성 제안용) */
  const categoryOptions = useMemo(() =>
    [...new Set(list.flatMap(c => [c.category1, c.category2]).filter(Boolean) as string[])],
    [list]
  );

  const CUSTOMER_STATS = useMemo<CustomerStat[]>(() => {
    const productsMap = Object.fromEntries(products.map(p => [String(p.id), p]));

    return customers.map(c => {
      const fbs      = feedbacks.filter(f => String(f.customerId) === String(c.id));
      const allPurch = purchases.filter(p => String(p.customerId) === String(c.id));
      const purchased = allPurch.filter(p => p.status === 'PURCHASED');

      const sortedFbs = [...fbs].sort((a, b) =>
        (b.createdAt ?? b.feedbackDate ?? '').localeCompare(a.createdAt ?? a.feedbackDate ?? ''));

      const lastPurchaseDate =
        [...purchased].sort((a, b) => (b.purchasedAt ?? '').localeCompare(a.purchasedAt ?? ''))[0]
          ?.purchasedAt ?? null;

      const age = c.age != null
        ? c.age
        : c.birthDate
          ? Math.floor((Date.now() - new Date(c.birthDate).getTime()) / (365.25 * 86400000))
          : null;

      const purchasedCategories = [
        ...new Set(
          purchased
            .map((p: any) => p.category ?? productsMap[String(p.productId)]?.category)
            .filter(Boolean) as string[]
        ),
      ];

      const dormantDays = c.lastLoginDate
        ? Math.floor((Date.now() - new Date(c.lastLoginDate).getTime()) / 86400000)
        : null;

      return {
        ...c,
        age,
        purchasedCategories,
        dormantDays,
        _feedbacks:           fbs,
        feedbackCount:        fbs.length,
        coldFeedbackCount:    fbs.filter((f: any) => f.feedback === 'COLD').length,
        hotFeedbackCount:     fbs.filter((f: any) => f.feedback === 'HOT').length,
        perfectFeedbackCount: fbs.filter((f: any) => f.feedback === 'PERFECT').length,
        lastFeedbackTemp:     sortedFbs[0]?.temperature ?? sortedFbs[0]?.temp ?? null,
        purchaseCount:        purchased.length,
        totalPurchaseAmount:  purchased.reduce((s: number, p: any) => s + (p.price ?? 0), 0),
        cartCount:            allPurch.filter((p: any) => p.status === 'CART').length,
        wishlistCount:        allPurch.filter((p: any) => p.status === 'WISHLIST').length,
        lastPurchaseDate,
      };
    });
  }, [customers, feedbacks, purchases, products]);

  const [view, setView] = useState<'list' | 'form'>(() => {
    return sessionStorage.getItem(DRAFT_KEY) ? 'form' : 'list';
  });
  const [editing, setEditing] = useState<Campaign | null>(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    try { return (JSON.parse(raw) as { editing: Campaign | null }).editing ?? null; }
    catch { return null; }
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (view === 'form') {
      const params: Record<string, string> = { view: 'form' };
      if (editing?.id) params.id = String(editing.id);
      if (searchParams.get('view') !== 'form') {
        setSearchParams(params, { replace: true });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchParams.get('view') !== 'form' && view === 'form') {
      setView('list');
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNew = () => {
    setEditing(null);
    setView('form');
    setSearchParams({ view: 'form' });
  };

  const handleEdit = (c: Campaign) => {
    setEditing(c);
    setView('form');
    setSearchParams({ view: 'form', id: String(c.id) });
  };

  const handleCancel = () => {
    setView('list');
    setSearchParams({}, { replace: true });
  };

  const handleSave = async (c: Campaign) => {
    if (c.id) {
      await updateCampaign(c.id, c);
    } else {
      await createCampaign(c);
    }
    const data = await getCampaigns();
    setList(Array.isArray(data) ? data : []);
    setView('list');
    setSearchParams({}, { replace: true });
  };

  const handleDelete = async (id: number) => {
    await deleteCampaign(id);
    setList(prev => prev.filter(c => c.id !== id));
    if (view === 'form') { setView('list'); setSearchParams({}, { replace: true }); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg"><Megaphone size={20} className="text-blue-600" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">캠페인</h1>
          <p className="text-gray-500 text-sm">캠페인 관리 및 고객 필터 설정</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {view !== 'list' && (
            <button onClick={handleCancel} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ChevronRight size={14} className="rotate-180" /> 목록으로
            </button>
          )}
          {view === 'list' && (
            <button
              onClick={() => navigate('/codes')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <Settings size={14} /> 필터 항목 관리
            </button>
          )}
        </div>
      </div>

      {view === 'list' ? (
        <CampaignList list={list} coupons={coupons} onNew={handleNew} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <CampaignForm
          initial={editing}
          coupons={coupons}
          customerStats={CUSTOMER_STATS}
          categoryOptions={categoryOptions}
          rawPurchases={purchases}
          rawFeedbacks={feedbacks}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
