import LeftSide from '@/components/home/LeftSide';
import RightSide from '@/components/home/RightSide';
import LocationFilter from '@/components/home/LocationFilter';
import BusinessTypeFilter from '@/components/home/BusinessTypeFilter';
import BusinessStageFilter from '@/components/home/BusinessStageFilter';
import PriceFilter from '@/components/home/PriceFilter';
import OwnerCountFilter from '@/components/home/OwnerCountFilter';
import NewUnitsFilter from '@/components/home/NewUnitsFilter';
import { Button } from '@/components/ui/button';
import { getApprovedBusiness } from '@/services/submission.api';
import MapView from '@/components/home/MapView';

export const FILTER_BUTTON: string[] = [];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const data = await getApprovedBusiness();

  const selected = id
    ? data.submissions.find((submission) => submission.id === id)
    : undefined;
  const mapAddress = selected?.address;

  return (
    <main>
      {/* 필터링 */}
      <div className="flex">
        <div className="flex flex-row py-4 overflow-x-auto md:overflow-auto">
          <LocationFilter />
          <BusinessTypeFilter />
          <BusinessStageFilter />
          <PriceFilter />
          <OwnerCountFilter />
          <NewUnitsFilter />
          <Button>리셋</Button>
        </div>
      </div>
      <div className="flex flex-row">
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
