import { SubmissionPublicDetail } from '@/types/submission.type';
import GyeonggiSideBar from '../GyeonggiSideBar';
import SeoulSideBar from '../SeoulSideBar';

const PublicData = ({ publicData }: { publicData: SubmissionPublicDetail }) => {
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
      <div className="flex-1 md:min-h-dvh order-1 md:order-2">
        {/* <DetailRightSide map={map} /> */}
      </div>
    </>
  );
};

export default PublicData;
