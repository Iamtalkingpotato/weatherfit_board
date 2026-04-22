export interface Customer {
  id: string; name: string; email: string; phone: string;
  age: number; gender: '남성' | '여성'; location: string;
  joinDate: string; membershipLevel: 'VIP' | '골드' | '실버' | '일반';
}
export interface TemperatureFeedback {
  id: string; customerId: string; date: string;
  actualTemp: number; feelsLikeTemp: number; weatherCondition: string;
  recommendedOutfit: string[]; feedback: '덥다' | '춥다' | '적당했다'; location: string;
}
export interface PurchaseData {
  id: string; customerId: string; productName: string; productImage: string;
  category: string; style: string; color: string; price: number;
  status: '구매완료' | '찜' | '장바구니' | '조회만함'; date: string; viewDuration?: number;
}
export interface WardrobeItem {
  id: string; customerId: string;
  category: '상의' | '하의' | '겉옷' | '원피스' | '신발' | '액세서리';
  style: string; color: string; registeredDate: string;
}
export interface BehaviorLog {
  id: string; customerId: string;
  action: 'view' | 'scroll' | 'wishlist' | 'cart' | 'purchase';
  pageUrl: string; timestamp: string; duration?: number; scrollDepth?: number; itemId?: string;
}

export const customers: Customer[] = [
  { id:'c001', name:'김지수', email:'jisu.kim@email.com', phone:'010-1234-5678', age:26, gender:'여성', location:'서울 강남구', joinDate:'2023-03-15', membershipLevel:'VIP' },
  { id:'c002', name:'이민준', email:'minjun.lee@email.com', phone:'010-2345-6789', age:31, gender:'남성', location:'부산 해운대구', joinDate:'2023-05-22', membershipLevel:'골드' },
  { id:'c003', name:'박서연', email:'seoyeon.park@email.com', phone:'010-3456-7890', age:24, gender:'여성', location:'서울 마포구', joinDate:'2023-07-08', membershipLevel:'실버' },
  { id:'c004', name:'최도현', email:'dohyun.choi@email.com', phone:'010-4567-8901', age:29, gender:'남성', location:'서울 송파구', joinDate:'2023-09-01', membershipLevel:'골드' },
  { id:'c005', name:'정하윤', email:'hayun.jung@email.com', phone:'010-5678-9012', age:22, gender:'여성', location:'대구 수성구', joinDate:'2024-01-10', membershipLevel:'일반' },
  { id:'c006', name:'강현우', email:'hyunwoo.kang@email.com', phone:'010-6789-0123', age:35, gender:'남성', location:'서울 용산구', joinDate:'2023-02-20', membershipLevel:'VIP' },
  { id:'c007', name:'윤소희', email:'sohee.yoon@email.com', phone:'010-7890-1234', age:27, gender:'여성', location:'광주 서구', joinDate:'2023-11-05', membershipLevel:'실버' },
  { id:'c008', name:'임재원', email:'jaewon.lim@email.com', phone:'010-8901-2345', age:33, gender:'남성', location:'대전 유성구', joinDate:'2024-02-14', membershipLevel:'일반' },
  { id:'c009', name:'한예진', email:'yejin.han@email.com', phone:'010-9012-3456', age:28, gender:'여성', location:'부산 부산진구', joinDate:'2023-06-30', membershipLevel:'골드' },
  { id:'c010', name:'오승민', email:'seungmin.oh@email.com', phone:'010-0123-4567', age:30, gender:'남성', location:'인천 연수구', joinDate:'2023-08-15', membershipLevel:'실버' },
  { id:'c011', name:'신유리', email:'yuri.shin@email.com', phone:'010-1111-2222', age:23, gender:'여성', location:'서울 강서구', joinDate:'2024-03-01', membershipLevel:'일반' },
  { id:'c012', name:'배준혁', email:'junhyuk.bae@email.com', phone:'010-2222-3333', age:32, gender:'남성', location:'대구 달서구', joinDate:'2023-04-10', membershipLevel:'골드' },
  { id:'c013', name:'조미나', email:'mina.jo@email.com', phone:'010-3333-4444', age:25, gender:'여성', location:'서울 성동구', joinDate:'2023-10-20', membershipLevel:'VIP' },
  { id:'c014', name:'권태양', email:'taeyang.kwon@email.com', phone:'010-4444-5555', age:38, gender:'남성', location:'부산 수영구', joinDate:'2022-12-01', membershipLevel:'VIP' },
  { id:'c015', name:'문채원', email:'chaewon.moon@email.com', phone:'010-5555-6666', age:21, gender:'여성', location:'인천 남동구', joinDate:'2024-04-05', membershipLevel:'일반' },
];

export const wardrobeItems: WardrobeItem[] = [
  { id:'w001', customerId:'c001', category:'겉옷', style:'미니멀', color:'베이지', registeredDate:'2024-01-10' },
  { id:'w002', customerId:'c001', category:'상의', style:'캐주얼', color:'화이트', registeredDate:'2024-01-10' },
  { id:'w003', customerId:'c001', category:'하의', style:'포멀', color:'블랙', registeredDate:'2024-01-10' },
  { id:'w004', customerId:'c001', category:'상의', style:'미니멀', color:'그레이', registeredDate:'2024-02-05' },
  { id:'w005', customerId:'c001', category:'겉옷', style:'캐주얼', color:'네이비', registeredDate:'2024-02-05' },
  { id:'w006', customerId:'c002', category:'상의', style:'스트릿', color:'블랙', registeredDate:'2024-01-15' },
  { id:'w007', customerId:'c002', category:'하의', style:'스트릿', color:'카키', registeredDate:'2024-01-15' },
  { id:'w008', customerId:'c002', category:'겉옷', style:'스포티', color:'그레이', registeredDate:'2024-01-20' },
  { id:'w009', customerId:'c002', category:'상의', style:'캐주얼', color:'화이트', registeredDate:'2024-02-10' },
  { id:'w010', customerId:'c003', category:'원피스', style:'캐주얼', color:'화이트', registeredDate:'2024-01-05' },
  { id:'w011', customerId:'c003', category:'상의', style:'캐주얼', color:'베이지', registeredDate:'2024-01-05' },
  { id:'w012', customerId:'c003', category:'하의', style:'캐주얼', color:'블루', registeredDate:'2024-01-08' },
  { id:'w013', customerId:'c004', category:'겉옷', style:'포멀', color:'네이비', registeredDate:'2024-01-12' },
  { id:'w014', customerId:'c004', category:'상의', style:'포멀', color:'화이트', registeredDate:'2024-01-12' },
  { id:'w015', customerId:'c004', category:'하의', style:'포멀', color:'블랙', registeredDate:'2024-01-12' },
  { id:'w016', customerId:'c005', category:'상의', style:'캐주얼', color:'화이트', registeredDate:'2024-02-01' },
  { id:'w017', customerId:'c005', category:'하의', style:'캐주얼', color:'베이지', registeredDate:'2024-02-01' },
  { id:'w018', customerId:'c006', category:'겉옷', style:'미니멀', color:'블랙', registeredDate:'2024-01-03' },
  { id:'w019', customerId:'c006', category:'상의', style:'미니멀', color:'그레이', registeredDate:'2024-01-03' },
  { id:'w020', customerId:'c006', category:'하의', style:'미니멀', color:'블랙', registeredDate:'2024-01-03' },
  { id:'w021', customerId:'c013', category:'겉옷', style:'포멀', color:'베이지', registeredDate:'2024-01-15' },
  { id:'w022', customerId:'c013', category:'상의', style:'포멀', color:'화이트', registeredDate:'2024-01-15' },
  { id:'w023', customerId:'c013', category:'하의', style:'미니멀', color:'블랙', registeredDate:'2024-01-15' },
  { id:'w024', customerId:'c014', category:'겉옷', style:'포멀', color:'네이비', registeredDate:'2023-12-10' },
  { id:'w025', customerId:'c014', category:'상의', style:'캐주얼', color:'화이트', registeredDate:'2023-12-10' },
];

export const temperatureFeedbacks: TemperatureFeedback[] = [
  { id:'f001', customerId:'c001', date:'2024-03-01', actualTemp:8,  feelsLikeTemp:5,  weatherCondition:'맑음', recommendedOutfit:['코트','니트','청바지'],       feedback:'춥다',    location:'서울 강남구' },
  { id:'f002', customerId:'c002', date:'2024-03-03', actualTemp:12, feelsLikeTemp:10, weatherCondition:'흐림', recommendedOutfit:['자켓','긴팔티','면바지'],     feedback:'적당했다', location:'부산 해운대구' },
  { id:'f003', customerId:'c003', date:'2024-03-05', actualTemp:15, feelsLikeTemp:13, weatherCondition:'맑음', recommendedOutfit:['가디건','티셔츠','슬랙스'],   feedback:'적당했다', location:'서울 마포구' },
  { id:'f004', customerId:'c001', date:'2024-03-08', actualTemp:18, feelsLikeTemp:20, weatherCondition:'맑음', recommendedOutfit:['얇은 자켓','티셔츠','청바지'],feedback:'덥다',    location:'서울 강남구' },
  { id:'f005', customerId:'c004', date:'2024-03-10', actualTemp:10, feelsLikeTemp:7,  weatherCondition:'비',   recommendedOutfit:['우비','니트','방수바지'],     feedback:'춥다',    location:'서울 송파구' },
  { id:'f006', customerId:'c005', date:'2024-03-12', actualTemp:20, feelsLikeTemp:22, weatherCondition:'맑음', recommendedOutfit:['가디건','반팔','슬랙스'],     feedback:'덥다',    location:'대구 수성구' },
  { id:'f007', customerId:'c006', date:'2024-03-14', actualTemp:16, feelsLikeTemp:15, weatherCondition:'흐림', recommendedOutfit:['자켓','긴팔티','면바지'],     feedback:'적당했다', location:'서울 용산구' },
  { id:'f008', customerId:'c007', date:'2024-03-15', actualTemp:14, feelsLikeTemp:12, weatherCondition:'맑음', recommendedOutfit:['가디건','긴팔티','청바지'],   feedback:'춥다',    location:'광주 서구' },
  { id:'f009', customerId:'c002', date:'2024-03-18', actualTemp:22, feelsLikeTemp:24, weatherCondition:'맑음', recommendedOutfit:['얇은 셔츠','반바지'],         feedback:'덥다',    location:'부산 해운대구' },
  { id:'f010', customerId:'c008', date:'2024-03-20', actualTemp:17, feelsLikeTemp:16, weatherCondition:'구름', recommendedOutfit:['자켓','티셔츠','청바지'],     feedback:'적당했다', location:'대전 유성구' },
  { id:'f011', customerId:'c003', date:'2024-03-22', actualTemp:9,  feelsLikeTemp:6,  weatherCondition:'흐림', recommendedOutfit:['코트','니트','두꺼운바지'],   feedback:'춥다',    location:'서울 마포구' },
  { id:'f012', customerId:'c001', date:'2024-03-25', actualTemp:23, feelsLikeTemp:25, weatherCondition:'맑음', recommendedOutfit:['얇은 자켓','반팔','면바지'],  feedback:'덥다',    location:'서울 강남구' },
  { id:'f013', customerId:'c004', date:'2024-03-28', actualTemp:19, feelsLikeTemp:18, weatherCondition:'맑음', recommendedOutfit:['가디건','긴팔티','청바지'],   feedback:'적당했다', location:'서울 송파구' },
  { id:'f014', customerId:'c005', date:'2024-04-01', actualTemp:25, feelsLikeTemp:27, weatherCondition:'맑음', recommendedOutfit:['반팔','반바지'],              feedback:'덥다',    location:'대구 수성구' },
  { id:'f015', customerId:'c006', date:'2024-04-03', actualTemp:13, feelsLikeTemp:11, weatherCondition:'비',   recommendedOutfit:['코트','니트','방수화'],       feedback:'춥다',    location:'서울 용산구' },
  { id:'f016', customerId:'c009', date:'2024-04-05', actualTemp:21, feelsLikeTemp:22, weatherCondition:'맑음', recommendedOutfit:['셔츠','면바지'],              feedback:'적당했다', location:'부산 부산진구' },
  { id:'f017', customerId:'c010', date:'2024-04-07', actualTemp:16, feelsLikeTemp:14, weatherCondition:'흐림', recommendedOutfit:['자켓','긴팔티'],              feedback:'춥다',    location:'인천 연수구' },
  { id:'f018', customerId:'c011', date:'2024-04-08', actualTemp:24, feelsLikeTemp:26, weatherCondition:'맑음', recommendedOutfit:['반팔','반바지'],              feedback:'덥다',    location:'서울 강서구' },
  { id:'f019', customerId:'c012', date:'2024-04-09', actualTemp:18, feelsLikeTemp:17, weatherCondition:'구름', recommendedOutfit:['가디건','긴팔티','청바지'],   feedback:'적당했다', location:'대구 달서구' },
  { id:'f020', customerId:'c013', date:'2024-04-10', actualTemp:20, feelsLikeTemp:19, weatherCondition:'맑음', recommendedOutfit:['얇은 자켓','반팔'],           feedback:'적당했다', location:'서울 성동구' },
  { id:'f021', customerId:'c001', date:'2024-04-11', actualTemp:22, feelsLikeTemp:24, weatherCondition:'맑음', recommendedOutfit:['반팔','면바지'],              feedback:'덥다',    location:'서울 강남구' },
  { id:'f022', customerId:'c004', date:'2024-04-11', actualTemp:22, feelsLikeTemp:21, weatherCondition:'맑음', recommendedOutfit:['반팔','슬랙스'],              feedback:'적당했다', location:'서울 송파구' },
  { id:'f023', customerId:'c006', date:'2024-04-11', actualTemp:22, feelsLikeTemp:20, weatherCondition:'맑음', recommendedOutfit:['자켓','반팔'],               feedback:'춥다',    location:'서울 용산구' },
  { id:'f024', customerId:'c009', date:'2024-04-11', actualTemp:23, feelsLikeTemp:24, weatherCondition:'맑음', recommendedOutfit:['반팔','반바지'],              feedback:'덥다',    location:'부산 부산진구' },
  { id:'f025', customerId:'c002', date:'2024-04-11', actualTemp:23, feelsLikeTemp:22, weatherCondition:'맑음', recommendedOutfit:['셔츠','반바지'],              feedback:'적당했다', location:'부산 해운대구' },
  { id:'f026', customerId:'c014', date:'2024-04-12', actualTemp:19, feelsLikeTemp:18, weatherCondition:'흐림', recommendedOutfit:['자켓','긴팔티'],              feedback:'적당했다', location:'부산 수영구' },
  { id:'f027', customerId:'c005', date:'2024-04-12', actualTemp:26, feelsLikeTemp:28, weatherCondition:'맑음', recommendedOutfit:['반팔','반바지'],              feedback:'덥다',    location:'대구 수성구' },
  { id:'f028', customerId:'c012', date:'2024-04-12', actualTemp:26, feelsLikeTemp:25, weatherCondition:'맑음', recommendedOutfit:['반팔','면바지'],              feedback:'덥다',    location:'대구 달서구' },
  { id:'f029', customerId:'c015', date:'2024-04-13', actualTemp:17, feelsLikeTemp:15, weatherCondition:'구름', recommendedOutfit:['가디건','긴팔티'],            feedback:'춥다',    location:'인천 남동구' },
  { id:'f030', customerId:'c010', date:'2024-04-13', actualTemp:17, feelsLikeTemp:16, weatherCondition:'구름', recommendedOutfit:['자켓','긴팔티'],              feedback:'적당했다', location:'인천 연수구' },
];

export const purchaseData: PurchaseData[] = [
  { id:'p001', customerId:'c001', productName:'오버사이즈 울 코트', productImage:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&h=200&fit=crop', category:'아우터', style:'미니멀', color:'베이지', price:189000, status:'구매완료', date:'2024-01-15', viewDuration:145 },
  { id:'p002', customerId:'c001', productName:'슬림핏 슬랙스', productImage:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=200&fit=crop', category:'하의', style:'포멀', color:'블랙', price:79000, status:'구매완료', date:'2024-02-05', viewDuration:88 },
  { id:'p003', customerId:'c002', productName:'스트릿 후드티', productImage:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop', category:'상의', style:'스트릿', color:'블랙', price:59000, status:'구매완료', date:'2024-01-20', viewDuration:60 },
  { id:'p004', customerId:'c002', productName:'카고 팬츠', productImage:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop', category:'하의', style:'스트릿', color:'카키', price:89000, status:'찜', date:'2024-02-12', viewDuration:120 },
  { id:'p005', customerId:'c003', productName:'플로럴 원피스', productImage:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category:'원피스', style:'캐주얼', color:'화이트', price:99000, status:'장바구니', date:'2024-02-15', viewDuration:200 },
  { id:'p006', customerId:'c003', productName:'린넨 셔츠', productImage:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', category:'상의', style:'캐주얼', color:'베이지', price:55000, status:'구매완료', date:'2024-02-18', viewDuration:95 },
  { id:'p007', customerId:'c004', productName:'테일러드 자켓', productImage:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop', category:'아우터', style:'포멀', color:'네이비', price:159000, status:'구매완료', date:'2024-02-20', viewDuration:180 },
  { id:'p008', customerId:'c005', productName:'크롭 니트', productImage:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop', category:'상의', style:'캐주얼', color:'화이트', price:49000, status:'찜', date:'2024-03-01', viewDuration:75 },
  { id:'p009', customerId:'c006', productName:'울 터틀넥', productImage:'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=200&h=200&fit=crop', category:'상의', style:'미니멀', color:'그레이', price:69000, status:'구매완료', date:'2024-01-25', viewDuration:110 },
  { id:'p010', customerId:'c006', productName:'캐시미어 코트', productImage:'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=200&h=200&fit=crop', category:'아우터', style:'미니멀', color:'블랙', price:320000, status:'구매완료', date:'2024-02-28', viewDuration:250 },
  { id:'p011', customerId:'c007', productName:'빈티지 데님 자켓', productImage:'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=200&h=200&fit=crop', category:'아우터', style:'빈티지', color:'블루', price:129000, status:'조회만함', date:'2024-03-05', viewDuration:45 },
  { id:'p012', customerId:'c008', productName:'조거 팬츠', productImage:'https://images.unsplash.com/photo-1594938298603-c8148c4b4e79?w=200&h=200&fit=crop', category:'하의', style:'스포티', color:'그레이', price:65000, status:'장바구니', date:'2024-03-10', viewDuration:130 },
  { id:'p013', customerId:'c009', productName:'플리츠 스커트', productImage:'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200&h=200&fit=crop', category:'하의', style:'캐주얼', color:'베이지', price:72000, status:'구매완료', date:'2024-01-18', viewDuration:165 },
  { id:'p014', customerId:'c009', productName:'스트라이프 셔츠', productImage:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', category:'상의', style:'캐주얼', color:'화이트', price:58000, status:'찜', date:'2024-03-15', viewDuration:90 },
  { id:'p015', customerId:'c010', productName:'워크웨어 자켓', productImage:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop', category:'아우터', style:'빈티지', color:'카키', price:145000, status:'구매완료', date:'2024-02-08', viewDuration:200 },
  { id:'p016', customerId:'c011', productName:'오버사이즈 후드', productImage:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop', category:'상의', style:'스트릿', color:'블랙', price:65000, status:'구매완료', date:'2024-03-20', viewDuration:80 },
  { id:'p017', customerId:'c012', productName:'슬림핏 청바지', productImage:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop', category:'하의', style:'캐주얼', color:'블루', price:89000, status:'구매완료', date:'2024-02-25', viewDuration:140 },
  { id:'p018', customerId:'c013', productName:'실크 블라우스', productImage:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', category:'상의', style:'포멀', color:'화이트', price:120000, status:'구매완료', date:'2024-01-30', viewDuration:220 },
  { id:'p019', customerId:'c013', productName:'와이드 슬랙스', productImage:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=200&fit=crop', category:'하의', style:'미니멀', color:'베이지', price:95000, status:'구매완료', date:'2024-03-08', viewDuration:175 },
  { id:'p020', customerId:'c014', productName:'트렌치 코트', productImage:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&h=200&fit=crop', category:'아우터', style:'포멀', color:'베이지', price:280000, status:'구매완료', date:'2024-02-10', viewDuration:300 },
  { id:'p021', customerId:'c001', productName:'스트라이프 셔츠', productImage:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', category:'상의', style:'캐주얼', color:'화이트', price:58000, status:'찜', date:'2024-03-25', viewDuration:95 },
  { id:'p022', customerId:'c006', productName:'울 터틀넥', productImage:'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=200&h=200&fit=crop', category:'상의', style:'미니멀', color:'블랙', price:69000, status:'구매완료', date:'2024-03-12', viewDuration:120 },
  { id:'p023', customerId:'c004', productName:'캐시미어 코트', productImage:'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=200&h=200&fit=crop', category:'아우터', style:'미니멀', color:'그레이', price:320000, status:'장바구니', date:'2024-04-01', viewDuration:280 },
  { id:'p024', customerId:'c009', productName:'오버사이즈 울 코트', productImage:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&h=200&fit=crop', category:'아우터', style:'미니멀', color:'블랙', price:189000, status:'구매완료', date:'2024-03-18', viewDuration:190 },
  { id:'p025', customerId:'c013', productName:'린넨 셔츠', productImage:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop', category:'상의', style:'캐주얼', color:'베이지', price:55000, status:'구매완료', date:'2024-04-02', viewDuration:85 },
  { id:'p026', customerId:'c014', productName:'슬림핏 슬랙스', productImage:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=200&fit=crop', category:'하의', style:'포멀', color:'네이비', price:79000, status:'구매완료', date:'2024-03-22', viewDuration:110 },
  { id:'p027', customerId:'c005', productName:'플로럴 원피스', productImage:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category:'원피스', style:'캐주얼', color:'화이트', price:99000, status:'찜', date:'2024-04-05', viewDuration:160 },
  { id:'p028', customerId:'c011', productName:'테일러드 자켓', productImage:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop', category:'아우터', style:'포멀', color:'블랙', price:159000, status:'장바구니', date:'2024-04-08', viewDuration:195 },
  { id:'p029', customerId:'c015', productName:'크롭 니트', productImage:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop', category:'상의', style:'캐주얼', color:'베이지', price:49000, status:'구매완료', date:'2024-04-10', viewDuration:70 },
  { id:'p030', customerId:'c010', productName:'스트릿 후드티', productImage:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop', category:'상의', style:'스트릿', color:'그레이', price:59000, status:'조회만함', date:'2024-04-11', viewDuration:35 },
];

export const behaviorLogs: BehaviorLog[] = [
  { id:'b001', customerId:'c001', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-13T09:15:00', duration:145, scrollDepth:80 },
  { id:'b002', customerId:'c001', action:'scroll',   pageUrl:'/products/outer',   timestamp:'2024-04-13T09:17:00', scrollDepth:95 },
  { id:'b003', customerId:'c001', action:'wishlist', pageUrl:'/products/outer',   timestamp:'2024-04-13T09:19:00', itemId:'p021' },
  { id:'b004', customerId:'c002', action:'view',     pageUrl:'/products/tops',    timestamp:'2024-04-13T10:05:00', duration:60, scrollDepth:50 },
  { id:'b005', customerId:'c002', action:'cart',     pageUrl:'/products/tops',    timestamp:'2024-04-13T10:07:00', itemId:'p003' },
  { id:'b006', customerId:'c003', action:'view',     pageUrl:'/products/dress',   timestamp:'2024-04-13T11:30:00', duration:180, scrollDepth:100 },
  { id:'b007', customerId:'c003', action:'wishlist', pageUrl:'/products/dress',   timestamp:'2024-04-13T11:33:00', itemId:'p005' },
  { id:'b008', customerId:'c004', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-13T13:00:00', duration:150, scrollDepth:80 },
  { id:'b009', customerId:'c004', action:'cart',     pageUrl:'/products/outer',   timestamp:'2024-04-13T13:03:00', itemId:'p023' },
  { id:'b010', customerId:'c005', action:'view',     pageUrl:'/products/tops',    timestamp:'2024-04-13T14:20:00', duration:45, scrollDepth:40 },
  { id:'b011', customerId:'c006', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-13T15:10:00', duration:200, scrollDepth:100 },
  { id:'b012', customerId:'c006', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-13T15:15:00', itemId:'p022' },
  { id:'b013', customerId:'c007', action:'scroll',   pageUrl:'/products/outer',   timestamp:'2024-04-13T16:00:00', scrollDepth:60 },
  { id:'b014', customerId:'c008', action:'view',     pageUrl:'/products/bottoms', timestamp:'2024-04-13T17:30:00', duration:90, scrollDepth:70 },
  { id:'b015', customerId:'c009', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-13T18:00:00', itemId:'p024' },
  { id:'b016', customerId:'c010', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-13T19:10:00', duration:55, scrollDepth:35 },
  { id:'b017', customerId:'c011', action:'cart',     pageUrl:'/products/outer',   timestamp:'2024-04-13T20:00:00', itemId:'p028' },
  { id:'b018', customerId:'c012', action:'view',     pageUrl:'/products/bottoms', timestamp:'2024-04-13T20:30:00', duration:100, scrollDepth:75 },
  { id:'b019', customerId:'c013', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-13T21:00:00', itemId:'p025' },
  { id:'b020', customerId:'c014', action:'scroll',   pageUrl:'/products/outer',   timestamp:'2024-04-13T21:30:00', scrollDepth:90 },
  { id:'b021', customerId:'c001', action:'view',     pageUrl:'/products/tops',    timestamp:'2024-04-12T10:00:00', duration:120, scrollDepth:65 },
  { id:'b022', customerId:'c002', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-12T11:00:00', duration:85, scrollDepth:55 },
  { id:'b023', customerId:'c003', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-12T12:00:00', itemId:'p006' },
  { id:'b024', customerId:'c009', action:'wishlist', pageUrl:'/products/tops',    timestamp:'2024-04-12T13:00:00', itemId:'p014' },
  { id:'b025', customerId:'c013', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-12T14:00:00', itemId:'p019' },
  { id:'b026', customerId:'c005', action:'wishlist', pageUrl:'/products/dress',   timestamp:'2024-04-12T15:00:00', itemId:'p027' },
  { id:'b027', customerId:'c015', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-12T16:00:00', itemId:'p029' },
  { id:'b028', customerId:'c006', action:'view',     pageUrl:'/products/tops',    timestamp:'2024-04-11T09:00:00', duration:110, scrollDepth:70 },
  { id:'b029', customerId:'c012', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-11T10:00:00', itemId:'p017' },
  { id:'b030', customerId:'c014', action:'purchase', pageUrl:'/checkout',         timestamp:'2024-04-11T11:00:00', itemId:'p026' },
  { id:'b031', customerId:'c001', action:'cart',     pageUrl:'/products/tops',    timestamp:'2024-04-10T14:00:00', itemId:'p002' },
  { id:'b032', customerId:'c004', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-10T15:00:00', duration:200, scrollDepth:90 },
  { id:'b033', customerId:'c007', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-09T11:00:00', duration:45, scrollDepth:30 },
  { id:'b034', customerId:'c008', action:'scroll',   pageUrl:'/products/bottoms', timestamp:'2024-04-09T12:00:00', scrollDepth:60 },
  { id:'b035', customerId:'c011', action:'view',     pageUrl:'/products/tops',    timestamp:'2024-04-08T16:00:00', duration:75, scrollDepth:55 },
  { id:'b036', customerId:'c015', action:'scroll',   pageUrl:'/products/tops',    timestamp:'2024-04-08T17:00:00', scrollDepth:45 },
  { id:'b037', customerId:'c002', action:'wishlist', pageUrl:'/products/bottoms', timestamp:'2024-04-07T10:00:00', itemId:'p004' },
  { id:'b038', customerId:'c010', action:'view',     pageUrl:'/products/outer',   timestamp:'2024-04-07T11:00:00', duration:60, scrollDepth:40 },
  { id:'b039', customerId:'c003', action:'view',     pageUrl:'/products/tops',    timestamp:'2024-04-06T13:00:00', duration:95, scrollDepth:70 },
  { id:'b040', customerId:'c013', action:'view',     pageUrl:'/products/tops',    timestamp:'2024-04-05T10:00:00', duration:130, scrollDepth:85 },
];

export const revenueTimeSeries = {
  daily:   [{ date:'04-07', revenue:145000 },{ date:'04-08', revenue:65000 },{ date:'04-09', revenue:0 },{ date:'04-10', revenue:79000 },{ date:'04-11', revenue:248000 },{ date:'04-12', revenue:243000 },{ date:'04-13', revenue:388000 }],
  weekly:  [{ date:'3월2주', revenue:248000 },{ date:'3월3주', revenue:375000 },{ date:'3월4주', revenue:584000 },{ date:'4월1주', revenue:409000 },{ date:'4월2주', revenue:631000 },{ date:'4월3주', revenue:388000 }],
  monthly: [{ date:'23-11', revenue:580000 },{ date:'23-12', revenue:920000 },{ date:'24-01', revenue:1240000 },{ date:'24-02', revenue:1680000 },{ date:'24-03', revenue:1450000 },{ date:'24-04', revenue:1870000 }],
  yearly:  [{ date:'2022', revenue:8400000 },{ date:'2023', revenue:14200000 },{ date:'2024', revenue:6240000 }],
};

export function getDashboardStats() {
  const purchased = purchaseData.filter(p => p.status === '구매완료');
  const totalRevenue = purchased.reduce((sum, p) => sum + p.price, 0);
  return {
    totalCustomers: customers.length,
    totalFeedbacks: temperatureFeedbacks.length,
    totalPurchases: purchased.length,
    totalWishlist: purchaseData.filter(p => p.status === '찜').length,
    totalCartItems: purchaseData.filter(p => p.status === '장바구니').length,
    totalRevenue,
    avgRevenuePerCustomer: Math.round(totalRevenue / customers.length),
    conversionRate: Number(((purchased.length / purchaseData.length) * 100).toFixed(1)),
    feedbackDistribution: {
      hot: temperatureFeedbacks.filter(f => f.feedback === '덥다').length,
      cold: temperatureFeedbacks.filter(f => f.feedback === '춥다').length,
      perfect: temperatureFeedbacks.filter(f => f.feedback === '적당했다').length,
    },
  };
}

export function getTopProducts(limit = 10) {
  const counts: Record<string, { name: string; count: number; revenue: number; style: string; category: string; image: string }> = {};
  purchaseData.filter(p => p.status === '구매완료').forEach(p => {
    if (!counts[p.productName]) counts[p.productName] = { name: p.productName, count: 0, revenue: 0, style: p.style, category: p.category, image: p.productImage };
    counts[p.productName].count++;
    counts[p.productName].revenue += p.price;
  });
  return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getTopStyles(limit = 5) {
  const counts: Record<string, number> = {};
  purchaseData.filter(p => p.status === '구매완료').forEach(p => { counts[p.style] = (counts[p.style] || 0) + 1; });
  return Object.entries(counts).map(([style, count]) => ({ style, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getCustomerPreferences(customerId: string) {
  const purchases = purchaseData.filter(p => p.customerId === customerId);
  const wardrobe = wardrobeItems.filter(w => w.customerId === customerId);
  const all = [
    ...purchases.map(p => ({ category: p.category, style: p.style, color: p.color })),
    ...wardrobe.map(w => ({ category: w.category as string, style: w.style, color: w.color })),
  ];
  const tally = (items: typeof all, key: keyof typeof all[0]) => {
    const c: Record<string, number> = {};
    items.forEach(i => { c[i[key]] = (c[i[key]] || 0) + 1; });
    return Object.entries(c).sort(([,a],[,b]) => b - a).slice(0, 5);
  };
  const filterCat = (cat: string) => all.filter(i => i.category === cat || (cat === '겉옷' && i.category === '아우터'));
  return {
    tops:   { styles: tally(filterCat('상의'),  'style'), colors: tally(filterCat('상의'),  'color') },
    bottoms:{ styles: tally(filterCat('하의'),  'style'), colors: tally(filterCat('하의'),  'color') },
    outer:  { styles: tally(filterCat('겉옷'),  'style'), colors: tally(filterCat('겉옷'),  'color') },
    overall:{ styles: tally(all, 'style'), colors: tally(all, 'color'), categories: tally(all, 'category') },
  };
}
