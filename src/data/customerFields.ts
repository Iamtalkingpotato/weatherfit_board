// ─── CustomerStat 필드 정의 ────────────────────────────────────────────────────
// 필드 ID 드롭다운 소스. 실제 CustomerStat 객체의 키와 1:1 대응해야 필터가 동작함.

export interface CustomerFieldDef {
  id:       string;
  label:    string;
  dataType: 'number' | 'date' | 'string' | 'select';
}

export const AVAILABLE_CUSTOMER_FIELDS: CustomerFieldDef[] = [
  { id: 'gender',           label: '성별',            dataType: 'select' },
  { id: 'birthDate',        label: '생년월일',        dataType: 'date'   },
  { id: 'joinDate',         label: '가입일',          dataType: 'date'   },
  { id: 'membershipLevel',  label: '멤버십 등급',      dataType: 'select' },
  { id: 'coldSensitivity',  label: '추위 민감도',      dataType: 'number' },
  { id: 'activityLevel',    label: '활동 수준',        dataType: 'select' },
  { id: 'preferredStyle',   label: '선호 스타일',      dataType: 'select' },
  { id: 'marketingConsent', label: '마케팅 활용 동의', dataType: 'select' },
  { id: 'pushConsent',      label: '푸시 수신 동의',   dataType: 'select' },
  { id: 'emailConsent',     label: '이메일 수신 동의', dataType: 'select' },
  { id: 'smsConsent',       label: 'SMS 수신 동의',    dataType: 'select' },
  { id: 'lastLoginDate',    label: '최근 로그인일',    dataType: 'date'   },
  { id: 'dormantDays',      label: '휴면 일수',        dataType: 'number' },
  { id: 'feedbackCount',    label: '총 피드백 수',     dataType: 'number' },
  { id: 'coldFeedbackCount', label: '"춥다" 피드백 수', dataType: 'number' },
  { id: 'hotFeedbackCount', label: '"덥다" 피드백 수', dataType: 'number' },
  { id: 'purchaseCount',    label: '구매 횟수',        dataType: 'number' },
  { id: 'totalPurchaseAmount', label: '총 구매 금액',   dataType: 'number' },
  { id: 'cartCount',        label: '장바구니 횟수',    dataType: 'number' },
  { id: 'wishlistCount',    label: '찜 횟수',          dataType: 'number' },
  { id: 'wardrobeCount',          label: '옷장 총 아이템 수',  dataType: 'number' },
  { id: 'wardrobeOuterCount',     label: '옷장 아우터 수',     dataType: 'number' },
  { id: 'wardrobeTopCount',       label: '옷장 상의 수',       dataType: 'number' },
  { id: 'wardrobeBottomCount',    label: '옷장 하의 수',       dataType: 'number' },
  { id: 'wardrobeAccessoryCount', label: '옷장 악세서리 수',   dataType: 'number' },
];
