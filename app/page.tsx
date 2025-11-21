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

export const FILTER_BUTTON: string[] = [];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ index?: string }>;
}) {
  const { index } = await searchParams;
  // const map = (index && ITEM[Number(index)].map) || '';

  const data = await getApprovedBusiness();

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
        {index && (
          <div className="flex-1 min-h-dvh">
            {/* <Image
              src={map}
              width={800}
              height={1000}
              alt="지도"
              className="w-full h-full object-cover"
            /> */}
          </div>
        )}
        {!index && <RightSide />}
      </div>
    </main>
  );
}
