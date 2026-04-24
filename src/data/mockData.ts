// ─── Reference: Color ─────────────────────────────────────────────────────

export interface ColorCode {
  colorId: number;
  colorCode: string;
  displayName: string;
  hexCode?: string;
}

export const colorCodes: ColorCode[] = [
  { colorId:  1, colorCode: 'WHITE',  displayName: '흰색',   hexCode: '#FFFFFF' },
  { colorId:  2, colorCode: 'BLACK',  displayName: '검정',   hexCode: '#000000' },
  { colorId:  3, colorCode: 'GRAY',   displayName: '회색',   hexCode: '#9CA3AF' },
  { colorId:  4, colorCode: 'NAVY',   displayName: '네이비', hexCode: '#1E3A5F' },
  { colorId:  5, colorCode: 'BLUE',   displayName: '블루',   hexCode: '#3B82F6' },
  { colorId:  6, colorCode: 'BEIGE',  displayName: '베이지', hexCode: '#D4B896' },
  { colorId:  7, colorCode: 'KHAKI',  displayName: '카키',   hexCode: '#8B8B5A' },
  { colorId:  8, colorCode: 'RED',    displayName: '레드',   hexCode: '#EF4444' },
  { colorId:  9, colorCode: 'PINK',   displayName: '핑크',   hexCode: '#F9A8D4' },
  { colorId: 10, colorCode: 'BROWN',  displayName: '브라운', hexCode: '#92400E' },
  { colorId: 11, colorCode: 'GREEN',  displayName: '그린',   hexCode: '#10B981' },
  { colorId: 12, colorCode: 'YELLOW', displayName: '옐로우', hexCode: '#FCD34D' },
  { colorId: 13, colorCode: 'PURPLE', displayName: '퍼플',   hexCode: '#8B5CF6' },
  { colorId: 14, colorCode: 'ORANGE', displayName: '오렌지', hexCode: '#F97316' },
  { colorId: 15, colorCode: 'OTHER',  displayName: '기타' },
];

export function getColor(id: number) { return colorCodes.find(c => c.colorId === id); }

// ─── Reference: Region ────────────────────────────────────────────────────

export interface Region {
  regionId: number;
  city: string;
  district?: string;
  fullName: string;
}

export const regions: Region[] = [
  { regionId:  1, city: '서울특별시', district: '강남구',   fullName: '서울특별시 강남구' },
  { regionId:  2, city: '부산광역시', district: '해운대구', fullName: '부산광역시 해운대구' },
  { regionId:  3, city: '서울특별시', district: '마포구',   fullName: '서울특별시 마포구' },
  { regionId:  4, city: '서울특별시', district: '송파구',   fullName: '서울특별시 송파구' },
  { regionId:  5, city: '대구광역시', district: '수성구',   fullName: '대구광역시 수성구' },
  { regionId:  6, city: '서울특별시', district: '용산구',   fullName: '서울특별시 용산구' },
  { regionId:  7, city: '광주광역시', district: '서구',     fullName: '광주광역시 서구' },
  { regionId:  8, city: '대전광역시', district: '유성구',   fullName: '대전광역시 유성구' },
  { regionId:  9, city: '부산광역시', district: '부산진구', fullName: '부산광역시 부산진구' },
  { regionId: 10, city: '인천광역시', district: '연수구',   fullName: '인천광역시 연수구' },
  { regionId: 11, city: '서울특별시', district: '강서구',   fullName: '서울특별시 강서구' },
  { regionId: 12, city: '대구광역시', district: '달서구',   fullName: '대구광역시 달서구' },
  { regionId: 13, city: '서울특별시', district: '성동구',   fullName: '서울특별시 성동구' },
  { regionId: 14, city: '부산광역시', district: '수영구',   fullName: '부산광역시 수영구' },
  { regionId: 15, city: '인천광역시', district: '남동구',   fullName: '인천광역시 남동구' },
  { regionId: 16, city: '서울특별시', district: '서초구',   fullName: '서울특별시 서초구' },
  { regionId: 17, city: '경기도',     district: '성남시',   fullName: '경기도 성남시' },
  { regionId: 18, city: '서울특별시', district: '강북구',   fullName: '서울특별시 강북구' },
  { regionId: 19, city: '울산광역시', district: '남구',     fullName: '울산광역시 남구' },
  { regionId: 20, city: '경기도',     district: '수원시',   fullName: '경기도 수원시' },
];

export function getRegion(id: number) { return regions.find(r => r.regionId === id); }

// ─── Core: Customer ───────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  regionId: number;
  joinDate: string;
  membershipLevel: 'VIP' | 'GOLD' | 'SILVER' | 'NORMAL';
  coldSensitivity: number;    // -2(매우 추위탐) ~ 0(보통) ~ 2(매우 더위탐)
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  preferredStyle: 'CASUAL' | 'FORMAL' | 'SPORTY' | 'STREET' | 'MINIMAL';
  // ── CRM 실무 필드 ──────────────────────────────────────
  marketingConsent: boolean;  // 마케팅 활용 동의
  pushConsent: boolean;       // 푸시 메시지 수신 동의
  emailConsent: boolean;      // 이메일 수신 동의
  smsConsent: boolean;        // SMS 수신 동의
  dmConsent: boolean;         // DM 수신 동의
  tmConsent: boolean;         // TM 수신 동의
  lastLoginDate: string;      // 최근 로그인 일자
  dormantDays: number;        // 휴면 일수 (기준일: 2026-04-24)
  isFraud: boolean;           // 부정 사용자 여부
  joinChannel: 'APP' | 'WEB' | 'SNS' | 'OFFLINE'; // 가입 채널
  joinType: 'DIRECT' | 'REFERRAL' | 'SNS_SIGNUP';  // 가입 유형
  createdAt: string;
}

export const GENDER_LABEL: Record<string, string>     = { MALE: '남성', FEMALE: '여성' };
export const MEMBERSHIP_LABEL: Record<string, string> = { VIP: 'VIP', GOLD: '골드', SILVER: '실버', NORMAL: '일반' };
export const ACTIVITY_LABEL: Record<string, string>   = { LOW: '낮음', MEDIUM: '보통', HIGH: '높음' };
export const STYLE_LABEL: Record<string, string>      = { CASUAL: '캐주얼', FORMAL: '포멀', SPORTY: '스포티', STREET: '스트릿', MINIMAL: '미니멀' };
export const JOIN_CHANNEL_LABEL: Record<string, string> = { APP: '앱', WEB: '웹', SNS: 'SNS', OFFLINE: '오프라인' };
export const JOIN_TYPE_LABEL: Record<string, string>    = { DIRECT: '직접가입', REFERRAL: '추천인', SNS_SIGNUP: 'SNS가입' };

export const customers: Customer[] = [
  { id:'c001', name:'김지수', email:'jisu.kim@email.com',       phone:'010-1234-5678', age:26, gender:'FEMALE', regionId: 1, joinDate:'2023-03-15', membershipLevel:'VIP',    coldSensitivity:-1, activityLevel:'MEDIUM', preferredStyle:'MINIMAL',  marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:true,  tmConsent:false, lastLoginDate:'2026-04-22', dormantDays:2,   isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2023-03-15T10:00:00' },
  { id:'c002', name:'이민준', email:'minjun.lee@email.com',     phone:'010-2345-6789', age:31, gender:'MALE',   regionId: 2, joinDate:'2023-05-22', membershipLevel:'GOLD',   coldSensitivity: 1, activityLevel:'HIGH',   preferredStyle:'STREET',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:false, tmConsent:false, lastLoginDate:'2026-04-20', dormantDays:4,   isFraud:false, joinChannel:'APP',     joinType:'REFERRAL',   createdAt:'2023-05-22T09:30:00' },
  { id:'c003', name:'박서연', email:'seoyeon.park@email.com',   phone:'010-3456-7890', age:24, gender:'FEMALE', regionId: 3, joinDate:'2023-07-08', membershipLevel:'SILVER', coldSensitivity: 0, activityLevel:'MEDIUM', preferredStyle:'CASUAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-03-15', dormantDays:40,  isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2023-07-08T14:00:00' },
  { id:'c004', name:'최도현', email:'dohyun.choi@email.com',    phone:'010-4567-8901', age:29, gender:'MALE',   regionId: 4, joinDate:'2023-09-01', membershipLevel:'GOLD',   coldSensitivity:-1, activityLevel:'MEDIUM', preferredStyle:'FORMAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:false, tmConsent:false, lastLoginDate:'2026-04-18', dormantDays:6,   isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2023-09-01T11:00:00' },
  { id:'c005', name:'정하윤', email:'hayun.jung@email.com',     phone:'010-5678-9012', age:22, gender:'FEMALE', regionId: 5, joinDate:'2024-01-10', membershipLevel:'NORMAL', coldSensitivity: 2, activityLevel:'LOW',    preferredStyle:'CASUAL',   marketingConsent:false, pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-02-10', dormantDays:73,  isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2024-01-10T16:00:00' },
  { id:'c006', name:'강현우', email:'hyunwoo.kang@email.com',   phone:'010-6789-0123', age:35, gender:'MALE',   regionId: 6, joinDate:'2023-02-20', membershipLevel:'VIP',    coldSensitivity:-2, activityLevel:'HIGH',   preferredStyle:'MINIMAL',  marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:true,  tmConsent:true,  lastLoginDate:'2026-04-23', dormantDays:1,   isFraud:false, joinChannel:'SNS',     joinType:'SNS_SIGNUP', createdAt:'2023-02-20T08:00:00' },
  { id:'c007', name:'윤소희', email:'sohee.yoon@email.com',     phone:'010-7890-1234', age:27, gender:'FEMALE', regionId: 7, joinDate:'2023-11-05', membershipLevel:'SILVER', coldSensitivity: 0, activityLevel:'MEDIUM', preferredStyle:'CASUAL',   marketingConsent:true,  pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-12-20', dormantDays:125, isFraud:false, joinChannel:'APP',     joinType:'REFERRAL',   createdAt:'2023-11-05T13:00:00' },
  { id:'c008', name:'임재원', email:'jaewon.lim@email.com',     phone:'010-8901-2345', age:33, gender:'MALE',   regionId: 8, joinDate:'2024-02-14', membershipLevel:'NORMAL', coldSensitivity: 1, activityLevel:'MEDIUM', preferredStyle:'SPORTY',   marketingConsent:false, pushConsent:false, emailConsent:false, smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-11-05', dormantDays:170, isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2024-02-14T10:00:00' },
  { id:'c009', name:'한예진', email:'yejin.han@email.com',      phone:'010-9012-3456', age:28, gender:'FEMALE', regionId: 9, joinDate:'2023-06-30', membershipLevel:'GOLD',   coldSensitivity: 0, activityLevel:'HIGH',   preferredStyle:'CASUAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:false, tmConsent:false, lastLoginDate:'2026-04-10', dormantDays:14,  isFraud:false, joinChannel:'SNS',     joinType:'SNS_SIGNUP', createdAt:'2023-06-30T12:00:00' },
  { id:'c010', name:'오승민', email:'seungmin.oh@email.com',    phone:'010-0123-4567', age:30, gender:'MALE',   regionId:10, joinDate:'2023-08-15', membershipLevel:'SILVER', coldSensitivity:-1, activityLevel:'MEDIUM', preferredStyle:'STREET',   marketingConsent:true,  pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-01-20', dormantDays:94,  isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2023-08-15T09:00:00' },
  { id:'c011', name:'신유리', email:'yuri.shin@email.com',      phone:'010-1111-2222', age:23, gender:'FEMALE', regionId:11, joinDate:'2024-03-01', membershipLevel:'NORMAL', coldSensitivity: 1, activityLevel:'LOW',    preferredStyle:'CASUAL',   marketingConsent:false, pushConsent:true,  emailConsent:false, smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-10-15', dormantDays:191, isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2024-03-01T15:00:00' },
  { id:'c012', name:'배준혁', email:'junhyuk.bae@email.com',    phone:'010-2222-3333', age:32, gender:'MALE',   regionId:12, joinDate:'2023-04-10', membershipLevel:'GOLD',   coldSensitivity: 0, activityLevel:'HIGH',   preferredStyle:'CASUAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-03-20', dormantDays:35,  isFraud:false, joinChannel:'SNS',     joinType:'REFERRAL',   createdAt:'2023-04-10T10:00:00' },
  { id:'c013', name:'조미나', email:'mina.jo@email.com',        phone:'010-3333-4444', age:25, gender:'FEMALE', regionId:13, joinDate:'2023-10-20', membershipLevel:'VIP',    coldSensitivity:-1, activityLevel:'MEDIUM', preferredStyle:'FORMAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:true,  tmConsent:false, lastLoginDate:'2026-04-21', dormantDays:3,   isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2023-10-20T11:00:00' },
  { id:'c014', name:'권태양', email:'taeyang.kwon@email.com',   phone:'010-4444-5555', age:38, gender:'MALE',   regionId:14, joinDate:'2022-12-01', membershipLevel:'VIP',    coldSensitivity:-2, activityLevel:'LOW',    preferredStyle:'FORMAL',   marketingConsent:true,  pushConsent:false, emailConsent:true,  smsConsent:true,  dmConsent:true,  tmConsent:true,  lastLoginDate:'2026-04-19', dormantDays:5,   isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2022-12-01T09:00:00' },
  { id:'c015', name:'문채원', email:'chaewon.moon@email.com',   phone:'010-5555-6666', age:21, gender:'FEMALE', regionId:15, joinDate:'2024-04-05', membershipLevel:'NORMAL', coldSensitivity: 2, activityLevel:'LOW',    preferredStyle:'CASUAL',   marketingConsent:false, pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-09-08', dormantDays:228, isFraud:false, joinChannel:'SNS',     joinType:'SNS_SIGNUP', createdAt:'2024-04-05T14:00:00' },
  { id:'c016', name:'류태민', email:'taemin.ryu@email.com',     phone:'010-6666-7777', age:34, gender:'MALE',   regionId:16, joinDate:'2023-01-15', membershipLevel:'GOLD',   coldSensitivity:-1, activityLevel:'HIGH',   preferredStyle:'MINIMAL',  marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:false, tmConsent:false, lastLoginDate:'2026-04-05', dormantDays:19,  isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2023-01-15T09:00:00' },
  { id:'c017', name:'서하은', email:'haeun.seo@email.com',      phone:'010-7777-8888', age:20, gender:'FEMALE', regionId:17, joinDate:'2024-02-28', membershipLevel:'NORMAL', coldSensitivity: 1, activityLevel:'MEDIUM', preferredStyle:'STREET',   marketingConsent:true,  pushConsent:true,  emailConsent:false, smsConsent:true,  dmConsent:false, tmConsent:false, lastLoginDate:'2026-02-28', dormantDays:55,  isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2024-02-28T16:00:00' },
  { id:'c018', name:'홍민재', email:'minjae.hong@email.com',    phone:'010-8888-9999', age:36, gender:'MALE',   regionId:18, joinDate:'2022-09-10', membershipLevel:'VIP',    coldSensitivity:-2, activityLevel:'MEDIUM', preferredStyle:'FORMAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:true,  tmConsent:false, lastLoginDate:'2026-04-15', dormantDays:9,   isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2022-09-10T10:00:00' },
  { id:'c019', name:'이수아', email:'sua.lee@email.com',        phone:'010-9999-0000', age:29, gender:'FEMALE', regionId:19, joinDate:'2023-12-20', membershipLevel:'SILVER', coldSensitivity: 0, activityLevel:'HIGH',   preferredStyle:'SPORTY',   marketingConsent:false, pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-01-10', dormantDays:104, isFraud:false, joinChannel:'OFFLINE', joinType:'DIRECT',     createdAt:'2023-12-20T13:00:00' },
  { id:'c020', name:'박강준', email:'kangjun.park@email.com',   phone:'010-1010-2020', age:27, gender:'MALE',   regionId:20, joinDate:'2024-01-25', membershipLevel:'NORMAL', coldSensitivity: 0, activityLevel:'MEDIUM', preferredStyle:'CASUAL',   marketingConsent:false, pushConsent:false, emailConsent:false, smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-08-30', dormantDays:237, isFraud:true,  joinChannel:'OFFLINE', joinType:'DIRECT',     createdAt:'2024-01-25T11:00:00' },
  { id:'c021', name:'김준서', email:'junser.kim@email.com',     phone:'010-2121-3232', age:32, gender:'MALE',   regionId: 6, joinDate:'2023-06-15', membershipLevel:'VIP',    coldSensitivity:-2, activityLevel:'MEDIUM', preferredStyle:'MINIMAL',  marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:true,  tmConsent:false, lastLoginDate:'2026-04-22', dormantDays:2,   isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2023-06-15T10:00:00' },
  { id:'c022', name:'이다영', email:'dayoung.lee@email.com',    phone:'010-2223-3334', age:28, gender:'FEMALE', regionId:13, joinDate:'2023-08-20', membershipLevel:'GOLD',   coldSensitivity:-1, activityLevel:'MEDIUM', preferredStyle:'FORMAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-04-08', dormantDays:16,  isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2023-08-20T09:00:00' },
  { id:'c023', name:'박지훈', email:'jihoon.park2@email.com',   phone:'010-2324-3435', age:25, gender:'MALE',   regionId: 3, joinDate:'2024-01-05', membershipLevel:'NORMAL', coldSensitivity: 1, activityLevel:'HIGH',   preferredStyle:'CASUAL',   marketingConsent:true,  pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-03-05', dormantDays:50,  isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2024-01-05T14:00:00' },
  { id:'c024', name:'최아린', email:'arin.choi@email.com',      phone:'010-2425-3536', age:30, gender:'FEMALE', regionId: 4, joinDate:'2023-11-15', membershipLevel:'SILVER', coldSensitivity: 0, activityLevel:'MEDIUM', preferredStyle:'CASUAL',   marketingConsent:true,  pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-12-10', dormantDays:135, isFraud:false, joinChannel:'SNS',     joinType:'SNS_SIGNUP', createdAt:'2023-11-15T11:00:00' },
  { id:'c025', name:'정우성', email:'woosung.jung@email.com',   phone:'010-2526-3637', age:40, gender:'MALE',   regionId: 1, joinDate:'2022-05-10', membershipLevel:'VIP',    coldSensitivity:-2, activityLevel:'LOW',    preferredStyle:'FORMAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:true,  tmConsent:true,  lastLoginDate:'2026-04-20', dormantDays:4,   isFraud:false, joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2022-05-10T09:00:00' },
  { id:'c026', name:'강민아', email:'mina.kang2@email.com',     phone:'010-2627-3738', age:23, gender:'FEMALE', regionId: 5, joinDate:'2024-02-10', membershipLevel:'NORMAL', coldSensitivity: 2, activityLevel:'HIGH',   preferredStyle:'SPORTY',   marketingConsent:false, pushConsent:true,  emailConsent:false, smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2026-03-01', dormantDays:54,  isFraud:false, joinChannel:'APP',     joinType:'DIRECT',     createdAt:'2024-02-10T15:00:00' },
  { id:'c027', name:'윤지호', email:'jiho.yoon@email.com',      phone:'010-2728-3839', age:27, gender:'MALE',   regionId: 2, joinDate:'2023-07-25', membershipLevel:'GOLD',   coldSensitivity: 0, activityLevel:'HIGH',   preferredStyle:'STREET',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:false, tmConsent:false, lastLoginDate:'2026-04-12', dormantDays:12,  isFraud:false, joinChannel:'SNS',     joinType:'REFERRAL',   createdAt:'2023-07-25T10:00:00' },
  { id:'c028', name:'임수진', email:'sujin.lim2@email.com',     phone:'010-2829-3940', age:35, gender:'FEMALE', regionId:16, joinDate:'2023-03-05', membershipLevel:'SILVER', coldSensitivity:-1, activityLevel:'MEDIUM', preferredStyle:'MINIMAL',  marketingConsent:true,  pushConsent:false, emailConsent:true,  smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-11-20', dormantDays:155, isFraud:false, joinChannel:'APP',     joinType:'REFERRAL',   createdAt:'2023-03-05T09:00:00' },
  { id:'c029', name:'한동훈', email:'donghoon.han@email.com',   phone:'010-2930-4041', age:29, gender:'MALE',   regionId:17, joinDate:'2024-03-20', membershipLevel:'NORMAL', coldSensitivity: 1, activityLevel:'MEDIUM', preferredStyle:'CASUAL',   marketingConsent:false, pushConsent:false, emailConsent:false, smsConsent:false, dmConsent:false, tmConsent:false, lastLoginDate:'2025-07-15', dormantDays:283, isFraud:true,  joinChannel:'WEB',     joinType:'DIRECT',     createdAt:'2024-03-20T13:00:00' },
  { id:'c030', name:'오가연', email:'gayeon.oh@email.com',      phone:'010-3031-4142', age:26, gender:'FEMALE', regionId: 9, joinDate:'2023-09-15', membershipLevel:'GOLD',   coldSensitivity:-2, activityLevel:'MEDIUM', preferredStyle:'CASUAL',   marketingConsent:true,  pushConsent:true,  emailConsent:true,  smsConsent:true,  dmConsent:false, tmConsent:false, lastLoginDate:'2026-04-16', dormantDays:8,   isFraud:false, joinChannel:'SNS',     joinType:'SNS_SIGNUP', createdAt:'2023-09-15T12:00:00' },
];

// ─── Core: Product ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: 'OUTER' | 'TOP' | 'BOTTOM' | 'ACCESSORY';
  style: 'CASUAL' | 'FORMAL' | 'SPORTY' | 'STREET' | 'MINIMAL';
  colorId: number;
  warmth: number;
  price: number;
  brand?: string;
  imageUrl?: string;
  inStock: boolean;
}

export const CATEGORY_LABEL: Record<string, string> = { OUTER: '아우터', TOP: '상의', BOTTOM: '하의', ACCESSORY: '악세서리' };

export const products: Product[] = [
  { id:'prod_001', name:'오버사이즈 울 코트',   category:'OUTER',     style:'MINIMAL', colorId: 6, warmth:4, price:189000, brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_002', name:'슬림핏 슬랙스',        category:'BOTTOM',    style:'FORMAL',  colorId: 2, warmth:2, price:79000,  brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_003', name:'스트릿 후드티',         category:'TOP',       style:'STREET',  colorId: 2, warmth:3, price:59000,  brand:'WFStreet',   imageUrl:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_004', name:'카고 팬츠',             category:'BOTTOM',    style:'STREET',  colorId: 7, warmth:2, price:89000,  brand:'WFStreet',   imageUrl:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_005', name:'플로럴 원피스',         category:'BOTTOM',    style:'CASUAL',  colorId: 1, warmth:1, price:99000,  brand:'WFLady',     imageUrl:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_006', name:'린넨 셔츠',             category:'TOP',       style:'CASUAL',  colorId: 6, warmth:2, price:55000,  brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_007', name:'테일러드 자켓',         category:'OUTER',     style:'FORMAL',  colorId: 4, warmth:3, price:159000, brand:'WFFormal',   imageUrl:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_008', name:'크롭 니트',             category:'TOP',       style:'CASUAL',  colorId: 1, warmth:3, price:49000,  brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_009', name:'울 터틀넥',             category:'TOP',       style:'MINIMAL', colorId: 3, warmth:4, price:69000,  brand:'WFMinimal',  imageUrl:'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_010', name:'캐시미어 코트',         category:'OUTER',     style:'MINIMAL', colorId: 2, warmth:5, price:320000, brand:'WFPremium',  imageUrl:'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_011', name:'빈티지 데님 자켓',      category:'OUTER',     style:'CASUAL',  colorId: 5, warmth:2, price:129000, brand:'WFStreet',   imageUrl:'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_012', name:'조거 팬츠',             category:'BOTTOM',    style:'SPORTY',  colorId: 3, warmth:2, price:65000,  brand:'WFSport',    imageUrl:'https://images.unsplash.com/photo-1594938298603-c8148c4b4e79?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_013', name:'플리츠 스커트',         category:'BOTTOM',    style:'CASUAL',  colorId: 6, warmth:1, price:72000,  brand:'WFLady',     imageUrl:'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_014', name:'스트라이프 셔츠',       category:'TOP',       style:'CASUAL',  colorId: 1, warmth:2, price:58000,  brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_015', name:'워크웨어 자켓',         category:'OUTER',     style:'CASUAL',  colorId: 7, warmth:3, price:145000, brand:'WFWork',     imageUrl:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_016', name:'오버사이즈 후드',       category:'TOP',       style:'STREET',  colorId: 2, warmth:3, price:65000,  brand:'WFStreet',   imageUrl:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_017', name:'슬림핏 청바지',         category:'BOTTOM',    style:'CASUAL',  colorId: 5, warmth:2, price:89000,  brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_018', name:'실크 블라우스',         category:'TOP',       style:'FORMAL',  colorId: 1, warmth:1, price:120000, brand:'WFFormal',   imageUrl:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_019', name:'와이드 슬랙스',         category:'BOTTOM',    style:'MINIMAL', colorId: 6, warmth:2, price:95000,  brand:'WFMinimal',  imageUrl:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_020', name:'트렌치 코트',           category:'OUTER',     style:'FORMAL',  colorId: 6, warmth:4, price:280000, brand:'WFPremium',  imageUrl:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_021', name:'양털 플리스 집업',      category:'OUTER',     style:'SPORTY',  colorId: 3, warmth:4, price:98000,  brand:'WFSport',    imageUrl:'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_022', name:'머플러',                category:'ACCESSORY', style:'MINIMAL', colorId: 6, warmth:4, price:35000,  brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_023', name:'패딩 베스트',           category:'OUTER',     style:'CASUAL',  colorId: 2, warmth:4, price:112000, brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_024', name:'반팔 티셔츠',           category:'TOP',       style:'CASUAL',  colorId: 1, warmth:1, price:29000,  brand:'WFBasic',    imageUrl:'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=200&h=200&fit=crop', inStock:true  },
  { id:'prod_025', name:'숏 패딩',               category:'OUTER',     style:'CASUAL',  colorId: 2, warmth:5, price:189000, brand:'WeatherFit', imageUrl:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop', inStock:true  },
];

export function getProduct(id: string) { return products.find(p => p.id === id); }

// ─── Core: WardrobeItem ───────────────────────────────────────────────────

export interface WardrobeItem {
  id: string;
  customerId: string;
  category: 'OUTER' | 'TOP' | 'BOTTOM' | 'ACCESSORY';
  style: 'CASUAL' | 'FORMAL' | 'SPORTY' | 'STREET' | 'MINIMAL';
  colorId: number;
  warmth: 1 | 2 | 3 | 4 | 5;
  registeredDate: string;
}

export const wardrobeItems: WardrobeItem[] = [
  { id:'w001', customerId:'c001', category:'OUTER',  style:'MINIMAL', colorId: 6, warmth:4, registeredDate:'2024-01-10' },
  { id:'w002', customerId:'c001', category:'TOP',    style:'CASUAL',  colorId: 1, warmth:2, registeredDate:'2024-01-10' },
  { id:'w003', customerId:'c001', category:'BOTTOM', style:'FORMAL',  colorId: 2, warmth:2, registeredDate:'2024-01-10' },
  { id:'w004', customerId:'c001', category:'TOP',    style:'MINIMAL', colorId: 3, warmth:3, registeredDate:'2024-02-05' },
  { id:'w005', customerId:'c001', category:'OUTER',  style:'CASUAL',  colorId: 4, warmth:3, registeredDate:'2024-02-05' },
  { id:'w006', customerId:'c002', category:'TOP',    style:'STREET',  colorId: 2, warmth:3, registeredDate:'2024-01-15' },
  { id:'w007', customerId:'c002', category:'BOTTOM', style:'STREET',  colorId: 7, warmth:2, registeredDate:'2024-01-15' },
  { id:'w008', customerId:'c002', category:'OUTER',  style:'SPORTY',  colorId: 3, warmth:4, registeredDate:'2024-01-20' },
  { id:'w009', customerId:'c002', category:'TOP',    style:'CASUAL',  colorId: 1, warmth:2, registeredDate:'2024-02-10' },
  { id:'w010', customerId:'c003', category:'BOTTOM', style:'CASUAL',  colorId: 1, warmth:1, registeredDate:'2024-01-05' },
  { id:'w011', customerId:'c003', category:'TOP',    style:'CASUAL',  colorId: 6, warmth:2, registeredDate:'2024-01-05' },
  { id:'w012', customerId:'c003', category:'BOTTOM', style:'CASUAL',  colorId: 5, warmth:2, registeredDate:'2024-01-08' },
  { id:'w013', customerId:'c004', category:'OUTER',  style:'FORMAL',  colorId: 4, warmth:4, registeredDate:'2024-01-12' },
  { id:'w014', customerId:'c004', category:'TOP',    style:'FORMAL',  colorId: 1, warmth:2, registeredDate:'2024-01-12' },
  { id:'w015', customerId:'c004', category:'BOTTOM', style:'FORMAL',  colorId: 2, warmth:2, registeredDate:'2024-01-12' },
  { id:'w016', customerId:'c005', category:'TOP',    style:'CASUAL',  colorId: 1, warmth:2, registeredDate:'2024-02-01' },
  { id:'w017', customerId:'c005', category:'BOTTOM', style:'CASUAL',  colorId: 6, warmth:2, registeredDate:'2024-02-01' },
  { id:'w018', customerId:'c006', category:'OUTER',  style:'MINIMAL', colorId: 2, warmth:5, registeredDate:'2024-01-03' },
  { id:'w019', customerId:'c006', category:'TOP',    style:'MINIMAL', colorId: 3, warmth:3, registeredDate:'2024-01-03' },
  { id:'w020', customerId:'c006', category:'BOTTOM', style:'MINIMAL', colorId: 2, warmth:2, registeredDate:'2024-01-03' },
  { id:'w021', customerId:'c013', category:'OUTER',  style:'FORMAL',  colorId: 6, warmth:4, registeredDate:'2024-01-15' },
  { id:'w022', customerId:'c013', category:'TOP',    style:'FORMAL',  colorId: 1, warmth:2, registeredDate:'2024-01-15' },
  { id:'w023', customerId:'c013', category:'BOTTOM', style:'MINIMAL', colorId: 2, warmth:2, registeredDate:'2024-01-15' },
  { id:'w024', customerId:'c014', category:'OUTER',  style:'FORMAL',  colorId: 4, warmth:5, registeredDate:'2023-12-10' },
  { id:'w025', customerId:'c014', category:'TOP',    style:'CASUAL',  colorId: 1, warmth:2, registeredDate:'2023-12-10' },
  { id:'w026', customerId:'c016', category:'OUTER',  style:'MINIMAL', colorId: 2, warmth:4, registeredDate:'2024-02-01' },
  { id:'w027', customerId:'c016', category:'TOP',    style:'MINIMAL', colorId: 3, warmth:3, registeredDate:'2024-02-01' },
  { id:'w028', customerId:'c018', category:'OUTER',  style:'FORMAL',  colorId: 2, warmth:5, registeredDate:'2023-10-15' },
  { id:'w029', customerId:'c019', category:'BOTTOM', style:'SPORTY',  colorId: 2, warmth:2, registeredDate:'2024-01-20' },
  { id:'w030', customerId:'c019', category:'TOP',    style:'SPORTY',  colorId: 3, warmth:2, registeredDate:'2024-01-20' },
];

// ─── Transaction: TemperatureFeedback ─────────────────────────────────────

export interface TemperatureFeedback {
  id: string;
  customerId: string;
  regionId: number;
  feedbackDate: string;
  actualTemp: number;
  feelsLikeTemp: number;
  humidity?: number;
  windSpeed?: number;
  weatherCondition: 'CLEAR' | 'CLOUDY' | 'PARTLY_CLOUDY' | 'RAIN' | 'SNOW' | 'FOG';
  recommendedOutfit: string[];
  feedback: 'HOT' | 'COLD' | 'PERFECT';
  createdAt: string;
}

export const FEEDBACK_LABEL: Record<string, string>       = { HOT: '덥다', COLD: '춥다', PERFECT: '적당했다' };
export const WEATHER_LABEL: Record<string, string>        = { CLEAR: '맑음', CLOUDY: '흐림', PARTLY_CLOUDY: '구름많음', RAIN: '비', SNOW: '눈', FOG: '안개' };

export const temperatureFeedbacks: TemperatureFeedback[] = [
  { id:'f001', customerId:'c001', regionId: 1, feedbackDate:'2024-03-01', actualTemp: 8,  feelsLikeTemp: 5,  humidity:60, windSpeed:3.2, weatherCondition:'CLEAR',        recommendedOutfit:['코트','니트','청바지'],        feedback:'COLD',    createdAt:'2024-03-01T10:00:00' },
  { id:'f002', customerId:'c002', regionId: 2, feedbackDate:'2024-03-03', actualTemp:12,  feelsLikeTemp:10,  humidity:70, windSpeed:2.1, weatherCondition:'CLOUDY',       recommendedOutfit:['자켓','긴팔티','면바지'],      feedback:'PERFECT', createdAt:'2024-03-03T14:00:00' },
  { id:'f003', customerId:'c003', regionId: 3, feedbackDate:'2024-03-05', actualTemp:15,  feelsLikeTemp:13,  humidity:55, windSpeed:1.5, weatherCondition:'CLEAR',        recommendedOutfit:['가디건','티셔츠','슬랙스'],    feedback:'PERFECT', createdAt:'2024-03-05T11:00:00' },
  { id:'f004', customerId:'c001', regionId: 1, feedbackDate:'2024-03-08', actualTemp:18,  feelsLikeTemp:20,  humidity:45, windSpeed:0.8, weatherCondition:'CLEAR',        recommendedOutfit:['얇은 자켓','티셔츠','청바지'], feedback:'HOT',     createdAt:'2024-03-08T13:00:00' },
  { id:'f005', customerId:'c004', regionId: 4, feedbackDate:'2024-03-10', actualTemp:10,  feelsLikeTemp: 7,  humidity:85, windSpeed:4.0, weatherCondition:'RAIN',         recommendedOutfit:['우비','니트','방수바지'],      feedback:'COLD',    createdAt:'2024-03-10T09:00:00' },
  { id:'f006', customerId:'c005', regionId: 5, feedbackDate:'2024-03-12', actualTemp:20,  feelsLikeTemp:22,  humidity:40, windSpeed:1.2, weatherCondition:'CLEAR',        recommendedOutfit:['가디건','반팔','슬랙스'],      feedback:'HOT',     createdAt:'2024-03-12T15:00:00' },
  { id:'f007', customerId:'c006', regionId: 6, feedbackDate:'2024-03-14', actualTemp:16,  feelsLikeTemp:15,  humidity:65, windSpeed:2.5, weatherCondition:'CLOUDY',       recommendedOutfit:['자켓','긴팔티','면바지'],      feedback:'PERFECT', createdAt:'2024-03-14T12:00:00' },
  { id:'f008', customerId:'c007', regionId: 7, feedbackDate:'2024-03-15', actualTemp:14,  feelsLikeTemp:12,  humidity:58, windSpeed:3.0, weatherCondition:'CLEAR',        recommendedOutfit:['가디건','긴팔티','청바지'],    feedback:'COLD',    createdAt:'2024-03-15T10:00:00' },
  { id:'f009', customerId:'c002', regionId: 2, feedbackDate:'2024-03-18', actualTemp:22,  feelsLikeTemp:24,  humidity:38, windSpeed:0.5, weatherCondition:'CLEAR',        recommendedOutfit:['얇은 셔츠','반바지'],          feedback:'HOT',     createdAt:'2024-03-18T14:00:00' },
  { id:'f010', customerId:'c008', regionId: 8, feedbackDate:'2024-03-20', actualTemp:17,  feelsLikeTemp:16,  humidity:62, windSpeed:1.8, weatherCondition:'PARTLY_CLOUDY',recommendedOutfit:['자켓','티셔츠','청바지'],      feedback:'PERFECT', createdAt:'2024-03-20T11:00:00' },
  { id:'f011', customerId:'c003', regionId: 3, feedbackDate:'2024-03-22', actualTemp: 9,  feelsLikeTemp: 6,  humidity:75, windSpeed:5.0, weatherCondition:'CLOUDY',       recommendedOutfit:['코트','니트','두꺼운바지'],    feedback:'COLD',    createdAt:'2024-03-22T09:00:00' },
  { id:'f012', customerId:'c001', regionId: 1, feedbackDate:'2024-03-25', actualTemp:23,  feelsLikeTemp:25,  humidity:42, windSpeed:0.8, weatherCondition:'CLEAR',        recommendedOutfit:['얇은 자켓','반팔','면바지'],   feedback:'HOT',     createdAt:'2024-03-25T15:00:00' },
  { id:'f013', customerId:'c004', regionId: 4, feedbackDate:'2024-03-28', actualTemp:19,  feelsLikeTemp:18,  humidity:55, windSpeed:1.5, weatherCondition:'CLEAR',        recommendedOutfit:['가디건','긴팔티','청바지'],    feedback:'PERFECT', createdAt:'2024-03-28T13:00:00' },
  { id:'f014', customerId:'c005', regionId: 5, feedbackDate:'2024-04-01', actualTemp:25,  feelsLikeTemp:27,  humidity:35, windSpeed:0.5, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','반바지'],               feedback:'HOT',     createdAt:'2024-04-01T14:00:00' },
  { id:'f015', customerId:'c006', regionId: 6, feedbackDate:'2024-04-03', actualTemp:13,  feelsLikeTemp:11,  humidity:80, windSpeed:4.5, weatherCondition:'RAIN',         recommendedOutfit:['코트','니트','방수화'],        feedback:'COLD',    createdAt:'2024-04-03T10:00:00' },
  { id:'f016', customerId:'c009', regionId: 9, feedbackDate:'2024-04-05', actualTemp:21,  feelsLikeTemp:22,  humidity:48, windSpeed:1.0, weatherCondition:'CLEAR',        recommendedOutfit:['셔츠','면바지'],               feedback:'PERFECT', createdAt:'2024-04-05T12:00:00' },
  { id:'f017', customerId:'c010', regionId:10, feedbackDate:'2024-04-07', actualTemp:16,  feelsLikeTemp:14,  humidity:68, windSpeed:3.5, weatherCondition:'CLOUDY',       recommendedOutfit:['자켓','긴팔티'],               feedback:'COLD',    createdAt:'2024-04-07T09:00:00' },
  { id:'f018', customerId:'c011', regionId:11, feedbackDate:'2024-04-08', actualTemp:24,  feelsLikeTemp:26,  humidity:40, windSpeed:0.8, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','반바지'],               feedback:'HOT',     createdAt:'2024-04-08T15:00:00' },
  { id:'f019', customerId:'c012', regionId:12, feedbackDate:'2024-04-09', actualTemp:18,  feelsLikeTemp:17,  humidity:58, windSpeed:2.0, weatherCondition:'PARTLY_CLOUDY',recommendedOutfit:['가디건','긴팔티','청바지'],    feedback:'PERFECT', createdAt:'2024-04-09T11:00:00' },
  { id:'f020', customerId:'c013', regionId:13, feedbackDate:'2024-04-10', actualTemp:20,  feelsLikeTemp:19,  humidity:50, windSpeed:1.5, weatherCondition:'CLEAR',        recommendedOutfit:['얇은 자켓','반팔'],            feedback:'PERFECT', createdAt:'2024-04-10T12:00:00' },
  { id:'f021', customerId:'c001', regionId: 1, feedbackDate:'2024-04-11', actualTemp:22,  feelsLikeTemp:24,  humidity:42, windSpeed:0.8, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','면바지'],               feedback:'HOT',     createdAt:'2024-04-11T14:00:00' },
  { id:'f022', customerId:'c004', regionId: 4, feedbackDate:'2024-04-11', actualTemp:22,  feelsLikeTemp:21,  humidity:50, windSpeed:1.2, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','슬랙스'],               feedback:'PERFECT', createdAt:'2024-04-11T13:00:00' },
  { id:'f023', customerId:'c006', regionId: 6, feedbackDate:'2024-04-11', actualTemp:22,  feelsLikeTemp:20,  humidity:55, windSpeed:2.5, weatherCondition:'CLEAR',        recommendedOutfit:['자켓','반팔'],                 feedback:'COLD',    createdAt:'2024-04-11T12:00:00' },
  { id:'f024', customerId:'c009', regionId: 9, feedbackDate:'2024-04-11', actualTemp:23,  feelsLikeTemp:24,  humidity:38, windSpeed:0.8, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','반바지'],               feedback:'HOT',     createdAt:'2024-04-11T15:00:00' },
  { id:'f025', customerId:'c002', regionId: 2, feedbackDate:'2024-04-11', actualTemp:23,  feelsLikeTemp:22,  humidity:44, windSpeed:1.5, weatherCondition:'CLEAR',        recommendedOutfit:['셔츠','반바지'],               feedback:'PERFECT', createdAt:'2024-04-11T13:30:00' },
  { id:'f026', customerId:'c014', regionId:14, feedbackDate:'2024-04-12', actualTemp:19,  feelsLikeTemp:18,  humidity:62, windSpeed:2.8, weatherCondition:'CLOUDY',       recommendedOutfit:['자켓','긴팔티'],               feedback:'PERFECT', createdAt:'2024-04-12T10:00:00' },
  { id:'f027', customerId:'c005', regionId: 5, feedbackDate:'2024-04-12', actualTemp:26,  feelsLikeTemp:28,  humidity:32, windSpeed:0.5, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','반바지'],               feedback:'HOT',     createdAt:'2024-04-12T15:00:00' },
  { id:'f028', customerId:'c012', regionId:12, feedbackDate:'2024-04-12', actualTemp:26,  feelsLikeTemp:25,  humidity:36, windSpeed:0.8, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','면바지'],               feedback:'HOT',     createdAt:'2024-04-12T14:00:00' },
  { id:'f029', customerId:'c015', regionId:15, feedbackDate:'2024-04-13', actualTemp:17,  feelsLikeTemp:15,  humidity:70, windSpeed:3.5, weatherCondition:'PARTLY_CLOUDY',recommendedOutfit:['가디건','긴팔티'],             feedback:'COLD',    createdAt:'2024-04-13T09:00:00' },
  { id:'f030', customerId:'c010', regionId:10, feedbackDate:'2024-04-13', actualTemp:17,  feelsLikeTemp:16,  humidity:65, windSpeed:2.0, weatherCondition:'PARTLY_CLOUDY',recommendedOutfit:['자켓','긴팔티'],               feedback:'PERFECT', createdAt:'2024-04-13T12:00:00' },
  { id:'f031', customerId:'c016', regionId:16, feedbackDate:'2024-04-14', actualTemp:20,  feelsLikeTemp:19,  humidity:52, windSpeed:1.5, weatherCondition:'CLEAR',        recommendedOutfit:['가디건','반팔'],               feedback:'PERFECT', createdAt:'2024-04-14T11:00:00' },
  { id:'f032', customerId:'c017', regionId:17, feedbackDate:'2024-04-14', actualTemp:21,  feelsLikeTemp:23,  humidity:44, windSpeed:0.5, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','청바지'],               feedback:'HOT',     createdAt:'2024-04-14T14:00:00' },
  { id:'f033', customerId:'c018', regionId:18, feedbackDate:'2024-04-15', actualTemp:15,  feelsLikeTemp:13,  humidity:72, windSpeed:4.0, weatherCondition:'RAIN',         recommendedOutfit:['코트','우비'],                 feedback:'COLD',    createdAt:'2024-04-15T10:00:00' },
  { id:'f034', customerId:'c019', regionId:19, feedbackDate:'2024-04-15', actualTemp:19,  feelsLikeTemp:18,  humidity:55, windSpeed:2.0, weatherCondition:'CLOUDY',       recommendedOutfit:['가디건','면바지'],             feedback:'PERFECT', createdAt:'2024-04-15T13:00:00' },
  { id:'f035', customerId:'c020', regionId:20, feedbackDate:'2024-04-16', actualTemp:22,  feelsLikeTemp:21,  humidity:48, windSpeed:1.5, weatherCondition:'CLEAR',        recommendedOutfit:['반팔','청바지'],               feedback:'PERFECT', createdAt:'2024-04-16T12:00:00' },
  // ── 추가 피드백 (f036-f060): 추위 민감 고객 COLD 집중 ──────────────────
  // c001 (coldSensitivity:-1) – 봄 중반 체감 춥다
  { id:'f036', customerId:'c001', regionId: 1, feedbackDate:'2024-04-17', actualTemp:14, feelsLikeTemp:11, humidity:70, windSpeed:3.5, weatherCondition:'CLOUDY',        recommendedOutfit:['코트','니트'],         feedback:'COLD',    createdAt:'2024-04-17T09:00:00' },
  { id:'f037', customerId:'c001', regionId: 1, feedbackDate:'2024-04-20', actualTemp:16, feelsLikeTemp:14, humidity:68, windSpeed:2.8, weatherCondition:'PARTLY_CLOUDY', recommendedOutfit:['두꺼운 자켓','니트'],  feedback:'COLD',    createdAt:'2024-04-20T10:00:00' },
  // c004 (coldSensitivity:-1)
  { id:'f038', customerId:'c004', regionId: 4, feedbackDate:'2024-04-17', actualTemp:13, feelsLikeTemp:11, humidity:72, windSpeed:4.0, weatherCondition:'RAIN',          recommendedOutfit:['코트','니트'],         feedback:'COLD',    createdAt:'2024-04-17T11:00:00' },
  { id:'f039', customerId:'c004', regionId: 4, feedbackDate:'2024-04-20', actualTemp:15, feelsLikeTemp:13, humidity:65, windSpeed:3.0, weatherCondition:'CLOUDY',        recommendedOutfit:['자켓','니트'],         feedback:'COLD',    createdAt:'2024-04-20T12:00:00' },
  // c006 (coldSensitivity:-2) – 18°C도 춥게 느낌
  { id:'f040', customerId:'c006', regionId: 6, feedbackDate:'2024-04-18', actualTemp:18, feelsLikeTemp:16, humidity:55, windSpeed:2.0, weatherCondition:'PARTLY_CLOUDY', recommendedOutfit:['자켓','긴팔티'],      feedback:'COLD',    createdAt:'2024-04-18T13:00:00' },
  // c014 (coldSensitivity:-2) – 3건 COLD
  { id:'f041', customerId:'c014', regionId:14, feedbackDate:'2024-04-16', actualTemp:12, feelsLikeTemp: 9, humidity:80, windSpeed:5.0, weatherCondition:'RAIN',          recommendedOutfit:['두꺼운 코트'],        feedback:'COLD',    createdAt:'2024-04-16T09:00:00' },
  { id:'f042', customerId:'c014', regionId:14, feedbackDate:'2024-04-18', actualTemp:15, feelsLikeTemp:13, humidity:70, windSpeed:3.5, weatherCondition:'CLOUDY',        recommendedOutfit:['코트','니트'],         feedback:'COLD',    createdAt:'2024-04-18T10:00:00' },
  { id:'f043', customerId:'c014', regionId:14, feedbackDate:'2024-04-21', actualTemp:17, feelsLikeTemp:15, humidity:62, windSpeed:2.5, weatherCondition:'PARTLY_CLOUDY', recommendedOutfit:['자켓','긴팔티'],      feedback:'COLD',    createdAt:'2024-04-21T11:00:00' },
  // c016 (coldSensitivity:-1) – 2건 COLD
  { id:'f044', customerId:'c016', regionId:16, feedbackDate:'2024-04-16', actualTemp:14, feelsLikeTemp:12, humidity:75, windSpeed:4.0, weatherCondition:'RAIN',          recommendedOutfit:['코트'],               feedback:'COLD',    createdAt:'2024-04-16T10:00:00' },
  { id:'f045', customerId:'c016', regionId:16, feedbackDate:'2024-04-19', actualTemp:16, feelsLikeTemp:14, humidity:68, windSpeed:3.0, weatherCondition:'CLOUDY',        recommendedOutfit:['두꺼운 자켓'],        feedback:'COLD',    createdAt:'2024-04-19T11:00:00' },
  // c018 (coldSensitivity:-2) – 2건 추가 (기존 f033 포함 3건)
  { id:'f046', customerId:'c018', regionId:18, feedbackDate:'2024-04-17', actualTemp:16, feelsLikeTemp:14, humidity:72, windSpeed:3.5, weatherCondition:'CLOUDY',        recommendedOutfit:['두꺼운 코트'],        feedback:'COLD',    createdAt:'2024-04-17T10:00:00' },
  { id:'f047', customerId:'c018', regionId:18, feedbackDate:'2024-04-20', actualTemp:18, feelsLikeTemp:16, humidity:60, windSpeed:2.0, weatherCondition:'PARTLY_CLOUDY', recommendedOutfit:['코트','자켓'],         feedback:'COLD',    createdAt:'2024-04-20T11:00:00' },
  // c021 (coldSensitivity:-2, 신규) – 3건 COLD
  { id:'f048', customerId:'c021', regionId: 6, feedbackDate:'2024-04-14', actualTemp:13, feelsLikeTemp:10, humidity:78, windSpeed:4.5, weatherCondition:'RAIN',          recommendedOutfit:['두꺼운 코트'],        feedback:'COLD',    createdAt:'2024-04-14T09:00:00' },
  { id:'f049', customerId:'c021', regionId: 6, feedbackDate:'2024-04-17', actualTemp:15, feelsLikeTemp:13, humidity:72, windSpeed:3.5, weatherCondition:'CLOUDY',        recommendedOutfit:['코트','니트'],         feedback:'COLD',    createdAt:'2024-04-17T10:00:00' },
  { id:'f050', customerId:'c021', regionId: 6, feedbackDate:'2024-04-21', actualTemp:17, feelsLikeTemp:15, humidity:65, windSpeed:2.8, weatherCondition:'PARTLY_CLOUDY', recommendedOutfit:['자켓','니트'],         feedback:'COLD',    createdAt:'2024-04-21T11:00:00' },
  // c022 (coldSensitivity:-1, 신규) – 2건 COLD
  { id:'f051', customerId:'c022', regionId:13, feedbackDate:'2024-04-15', actualTemp:14, feelsLikeTemp:12, humidity:73, windSpeed:3.8, weatherCondition:'RAIN',          recommendedOutfit:['두꺼운 자켓'],        feedback:'COLD',    createdAt:'2024-04-15T09:00:00' },
  { id:'f052', customerId:'c022', regionId:13, feedbackDate:'2024-04-18', actualTemp:16, feelsLikeTemp:14, humidity:68, windSpeed:2.5, weatherCondition:'CLOUDY',        recommendedOutfit:['코트'],               feedback:'COLD',    createdAt:'2024-04-18T10:00:00' },
  // c025 (coldSensitivity:-2, 신규) – 3건 COLD
  { id:'f053', customerId:'c025', regionId: 1, feedbackDate:'2024-04-15', actualTemp:12, feelsLikeTemp: 9, humidity:82, windSpeed:5.0, weatherCondition:'RAIN',          recommendedOutfit:['두꺼운 코트'],        feedback:'COLD',    createdAt:'2024-04-15T10:00:00' },
  { id:'f054', customerId:'c025', regionId: 1, feedbackDate:'2024-04-18', actualTemp:14, feelsLikeTemp:11, humidity:75, windSpeed:4.0, weatherCondition:'CLOUDY',        recommendedOutfit:['코트','니트'],         feedback:'COLD',    createdAt:'2024-04-18T11:00:00' },
  { id:'f055', customerId:'c025', regionId: 1, feedbackDate:'2024-04-21', actualTemp:16, feelsLikeTemp:14, humidity:68, windSpeed:3.0, weatherCondition:'PARTLY_CLOUDY', recommendedOutfit:['자켓','니트'],         feedback:'COLD',    createdAt:'2024-04-21T12:00:00' },
  // c030 (coldSensitivity:-2, 신규) – 2건 COLD
  { id:'f056', customerId:'c030', regionId: 9, feedbackDate:'2024-04-16', actualTemp:13, feelsLikeTemp:11, humidity:76, windSpeed:4.2, weatherCondition:'RAIN',          recommendedOutfit:['두꺼운 코트'],        feedback:'COLD',    createdAt:'2024-04-16T09:00:00' },
  { id:'f057', customerId:'c030', regionId: 9, feedbackDate:'2024-04-19', actualTemp:15, feelsLikeTemp:13, humidity:70, windSpeed:3.0, weatherCondition:'CLOUDY',        recommendedOutfit:['코트'],               feedback:'COLD',    createdAt:'2024-04-19T10:00:00' },
  // 더위 민감 고객 HOT 피드백 (c005, c026)
  { id:'f058', customerId:'c005', regionId: 5, feedbackDate:'2024-04-18', actualTemp:22, feelsLikeTemp:25, humidity:35, windSpeed:0.5, weatherCondition:'CLEAR',         recommendedOutfit:['반팔','반바지'],      feedback:'HOT',     createdAt:'2024-04-18T14:00:00' },
  { id:'f059', customerId:'c026', regionId: 5, feedbackDate:'2024-04-17', actualTemp:21, feelsLikeTemp:23, humidity:38, windSpeed:0.8, weatherCondition:'CLEAR',         recommendedOutfit:['반팔'],               feedback:'HOT',     createdAt:'2024-04-17T15:00:00' },
  // 적당 피드백 (c023, c024, c027, c029)
  { id:'f060', customerId:'c023', regionId: 3, feedbackDate:'2024-04-18', actualTemp:18, feelsLikeTemp:17, humidity:55, windSpeed:1.5, weatherCondition:'PARTLY_CLOUDY', recommendedOutfit:['가디건','청바지'],    feedback:'PERFECT', createdAt:'2024-04-18T12:00:00' },
  { id:'f061', customerId:'c024', regionId: 4, feedbackDate:'2024-04-19', actualTemp:19, feelsLikeTemp:18, humidity:50, windSpeed:1.2, weatherCondition:'CLEAR',         recommendedOutfit:['가디건','슬랙스'],    feedback:'PERFECT', createdAt:'2024-04-19T11:00:00' },
  { id:'f062', customerId:'c027', regionId: 2, feedbackDate:'2024-04-17', actualTemp:20, feelsLikeTemp:19, humidity:48, windSpeed:1.0, weatherCondition:'CLEAR',         recommendedOutfit:['셔츠','면바지'],      feedback:'PERFECT', createdAt:'2024-04-17T13:00:00' },
  { id:'f063', customerId:'c029', regionId:17, feedbackDate:'2024-04-20', actualTemp:20, feelsLikeTemp:21, humidity:44, windSpeed:0.8, weatherCondition:'CLEAR',         recommendedOutfit:['반팔','청바지'],      feedback:'HOT',     createdAt:'2024-04-20T14:00:00' },
];

// ─── Transaction: PurchaseData ────────────────────────────────────────────

export interface PurchaseData {
  id: string;
  customerId: string;
  productId: string;
  status: 'PURCHASED' | 'WISHLIST' | 'CART' | 'VIEW_ONLY';
  size?: string;
  price: number;
  viewDuration?: number;
  purchaseDate: string;
  createdAt: string;
}

export const STATUS_LABEL: Record<string, string> = { PURCHASED: '구매완료', WISHLIST: '찜', CART: '장바구니', VIEW_ONLY: '조회만함' };

export const purchaseData: PurchaseData[] = [
  { id:'p001', customerId:'c001', productId:'prod_001', status:'PURCHASED', size:'M', price:189000, viewDuration:145, purchaseDate:'2024-01-15', createdAt:'2024-01-15T10:00:00' },
  { id:'p002', customerId:'c001', productId:'prod_002', status:'PURCHASED', size:'S', price: 79000, viewDuration: 88, purchaseDate:'2024-02-05', createdAt:'2024-02-05T14:00:00' },
  { id:'p003', customerId:'c002', productId:'prod_003', status:'PURCHASED', size:'L', price: 59000, viewDuration: 60, purchaseDate:'2024-01-20', createdAt:'2024-01-20T11:00:00' },
  { id:'p004', customerId:'c002', productId:'prod_004', status:'WISHLIST',            price: 89000, viewDuration:120, purchaseDate:'2024-02-12', createdAt:'2024-02-12T15:00:00' },
  { id:'p005', customerId:'c003', productId:'prod_005', status:'CART',      size:'S', price: 99000, viewDuration:200, purchaseDate:'2024-02-15', createdAt:'2024-02-15T13:00:00' },
  { id:'p006', customerId:'c003', productId:'prod_006', status:'PURCHASED', size:'M', price: 55000, viewDuration: 95, purchaseDate:'2024-02-18', createdAt:'2024-02-18T10:00:00' },
  { id:'p007', customerId:'c004', productId:'prod_007', status:'PURCHASED', size:'L', price:159000, viewDuration:180, purchaseDate:'2024-02-20', createdAt:'2024-02-20T12:00:00' },
  { id:'p008', customerId:'c005', productId:'prod_008', status:'WISHLIST',  size:'S', price: 49000, viewDuration: 75, purchaseDate:'2024-03-01', createdAt:'2024-03-01T14:00:00' },
  { id:'p009', customerId:'c006', productId:'prod_009', status:'PURCHASED', size:'L', price: 69000, viewDuration:110, purchaseDate:'2024-01-25', createdAt:'2024-01-25T09:00:00' },
  { id:'p010', customerId:'c006', productId:'prod_010', status:'PURCHASED', size:'M', price:320000, viewDuration:250, purchaseDate:'2024-02-28', createdAt:'2024-02-28T11:00:00' },
  { id:'p011', customerId:'c007', productId:'prod_011', status:'VIEW_ONLY',            price:129000, viewDuration: 45, purchaseDate:'2024-03-05', createdAt:'2024-03-05T16:00:00' },
  { id:'p012', customerId:'c008', productId:'prod_012', status:'CART',      size:'L', price: 65000, viewDuration:130, purchaseDate:'2024-03-10', createdAt:'2024-03-10T10:00:00' },
  { id:'p013', customerId:'c009', productId:'prod_013', status:'PURCHASED', size:'S', price: 72000, viewDuration:165, purchaseDate:'2024-01-18', createdAt:'2024-01-18T12:00:00' },
  { id:'p014', customerId:'c009', productId:'prod_014', status:'WISHLIST',  size:'S', price: 58000, viewDuration: 90, purchaseDate:'2024-03-15', createdAt:'2024-03-15T14:00:00' },
  { id:'p015', customerId:'c010', productId:'prod_015', status:'PURCHASED', size:'M', price:145000, viewDuration:200, purchaseDate:'2024-02-08', createdAt:'2024-02-08T10:00:00' },
  { id:'p016', customerId:'c011', productId:'prod_016', status:'PURCHASED', size:'M', price: 65000, viewDuration: 80, purchaseDate:'2024-03-20', createdAt:'2024-03-20T11:00:00' },
  { id:'p017', customerId:'c012', productId:'prod_017', status:'PURCHASED', size:'L', price: 89000, viewDuration:140, purchaseDate:'2024-02-25', createdAt:'2024-02-25T13:00:00' },
  { id:'p018', customerId:'c013', productId:'prod_018', status:'PURCHASED', size:'S', price:120000, viewDuration:220, purchaseDate:'2024-01-30', createdAt:'2024-01-30T10:00:00' },
  { id:'p019', customerId:'c013', productId:'prod_019', status:'PURCHASED', size:'S', price: 95000, viewDuration:175, purchaseDate:'2024-03-08', createdAt:'2024-03-08T14:00:00' },
  { id:'p020', customerId:'c014', productId:'prod_020', status:'PURCHASED', size:'L', price:280000, viewDuration:300, purchaseDate:'2024-02-10', createdAt:'2024-02-10T09:00:00' },
  { id:'p021', customerId:'c001', productId:'prod_014', status:'WISHLIST',  size:'S', price: 58000, viewDuration: 95, purchaseDate:'2024-03-25', createdAt:'2024-03-25T15:00:00' },
  { id:'p022', customerId:'c006', productId:'prod_009', status:'PURCHASED', size:'L', price: 69000, viewDuration:120, purchaseDate:'2024-03-12', createdAt:'2024-03-12T10:00:00' },
  { id:'p023', customerId:'c004', productId:'prod_010', status:'CART',      size:'M', price:320000, viewDuration:280, purchaseDate:'2024-04-01', createdAt:'2024-04-01T16:00:00' },
  { id:'p024', customerId:'c009', productId:'prod_001', status:'PURCHASED', size:'M', price:189000, viewDuration:190, purchaseDate:'2024-03-18', createdAt:'2024-03-18T11:00:00' },
  { id:'p025', customerId:'c013', productId:'prod_006', status:'PURCHASED', size:'S', price: 55000, viewDuration: 85, purchaseDate:'2024-04-02', createdAt:'2024-04-02T12:00:00' },
  { id:'p026', customerId:'c014', productId:'prod_002', status:'PURCHASED', size:'L', price: 79000, viewDuration:110, purchaseDate:'2024-03-22', createdAt:'2024-03-22T10:00:00' },
  { id:'p027', customerId:'c005', productId:'prod_005', status:'WISHLIST',  size:'S', price: 99000, viewDuration:160, purchaseDate:'2024-04-05', createdAt:'2024-04-05T14:00:00' },
  { id:'p028', customerId:'c011', productId:'prod_007', status:'CART',      size:'M', price:159000, viewDuration:195, purchaseDate:'2024-04-08', createdAt:'2024-04-08T16:00:00' },
  { id:'p029', customerId:'c015', productId:'prod_008', status:'PURCHASED', size:'S', price: 49000, viewDuration: 70, purchaseDate:'2024-04-10', createdAt:'2024-04-10T11:00:00' },
  { id:'p030', customerId:'c010', productId:'prod_003', status:'VIEW_ONLY',            price: 59000, viewDuration: 35, purchaseDate:'2024-04-11', createdAt:'2024-04-11T13:00:00' },
  { id:'p031', customerId:'c016', productId:'prod_021', status:'PURCHASED', size:'M', price: 98000, viewDuration:155, purchaseDate:'2024-04-05', createdAt:'2024-04-05T10:00:00' },
  { id:'p032', customerId:'c017', productId:'prod_024', status:'PURCHASED', size:'S', price: 29000, viewDuration: 45, purchaseDate:'2024-04-08', createdAt:'2024-04-08T14:00:00' },
  { id:'p033', customerId:'c018', productId:'prod_025', status:'PURCHASED', size:'L', price:189000, viewDuration:200, purchaseDate:'2024-03-28', createdAt:'2024-03-28T10:00:00' },
  { id:'p034', customerId:'c019', productId:'prod_012', status:'PURCHASED', size:'M', price: 65000, viewDuration:130, purchaseDate:'2024-04-02', createdAt:'2024-04-02T11:00:00' },
  { id:'p035', customerId:'c020', productId:'prod_022', status:'CART',                price: 35000, viewDuration: 60, purchaseDate:'2024-04-10', createdAt:'2024-04-10T15:00:00' },
  // ── 추가 구매 (p036-p055): 추위민감 고객 → 보온성↑ 상품 집중 ──────────
  // c021 (coldSensitivity:-2, VIP) – warmth 4~5 상품 3건
  { id:'p036', customerId:'c021', productId:'prod_010', status:'PURCHASED', size:'L', price:320000, viewDuration:280, purchaseDate:'2024-02-20', createdAt:'2024-02-20T10:00:00' },
  { id:'p037', customerId:'c021', productId:'prod_022', status:'PURCHASED',           price: 35000, viewDuration: 85, purchaseDate:'2024-03-05', createdAt:'2024-03-05T11:00:00' },
  { id:'p038', customerId:'c021', productId:'prod_025', status:'PURCHASED', size:'L', price:189000, viewDuration:210, purchaseDate:'2024-04-08', createdAt:'2024-04-08T12:00:00' },
  // c022 (coldSensitivity:-1, GOLD) – warmth 4 상품 2건
  { id:'p039', customerId:'c022', productId:'prod_001', status:'PURCHASED', size:'M', price:189000, viewDuration:165, purchaseDate:'2024-03-10', createdAt:'2024-03-10T10:00:00' },
  { id:'p040', customerId:'c022', productId:'prod_009', status:'PURCHASED', size:'S', price: 69000, viewDuration:120, purchaseDate:'2024-04-05', createdAt:'2024-04-05T11:00:00' },
  // c025 (coldSensitivity:-2, VIP) – warmth 4~5 상품 3건
  { id:'p041', customerId:'c025', productId:'prod_010', status:'PURCHASED', size:'L', price:320000, viewDuration:300, purchaseDate:'2024-01-10', createdAt:'2024-01-10T09:00:00' },
  { id:'p042', customerId:'c025', productId:'prod_020', status:'PURCHASED', size:'L', price:280000, viewDuration:255, purchaseDate:'2024-02-15', createdAt:'2024-02-15T10:00:00' },
  { id:'p043', customerId:'c025', productId:'prod_023', status:'PURCHASED', size:'L', price:112000, viewDuration:170, purchaseDate:'2024-03-20', createdAt:'2024-03-20T11:00:00' },
  // c030 (coldSensitivity:-2, GOLD) – 2건
  { id:'p044', customerId:'c030', productId:'prod_025', status:'PURCHASED', size:'M', price:189000, viewDuration:195, purchaseDate:'2024-03-15', createdAt:'2024-03-15T10:00:00' },
  { id:'p045', customerId:'c030', productId:'prod_001', status:'PURCHASED', size:'S', price:189000, viewDuration:175, purchaseDate:'2024-04-10', createdAt:'2024-04-10T11:00:00' },
  // 기존 추위민감 고객 추가 구매
  { id:'p046', customerId:'c006', productId:'prod_020', status:'CART',      size:'L', price:280000, viewDuration:240, purchaseDate:'2024-04-15', createdAt:'2024-04-15T14:00:00' },
  { id:'p047', customerId:'c006', productId:'prod_022', status:'PURCHASED',           price: 35000, viewDuration: 80, purchaseDate:'2024-04-12', createdAt:'2024-04-12T10:00:00' },
  { id:'p048', customerId:'c014', productId:'prod_021', status:'PURCHASED', size:'L', price: 98000, viewDuration:155, purchaseDate:'2024-04-05', createdAt:'2024-04-05T09:00:00' },
  { id:'p049', customerId:'c018', productId:'prod_022', status:'PURCHASED',           price: 35000, viewDuration: 75, purchaseDate:'2024-04-10', createdAt:'2024-04-10T10:00:00' },
  { id:'p050', customerId:'c028', productId:'prod_023', status:'PURCHASED', size:'M', price:112000, viewDuration:160, purchaseDate:'2024-04-08', createdAt:'2024-04-08T11:00:00' },
  // 신규 고객 일반 구매
  { id:'p051', customerId:'c023', productId:'prod_006', status:'PURCHASED', size:'M', price: 55000, viewDuration: 90, purchaseDate:'2024-04-05', createdAt:'2024-04-05T14:00:00' },
  { id:'p052', customerId:'c023', productId:'prod_017', status:'WISHLIST',  size:'M', price: 89000, viewDuration:130, purchaseDate:'2024-04-10', createdAt:'2024-04-10T15:00:00' },
  { id:'p053', customerId:'c024', productId:'prod_008', status:'PURCHASED', size:'S', price: 49000, viewDuration: 85, purchaseDate:'2024-04-03', createdAt:'2024-04-03T11:00:00' },
  { id:'p054', customerId:'c024', productId:'prod_013', status:'CART',      size:'S', price: 72000, viewDuration:110, purchaseDate:'2024-04-12', createdAt:'2024-04-12T16:00:00' },
  { id:'p055', customerId:'c026', productId:'prod_024', status:'PURCHASED', size:'S', price: 29000, viewDuration: 55, purchaseDate:'2024-04-08', createdAt:'2024-04-08T14:00:00' },
];

// ─── Log: BehaviorLog ─────────────────────────────────────────────────────

export interface BehaviorLog {
  id: string;
  customerId: string;
  action: 'VIEW' | 'SCROLL' | 'WISHLIST' | 'CART' | 'PURCHASE';
  pageUrl: string;
  itemId?: string;
  duration?: number;
  scrollDepth?: number;
  timestamp: string;
}

export const ACTION_LABEL: Record<string, string> = { VIEW: '조회', SCROLL: '스크롤', WISHLIST: '찜', CART: '장바구니', PURCHASE: '구매' };

export const behaviorLogs: BehaviorLog[] = [
  { id:'b001', customerId:'c001', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-13T09:15:00', duration:145, scrollDepth:80 },
  { id:'b002', customerId:'c001', action:'SCROLL',   pageUrl:'/products/outer',   timestamp:'2024-04-13T09:17:00', scrollDepth:95 },
  { id:'b003', customerId:'c001', action:'WISHLIST', pageUrl:'/products/outer',   timestamp:'2024-04-13T09:19:00', itemId:'prod_014' },
  { id:'b004', customerId:'c002', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-13T10:05:00', duration:60,  scrollDepth:50 },
  { id:'b005', customerId:'c002', action:'CART',     pageUrl:'/products/tops',    timestamp:'2024-04-13T10:07:00', itemId:'prod_003' },
  { id:'b006', customerId:'c003', action:'VIEW',     pageUrl:'/products/dress',   timestamp:'2024-04-13T11:30:00', duration:180, scrollDepth:100 },
  { id:'b007', customerId:'c003', action:'WISHLIST', pageUrl:'/products/dress',   timestamp:'2024-04-13T11:33:00', itemId:'prod_005' },
  { id:'b008', customerId:'c004', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-13T13:00:00', duration:150, scrollDepth:80 },
  { id:'b009', customerId:'c004', action:'CART',     pageUrl:'/products/outer',   timestamp:'2024-04-13T13:03:00', itemId:'prod_010' },
  { id:'b010', customerId:'c005', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-13T14:20:00', duration:45,  scrollDepth:40 },
  { id:'b011', customerId:'c006', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-13T15:10:00', duration:200, scrollDepth:100 },
  { id:'b012', customerId:'c006', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-13T15:15:00', itemId:'prod_009' },
  { id:'b013', customerId:'c007', action:'SCROLL',   pageUrl:'/products/outer',   timestamp:'2024-04-13T16:00:00', scrollDepth:60 },
  { id:'b014', customerId:'c008', action:'VIEW',     pageUrl:'/products/bottoms', timestamp:'2024-04-13T17:30:00', duration:90,  scrollDepth:70 },
  { id:'b015', customerId:'c009', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-13T18:00:00', itemId:'prod_001' },
  { id:'b016', customerId:'c010', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-13T19:10:00', duration:55,  scrollDepth:35 },
  { id:'b017', customerId:'c011', action:'CART',     pageUrl:'/products/outer',   timestamp:'2024-04-13T20:00:00', itemId:'prod_007' },
  { id:'b018', customerId:'c012', action:'VIEW',     pageUrl:'/products/bottoms', timestamp:'2024-04-13T20:30:00', duration:100, scrollDepth:75 },
  { id:'b019', customerId:'c013', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-13T21:00:00', itemId:'prod_006' },
  { id:'b020', customerId:'c014', action:'SCROLL',   pageUrl:'/products/outer',   timestamp:'2024-04-13T21:30:00', scrollDepth:90 },
  { id:'b021', customerId:'c001', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-12T10:00:00', duration:120, scrollDepth:65 },
  { id:'b022', customerId:'c002', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-12T11:00:00', duration:85,  scrollDepth:55 },
  { id:'b023', customerId:'c003', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-12T12:00:00', itemId:'prod_006' },
  { id:'b024', customerId:'c009', action:'WISHLIST', pageUrl:'/products/tops',    timestamp:'2024-04-12T13:00:00', itemId:'prod_014' },
  { id:'b025', customerId:'c013', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-12T14:00:00', itemId:'prod_019' },
  { id:'b026', customerId:'c005', action:'WISHLIST', pageUrl:'/products/dress',   timestamp:'2024-04-12T15:00:00', itemId:'prod_005' },
  { id:'b027', customerId:'c015', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-12T16:00:00', itemId:'prod_008' },
  { id:'b028', customerId:'c006', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-11T09:00:00', duration:110, scrollDepth:70 },
  { id:'b029', customerId:'c012', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-11T10:00:00', itemId:'prod_017' },
  { id:'b030', customerId:'c014', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-11T11:00:00', itemId:'prod_002' },
  { id:'b031', customerId:'c001', action:'CART',     pageUrl:'/products/tops',    timestamp:'2024-04-10T14:00:00', itemId:'prod_002' },
  { id:'b032', customerId:'c004', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-10T15:00:00', duration:200, scrollDepth:90 },
  { id:'b033', customerId:'c007', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-09T11:00:00', duration:45,  scrollDepth:30 },
  { id:'b034', customerId:'c008', action:'SCROLL',   pageUrl:'/products/bottoms', timestamp:'2024-04-09T12:00:00', scrollDepth:60 },
  { id:'b035', customerId:'c011', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-08T16:00:00', duration:75,  scrollDepth:55 },
  { id:'b036', customerId:'c015', action:'SCROLL',   pageUrl:'/products/tops',    timestamp:'2024-04-08T17:00:00', scrollDepth:45 },
  { id:'b037', customerId:'c002', action:'WISHLIST', pageUrl:'/products/bottoms', timestamp:'2024-04-07T10:00:00', itemId:'prod_004' },
  { id:'b038', customerId:'c010', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-07T11:00:00', duration:60,  scrollDepth:40 },
  { id:'b039', customerId:'c003', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-06T13:00:00', duration:95,  scrollDepth:70 },
  { id:'b040', customerId:'c013', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-05T10:00:00', duration:130, scrollDepth:85 },
  { id:'b041', customerId:'c016', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-05T11:00:00', itemId:'prod_021' },
  { id:'b042', customerId:'c017', action:'VIEW',     pageUrl:'/products/tops',    timestamp:'2024-04-08T14:00:00', duration:55,  scrollDepth:50 },
  { id:'b043', customerId:'c017', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-08T14:30:00', itemId:'prod_024' },
  { id:'b044', customerId:'c018', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-01T09:00:00', duration:200, scrollDepth:100 },
  { id:'b045', customerId:'c018', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-01T09:30:00', itemId:'prod_025' },
  { id:'b046', customerId:'c019', action:'VIEW',     pageUrl:'/products/bottoms', timestamp:'2024-04-02T10:00:00', duration:85,  scrollDepth:65 },
  { id:'b047', customerId:'c019', action:'PURCHASE', pageUrl:'/checkout',         timestamp:'2024-04-02T10:20:00', itemId:'prod_012' },
  { id:'b048', customerId:'c020', action:'VIEW',     pageUrl:'/products/outer',   timestamp:'2024-04-10T13:00:00', duration:70,  scrollDepth:50 },
  { id:'b049', customerId:'c020', action:'CART',     pageUrl:'/products/outer',   timestamp:'2024-04-10T13:10:00', itemId:'prod_022' },
  { id:'b050', customerId:'c016', action:'SCROLL',   pageUrl:'/products/outer',   timestamp:'2024-04-06T10:00:00', scrollDepth:80 },
];

// ─── Campaign ─────────────────────────────────────────────────────────────

export interface CampaignFilterCondition {
  id: string;
  fieldId: string;
  fieldLabel: string;
  dataType: "string" | "number" | "boolean" | "date" | "select";
  operator: string;
  value: string;
}

export interface Campaign {
  id: string;
  category1: string;
  category2: string;
  name: string;
  description: string;
  status: '설계중' | '시뮬레이션 완료' | '수행중' | '종료';
  startDate: string;
  endDate: string;
  graceDays: number;
  customerType: string;
  visibility: '비공개' | '모두공개' | '부서공개';
  tags: string;
  department: string;
  createdBy: string;
  createdDate: string;
  filterSubject: string;
  filterConditions: CampaignFilterCondition[];
  couponId?: string;           // 연결된 쿠폰 ID
  autoIssueCoupon?: boolean;   // 캠페인 수행 시 자동 발급
}

export const campaigns: Campaign[] = [
  {
    id: 'C260423001', category1: '조기정착', category2: '신규고객유치',
    name: '봄맞이 아우터 10% 쿠폰 발급',
    description: '봄 시즌 아우터 구매 고객에게 10% 할인 쿠폰 자동 발급. 구매 이력 2건 이하 신규 고객 대상.',
    status: '수행중', startDate: '2026-04-23', endDate: '2026-05-15', graceDays: 3,
    customerType: '개인', visibility: '모두공개', tags: '#봄 #아우터 #쿠폰 #신규',
    department: '마케팅팀', createdBy: 'admin', createdDate: '2026-04-23',
    filterSubject: 'WeatherFit_전체고객Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'age',           fieldLabel: '나이',      dataType: 'number', operator: '>=', value: '20' },
      { id: 'fc2', fieldId: 'purchaseCount', fieldLabel: '구매 횟수', dataType: 'number', operator: '<=', value: '2' },
    ],
    couponId: 'CPN001', autoIssueCoupon: true,
  },
  {
    id: 'C260420001', category1: '활성화', category2: '기존고객유지',
    name: '체감온도 5°C 이하 핫팩 무료 증정',
    description: '한파 시 앱 접속 고객에게 핫팩 1개 무료 증정. 구매 이력이 있는 골드 등급 이상 고객 우선 적용.',
    status: '시뮬레이션 완료', startDate: '2026-04-20', endDate: '2026-04-30', graceDays: 0,
    customerType: '개인', visibility: '부서공개', tags: '#한파 #핫팩 #무료증정 #골드',
    department: '마케팅팀', createdBy: 'admin', createdDate: '2026-04-20',
    filterSubject: '멤버십등급_Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'membership',    fieldLabel: '멤버십 등급', dataType: 'string', operator: 'IN', value: 'VIP,GOLD' },
      { id: 'fc2', fieldId: 'purchaseCount', fieldLabel: '구매 횟수',   dataType: 'number', operator: '>=', value: '1' },
    ],
    couponId: 'CPN007', autoIssueCoupon: true,
  },
  {
    id: 'C260418001', category1: '우수고객', category2: '기존고객유지',
    name: 'VIP·골드 봄 시즌 15% 추가할인',
    description: 'VIP·골드 등급 고객 전용 봄 시즌 추가 15% 할인 이벤트. 봄 아이템(아우터·상의) 구매 시 자동 적용.',
    status: '수행중', startDate: '2026-04-18', endDate: '2026-05-10', graceDays: 7,
    customerType: '개인', visibility: '모두공개', tags: '#VIP #골드 #추가할인 #봄시즌',
    department: '고객전략팀', createdBy: 'admin', createdDate: '2026-04-18',
    filterSubject: '멤버십등급_Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'membership', fieldLabel: '멤버십 등급', dataType: 'string', operator: 'IN', value: 'VIP,GOLD' },
    ],
    couponId: 'CPN002', autoIssueCoupon: true,
  },
  {
    id: 'C260416001', category1: '조기정착', category2: '신규고객유치',
    name: '신규 가입 웰컴 쿠폰 5%',
    description: '구매 이력 없는 2024년 이후 신규 가입 고객에게 5% 웰컴 쿠폰 자동 발급. 온보딩 전환율 향상 목적.',
    status: '수행중', startDate: '2026-04-16', endDate: '2026-06-30', graceDays: 0,
    customerType: '개인', visibility: '모두공개', tags: '#신규가입 #웰컴쿠폰 #온보딩',
    department: '마케팅팀', createdBy: 'admin', createdDate: '2026-04-16',
    filterSubject: 'WeatherFit_전체고객Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'purchaseCount', fieldLabel: '구매 횟수', dataType: 'number', operator: '=',  value: '0' },
      { id: 'fc2', fieldId: 'joinDate',      fieldLabel: '가입일',    dataType: 'date',   operator: '>=', value: '2024-01-01' },
    ],
    couponId: 'CPN003', autoIssueCoupon: true,
  },
  {
    id: 'C260413001', category1: '이탈방지', category2: '기존고객유지',
    name: '오래된 구매 고객 아우터 20% 특가',
    description: '최근 구매일이 2024년 3월 이전인 고객에게 아우터 카테고리 20% 특가 알림 발송. 재유입 유도.',
    status: '설계중', startDate: '2026-04-13', endDate: '2026-04-27', graceDays: 5,
    customerType: '개인', visibility: '비공개', tags: '#이탈방지 #재유입 #아우터특가',
    department: '고객전략팀', createdBy: 'admin', createdDate: '2026-04-13',
    filterSubject: '구매이력_Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'lastPurchaseDate', fieldLabel: '최근 구매일', dataType: 'date', operator: '<=', value: '2024-03-15' },
    ],
    couponId: 'CPN004', autoIssueCoupon: false,
  },
  {
    id: 'C260410001', category1: '활성화', category2: '기존고객유지',
    name: '캐주얼 선호 고객 개인화 15% 할인',
    description: '선호 스타일이 캐주얼이고 구매 이력이 있는 고객에게 맞춤 상품 15% 할인 쿠폰 발송.',
    status: '시뮬레이션 완료', startDate: '2026-04-10', endDate: '2026-04-24', graceDays: 0,
    customerType: '개인', visibility: '부서공개', tags: '#개인화 #캐주얼 #스타일추천 #할인',
    department: '데이터팀', createdBy: 'admin', createdDate: '2026-04-10',
    filterSubject: 'WeatherFit_전체고객Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'preferredStyle', fieldLabel: '선호 스타일', dataType: 'string', operator: '=',  value: 'CASUAL' },
      { id: 'fc2', fieldId: 'purchaseCount',  fieldLabel: '구매 횟수',   dataType: 'number', operator: '>=', value: '1' },
    ],
    couponId: 'CPN005', autoIssueCoupon: true,
  },
  {
    id: 'C260408001', category1: '재활성화', category2: '기존고객유지',
    name: '추위 민감 고객 보온 패키지 무료 증정',
    description: '추위 민감도 -1 이하이면서 "춥다" 피드백을 2회 이상 남긴 고객에게 보온 패키지(머플러+핫팩) 무료 증정. 온도 피드백 데이터 직접 활용.',
    status: '설계중', startDate: '2026-04-08', endDate: '2026-04-30', graceDays: 0,
    customerType: '개인', visibility: '비공개', tags: '#추위민감 #보온패키지 #무료증정 #피드백활용',
    department: '데이터팀', createdBy: 'admin', createdDate: '2026-04-08',
    filterSubject: '온도피드백_Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'coldSensitivity',   fieldLabel: '추위 민감도',    dataType: 'number', operator: '<=', value: '-1' },
      { id: 'fc2', fieldId: 'coldFeedbackCount', fieldLabel: '춥다 피드백 수', dataType: 'number', operator: '>=', value: '2' },
    ],
    couponId: 'CPN006', autoIssueCoupon: true,
  },
  {
    id: 'C260405001', category1: '조기정착', category2: '신규고객유치',
    name: '봄·여름 신상품 프리뷰 + 5% 얼리버드',
    description: '2024년 이후 가입 고객 중 구매 1건 이하인 고객 대상 신상품 프리뷰 + 5% 얼리버드 할인.',
    status: '종료', startDate: '2026-04-05', endDate: '2026-04-19', graceDays: 0,
    customerType: '개인', visibility: '모두공개', tags: '#신상품 #얼리버드 #봄여름',
    department: '마케팅팀', createdBy: 'admin', createdDate: '2026-04-05',
    filterSubject: 'WeatherFit_전체고객Filter',
    filterConditions: [
      { id: 'fc1', fieldId: 'joinDate',      fieldLabel: '가입일',    dataType: 'date',   operator: '>=', value: '2024-01-01' },
      { id: 'fc2', fieldId: 'purchaseCount', fieldLabel: '구매 횟수', dataType: 'number', operator: '<=', value: '1' },
    ],
    couponId: 'CPN008', autoIssueCoupon: false,
  },
];

// ─── Coupon ───────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  name: string;
  description: string;
  type: 'PERCENT' | 'FIXED';       // PERCENT: 비율 할인, FIXED: 정액 할인
  discountValue: number;            // 할인값 (% 또는 원)
  minOrderAmount: number;           // 최소 주문 금액
  maxDiscountAmount?: number;       // 최대 할인 금액 (PERCENT 전용)
  validDays: number;                // 발급 후 유효 기간 (일)
  targetCategory?: string;         // 적용 카테고리 (null = 전체)
  campaignId?: string;              // 연결된 캠페인 ID
  issuedCount: number;
  usedCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt: string;
}

export interface CustomerCoupon {
  id: string;
  customerId: string;
  couponId: string;
  issuedAt: string;
  expiredAt: string;
  usedAt?: string;
  status: 'ISSUED' | 'USED' | 'EXPIRED';
  orderId?: string;
}

export const COUPON_TYPE_LABEL: Record<string, string>            = { PERCENT: '비율(%)', FIXED: '정액(원)' };
export const COUPON_STATUS_LABEL: Record<string, string>          = { ACTIVE: '활성', INACTIVE: '비활성', EXPIRED: '만료' };
export const CUSTOMER_COUPON_STATUS_LABEL: Record<string, string> = { ISSUED: '미사용', USED: '사용완료', EXPIRED: '만료' };

export const coupons: Coupon[] = [
  { id:'CPN001', name:'봄 시즌 아우터 10% 할인',      description:'봄 시즌 아우터 카테고리 10% 할인. 봄맞이 쿠폰 발급 캠페인 연동.',               type:'PERCENT', discountValue:10, minOrderAmount:30000,  maxDiscountAmount:20000, validDays:30, targetCategory:'OUTER',     campaignId:'C260423001', issuedCount:25, usedCount: 8, status:'ACTIVE',   createdAt:'2026-04-23T10:00:00' },
  { id:'CPN002', name:'VIP·골드 15% 추가할인',         description:'VIP·골드 등급 전용 봄 시즌 15% 추가 할인쿠폰.',                              type:'PERCENT', discountValue:15, minOrderAmount:50000,  maxDiscountAmount:30000, validDays:14, targetCategory:undefined,   campaignId:'C260418001', issuedCount:15, usedCount: 9, status:'ACTIVE',   createdAt:'2026-04-18T10:00:00' },
  { id:'CPN003', name:'신규 가입 웰컴 5% 쿠폰',        description:'신규 가입 후 첫 구매 시 사용 가능한 5% 웰컴 쿠폰.',                          type:'PERCENT', discountValue: 5, minOrderAmount:10000,  maxDiscountAmount:10000, validDays: 7, targetCategory:undefined,   campaignId:'C260416001', issuedCount: 3, usedCount: 1, status:'ACTIVE',   createdAt:'2026-04-16T10:00:00' },
  { id:'CPN004', name:'아우터 2만원 정액 할인',         description:'아우터 구매 시 2만원 즉시 할인. 10만원 이상 주문 대상.',                      type:'FIXED',   discountValue:20000, minOrderAmount:100000, validDays:30,            targetCategory:'OUTER',     campaignId:'C260413001', issuedCount: 0, usedCount: 0, status:'ACTIVE',   createdAt:'2026-04-13T10:00:00' },
  { id:'CPN005', name:'캐주얼 스타일 15% 할인',         description:'캐주얼 선호 고객 전용 전 상품 15% 할인.',                                   type:'PERCENT', discountValue:15, minOrderAmount:40000,  maxDiscountAmount:25000, validDays:14, targetCategory:undefined,   campaignId:'C260410001', issuedCount: 0, usedCount: 0, status:'ACTIVE',   createdAt:'2026-04-10T10:00:00' },
  { id:'CPN006', name:'보온 패키지 3.5만원 할인',       description:'추위 민감 고객 대상 보온 패키지(머플러+핫팩) 금액 할인 쿠폰.',                type:'FIXED',   discountValue:35000, minOrderAmount:50000,  validDays: 7,            targetCategory:'ACCESSORY', campaignId:'C260408001', issuedCount: 0, usedCount: 0, status:'ACTIVE',   createdAt:'2026-04-08T10:00:00' },
  { id:'CPN007', name:'핫팩 5천원 할인',               description:'한파 시 골드 이상 고객 핫팩 구매 5천원 즉시 할인.',                          type:'FIXED',   discountValue: 5000, minOrderAmount:    0,  validDays: 5,            targetCategory:'ACCESSORY', campaignId:'C260420001', issuedCount: 7, usedCount: 4, status:'ACTIVE',   createdAt:'2026-04-20T10:00:00' },
  { id:'CPN008', name:'봄·여름 신상품 5% 얼리버드',     description:'신상품 출시 전 얼리버드 5% 할인. (종료됨)',                                type:'PERCENT', discountValue: 5, minOrderAmount:20000,  maxDiscountAmount:15000, validDays:14, targetCategory:undefined,   campaignId:'C260405001', issuedCount: 0, usedCount: 0, status:'INACTIVE', createdAt:'2026-04-05T10:00:00' },
  { id:'CPN009', name:'전 상품 10% 정기 쿠폰',          description:'월간 정기 발행 전 상품 10% 할인 쿠폰.',                                   type:'PERCENT', discountValue:10, minOrderAmount:30000,  maxDiscountAmount:20000, validDays:30, targetCategory:undefined,   campaignId:undefined,    issuedCount: 4, usedCount: 2, status:'ACTIVE',   createdAt:'2026-03-01T10:00:00' },
  { id:'CPN010', name:'상의 1만원 즉시 할인',           description:'상의 카테고리 5만원 이상 구매 시 1만원 즉시 할인.',                         type:'FIXED',   discountValue:10000, minOrderAmount:50000,  validDays:14,            targetCategory:'TOP',       campaignId:undefined,    issuedCount: 0, usedCount: 0, status:'ACTIVE',   createdAt:'2026-04-01T10:00:00' },
];

export function getCoupon(id: string) { return coupons.find(c => c.id === id); }

export const customerCoupons: CustomerCoupon[] = [
  // CPN001 봄 시즌 아우터 (발급 5건, 사용 2건)
  { id:'cc001', customerId:'c003', couponId:'CPN001', issuedAt:'2026-04-23', expiredAt:'2026-05-23', status:'USED',   usedAt:'2026-04-25', orderId:'ORD-001' },
  { id:'cc002', customerId:'c005', couponId:'CPN001', issuedAt:'2026-04-23', expiredAt:'2026-05-23', status:'USED',   usedAt:'2026-04-26', orderId:'ORD-002' },
  { id:'cc003', customerId:'c007', couponId:'CPN001', issuedAt:'2026-04-23', expiredAt:'2026-05-23', status:'ISSUED' },
  { id:'cc004', customerId:'c011', couponId:'CPN001', issuedAt:'2026-04-23', expiredAt:'2026-05-23', status:'ISSUED' },
  { id:'cc005', customerId:'c015', couponId:'CPN001', issuedAt:'2026-04-23', expiredAt:'2026-05-23', status:'ISSUED' },
  // CPN002 VIP·골드 15% (발급 6건, 사용 3건)
  { id:'cc006', customerId:'c001', couponId:'CPN002', issuedAt:'2026-04-18', expiredAt:'2026-05-02', status:'USED',   usedAt:'2026-04-20', orderId:'ORD-010' },
  { id:'cc007', customerId:'c006', couponId:'CPN002', issuedAt:'2026-04-18', expiredAt:'2026-05-02', status:'USED',   usedAt:'2026-04-21', orderId:'ORD-011' },
  { id:'cc008', customerId:'c013', couponId:'CPN002', issuedAt:'2026-04-18', expiredAt:'2026-05-02', status:'USED',   usedAt:'2026-04-22', orderId:'ORD-012' },
  { id:'cc009', customerId:'c014', couponId:'CPN002', issuedAt:'2026-04-18', expiredAt:'2026-05-02', status:'ISSUED' },
  { id:'cc010', customerId:'c021', couponId:'CPN002', issuedAt:'2026-04-18', expiredAt:'2026-05-02', status:'ISSUED' },
  { id:'cc011', customerId:'c025', couponId:'CPN002', issuedAt:'2026-04-18', expiredAt:'2026-05-02', status:'ISSUED' },
  // CPN003 웰컴 5% (발급 3건, 사용 1건)
  { id:'cc012', customerId:'c017', couponId:'CPN003', issuedAt:'2026-04-16', expiredAt:'2026-04-23', status:'USED',   usedAt:'2026-04-18', orderId:'ORD-020' },
  { id:'cc013', customerId:'c023', couponId:'CPN003', issuedAt:'2026-04-16', expiredAt:'2026-04-23', status:'EXPIRED' },
  { id:'cc014', customerId:'c026', couponId:'CPN003', issuedAt:'2026-04-16', expiredAt:'2026-04-23', status:'ISSUED' },
  // CPN007 핫팩 5천원 (발급 7건, 사용 4건)
  { id:'cc015', customerId:'c001', couponId:'CPN007', issuedAt:'2026-04-20', expiredAt:'2026-04-25', status:'USED',   usedAt:'2026-04-21', orderId:'ORD-030' },
  { id:'cc016', customerId:'c004', couponId:'CPN007', issuedAt:'2026-04-20', expiredAt:'2026-04-25', status:'USED',   usedAt:'2026-04-22', orderId:'ORD-031' },
  { id:'cc017', customerId:'c006', couponId:'CPN007', issuedAt:'2026-04-20', expiredAt:'2026-04-25', status:'USED',   usedAt:'2026-04-20', orderId:'ORD-032' },
  { id:'cc018', customerId:'c014', couponId:'CPN007', issuedAt:'2026-04-20', expiredAt:'2026-04-25', status:'USED',   usedAt:'2026-04-23', orderId:'ORD-033' },
  { id:'cc019', customerId:'c021', couponId:'CPN007', issuedAt:'2026-04-20', expiredAt:'2026-04-25', status:'ISSUED' },
  { id:'cc020', customerId:'c022', couponId:'CPN007', issuedAt:'2026-04-20', expiredAt:'2026-04-25', status:'ISSUED' },
  { id:'cc021', customerId:'c025', couponId:'CPN007', issuedAt:'2026-04-20', expiredAt:'2026-04-25', status:'ISSUED' },
  // CPN009 전 상품 10% 정기 (발급 4건, 사용 2건)
  { id:'cc022', customerId:'c009', couponId:'CPN009', issuedAt:'2026-03-01', expiredAt:'2026-03-31', status:'USED',   usedAt:'2026-03-15', orderId:'ORD-040' },
  { id:'cc023', customerId:'c012', couponId:'CPN009', issuedAt:'2026-03-01', expiredAt:'2026-03-31', status:'USED',   usedAt:'2026-03-20', orderId:'ORD-041' },
  { id:'cc024', customerId:'c016', couponId:'CPN009', issuedAt:'2026-03-01', expiredAt:'2026-03-31', status:'EXPIRED' },
  { id:'cc025', customerId:'c027', couponId:'CPN009', issuedAt:'2026-03-01', expiredAt:'2026-03-31', status:'EXPIRED' },
];

// ─── Revenue time series ──────────────────────────────────────────────────

export const revenueTimeSeries = {
  daily:   [{ date:'04-07', revenue:145000 },{ date:'04-08', revenue:94000 },{ date:'04-09', revenue:0 },{ date:'04-10', revenue:79000 },{ date:'04-11', revenue:248000 },{ date:'04-12', revenue:319000 },{ date:'04-13', revenue:388000 }],
  weekly:  [{ date:'3월2주', revenue:248000 },{ date:'3월3주', revenue:375000 },{ date:'3월4주', revenue:584000 },{ date:'4월1주', revenue:409000 },{ date:'4월2주', revenue:631000 },{ date:'4월3주', revenue:388000 }],
  monthly: [{ date:'23-11', revenue:580000 },{ date:'23-12', revenue:920000 },{ date:'24-01', revenue:1240000 },{ date:'24-02', revenue:1680000 },{ date:'24-03', revenue:1450000 },{ date:'24-04', revenue:1870000 }],
  yearly:  [{ date:'2022', revenue:8400000 },{ date:'2023', revenue:14200000 },{ date:'2024', revenue:6240000 }],
};

// ─── Aggregate helpers ────────────────────────────────────────────────────

export function getDashboardStats() {
  const purchased = purchaseData.filter(p => p.status === 'PURCHASED');
  const totalRevenue = purchased.reduce((sum, p) => sum + p.price, 0);
  return {
    totalCustomers: customers.length,
    totalFeedbacks: temperatureFeedbacks.length,
    totalPurchases: purchased.length,
    totalWishlist: purchaseData.filter(p => p.status === 'WISHLIST').length,
    totalCartItems: purchaseData.filter(p => p.status === 'CART').length,
    totalRevenue,
    avgRevenuePerCustomer: Math.round(totalRevenue / customers.length),
    conversionRate: Number(((purchased.length / purchaseData.length) * 100).toFixed(1)),
    feedbackDistribution: {
      hot:     temperatureFeedbacks.filter(f => f.feedback === 'HOT').length,
      cold:    temperatureFeedbacks.filter(f => f.feedback === 'COLD').length,
      perfect: temperatureFeedbacks.filter(f => f.feedback === 'PERFECT').length,
    },
  };
}

export function getTopProducts(limit = 10) {
  const counts: Record<string, { name: string; count: number; revenue: number; style: string; category: string; image: string }> = {};
  purchaseData.filter(p => p.status === 'PURCHASED').forEach(p => {
    const prod = getProduct(p.productId);
    if (!prod) return;
    if (!counts[prod.name]) counts[prod.name] = { name: prod.name, count: 0, revenue: 0, style: prod.style, category: prod.category, image: prod.imageUrl ?? '' };
    counts[prod.name].count++;
    counts[prod.name].revenue += p.price;
  });
  return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getTopStyles(limit = 5) {
  const counts: Record<string, number> = {};
  purchaseData.filter(p => p.status === 'PURCHASED').forEach(p => {
    const prod = getProduct(p.productId);
    if (!prod) return;
    counts[prod.style] = (counts[prod.style] || 0) + 1;
  });
  return Object.entries(counts).map(([style, count]) => ({ style, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getCustomerPreferences(customerId: string) {
  const purchases = purchaseData.filter(p => p.customerId === customerId);
  const wardrobe  = wardrobeItems.filter(w => w.customerId === customerId);

  const all = [
    ...purchases.map(p => {
      const prod = getProduct(p.productId);
      return prod ? { category: prod.category, style: prod.style, colorId: prod.colorId } : null;
    }).filter(Boolean) as { category: string; style: string; colorId: number }[],
    ...wardrobe.map(w => ({ category: w.category, style: w.style, colorId: w.colorId })),
  ];

  const tally = (items: typeof all, key: keyof typeof all[0]) => {
    const c: Record<string, number> = {};
    items.forEach(i => { const v = String(i[key]); c[v] = (c[v] || 0) + 1; });
    return Object.entries(c).sort(([, a], [, b]) => b - a).slice(0, 5);
  };

  const filterCat = (cat: string) => all.filter(i => i.category === cat);
  return {
    tops:    { styles: tally(filterCat('TOP'),    'style'), colors: tally(filterCat('TOP'),    'colorId') },
    bottoms: { styles: tally(filterCat('BOTTOM'), 'style'), colors: tally(filterCat('BOTTOM'), 'colorId') },
    outer:   { styles: tally(filterCat('OUTER'),  'style'), colors: tally(filterCat('OUTER'),  'colorId') },
    overall: { styles: tally(all, 'style'), colors: tally(all, 'colorId'), categories: tally(all, 'category') },
  };
}
