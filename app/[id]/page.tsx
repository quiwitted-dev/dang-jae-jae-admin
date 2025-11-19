import GyeonggiSideBar from '@/components/home/GyeonggiSideBar';
import SeoulSideBar from '@/components/home/SeoulSideBar';
import { getSubmissionPublicDetail } from '@/services/submission.api';
import { SubmissionPublicDetail } from '@/types/submission.type';

const Detailpage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}) => {
  const { id } = await params;
  let publicData: SubmissionPublicDetail | null = null;
  try {
    publicData = await getSubmissionPublicDetail(id);
  } catch (error) {
    console.error('공공데이터 상세 조회 실패', error);
  }

  if (!publicData) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="flex md:flex-row flex-col">
      <div className="order-2 md:order-1">
        {publicData.dataSource === 'SEOUL' && (
          <SeoulSideBar publicData={publicData} />
        )}
        {publicData.dataSource === 'GYEONGGI' && (
          <GyeonggiSideBar publicData={publicData} />
        )}
      </div>
      <div className="flex-1 md:min-h-dvh order-1 md:order-2">
        {/* <DetailRightSide map={map} /> */}
      </div>
    </div>
  );
};

export default Detailpage;
