import PublicData from '@/components/home/[id]/PublicData';
import SubmissionData from '@/components/home/[id]/SubmissionData';
import {
  getSubmissionPublicDetail,
  getSubmissionUserDetail,
} from '@/services/submission.api';
import {
  SubmissionPublicDetail,
  SubmissionUserDetail,
} from '@/types/submission.type';

const Detailpage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type: 'PUBLIC_DATA' | 'SUBMISSION' }>;
}) => {
  const { id } = await params;
  const dataType = (await searchParams).type;

  const fetchData = {
    PUBLIC_DATA: getSubmissionPublicDetail,
    SUBMISSION: getSubmissionUserDetail,
  };

  if (!dataType) {
    return <div>잘못된 접근입니다.</div>;
  }

  const data = await fetchData[dataType]?.(id);

  return (
    <div className="flex md:flex-row flex-col">
      {dataType === 'PUBLIC_DATA' && (
        <PublicData publicData={data as SubmissionPublicDetail} />
      )}
      {dataType === 'SUBMISSION' && (
        <SubmissionData submissionData={data as SubmissionUserDetail} />
      )}
    </div>
  );
};

export default Detailpage;
