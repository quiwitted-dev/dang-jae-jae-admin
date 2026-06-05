// 공통 타입 정의

// 사용자 타입
export interface User {
  id: string;
  kakaoId: string;
  nickname: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// 어드민 타입
export interface Admin {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

// 공공데이터 타입
export interface PublicRenovationData {
  id: string;
  dataSource: "SEOUL" | "GYEONGGI_GENERAL" | "GYEONGGI_SMALL";
  originalId: string;
  address?: string;
  projectName?: string;
  projectType?: string;
  currentStage?: string;
  generalSaleUnits?: number;
  totalSaleUnits?: number;
  newConstructionUnits?: number;
  rentalUnits?: number;
  ownerCount?: number;
  projectAreaM2?: string;
  volumeRatio?: string;
  buildingCoverageRatio?: string;
  averageLandSharePyeong?: string;
  newConstructionFloors?: number;
  mainUsage?: string;
  usageZone?: string;
  renovationPriceId?: string;
  createdAt: string;
  updatedAt: string;
  approvedRenovationPrice?: RenovationPrice;
}

// 사업 예정지 신청 타입
export interface RenovationPlaceSubmission {
  id: string;
  userId: string;
  tempName: string;
  location: string;
  consentContact?: string;
  priceRange?: string;
  ownerCount?: number;
  expectedNewUnits?: number;
  projectArea?: string;
  currentVolumeRatio?: string;
  expectedVolumeRatio?: string;
  constructionYear?: number;
  mainUsage?: string;
  usageZone?: string;
  applicablePolicy?: string;
  businessEntity?: string;
  businessType?: string;
  consentRate?: string;
  notes?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  renovationPriceId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  renovationPrice?: RenovationPrice;
}

// 가격 타입
export interface RenovationPrice {
  id: string;
  userId: string;
  referenceId: string;
  dataType: "PUBLIC_DATA" | "SUBMISSION";
  minPrice: string;
  maxPrice: string;
  minimumInitialInvestment?: string | null;
  premium?: string | null;
  isDisplayed: boolean;
  status: PriceCandidateStatus;
  memo?: string | null;
  evidence?: string | null;
  attachments?: PriceAttachment[] | null;
  displayedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  // 호환성을 위한 필드 (deprecated)
  price?: string;
}

export type PriceCandidateStatus = "DISPLAYED" | "PENDING" | "REJECTED" | "ON_HOLD";

export interface PriceAttachment {
  id: string;
  url: string;
  filename?: string;
}

export interface PriceGroupSummary {
  groupId: string;
  referenceId: string;
  referenceType: "PUBLIC_DATA" | "SUBMISSION";
  referenceName?: string;
  referenceAddress?: string;
  currentDisplayedPrice?: RenovationPrice | null;
  candidateCount: number;
  pendingCount: number;
  lastSubmittedAt?: string;
  lastDecidedAt?: string;
  reviewerName?: string;
  businessType?: string;
}

export interface PriceCandidate extends RenovationPrice {
  status: PriceCandidateStatus;
  memo?: string | null;
  evidence?: string | null;
  attachments?: PriceAttachment[] | null;
  submittedBy?: string | null;
  decidedAt?: string | null;
  decidedBy?: string | null;
  displayedAt?: string | null;
}

export interface PriceGroupStats {
  minPrice?: number | null;
  maxPrice?: number | null;
  averagePrice?: number | null;
}

export interface PriceGroupMetrics {
  candidateCount?: number;
  pendingCount?: number;
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  avgPrice?: string | number | null;
  lastSubmittedAt?: string | null;
  lastDecidedAt?: string | null;
}

export interface PriceGroupListItemDTO {
  groupId: string;
  dataType: "PUBLIC_DATA" | "SUBMISSION";
  referenceId: string;
  projectName?: string | null;
  address?: string | null;
  businessType?: string | null;
  manager?: {
    id: string;
    nickname: string;
    email: string;
  } | string | null;
  currentDisplayedPrice?: RenovationPrice | null;
  candidateCount?: number;
  pendingCount?: number;
  lastSubmittedAt?: string | null;
  lastDecidedAt?: string | null;
  metrics?: PriceGroupMetrics;
}

export interface PriceHistoryEntryDTO {
  id?: string;
  renovationPriceId?: string;
  priceId?: string;
  priceSnapshot?: {
    id: string;
    minPrice: string;
    maxPrice: string;
  } | null;
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  price?: string | number; // 호환성을 위한 필드
  status: PriceCandidateStatus;
  decidedAt: string;
  decidedBy?: string | null;
}

export interface PriceHistoryEntry {
  id?: string;
  renovationPriceId?: string;
  priceId: string;
  priceSnapshot?: {
    id: string;
    minPrice: string;
    maxPrice: string;
  } | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  price?: string; // 호환성을 위한 필드
  status: PriceCandidateStatus;
  decidedAt: string;
  decidedBy?: string;
}

export interface PriceGroupDetailDTO extends PriceGroupListItemDTO {
  candidates: PriceCandidate[];
  history?: PriceHistoryEntryDTO[] | null;
}

export interface PriceGroupDetail {
  summary: PriceGroupSummary;
  candidates: PriceCandidate[];
  stats?: PriceGroupStats;
  history?: PriceHistoryEntry[];
}

// 북마크 타입
export interface UserFavoriteRenovation {
  id: string;
  userId: string;
  referenceId: string;
  dataType: "PUBLIC_DATA" | "SUBMISSION";
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 어드민 로그인 응답
export interface AdminLoginResponse {
  success: boolean;
  admin?: {
    id: string;
    email: string;
    nickname: string;
  };
  error?: string;
}

// 어드민 목록 응답
export interface AdminListResponse {
  success: boolean;
  admins?: Admin[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// 신청 목록 응답
export interface SubmissionListResponse {
  success: boolean;
  submissions?: RenovationPlaceSubmission[];
  error?: string;
}

// 가격 목록 응답
export interface PriceListResponse {
  success: boolean;
  renovationPrices?: RenovationPrice[];
  error?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface PriceGroupListResponse {
  success: boolean;
  priceGroups?: PriceGroupListItemDTO[];
  error?: string;
  meta?: PaginationMeta;
}

export interface PriceGroupDetailResponse {
  success: boolean;
  priceGroup?: PriceGroupDetailDTO;
  error?: string;
}

// 메인 타이틀 타입
export interface MainTitle {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// 메인 타이틀 응답
export interface MainTitleResponse {
  success: boolean;
  mainTitle?: MainTitle | null;
  error?: string;
}

// 메인 타이틀 목록 응답
export interface MainTitleListResponse {
  success: boolean;
  mainTitles?: MainTitle[];
  error?: string;
}

// 유저 목록 응답
export interface UserListResponse {
  success: boolean;
  users?: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}
