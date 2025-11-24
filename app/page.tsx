import LeftSide from '@/components/home/LeftSide';
import RightSide from '@/components/home/RightSide';
import { getApprovedBusiness } from '@/services/submission.api';
import MapView from '@/components/home/MapView';

export const FILTER_BUTTON: string[] = [];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { id, ...query } = params;

  const data = await getApprovedBusiness(query);

  const selected = id
    ? data.submissions.find((submission) => submission.id === id)
    : undefined;
  const mapAddress = selected?.address;

  return (
    <main>
      {/* 필터링 */}
      <div className="flex flex-row gap-5">
        <LeftSide data={data} />
        {selected && (
          <div className="flex-1 min-h-dvh max-h-screen">
            <MapView address={mapAddress} />
          </div>
        )}
        {!selected && <RightSide />}
      </div>
    </main>
  );
}
