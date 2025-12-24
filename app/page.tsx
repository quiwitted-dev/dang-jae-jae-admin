import LeftSide from '@/components/home/LeftSide';
import { getApprovedBusiness } from '@/services/submission.api';
import HomeRightSide from '@/components/home/HomeRightSide';
import { ApprovedSubmissionList } from '@/types/submission.type';

export const FILTER_BUTTON: string[] = [];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  let data: ApprovedSubmissionList = { success: false, submissions: [] };
  try {
    data = await getApprovedBusiness(params);
  } catch (error) {
    console.error('getApprovedBusiness Failed', error);
  }

  return (
    <main>
      {/* 필터링 */}
      <div className="flex flex-row gap-5">
        <LeftSide data={data} />
        <HomeRightSide />
      </div>
    </main>
  );
}
