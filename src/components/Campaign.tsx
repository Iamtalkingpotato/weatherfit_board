import { useState, useMemo } from 'react';
import {
  Plus, ChevronRight, ChevronDown, Search, X, Trash2,
  Users, Megaphone, CheckSquare, Square,
} from 'lucide-react';
import {
  campaigns as initialCampaigns, customers, temperatureFeedbacks, purchaseData,
  getRegion, Campaign, CampaignFilterCondition,
  coupons, getCoupon,
} from '../data/mockData';

// ─── Filter tree (WeatherFit 실데이터 기반) ───────────────────────────────

interface TreeNode {
  id: string;
  label: string;
  type: 'group' | 'field';
  dataType?: 'number' | 'string' | 'date' | 'select';
  children?: TreeNode[];
}

const FILTER_TREE: TreeNode[] = [
  {
    id: 'customer', label: '고객 기본정보', type: 'group',
    children: [
      { id: 'age',        label: '나이',        type: 'field', dataType: 'number' },
      { id: 'gender',     label: '성별',        type: 'field', dataType: 'select' },
      { id: 'membership', label: '멤버십 등급', type: 'field', dataType: 'select' },
      { id: 'joinDate',   label: '가입일',      type: 'field', dataType: 'date'   },
      { id: 'regionCity', label: '지역(시)',     type: 'field', dataType: 'string' },
    ],
  },
  {
    id: 'weatherfit', label: 'WeatherFit 특성', type: 'group',
    children: [
      { id: 'coldSensitivity', label: '추위 민감도 (-2 ~ +2)', type: 'field', dataType: 'number' },
      { id: 'activityLevel',   label: '활동 수준',              type: 'field', dataType: 'select' },
      { id: 'preferredStyle',  label: '선호 스타일',             type: 'field', dataType: 'select' },
    ],
  },
  {
    id: 'feedback', label: '온도 피드백', type: 'group',
    children: [
      { id: 'feedbackCount',        label: '총 피드백 수',         type: 'field', dataType: 'number' },
      { id: 'coldFeedbackCount',    label: '"춥다" 피드백 수',     type: 'field', dataType: 'number' },
      { id: 'hotFeedbackCount',     label: '"덥다" 피드백 수',     type: 'field', dataType: 'number' },
      { id: 'perfectFeedbackCount', label: '"적당" 피드백 수',     type: 'field', dataType: 'number' },
      { id: 'lastFeedbackTemp',     label: '최근 피드백 온도(°C)', type: 'field', dataType: 'number' },
    ],
  },
  {
    id: 'purchase', label: '구매 / 행동', type: 'group',
    children: [
      { id: 'purchaseCount',       label: '구매 횟수',    type: 'field', dataType: 'number' },
      { id: 'totalPurchaseAmount', label: '총 구매 금액', type: 'field', dataType: 'number' },
      { id: 'cartCount',           label: '장바구니 횟수', type: 'field', dataType: 'number' },
      { id: 'wishlistCount',       label: '찜 횟수',      type: 'field', dataType: 'number' },
      { id: 'lastPurchaseDate',    label: '최근 구매일',   type: 'field', dataType: 'date'   },
    ],
  },
  {
    id: 'consent', label: '동의 정보', type: 'group',
    children: [
      { id: 'marketingConsent', label: '마케팅 활용 동의',      type: 'field', dataType: 'select' },
      { id: 'pushConsent',      label: '푸시 메시지 수신 동의', type: 'field', dataType: 'select' },
      { id: 'emailConsent',     label: '이메일 수신 동의',      type: 'field', dataType: 'select' },
      { id: 'smsConsent',       label: 'SMS 수신 동의',         type: 'field', dataType: 'select' },
    ],
  },
  {
    id: 'behavior', label: '행동 / 채널', type: 'group',
    children: [
      { id: 'dormantDays',  label: '휴면 일수',   type: 'field', dataType: 'number' },
      { id: 'joinChannel',  label: '가입 채널',   type: 'field', dataType: 'select' },
      { id: 'joinType',     label: '가입 유형',   type: 'field', dataType: 'select' },
      { id: 'isFraud',      label: '부정 사용자', type: 'field', dataType: 'select' },
    ],
  },
];

// select 필드별 옵션
const FIELD_OPTIONS: Record<string, { label: string; value: string }[]> = {
  gender:        [{ label: '남성', value: 'MALE' }, { label: '여성', value: 'FEMALE' }],
  membership:    [{ label: 'VIP', value: 'VIP' }, { label: '골드', value: 'GOLD' }, { label: '실버', value: 'SILVER' }, { label: '일반', value: 'NORMAL' }],
  activityLevel: [{ label: '낮음', value: 'LOW' }, { label: '보통', value: 'MEDIUM' }, { label: '높음', value: 'HIGH' }],
  preferredStyle:[{ label: '캐주얼', value: 'CASUAL' }, { label: '포멀', value: 'FORMAL' }, { label: '스포티', value: 'SPORTY' }, { label: '스트릿', value: 'STREET' }, { label: '미니멀', value: 'MINIMAL' }],
  marketingConsent: [{ label: '동의', value: 'true' }, { label: '미동의', value: 'false' }],
  pushConsent:      [{ label: '동의', value: 'true' }, { label: '미동의', value: 'false' }],
  emailConsent:     [{ label: '동의', value: 'true' }, { label: '미동의', value: 'false' }],
  smsConsent:       [{ label: '동의', value: 'true' }, { label: '미동의', value: 'false' }],
  joinChannel:      [{ label: '앱', value: 'APP' }, { label: '웹', value: 'WEB' }, { label: 'SNS', value: 'SNS' }, { label: '오프라인', value: 'OFFLINE' }],
  joinType:         [{ label: '직접가입', value: 'DIRECT' }, { label: '추천인', value: 'REFERRAL' }, { label: 'SNS가입', value: 'SNS_SIGNUP' }],
  isFraud:          [{ label: '부정사용자', value: 'true' }, { label: '정상', value: 'false' }],
};

const OPERATORS: Record<string, { label: string; value: string }[]> = {
  number: [{ label: '≥', value: '>=' }, { label: '>', value: '>' }, { label: '≤', value: '<=' }, { label: '<', value: '<' }, { label: '=', value: '=' }, { label: '≠', value: '!=' }],
  string: [{ label: '= (같음)', value: '=' }, { label: '≠ (다름)', value: '!=' }, { label: 'LIKE', value: 'LIKE' }],
  date:   [{ label: '≥', value: '>=' }, { label: '>', value: '>' }, { label: '≤', value: '<=' }, { label: '<', value: '<' }, { label: '=', value: '=' }],
  select: [{ label: '= (같음)', value: '=' }, { label: '≠ (다름)', value: '!=' }, { label: 'IN (복수선택)', value: 'IN' }],
};

const FILTER_SUBJECTS = ['WeatherFit_전체고객Filter', '온도피드백_Filter', '구매이력_Filter', '멤버십등급_Filter'];

// ─── Helpers ──────────────────────────────────────────────────────────────

function hasMatch(node: TreeNode, q: string): boolean {
  if (!q) return true;
  if (node.label.includes(q)) return true;
  return node.children?.some(c => hasMatch(c, q)) ?? false;
}

function uid() { return Math.random().toString(36).slice(2, 10); }

const STATUS_COLORS: Record<string, string> = {
  '설계중':          'bg-blue-100 text-blue-700',
  '시뮬레이션 완료': 'bg-purple-100 text-purple-700',
  '수행중':          'bg-green-100 text-green-700',
  '종료':            'bg-gray-100 text-gray-600',
};

// ─── Tree node component ──────────────────────────────────────────────────

function TreeItem({
  node, expanded, onToggle, onAdd, query,
}: {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (node: TreeNode) => void;
  query: string;
}) {
  if (!hasMatch(node, query)) return null;

  if (node.type === 'field') {
    const typeColor: Record<string, string> = { number: 'bg-blue-500', string: 'bg-orange-400', date: 'bg-green-500', select: 'bg-purple-500' };
    const typeTag:  Record<string, string>  = { number: '123', string: 'abc', date: 'dt', select: '≡' };
    const dt = node.dataType ?? 'string';
    return (
      <div
        className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 cursor-pointer hover:bg-blue-50 rounded text-xs text-gray-700 group"
        onClick={() => onAdd(node)}
      >
        <span className={`shrink-0 w-4 h-4 rounded-sm ${typeColor[dt]} text-white flex items-center justify-center text-[8px] font-bold`}>{typeTag[dt]}</span>
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
            <TreeItem key={c.id} node={c} expanded={expanded} onToggle={onToggle} onAdd={onAdd} query={query} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Per-customer stats (for live query) ─────────────────────────────────

function buildCustomerStats() {
  return customers.map(c => {
    const feedbacks = temperatureFeedbacks.filter(f => f.customerId === c.id);
    const allPurch  = purchaseData.filter(p => p.customerId === c.id);
    const purchased = allPurch.filter(p => p.status === 'PURCHASED');
    const sortedFB  = [...feedbacks].sort((a, b) => b.feedbackDate.localeCompare(a.feedbackDate));
    const sortedP   = [...purchased].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
    return {
      ...c,
      regionCity:           getRegion(c.regionId)?.city ?? '',
      feedbackCount:        feedbacks.length,
      coldFeedbackCount:    feedbacks.filter(f => f.feedback === 'COLD').length,
      hotFeedbackCount:     feedbacks.filter(f => f.feedback === 'HOT').length,
      perfectFeedbackCount: feedbacks.filter(f => f.feedback === 'PERFECT').length,
      lastFeedbackTemp:     sortedFB[0]?.actualTemp ?? null as number | null,
      purchaseCount:        purchased.length,
      totalPurchaseAmount:  purchased.reduce((s, p) => s + p.price, 0),
      cartCount:            allPurch.filter(p => p.status === 'CART').length,
      wishlistCount:        allPurch.filter(p => p.status === 'WISHLIST').length,
      lastPurchaseDate:     sortedP[0]?.purchaseDate ?? null as string | null,
    };
  });
}

function matchNum(actual: number, op: string, val: number): boolean {
  if (op === '>')  return actual >  val;
  if (op === '>=') return actual >= val;
  if (op === '<')  return actual <  val;
  if (op === '<=') return actual <= val;
  if (op === '=')  return actual === val;
  if (op === '!=') return actual !== val;
  return true;
}

type CustomerStat = ReturnType<typeof buildCustomerStats>[0];

function matchCondition(cs: CustomerStat, cond: CampaignFilterCondition): boolean {
  if (!cond.value) return true;

  const numVal = Number(cond.value);

  switch (cond.fieldId) {
    case 'age':           return matchNum(cs.age, cond.operator, numVal);
    case 'joinDate': {
      if (cond.operator === '>=') return cs.joinDate >= cond.value;
      if (cond.operator === '>')  return cs.joinDate >  cond.value;
      if (cond.operator === '<=') return cs.joinDate <= cond.value;
      if (cond.operator === '<')  return cs.joinDate <  cond.value;
      if (cond.operator === '=')  return cs.joinDate === cond.value;
      return true;
    }
    case 'regionCity': {
      if (cond.operator === '=')    return cs.regionCity === cond.value;
      if (cond.operator === '!=')   return cs.regionCity !== cond.value;
      if (cond.operator === 'LIKE') return cs.regionCity.includes(cond.value);
      return true;
    }
    case 'gender': {
      const vals = cond.value.split(',').map(v => v.trim());
      if (cond.operator === 'IN') return vals.includes(cs.gender);
      if (cond.operator === '=')  return cs.gender === cond.value;
      if (cond.operator === '!=') return cs.gender !== cond.value;
      return true;
    }
    case 'membership': {
      const vals = cond.value.split(',').map(v => v.trim());
      if (cond.operator === 'IN') return vals.includes(cs.membershipLevel);
      if (cond.operator === '=')  return cs.membershipLevel === cond.value;
      if (cond.operator === '!=') return cs.membershipLevel !== cond.value;
      return true;
    }
    case 'activityLevel': {
      const vals = cond.value.split(',').map(v => v.trim());
      if (cond.operator === 'IN') return vals.includes(cs.activityLevel);
      if (cond.operator === '=')  return cs.activityLevel === cond.value;
      if (cond.operator === '!=') return cs.activityLevel !== cond.value;
      return true;
    }
    case 'preferredStyle': {
      const vals = cond.value.split(',').map(v => v.trim());
      if (cond.operator === 'IN') return vals.includes(cs.preferredStyle);
      if (cond.operator === '=')  return cs.preferredStyle === cond.value;
      if (cond.operator === '!=') return cs.preferredStyle !== cond.value;
      return true;
    }
    case 'coldSensitivity':   return matchNum(cs.coldSensitivity,   cond.operator, numVal);
    case 'feedbackCount':        return matchNum(cs.feedbackCount,        cond.operator, numVal);
    case 'coldFeedbackCount':    return matchNum(cs.coldFeedbackCount,    cond.operator, numVal);
    case 'hotFeedbackCount':     return matchNum(cs.hotFeedbackCount,     cond.operator, numVal);
    case 'perfectFeedbackCount': return matchNum(cs.perfectFeedbackCount, cond.operator, numVal);
    case 'lastFeedbackTemp':
      return cs.lastFeedbackTemp !== null && matchNum(cs.lastFeedbackTemp, cond.operator, numVal);
    case 'purchaseCount':       return matchNum(cs.purchaseCount,       cond.operator, numVal);
    case 'totalPurchaseAmount': return matchNum(cs.totalPurchaseAmount, cond.operator, numVal);
    case 'cartCount':           return matchNum(cs.cartCount,           cond.operator, numVal);
    case 'wishlistCount':       return matchNum(cs.wishlistCount,       cond.operator, numVal);
    case 'lastPurchaseDate': {
      if (!cs.lastPurchaseDate) return false;
      if (cond.operator === '>=') return cs.lastPurchaseDate >= cond.value;
      if (cond.operator === '>')  return cs.lastPurchaseDate >  cond.value;
      if (cond.operator === '<=') return cs.lastPurchaseDate <= cond.value;
      if (cond.operator === '<')  return cs.lastPurchaseDate <  cond.value;
      if (cond.operator === '=')  return cs.lastPurchaseDate === cond.value;
      return true;
    }
    case 'marketingConsent': return String(cs.marketingConsent) === cond.value;
    case 'pushConsent':      return String(cs.pushConsent)      === cond.value;
    case 'emailConsent':     return String(cs.emailConsent)     === cond.value;
    case 'smsConsent':       return String(cs.smsConsent)       === cond.value;
    case 'dormantDays':      return matchNum(cs.dormantDays, cond.operator, numVal);
    case 'joinChannel': {
      const vals = cond.value.split(',').map(v => v.trim());
      if (cond.operator === 'IN') return vals.includes(cs.joinChannel);
      if (cond.operator === '=')  return cs.joinChannel === cond.value;
      if (cond.operator === '!=') return cs.joinChannel !== cond.value;
      return true;
    }
    case 'joinType': {
      const vals = cond.value.split(',').map(v => v.trim());
      if (cond.operator === 'IN') return vals.includes(cs.joinType);
      if (cond.operator === '=')  return cs.joinType === cond.value;
      if (cond.operator === '!=') return cs.joinType !== cond.value;
      return true;
    }
    case 'isFraud': return String(cs.isFraud) === cond.value;
    default: return true;
  }
}

// ─── Filter builder ───────────────────────────────────────────────────────

function FilterBuilder({
  conditions,
  onChange,
  filterSubject,
  onSubjectChange,
}: {
  conditions: CampaignFilterCondition[];
  onChange: (c: CampaignFilterCondition[]) => void;
  filterSubject: string;
  onSubjectChange: (s: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['customer', 'weatherfit', 'feedback', 'purchase']));
  const [treeQuery, setTreeQuery] = useState('');
  const [extractLimit, setExtractLimit] = useState(100);
  const [noLimit, setNoLimit] = useState(false);
  const [queryResult, setQueryResult] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [matchedNames, setMatchedNames] = useState<string[]>([]);

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
    onChange([
      ...conditions,
      {
        id: uid(),
        fieldId:    node.id,
        fieldLabel: node.label,
        dataType:   isSelect ? 'string' : (node.dataType ?? 'string'),
        operator:   ops[0].value,
        value:      '',
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
    const stats = buildCustomerStats();
    const matched = stats.filter(cs => conditions.every(cond => matchCondition(cs, cond)));
    const limited = noLimit || extractLimit === 0 ? matched : matched.slice(0, extractLimit);
    const names = limited.slice(0, 8).map(cs => cs.name);
    const extra = limited.length - names.length;
    setQueryResult(limited.length);
    setMatchedNames(extra > 0 ? [...names, `+${extra}명`] : names);
    setElapsed(Math.round(performance.now() - t0));
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden text-sm">
      {/* top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <span className="text-xs text-gray-500 shrink-0">분석 주제</span>
        <select
          value={filterSubject}
          onChange={e => onSubjectChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {FILTER_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={() => onChange([])}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 text-gray-500"
        >
          조건 초기화
        </button>
        <div className="flex-1" />
        <button
          onClick={runQuery}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          <Users size={12} /> 고객 수 조회
        </button>
      </div>

      {/* body */}
      <div className="flex" style={{ minHeight: 300 }}>
        {/* left: tree */}
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
                <button onClick={() => setTreeQuery('')}><X size={11} className="text-gray-400" /></button>
              )}
            </div>
            <div className="flex gap-1 mt-1.5">
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> 숫자</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> 선택</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> 날짜</span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5">
            {FILTER_TREE.map(node => (
              <TreeItem key={node.id} node={node} expanded={expanded} onToggle={toggleExpanded} onAdd={addCondition} query={treeQuery} />
            ))}
          </div>
        </div>

        {/* right: conditions */}
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
                  const fieldOpts = FIELD_OPTIONS[cond.fieldId];
                  const isSelect  = !!fieldOpts;
                  const ops = OPERATORS[isSelect ? 'select' : (cond.dataType ?? 'string')] ?? OPERATORS.string;

                  return (
                    <div key={cond.id} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-2 py-1.5 flex-wrap">
                      <span className="shrink-0 w-3.5 h-3.5 rounded-sm bg-blue-500 text-white flex items-center justify-center text-[8px]">■</span>
                      <span className="text-xs text-gray-800 w-36 truncate shrink-0 font-medium">{cond.fieldLabel}</span>

                      {/* operator */}
                      <select
                        value={cond.operator}
                        onChange={e => updateCondition(cond.id, { operator: e.target.value, value: '' })}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none min-w-[96px]"
                      >
                        {ops.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>

                      {/* value */}
                      {isSelect && cond.operator !== 'IN' ? (
                        <select
                          value={cond.value}
                          onChange={e => updateCondition(cond.id, { value: e.target.value })}
                          className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none flex-1 min-w-[100px]"
                        >
                          <option value="">-- 선택 --</option>
                          {fieldOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : isSelect && cond.operator === 'IN' ? (
                        <div className="flex flex-wrap gap-1 flex-1">
                          {fieldOpts.map(o => (
                            <label key={o.value} className="flex items-center gap-1 cursor-pointer text-[11px] text-gray-700 bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:bg-blue-50">
                              <input
                                type="checkbox"
                                checked={cond.value.split(',').filter(Boolean).includes(o.value)}
                                onChange={e => {
                                  const cur = new Set(cond.value.split(',').filter(Boolean));
                                  e.target.checked ? cur.add(o.value) : cur.delete(o.value);
                                  updateCondition(cond.id, { value: Array.from(cur).join(',') });
                                }}
                                className="accent-blue-500"
                              />
                              {o.label}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={cond.dataType === 'number' ? 'number' : cond.dataType === 'date' ? 'date' : 'text'}
                          value={cond.value}
                          onChange={e => updateCondition(cond.id, { value: e.target.value })}
                          placeholder="값 입력"
                          className="border border-gray-300 rounded px-2 py-0.5 text-xs flex-1 min-w-[80px] focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      )}

                      <button onClick={() => deleteCondition(cond.id)} className="shrink-0 text-red-400 hover:text-red-600 ml-auto">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* result preview */}
          {queryResult !== null && (
            <div className={`rounded-lg px-4 py-3 text-sm border ${queryResult === 0 ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-green-50 border-green-200 text-green-800'}`}>
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Users size={14} />
                <span>조회 결과: {queryResult.toLocaleString()}명</span>
                <span className="text-xs font-normal opacity-60">{elapsed}ms</span>
              </div>
              {matchedNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {matchedNames.map((n, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded-full text-xs ${n.startsWith('+') ? 'bg-green-200 text-green-700 font-medium' : 'bg-white border border-green-200 text-green-700'}`}>{n}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* bottom bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-t border-gray-200 flex-wrap text-xs">
        <span className="shrink-0 text-gray-600">추출 건 수 제한</span>
        <input
          type="number"
          value={extractLimit}
          onChange={e => setExtractLimit(Number(e.target.value))}
          disabled={noLimit}
          className="w-20 border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none disabled:bg-gray-100"
        />
        <label className="flex items-center gap-1 cursor-pointer text-gray-500">
          <button onClick={() => setNoLimit(v => !v)} className="text-gray-500">
            {noLimit ? <CheckSquare size={13} className="text-blue-500" /> : <Square size={13} />}
          </button>
          제한 없음
        </label>
        <div className="flex-1" />
        <button className="px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">조건만 저장</button>
        <button onClick={runQuery} className="px-3 py-1 border border-blue-400 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">최종 조회</button>
      </div>
    </div>
  );
}

// ─── Campaign form ────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Campaign, 'id' | 'department' | 'createdBy' | 'createdDate'> = {
  category1: '',
  category2: '',
  name: '',
  description: '',
  status: '설계중',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  graceDays: 0,
  customerType: '개인',
  visibility: '비공개',
  tags: '',
  filterSubject: 'WeatherFit_전체고객Filter',
  filterConditions: [],
  couponId: '',
  autoIssueCoupon: false,
};

const CATEGORY1_OPTIONS = ['조기정착', '활성화', '이탈방지', '재활성화', '우수고객'];
const CATEGORY2_OPTIONS = ['신규고객유치', '기존고객유지', '휴면고객재유입', 'VIP전환', '프로모션'];

function CampaignForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Campaign | null;
  onSave: (c: Campaign) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Campaign, 'id' | 'department' | 'createdBy' | 'createdDate'>>(
    initial
      ? {
          category1: initial.category1, category2: initial.category2,
          name: initial.name, description: initial.description,
          status: initial.status, startDate: initial.startDate, endDate: initial.endDate,
          graceDays: initial.graceDays, customerType: initial.customerType,
          visibility: initial.visibility, tags: initial.tags,
          filterSubject: initial.filterSubject, filterConditions: initial.filterConditions,
          couponId: initial.couponId ?? '',
          autoIssueCoupon: initial.autoIssueCoupon ?? false,
        }
      : { ...EMPTY_FORM },
  );

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim()) { alert('캠페인 명을 입력하세요'); return; }
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      ...form,
      id: initial?.id ?? `C${now.replace(/-/g, '').slice(2)}${String(Math.floor(Math.random() * 900) + 100)}`,
      department: initial?.department ?? '마케팅팀',
      createdBy:  initial?.createdBy  ?? 'admin',
      createdDate: initial?.createdDate ?? now,
    });
  };

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

        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">캠페인 분류</label>
          <select value={form.category1} onChange={e => set('category1', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-36">
            <option value="">[ 선택 ]</option>
            {CATEGORY1_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={form.category2} onChange={e => set('category2', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-40">
            <option value="">[ 선택 ]</option>
            {CATEGORY2_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">캠페인 명</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>

        <div className="flex gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0 pt-1.5">캠페인 설명</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={3}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="w-28 text-sm text-gray-600 shrink-0">수행 일자</label>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          <span className="text-gray-400">~</span>
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          <span className="text-sm text-gray-500">종료 후</span>
          <input type="number" value={form.graceDays} onChange={e => set('graceDays', Number(e.target.value))}
            className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          <span className="text-sm text-gray-500">일 후까지 실적 인정</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">고객군 유형</label>
          <select value={form.customerType} onChange={e => set('customerType', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-32">
            <option>개인</option><option>법인</option><option>전체</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">공개 설정</label>
          <div className="flex gap-4">
            {(['비공개', '모두공개', '부서공개'] as const).map(v => (
              <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                <input type="radio" name="visibility" value={v} checked={form.visibility === v}
                  onChange={() => set('visibility', v)} className="accent-blue-600" />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">태그</label>
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
            placeholder="#태그 #태그2"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      </div>

      {/* 연결 쿠폰 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" /> 연결 쿠폰 설정
          <span className="text-xs font-normal text-gray-400 ml-1">캠페인 수행 시 자동 발급할 쿠폰을 선택하세요</span>
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="w-28 text-sm text-gray-600 shrink-0">쿠폰 선택</label>
          <select
            value={form.couponId ?? ''}
            onChange={e => set('couponId', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-72"
          >
            <option value="">연결 쿠폰 없음</option>
            {coupons.filter(c => c.status !== 'EXPIRED').map(c => (
              <option key={c.id} value={c.id}>
                [{c.id}] {c.name} ({c.type === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}원`} 할인)
              </option>
            ))}
          </select>
          {form.couponId && (() => {
            const cp = getCoupon(form.couponId);
            return cp ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
                <span className="font-semibold">{cp.name}</span>
                <span>·</span>
                <span>{cp.type === 'PERCENT' ? `${cp.discountValue}% 할인` : `${cp.discountValue.toLocaleString()}원 할인`}</span>
                <span>·</span>
                <span>유효 {cp.validDays}일</span>
                {cp.minOrderAmount > 0 && <><span>·</span><span>최소 {cp.minOrderAmount.toLocaleString()}원</span></>}
              </div>
            ) : null;
          })()}
        </div>
        <div className="flex items-center gap-3">
          <label className="w-28 text-sm text-gray-600 shrink-0">자동 발급</label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.autoIssueCoupon ?? false}
              onChange={e => set('autoIssueCoupon', e.target.checked)}
              className="accent-blue-600 w-4 h-4"
            />
            캠페인 수행 시 필터 대상 고객에게 쿠폰 자동 발급
          </label>
        </div>
      </div>

      {/* 고객 필터 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> 고객 필터 설정
          <span className="text-xs font-normal text-gray-400 ml-1">실제 고객 데이터 기반 조건 설정 · AND 결합</span>
        </h3>
        <FilterBuilder
          conditions={form.filterConditions}
          onChange={v => set('filterConditions', v)}
          filterSubject={form.filterSubject}
          onSubjectChange={v => set('filterSubject', v)}
        />
      </div>

      <div className="flex justify-end gap-3 pb-4">
        <button onClick={onCancel}
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

// ─── Campaign list ────────────────────────────────────────────────────────

function CampaignList({
  list, onNew, onEdit, onDelete,
}: {
  list: Campaign[];
  onNew: () => void;
  onEdit: (c: Campaign) => void;
  onDelete: (id: string) => void;
}) {
  const [checked, setChecked]       = useState<Set<string>>(new Set());
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  const filtered = useMemo(() => list.filter(c => {
    const matchSearch = !search || c.name.includes(search) || c.id.includes(search) || c.category1.includes(search);
    const matchStatus = statusFilter === '전체' || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [list, search, statusFilter]);

  const toggleAll = () => checked.size === filtered.length ? setChecked(new Set()) : setChecked(new Set(filtered.map(c => c.id)));
  const toggleOne = (id: string) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const STATUS_OPTIONS = ['전체', '설계중', '시뮬레이션 완료', '수행중', '종료'];

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
            onClick={() => { if (window.confirm(`${checked.size}개 캠페인을 삭제하시겠습니까?`)) { checked.forEach(id => onDelete(id)); setChecked(new Set()); } }}
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
                    {checked.size === filtered.length && filtered.length > 0
                      ? <CheckSquare size={14} className="text-blue-500" />
                      : <Square size={14} className="text-gray-400" />}
                  </button>
                </th>
                {['캠페인 ID','분류1','분류2','캠페인 명','상태','시작 일자','종료 일자','공개','기안 부서','기안자','기안 일자'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
                <th className="px-3 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={14} className="text-center py-12 text-gray-400 text-sm">캠페인이 없습니다</td></tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onEdit(c)}>
                    <td className="px-3 py-3 text-center text-gray-500 text-xs">{i + 1}</td>
                    <td className="px-3 py-3 text-center" onClick={e => { e.stopPropagation(); toggleOne(c.id); }}>
                      {checked.has(c.id) ? <CheckSquare size={14} className="text-blue-500 mx-auto" /> : <Square size={14} className="text-gray-400 mx-auto" />}
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-gray-700 whitespace-nowrap">{c.id}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.category1}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.category2}</td>
                    <td className="px-3 py-3 text-sm text-gray-900 max-w-[200px] truncate">{c.name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.startDate}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.endDate}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.visibility}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.department}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.createdBy}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.createdDate}</td>
                    <td className="px-3 py-3 text-center" onClick={e => { e.stopPropagation(); onDelete(c.id); }}>
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">총 {filtered.length}건</div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

export function CampaignPage() {
  const [list, setList]     = useState<Campaign[]>(initialCampaigns);
  const [view, setView]     = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<Campaign | null>(null);

  const handleNew    = () => { setEditing(null); setView('form'); };
  const handleEdit   = (c: Campaign) => { setEditing(c); setView('form'); };
  const handleCancel = () => setView('list');

  const handleSave = (c: Campaign) => {
    setList(prev => prev.some(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]);
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (view === 'form') setView('list');
    setList(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg"><Megaphone size={20} className="text-blue-600" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">캠페인</h1>
          <p className="text-gray-500 text-sm">캠페인 관리 및 고객 필터 설정</p>
        </div>
        {view === 'form' && (
          <button onClick={handleCancel} className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ChevronRight size={14} className="rotate-180" /> 목록으로
          </button>
        )}
      </div>

      {view === 'list' ? (
        <CampaignList list={list} onNew={handleNew} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <CampaignForm initial={editing} onSave={handleSave} onCancel={handleCancel} />
      )}
    </div>
  );
}
