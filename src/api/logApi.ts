const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? '';
const REQUEST_TIMEOUT_MS = 10000;

type JsonBody = Record<string, any> | any[] | null | undefined;

type CampaignPayload = Record<string, any>;

type IssueCampaignCouponsPayload =
  | number[]
  | {
      customerIds?: number[];
      filterConditions?: any[];
    };

async function requestJson(url: string, options?: RequestInit): Promise<any> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      signal: options?.signal ?? controller.signal,
    });
    const text = await res.text();

    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const message =
        typeof data === 'object' && data?.error
          ? data.error
          : typeof data === 'string' && data.trim()
            ? data
            : `${options?.method ?? 'GET'} ${url} failed: ${res.status}`;
      throw new Error(message);
    }

    return data;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`${options?.method ?? 'GET'} ${url} timed out`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function jsonOptions(method: 'POST' | 'PUT' | 'PATCH', body?: JsonBody): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  };
}

function toNullableNumber(value: any): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeFilterConditions(value: any): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') return value.trim() ? value : '[]';
  if (value == null) return '[]';
  try {
    return JSON.stringify(value);
  } catch {
    return '[]';
  }
}

// DDL의 campaign 컬럼 기준으로만 저장 payload를 만든다.
// actions 배열은 campaign_action 테이블에 별도 저장되므로 payload에 함께 포함시킨다.
function serializeCampaign(campaign: CampaignPayload): CampaignPayload {
  const payload: CampaignPayload = {};

  const fields = [
    'campaignName',
    'description',
    'category1',
    'category2',
    'status',
    'startDate',
    'endDate',
    'graceDays',
    'customerType',
    'visibility',
    'tags',
    'department',
    'createdBy',
    'filterSubject',
    'filterConditions',
    'anonymousMinVisits',
    'emailSubject',
    'emailBody',
    'popupMessage',
  ];

  fields.forEach((field) => {
    if (!(field in campaign)) return;

    if (field === 'filterConditions') {
      payload.filterConditions = normalizeFilterConditions(campaign.filterConditions);
      return;
    }

    if (field === 'graceDays') {
      payload.graceDays = toNullableNumber(campaign.graceDays) ?? 0;
      return;
    }

    if (field === 'anonymousMinVisits') {
      payload.anonymousMinVisits = toNullableNumber(campaign.anonymousMinVisits);
      return;
    }

    if (field === 'startDate' || field === 'endDate') {
      payload[field] = campaign[field] || null;
      return;
    }

    payload[field] = campaign[field];
  });

  if (!('status' in payload)) payload.status = '설계중';
  if (!('graceDays' in payload)) payload.graceDays = 0;
  if (!('customerType' in payload)) payload.customerType = '개인';
  if (!('visibility' in payload)) payload.visibility = '비공개';
  if (!('filterConditions' in payload)) payload.filterConditions = '[]';

  // actions 배열 포함 (campaign_action 테이블 저장용)
  payload.actions = Array.isArray(campaign.actions) ? campaign.actions : [];

  return payload;
}

function deserializeCampaign(campaign: any): any {
  if (!campaign || typeof campaign !== 'object') return campaign;

  let filterConditions: any[] = [];
  const raw = campaign.filterConditions;

  if (Array.isArray(raw)) {
    filterConditions = raw;
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      filterConditions = Array.isArray(parsed) ? parsed : [];
    } catch {
      filterConditions = [];
    }
  }

  // actions 배열 보장
  const actions = Array.isArray(campaign.actions) ? campaign.actions : [];

  return {
    ...campaign,
    filterConditions,
    actions,
  };
}

function normalizeIssueCouponPayload(payload?: IssueCampaignCouponsPayload): {
  customerIds?: number[];
  filterConditions?: any[];
} {
  if (Array.isArray(payload)) {
    return { customerIds: payload };
  }

  return {
    customerIds: Array.isArray(payload?.customerIds) ? payload.customerIds : undefined,
    filterConditions: Array.isArray(payload?.filterConditions) ? payload.filterConditions : undefined,
  };
}

export async function getLogStats() {
  return requestJson('/api/admin/logs/stats');
}

export async function getSuccessLogs() {
  return requestJson('/api/admin/logs/success');
}

export async function getFailLogs() {
  return requestJson('/api/admin/logs/fail');
}

export async function getDashboardSummary() {
  return requestJson('/api/dashboard/summary');
}

export async function getAllFeedbacks() {
  return requestJson('/api/feedbacks');
}

export async function getAllPurchases() {
  return requestJson('/api/admin/purchases');
}

export async function getAllWardrobes() {
  return requestJson('/api/admin/wardrobes');
}

export async function getBehaviorLogs() {
  return requestJson('/api/admin/behavior-logs');
}

function daysQuery(days: number) {
  return `?days=${encodeURIComponent(String(days))}`;
}

export async function getBehaviorSummary(days: number) {
  return requestJson(`/api/admin/behavior-logs/summary${daysQuery(days)}`);
}

export async function getBehaviorTypeCounts(days: number) {
  return requestJson(`/api/admin/behavior-logs/type-counts${daysQuery(days)}`);
}

export async function getBehaviorHourly(days: number) {
  return requestJson(`/api/admin/behavior-logs/hourly${daysQuery(days)}`);
}

export async function getBehaviorConversionRate(days: number) {
  return requestJson(`/api/admin/behavior-logs/conversion-rate${daysQuery(days)}`);
}

export async function getBehaviorPopularProducts(days: number) {
  return requestJson(`/api/admin/behavior-logs/popular-products${daysQuery(days)}`);
}

export async function getBehaviorPopularPages(days: number) {
  return requestJson(`/api/admin/behavior-logs/popular-pages${daysQuery(days)}`);
}

export async function getBehaviorWishlistConversion(days: number) {
  return requestJson(`/api/admin/behavior-logs/wishlist-conversion${daysQuery(days)}`);
}

export async function getBehaviorDetail(params: { type?: string | null; hour?: number; days?: number }) {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.hour !== undefined) qs.set('hour', String(params.hour));
  if (params.days && params.days > 0) qs.set('days', String(params.days));
  const query = qs.toString();
  return requestJson(`/api/admin/behavior-logs/detail${query ? `?${query}` : ''}`);
}

export async function getAnonymousUsers() {
  return requestJson('/api/anonymous-users');
}

export async function deleteAnonymousUser(anonymousId: string) {
  return requestJson(`/api/anonymous-users/${anonymousId}`, { method: 'DELETE' });
}

export async function getCustomers() {
  return requestJson('/api/admin/customers');
}

export async function deleteCustomer(customerId: number) {
  await requestJson(`/api/admin/customers/${customerId}`, { method: 'DELETE' });
}

export async function getCustomerFeedbacks(customerId: number) {
  return requestJson(`/api/feedbacks/customer/${customerId}`);
}

export async function getCustomerPurchases(customerId: number) {
  return requestJson(`/api/admin/purchases/customer/${customerId}`);
}

export async function getCustomerWardrobes(customerId: number) {
  return requestJson(`/api/admin/wardrobes/customer/${customerId}`);
}

export async function getCustomerPreferences(customerId: number) {
  return requestJson(`/api/admin/customers/${customerId}/preferences`);
}

export async function getColors() {
  return requestJson('/api/colors');
}

export async function getRegions() {
  return requestJson('/api/regions');
}

export async function getProducts() {
  return requestJson('/api/admin/products');
}

export async function getProduct(productId: number) {
  return requestJson(`/api/admin/products/${productId}`);
}

export async function getCoupons() {
  return requestJson('/api/coupons');
}

export async function getCoupon(couponId: number) {
  return requestJson(`/api/coupons/${couponId}`);
}

export async function createCoupon(coupon: any) {
  return requestJson('/api/coupons', jsonOptions('POST', coupon));
}

export async function updateCoupon(couponId: number, coupon: any) {
  return requestJson(`/api/coupons/${couponId}`, jsonOptions('PUT', coupon));
}

export async function deleteCoupon(couponId: number) {
  await requestJson(`/api/coupons/${couponId}`, { method: 'DELETE' });
}

export async function getAllCustomerCoupons() {
  return requestJson('/api/customer-coupons');
}

export async function getCustomerCoupons(customerId: number) {
  return requestJson(`/api/customer-coupons/customer/${customerId}`);
}

export async function getCustomerCouponsByCustomer(customerId: number) {
  return requestJson(`/api/customer-coupons/customer/${customerId}`);
}

export async function getCampaigns() {
  const data = await requestJson('/api/campaigns');
  return Array.isArray(data) ? data.map(deserializeCampaign) : data;
}

export async function getCampaign(campaignId: number) {
  return deserializeCampaign(await requestJson(`/api/campaigns/${campaignId}`));
}

export async function createCampaign(campaign: any) {
  const data = await requestJson('/api/campaigns', jsonOptions('POST', serializeCampaign(campaign)));
  return deserializeCampaign(data);
}

export async function updateCampaign(campaignId: number, campaign: any) {
  const data = await requestJson(
    `/api/campaigns/${campaignId}`,
    jsonOptions('PUT', serializeCampaign(campaign)),
  );
  return deserializeCampaign(data);
}

export async function deleteCampaign(campaignId: number) {
  await requestJson(`/api/campaigns/${campaignId}`, { method: 'DELETE' });
}

export async function issueCampaignCoupons(
  campaignId: number,
  payload?: IssueCampaignCouponsPayload,
) {
  return requestJson(
    `/api/campaigns/${campaignId}/issue-coupons`,
    jsonOptions('POST', normalizeIssueCouponPayload(payload)),
  );
}

export async function executeCampaign(campaignId: number, emailSubject: string, emailBody: string) {
  return requestJson(
    `/api/campaigns/${campaignId}/execute`,
    jsonOptions('POST', { emailSubject, emailBody }),
  );
}

export async function getAnonymousPopupRules() {
  return requestJson('/api/anonymous-popup-rules');
}

export async function createAnonymousPopupRule(rule: any) {
  return requestJson('/api/anonymous-popup-rules', jsonOptions('POST', rule));
}

export async function updateAnonymousPopupRule(id: number, rule: any) {
  return requestJson(`/api/anonymous-popup-rules/${id}`, jsonOptions('PUT', rule));
}

export async function deleteAnonymousPopupRule(id: number) {
  return requestJson(`/api/anonymous-popup-rules/${id}`, { method: 'DELETE' });
}

export async function toggleAnonymousPopupRule(id: number) {
  return requestJson(`/api/anonymous-popup-rules/${id}/toggle`, jsonOptions('PATCH', {}));
}
