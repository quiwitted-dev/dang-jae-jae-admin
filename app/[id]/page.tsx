import DetailRightSide from '@/components/home/DetailRightSide';
import DetailSideBar from '@/components/home/DetailSideBar';
import { getSubmissionPublicDetail } from '@/services/submission.api';

const Detailpage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}) => {
  const { id } = await params;
  const { source } = await searchParams;
  try {
    const publicData = await getSubmissionPublicDetail(id);
    console.log(publicData);
  } catch (error) {
    console.error('공공데이터 상세 조회 실패');
  }
  // const map = ITEM[Number(id)].map;

  return (
    <div className="flex md:flex-row flex-col">
      <div className="order-2 md:order-1">
        {/* <DetailSideBar data={data} index={index ? Number(index) : Number(id)} /> */}
      </div>
      <div className="flex-1 md:min-h-dvh order-1 md:order-2">
        {/* <DetailRightSide map={map} /> */}
      </div>
    </div>
  );
};

export default Detailpage;
