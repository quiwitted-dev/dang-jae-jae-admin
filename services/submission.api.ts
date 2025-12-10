import { ExpectedFormInputs } from '@/schemas/expectedSchema';
import {
  ApprovedSubmissionList,
  SubmissionPublicDetail,
  SubmissionUserDetail,
} from '@/types/submission.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type getApprovedBusinessProps = {
  locations?: string | string[];
  projectTypes?: string | string[];
  currentStage?: string;
  minPrice?: number;
  maxPrice?: number;
  ownerCountMin?: number;
  ownerCountMax?: number;
  newConstructionUnitsMin?: number;
  newConstructionUnitsMax?: number;
  keyword?: string;
  page?: string;
};

// 승인된 사업 예정지 목록 조회
export const getApprovedBusiness = async (
  query: getApprovedBusinessProps = {}
): Promise<ApprovedSubmissionList> => {
  const params = new URLSearchParams();
  const appendParam = (
    key: string,
    value: string | number | Array<string | number> | undefined
  ) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else if (value !== '') {
      params.append(key, String(value));
    }
  };

  appendParam('locations', query.locations);
  appendParam('projectTypes', query.projectTypes);
  appendParam('currentStage', query.currentStage);
  appendParam('minPrice', query.minPrice);
  appendParam('maxPrice', query.maxPrice);
  appendParam('ownerCountMin', query.ownerCountMin);
  appendParam('ownerCountMax', query.ownerCountMax);
  appendParam('newConstructionUnitsMin', query.newConstructionUnitsMin);
  appendParam('newConstructionUnitsMax', query.newConstructionUnitsMax);
  appendParam('keyword', query.keyword);
  appendParam('page', query.page);

  const queryString = params.toString();
  const url = `${API_URL}/api/submission/approved${
    queryString ? `?${queryString}` : ''
  }`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache',
  });

  if (!res.ok) {
    throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return data;
};

// 사업 예정지 공공데이터 상세 조회
export const getSubmissionPublicDetail = async (
  id: string
): Promise<SubmissionPublicDetail> => {
  const res = await fetch(`${API_URL}/api/submission/public/${id}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(
      `사업 예정지 공공데이터 상세 조회 실패: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();

  return data.data;
};

// 사업 예정지 유저데이터 상세 조회
export const getSubmissionUserDetail = async (
  id: string
): Promise<SubmissionUserDetail> => {
  const res = await fetch(`${API_URL}/api/submission/user/${id}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(
      `사업 예정지 유저 상세 조회 실패 ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data.data;
};

export const postSubmissionUser = async (form: ExpectedFormInputs) => {
  const res = await fetch(`/api/submission`, {
    method: 'POST',
    body: JSON.stringify({ form }),
  });
  const data = await res.json();
  if (data.success === false) {
    throw new Error(data.message || '사업장 등록에 실패하였습니다.');
  }
  return data;
};
