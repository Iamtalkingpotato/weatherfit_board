import { createContext, useContext, useState, ReactNode } from 'react';

// ─── Field 타입 ───────────────────────────────────────────────────────────────

export interface FieldOption {
  codeValue: number;
  codeName:  string;
  codeEng:   string;
}

export interface Field {
  fieldNo:        number;                                       // 불변 고유번호
  id:             string;                                       // 고객 데이터 필드명
  label:          string;                                       // 표시명
  dataType:       'number' | 'date' | 'string' | 'select';
  selectOptions?: FieldOption[];                                // select일 때만
  active:         boolean;                                      // 캠페인 필터 활성 여부
  filterSubject?: string;                                       // 필터 주제 분류 (예: 고객정보, 고객활동, 피드백)
  isAggregate?:   boolean;                                      // 집계 필드 (기간 기준 선택 가능)
}

/** 기본 제공 필터 주제 목록 */
export const DEFAULT_FILTER_SUBJECTS = ['고객정보', '고객활동', '피드백', '옷장'] as const;

/** 삭제 불가능한 고정 주제 */
export const FIXED_FILTER_SUBJECT = '기타';

// ─── TreeNode — Campaign.tsx 내부 표시용 (Field에서 파생) ─────────────────────

export interface TreeNode {
  id:             string;
  label:          string;
  type:           'group' | 'field';
  dataType?:      'number' | 'string' | 'date' | 'select';
  children?:      TreeNode[];
  selectOptions?: { label: string; value: string }[];
}

export function fieldToTreeNode(f: Field): TreeNode {
  return {
    id:       f.id,
    label:    f.label,
    type:     'field',
    dataType: f.dataType,
    selectOptions: f.selectOptions?.map(o => ({ label: o.codeName, value: o.codeEng })),
  };
}

// ─── 초기 필드 데이터 ──────────────────────────────────────────────────────────

export const INITIAL_FIELDS: Field[] = [
  {
    fieldNo: 1, id: 'gender', label: '성별', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '남성', codeEng: 'MALE' },
      { codeValue: 2, codeName: '여성', codeEng: 'FEMALE' },
    ],
  },
  { fieldNo: 2,  id: 'birthDate',    label: '생년월일',   dataType: 'date',   active: true, filterSubject: '고객정보' },
  { fieldNo: 3,  id: 'regionId',     label: '지역 ID',    dataType: 'number', active: true, filterSubject: '고객정보' },
  { fieldNo: 4,  id: 'joinDate',     label: '가입일',      dataType: 'date',   active: true, filterSubject: '고객정보' },
  {
    fieldNo: 5, id: 'membershipLevel', label: '멤버십 등급', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: 'VIP',  codeEng: 'VIP'    },
      { codeValue: 2, codeName: '골드', codeEng: 'GOLD'   },
      { codeValue: 3, codeName: '실버', codeEng: 'SILVER' },
      { codeValue: 4, codeName: '일반', codeEng: 'BASIC'  },
    ],
  },
  {
    fieldNo: 6, id: 'coldSensitivity', label: '추위 민감도', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '많이 추위 탐', codeEng: '1' },
      { codeValue: 2, codeName: '추위 탐',      codeEng: '2' },
      { codeValue: 3, codeName: '보통',          codeEng: '3' },
      { codeValue: 4, codeName: '더위 탐',      codeEng: '4' },
      { codeValue: 5, codeName: '많이 더위 탐', codeEng: '5' },
    ],
  },
  {
    fieldNo: 7, id: 'activityLevel', label: '활동 수준', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '낮음', codeEng: 'LOW'    },
      { codeValue: 2, codeName: '보통', codeEng: 'MEDIUM' },
      { codeValue: 3, codeName: '높음', codeEng: 'HIGH'   },
    ],
  },
  {
    fieldNo: 8, id: 'preferredStyle', label: '선호 스타일', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '캐주얼', codeEng: 'CASUAL'  },
      { codeValue: 2, codeName: '포멀',   codeEng: 'FORMAL'  },
      { codeValue: 3, codeName: '스포티', codeEng: 'SPORTY'  },
      { codeValue: 4, codeName: '스트릿', codeEng: 'STREET'  },
      { codeValue: 5, codeName: '미니멀', codeEng: 'MINIMAL' },
    ],
  },
  {
    fieldNo: 9, id: 'marketingConsent', label: '마케팅 활용 동의', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '동의',   codeEng: 'true'  },
      { codeValue: 2, codeName: '미동의', codeEng: 'false' },
    ],
  },
  {
    fieldNo: 10, id: 'pushConsent', label: '푸시 수신 동의', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '동의',   codeEng: 'true'  },
      { codeValue: 2, codeName: '미동의', codeEng: 'false' },
    ],
  },
  {
    fieldNo: 11, id: 'emailConsent', label: '이메일 수신 동의', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '동의',   codeEng: 'true'  },
      { codeValue: 2, codeName: '미동의', codeEng: 'false' },
    ],
  },
  {
    fieldNo: 12, id: 'smsConsent', label: 'SMS 수신 동의', dataType: 'select', active: true, filterSubject: '고객정보',
    selectOptions: [
      { codeValue: 1, codeName: '동의',   codeEng: 'true'  },
      { codeValue: 2, codeName: '미동의', codeEng: 'false' },
    ],
  },
  { fieldNo: 13, id: 'lastLoginDate',       label: '최근 로그인일',   dataType: 'date',   active: true, filterSubject: '고객정보' },
  { fieldNo: 14, id: 'regionCity',          label: '지역(시)',         dataType: 'string', active: true, filterSubject: '고객정보' },
  { fieldNo: 15, id: 'dormantDays',         label: '휴면 일수',       dataType: 'number', active: true, filterSubject: '고객정보' },
  { fieldNo: 16, id: 'feedbackCount',       label: '총 피드백 수',    dataType: 'number', active: true, filterSubject: '피드백',   isAggregate: true },
  { fieldNo: 17, id: 'coldFeedbackCount',   label: '"춥다" 피드백 수', dataType: 'number', active: true, filterSubject: '피드백',   isAggregate: true },
  { fieldNo: 18, id: 'hotFeedbackCount',    label: '"덥다" 피드백 수', dataType: 'number', active: true, filterSubject: '피드백',   isAggregate: true },
  { fieldNo: 19, id: 'purchaseCount',       label: '구매 횟수',       dataType: 'number', active: true, filterSubject: '고객활동', isAggregate: true },
  { fieldNo: 20, id: 'totalPurchaseAmount', label: '총 구매 금액',    dataType: 'number', active: true, filterSubject: '고객활동', isAggregate: true },
  { fieldNo: 21, id: 'cartCount',           label: '장바구니 횟수',   dataType: 'number', active: true, filterSubject: '고객활동', isAggregate: true },
  { fieldNo: 22, id: 'wishlistCount',           label: '찜 횟수',           dataType: 'number', active: true, filterSubject: '고객활동', isAggregate: true },
  { fieldNo: 23, id: 'wardrobeCount',           label: '옷장 총 아이템 수', dataType: 'number', active: true, filterSubject: '옷장' },
  { fieldNo: 24, id: 'wardrobeOuterCount',      label: '옷장 아우터 수',    dataType: 'number', active: true, filterSubject: '옷장' },
  { fieldNo: 25, id: 'wardrobeTopCount',        label: '옷장 상의 수',      dataType: 'number', active: true, filterSubject: '옷장' },
  { fieldNo: 26, id: 'wardrobeBottomCount',     label: '옷장 하의 수',      dataType: 'number', active: true, filterSubject: '옷장' },
  { fieldNo: 27, id: 'wardrobeAccessoryCount',  label: '옷장 악세서리 수',  dataType: 'number', active: true, filterSubject: '옷장' },
];

const LS_FIELDS_KEY          = 'wf_admin_fields';
const LS_FIELDS_VERSION_KEY  = 'wf_admin_fields_version';
const LS_SUBJECTS_KEY        = 'wf_admin_filter_subjects';
const CURRENT_FIELDS_VERSION = '7';

// ─── Context ──────────────────────────────────────────────────────────────────

type Updater<T> = T | ((prev: T) => T);

interface CodeContextValue {
  fields:         Field[];
  setFields:      (f: Updater<Field[]>) => void;
  filterSubjects: string[];
  setFilterSubjects: (subjects: string[]) => void;
}

const CodeContext = createContext<CodeContextValue | null>(null);

function mergeInitialWithSavedActive(saved: Field[]): Field[] {
  // INITIAL_FIELDS 기준 구조는 유지하되, 저장된 active/filterSubject/label 등 사용자 커스터마이징 값은 보존
  const merged = INITIAL_FIELDS.map(init => {
    const found = saved.find(f => f.id === init.id);
    if (!found) return init;
    return {
      ...init,
      active:        found.active,
      filterSubject: found.filterSubject ?? init.filterSubject,
      label:         found.label ?? init.label,
    };
  });
  // 저장된 데이터에 INITIAL_FIELDS에 없는 사용자 추가 필드도 보존
  const initIds = new Set(INITIAL_FIELDS.map(f => f.id));
  const extras = saved.filter(f => !initIds.has(f.id));
  return [...merged, ...extras];
}

export function CodeProvider({ children }: { children: ReactNode }) {
  const [fields, setFieldsState] = useState<Field[]>(() => {
    try {
      const raw = localStorage.getItem(LS_FIELDS_KEY);
      if (!raw) return INITIAL_FIELDS;
      const saved: Field[] = JSON.parse(raw);
      if (localStorage.getItem(LS_FIELDS_VERSION_KEY) !== CURRENT_FIELDS_VERSION) {
        const migrated = mergeInitialWithSavedActive(saved);
        localStorage.setItem(LS_FIELDS_KEY, JSON.stringify(migrated));
        localStorage.setItem(LS_FIELDS_VERSION_KEY, CURRENT_FIELDS_VERSION);
        // subjects 마이그레이션: 새로 추가된 기본 주제가 빠져있으면 보충
        try {
          const rawSub = localStorage.getItem(LS_SUBJECTS_KEY);
          const savedSubs: string[] = rawSub ? JSON.parse(rawSub) : [];
          const merged = [
            FIXED_FILTER_SUBJECT,
            ...DEFAULT_FILTER_SUBJECTS.filter(s => !savedSubs.includes(s)),
            ...savedSubs.filter(s => s !== FIXED_FILTER_SUBJECT),
          ];
          localStorage.setItem(LS_SUBJECTS_KEY, JSON.stringify(merged));
        } catch { /* ignore */ }
        return migrated;
      }
      return saved;
    } catch { return INITIAL_FIELDS; }
  });

  const [filterSubjects, setFilterSubjectsState] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LS_SUBJECTS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as string[];
        // "기타"는 항상 맨 앞에 고정
        const others = saved.filter(s => s !== FIXED_FILTER_SUBJECT);
        return [FIXED_FILTER_SUBJECT, ...others];
      }
    } catch { /* ignore */ }
    return [FIXED_FILTER_SUBJECT, ...DEFAULT_FILTER_SUBJECTS];
  });

  const setFields = (f: Updater<Field[]>) => {
    setFieldsState(prev => {
      const next = typeof f === 'function' ? f(prev) : f;
      localStorage.setItem(LS_FIELDS_KEY, JSON.stringify(next));
      localStorage.setItem(LS_FIELDS_VERSION_KEY, CURRENT_FIELDS_VERSION);
      return next;
    });
  };

  const setFilterSubjects = (subjects: string[]) => {
    // "기타"는 항상 맨 앞에 고정
    const withFixed = subjects.includes(FIXED_FILTER_SUBJECT)
      ? [FIXED_FILTER_SUBJECT, ...subjects.filter(s => s !== FIXED_FILTER_SUBJECT)]
      : [FIXED_FILTER_SUBJECT, ...subjects];
    setFilterSubjectsState(withFixed);
    localStorage.setItem(LS_SUBJECTS_KEY, JSON.stringify(withFixed));
  };

  return (
    <CodeContext.Provider value={{ fields, setFields, filterSubjects, setFilterSubjects }}>
      {children}
    </CodeContext.Provider>
  );
}

export function useCodeContext() {
  const ctx = useContext(CodeContext);
  if (!ctx) throw new Error('useCodeContext must be used within CodeProvider');
  return ctx;
}
