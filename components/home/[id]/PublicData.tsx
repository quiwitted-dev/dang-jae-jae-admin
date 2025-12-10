import { SubmissionPublicDetail } from '@/types/submission.type';
import GyeonggiSideBar from '../GyeonggiSideBar';
import SeoulSideBar from '../SeoulSideBar';
import DetailRightSide from '../DetailRightSide';

const PublicData = ({ publicData }: { publicData: SubmissionPublicDetail }) => {
  const mapAddress =
    publicData.dataSource === 'SEOUL'
      ? `${publicData.representativeLotNumber}`
      : publicData.address;

  return (
    <>
      <div className="order-2 md:order-1">
        {publicData.dataSource === 'SEOUL' && (
          <SeoulSideBar publicData={publicData} />
        )}
        {publicData.dataSource === 'GYEONGGI' && (
          <GyeonggiSideBar publicData={publicData} />
        )}
      </div>
      <div className="flex-1 md:h-[calc(100vh)] rounded-xl md:sticky md:top-0 order-1 md:order-2">
        <DetailRightSide address={mapAddress} />
      </div>
    </>
  );
};

export default PublicData;
