import { SubmissionUserDetail } from '@/types/submission.type';
import SubmissionUserSideBar from '../SubmissionUserSideBar';
import DetailRightSide from '../DetailRightSide';

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
      <div className="flex-1 md:h-[calc(100vh)] rounded-xl md:sticky md:top-0 order-1 md:order-2">
        <DetailRightSide address={submissionData.location} />
      </div>
    </>
  );
};

export default SubmissionData;
