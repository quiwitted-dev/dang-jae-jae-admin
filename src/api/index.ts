import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type {
  Admin,
  AdminLoginResponse,
  AdminListResponse,
  SubmissionListResponse,
  PriceListResponse,
  RenovationPlaceSubmission,
  RenovationPrice,
  PublicRenovationData,
  User,
  UserFavoriteRenovation,
  MainTitleResponse,
  MainTitleListResponse,
  ApiResponse,
  PriceGroupListResponse,
  PriceGroupDetailResponse,
  PriceCandidateStatus,
  UserListResponse,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const ADMIN_UNAUTHORIZED_EVENT = "admin:unauthorized";

// Axios 인스턴스 생성 (쿠키 포함)
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
const requestQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject: (reason?: any) => void;
  config: RetryRequestConfig;
}> = [];

const processQueue = (error?: any) => {
  while (requestQueue.length > 0) {
    const queued = requestQueue.shift();
    if (!queued) continue;

    if (error) {
      queued.reject(error);
    } else {
      apiClient.request(queued.config).then(queued.resolve).catch(queued.reject);
    }
  }
};

const REFRESH_ENDPOINT = "/api/admin/refresh";

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error?.response?.status;
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (status === 401 || status === 419) {
      if (!originalRequest || originalRequest._retry) {
        window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes(REFRESH_ENDPOINT)) {
        window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      return new Promise<AxiosResponse>((resolve, reject) => {
        requestQueue.push({ resolve, reject, config: originalRequest });

        if (!isRefreshing) {
          isRefreshing = true;
          apiClient
            .post<ApiResponse<null>>(REFRESH_ENDPOINT)
            .then((response) => {
              if (!response.data?.success) {
                throw new Error(response.data?.error || "토큰 갱신에 실패했습니다.");
              }
              processQueue();
            })
            .catch((refreshError) => {
              processQueue(refreshError);
              window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
      });
    }

    return Promise.reject(error);
  }
);

// 어드민 API
export const adminApi = {
  // 어드민 로그인
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<AdminLoginResponse>("/api/admin/login", {
      email,
      password,
    });
    return response.data;
  },

  // 어드민 Refresh Token으로 Access Token 갱신
  refresh: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/admin/refresh");
    return response.data;
  },

  // 어드민 로그아웃
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/admin/logout");
    return response.data;
  },

  // 어드민 생성
  create: async (
    email: string,
    nickname: string,
    password: string
  ): Promise<ApiResponse<Admin>> => {
    const response = await apiClient.post<ApiResponse<Admin>>("/api/admin", {
      email,
      nickname,
      password,
    });
    return response.data;
  },

  // 어드민 목록 조회
  getList: async (params?: { page?: number; limit?: number }): Promise<AdminListResponse> => {
    const response = await apiClient.get<AdminListResponse>("/api/admin", { params });
    return response.data;
  },

  // 어드민 상세 조회
  getById: async (id: string): Promise<ApiResponse<Admin>> => {
    const response = await apiClient.get<ApiResponse<Admin>>(`/api/admin/${id}`);
    return response.data;
  },

  // 어드민 수정
  update: async (
    id: string,
    data: { email?: string; nickname?: string; password?: string }
  ): Promise<ApiResponse<Admin>> => {
    const response = await apiClient.put<ApiResponse<Admin>>(`/api/admin/${id}`, data);
    return response.data;
  },

  // 어드민 삭제
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/admin/${id}`);
    return response.data;
  },

  // 사업 예정지 신청 목록 조회 (PENDING, APPROVED, REJECTED)
  getSubmissions: async (
    status?: "PENDING" | "APPROVED" | "REJECTED"
  ): Promise<SubmissionListResponse> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<SubmissionListResponse>("/api/admin/submissions", {
      params,
    });
    return response.data;
  },

  // 사업 예정지 신청 승인
  approveSubmission: async (id: string): Promise<ApiResponse<RenovationPlaceSubmission>> => {
    const response = await apiClient.put<ApiResponse<RenovationPlaceSubmission>>(
      `/api/admin/submission/${id}/approve`
    );
    return response.data;
  },

  // 사업 예정지 신청 거절
  rejectSubmission: async (
    id: string,
    rejectionReason: string
  ): Promise<ApiResponse<RenovationPlaceSubmission>> => {
    const response = await apiClient.put<ApiResponse<RenovationPlaceSubmission>>(
      `/api/admin/submission/${id}/reject`,
      {
        rejectionReason,
      }
    );
    return response.data;
  },

  // 가격 목록 조회
  getPrices: async (
    dataType?: "PUBLIC_DATA" | "SUBMISSION",
    isDisplayed?: boolean
  ): Promise<PriceListResponse> => {
    const params: any = {};
    if (dataType) params.dataType = dataType;
    if (isDisplayed !== undefined) params.isDisplayed = isDisplayed.toString();
    const response = await apiClient.get<PriceListResponse>("/api/admin/prices", { params });
    return response.data;
  },

  // 가격 그룹 목록 조회
  getPriceGroups: async (
    params?: {
      page?: number;
      pageSize?: number;
      dataType?: "PUBLIC_DATA" | "SUBMISSION";
      status?: "ALL" | "PENDING" | "NEEDS_REVIEW" | "DISPLAYED";
      keyword?: string;
    }
  ): Promise<PriceGroupListResponse> => {
    const response = await apiClient.get<PriceGroupListResponse>("/api/admin/price-groups", {
      params,
    });
    return response.data;
  },

  // 가격 그룹 상세 조회
  getPriceGroupDetail: async (groupId: string): Promise<PriceGroupDetailResponse> => {
    const response = await apiClient.get<PriceGroupDetailResponse>(
      `/api/admin/price-groups/${groupId}`
    );
    return response.data;
  },

  // 특정 가격을 노출 가격으로 지정
  setDisplayedPrice: async (
    groupId: string,
    priceId: string
  ): Promise<ApiResponse<RenovationPrice>> => {
    const response = await apiClient.put<ApiResponse<RenovationPrice>>(
      `/api/admin/price-groups/${groupId}/display`,
      {
        priceId,
      }
    );
    return response.data;
  },

  // 가격 상태 변경 (노출 제외)
  updatePriceStatus: async (
    priceId: string,
    payload: {
      status: Exclude<PriceCandidateStatus, "DISPLAYED">;
      memo?: string;
    }
  ): Promise<ApiResponse<RenovationPrice>> => {
    const response = await apiClient.put<ApiResponse<RenovationPrice>>(
      `/api/admin/price/${priceId}/status`,
      payload
    );
    return response.data;
  },

  // 가격 승인 (isDisplayed = true 설정)
  approvePrice: async (id: string): Promise<ApiResponse<RenovationPrice>> => {
    const response = await apiClient.put<ApiResponse<RenovationPrice>>(
      `/api/admin/price/${id}/approve`
    );
    return response.data;
  },

  // 가격 선택 (작업장에 가격 연결)
  selectPrice: async (
    renovationPriceId: string,
    referenceId: string,
    dataType: "PUBLIC_DATA" | "SUBMISSION"
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>("/api/admin/price/select", {
      renovationPriceId,
      referenceId,
      dataType,
    });
    return response.data;
  },

  // 유저 목록 조회
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<UserListResponse> => {
    // 빈 문자열인 경우 파라미터에서 제외
    const filteredParams = { ...params };
    if (filteredParams.keyword === "") {
      delete filteredParams.keyword;
    }

    const response = await apiClient.get<UserListResponse>("/api/admin/users", {
      params: filteredParams,
    });
    return response.data;
  },

  // 유저 강제 탈퇴 처리
  withdrawUser: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/admin/users/${id}`);
    return response.data;
  },
};

// 인증 API (일반 유저용)
export const authApi = {
  // 카카오 로그인 콜백
  kakaoCallback: async (code: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>("/api/auth/kakao/callback", { code });
    return response.data;
  },

  // Refresh Token으로 Access Token 갱신
  refresh: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/auth/refresh");
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/auth/logout");
    return response.data;
  },
};

// 사업 예정지 신청 API
export const submissionApi = {
  // 승인된 사업 예정지 목록 조회 (공개)
  getApproved: async (): Promise<ApiResponse<RenovationPlaceSubmission[]>> => {
    const response = await apiClient.get<ApiResponse<RenovationPlaceSubmission[]>>(
      "/api/submission/approved"
    );
    return response.data;
  },

  // 사업 예정지 신청 생성
  create: async (
    data: Partial<RenovationPlaceSubmission>
  ): Promise<ApiResponse<RenovationPlaceSubmission>> => {
    const response = await apiClient.post<ApiResponse<RenovationPlaceSubmission>>(
      "/api/submission",
      data
    );
    return response.data;
  },

  // 내 사업 예정지 신청 목록 조회
  getMyList: async (): Promise<ApiResponse<RenovationPlaceSubmission[]>> => {
    const response = await apiClient.get<ApiResponse<RenovationPlaceSubmission[]>>(
      "/api/submission"
    );
    return response.data;
  },

  // 사업 예정지 신청 상세 조회
  getById: async (id: string): Promise<ApiResponse<RenovationPlaceSubmission>> => {
    const response = await apiClient.get<ApiResponse<RenovationPlaceSubmission>>(
      `/api/submission/${id}`
    );
    return response.data;
  },

  // 사업 예정지 신청 수정
  update: async (
    id: string,
    data: Partial<RenovationPlaceSubmission>
  ): Promise<ApiResponse<RenovationPlaceSubmission>> => {
    const response = await apiClient.put<ApiResponse<RenovationPlaceSubmission>>(
      `/api/submission/${id}`,
      data
    );
    return response.data;
  },

  // 사업 예정지 신청 삭제
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/submission/${id}`);
    return response.data;
  },
};

// 가격 API
export const priceApi = {
  // 가격 입력
  create: async (
    referenceId: string,
    dataType: "PUBLIC_DATA" | "SUBMISSION",
    data: {
      minPrice: number | string;
      maxPrice: number | string;
      minimumInitialInvestment?: number | string | null;
      premium?: number | string | null;
      memo?: string | null;
      evidence?: string | null;
      attachments?: any[] | null;
    }
  ): Promise<ApiResponse<RenovationPrice>> => {
    const response = await apiClient.post<ApiResponse<RenovationPrice>>("/api/price", {
      referenceId,
      dataType,
      ...data,
    });
    return response.data;
  },

  // 내가 입력한 가격 목록 조회
  getMyList: async (): Promise<PriceListResponse> => {
    const response = await apiClient.get<PriceListResponse>("/api/price");
    return response.data;
  },

  // 특정 작업장의 승인된 가격 목록 조회 (공개)
  getDisplayed: async (publicRenovationDataId: string): Promise<ApiResponse<RenovationPrice[]>> => {
    const response = await apiClient.get<ApiResponse<RenovationPrice[]>>(
      `/api/price/displayed/${publicRenovationDataId}`
    );
    return response.data;
  },

  // 특정 작업장의 어드민이 선택한 가격 조회 (공개)
  getApproved: async (
    referenceId: string,
    dataType: "PUBLIC_DATA" | "SUBMISSION"
  ): Promise<ApiResponse<RenovationPrice>> => {
    const response = await apiClient.get<ApiResponse<RenovationPrice>>("/api/price/approved", {
      params: {
        referenceId,
        dataType,
      },
    });
    return response.data;
  },
};

// 북마크 API
export const favoriteApi = {
  // 북마크 추가
  create: async (
    referenceId: string,
    dataType: "PUBLIC_DATA" | "SUBMISSION"
  ): Promise<ApiResponse<UserFavoriteRenovation>> => {
    const response = await apiClient.post<ApiResponse<UserFavoriteRenovation>>("/api/favorite", {
      referenceId,
      dataType,
    });
    return response.data;
  },

  // 내 북마크 목록 조회
  getMyList: async (): Promise<ApiResponse<UserFavoriteRenovation[]>> => {
    const response = await apiClient.get<ApiResponse<UserFavoriteRenovation[]>>("/api/favorite");
    return response.data;
  },

  // 북마크 삭제
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/favorite/${id}`);
    return response.data;
  },
};

// 공공데이터 API
export const apiDataApi = {
  // 공공데이터 동기화
  sync: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/api-data/sync");
    return response.data;
  },

  // 공공데이터 상세 조회
  getById: async (id: string): Promise<ApiResponse<PublicRenovationData>> => {
    const response = await apiClient.get<ApiResponse<PublicRenovationData>>(`/api/api-data/${id}`);
    return response.data;
  },
};

// 메인 타이틀 API
export const mainTitleApi = {
  // 메인 타이틀 조회 (최신 1개, 인증 불필요)
  get: async (): Promise<MainTitleResponse> => {
    const response = await apiClient.get<MainTitleResponse>("/api/main-title");
    return response.data;
  },

  // 어드민: 메인 타이틀 생성
  create: async (title: string): Promise<MainTitleResponse> => {
    const response = await apiClient.post<MainTitleResponse>("/api/main-title", { title });
    return response.data;
  },

  // 어드민: 메인 타이틀 목록 조회
  getList: async (): Promise<MainTitleListResponse> => {
    const response = await apiClient.get<MainTitleListResponse>("/api/main-title/list");
    return response.data;
  },

  // 어드민: 메인 타이틀 단일 조회
  getById: async (id: string): Promise<MainTitleResponse> => {
    const response = await apiClient.get<MainTitleResponse>(`/api/main-title/${id}`);
    return response.data;
  },

  // 어드민: 메인 타이틀 수정
  update: async (id: string, title: string): Promise<MainTitleResponse> => {
    const response = await apiClient.put<MainTitleResponse>(`/api/main-title/${id}`, {
      title,
    });
    return response.data;
  },

  // 어드민: 메인 타이틀 삭제
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/main-title/${id}`);
    return response.data;
  },
};
