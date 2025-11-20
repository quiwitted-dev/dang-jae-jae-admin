import LeftSide from '@/components/home/LeftSide';
import RightSide from '@/components/home/RightSide';
import { Button } from '@/components/ui/button';
import { getApprovedBusiness } from '@/services/submission.api';

export const FILTER_BUTTON = [
  '위치',
  '사업성격',
  '사업단계',
  '시세',
  '권리자수',
  '신축세대수',
];

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
          {FILTER_BUTTON.map((item) => (
            <Button key={item} className="flex-1" variant={'ghost'}>
              <p className="text-2xl font-bold">{item}</p>
            </Button>
          ))}
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
