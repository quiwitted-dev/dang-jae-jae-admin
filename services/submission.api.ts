import { ApprovedSubmissionList } from '@/types/type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 승인된 사업 예정지 목록 조회
export const getApprovedBusiness =
  async (): Promise<ApprovedSubmissionList> => {
    try {
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
    } catch (error) {
      console.error('getApprovedBusiness 에러:', error);
      // 에러 시 기본값 반환
      return {
        success: false,
        submissions: [],
        total: 0,
      };
    }
  };

// 사업 예정지 신청 상세 조회
export const getSubmissionDetail = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/api/submisson/${id}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('사업 예정지 신청 상세 조회 실패');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getSubmissionDetail 에러 : ', error);
  }
};
