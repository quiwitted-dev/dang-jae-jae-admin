import DetailRightSide from '@/components/home/DetailRightSide';
import DetailSideBar from '@/components/home/DetailSideBar';
import { getSubmissionDetail } from '@/services/submission.api';

const Detailpage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ index?: string }>;
}) => {
  const { id } = await params;
  const { index } = await searchParams;
  const data = await getSubmissionDetail(id);
  // const map = ITEM[Number(id)].map;

  return (
    <div className="flex md:flex-row flex-col">
      <div className="order-2 md:order-1">
        <DetailSideBar data={data} index={index ? Number(index) : Number(id)} />
      </div>
      <div className="flex-1 md:min-h-dvh order-1 md:order-2">
        {/* <DetailRightSide map={map} /> */}
      </div>
    </div>
  );
};

export default Detailpage;
