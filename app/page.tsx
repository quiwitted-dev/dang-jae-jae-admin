import LeftSide from '@/components/home/LeftSide';
import { getApprovedBusiness } from '@/services/submission.api';
import HomeRightSide from '@/components/home/HomeRightSide';

export const FILTER_BUTTON: string[] = [];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;

  const data = await getApprovedBusiness(params);

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
