import { ExpectedFormInputs } from '@/schemas/expectedSchema';
import {
  ApprovedSubmissionList,
  SubmissionPublicDetail,
  SubmissionUserDetail,
} from '@/types/submission.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 승인된 사업 예정지 목록 조회
export const getApprovedBusiness =
  async (): Promise<ApprovedSubmissionList> => {
    const res = await fetch(`${API_URL}/api/submission/approved`, {
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

  if (!res.ok) {
    throw new Error(
      `사업 예정지 유저 입력 실패 ${res.status} ${res.statusText}`
    );
  }
  // todo : 사업 등록 성공하면 return 뭐 주고 아니면 뭐 주고
  const data = await res.json();
  return data;
};
