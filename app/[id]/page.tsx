import DetailSideBar from '@/components/home/DetailSideBar';
import { ITEM } from '@/components/home/LeftSide';

const Detailpage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = ITEM[Number(id)];

  return (
    <div>
      <DetailSideBar data={data} />
    </div>
  );
};

export default Detailpage;
