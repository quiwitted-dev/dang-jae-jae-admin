import { SubmissionUserDetail } from '@/types/submission.type';
import SubmissionUserSideBar from '../SubmissionUserSideBar';

const SubmissionData = ({
  submissionData,
}: {
  submissionData: SubmissionUserDetail;
}) => {
  return (
    <>
      <div className="order-2 md:order-1">
        <SubmissionUserSideBar submissionData={submissionData} />
      </div>
      <div className="flex-1 md:min-h-dvh order-1 md:order-2">
        {/* <DetailRightSide map={map} /> */}
      </div>
    </>
  );
};

export default SubmissionData;
