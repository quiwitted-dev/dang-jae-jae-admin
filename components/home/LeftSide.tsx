import { Bookmark } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';

export const FILTERBUTTON = [
  '위치',
  '사업성격',
  '사업단계',
  '시세',
  '권리자수',
  '신축세대수',
];

export const ITEM = [
  {
    address: '강남구 개포동 185',
    project_name: '개포주공6,7단지아파트 재건축',
    approval_status: '추진위원회승인',
    price_range: {
      min: 3000000000,
      max: 4100000000,
      min_initial_investment: 2500000000,
      premium: 0,
    },
    nick_name: '닉네임닉네01099990000',
    map: '',
    project_type: '재건축',
    average_land_share: 26.19,
    new_households: 2548,
    rental_households: 300,
    owners_count: 1081,
    land_area_m2: 132132.0,
    status: '진행중',
    details: {
      usage: '공공주택 및 부대 복리시설',
      purpose_area: '제3종 일반주거지역',
      floor_area_ratio: '230.55%',
      building_coverage: '21.16%',
      owners: 564,
      total_households: 787,
      reconstruction_area_m2: 48837.5,
      buildings: 3,
      planned_buildings: 20,
    },
    area_distribution: {
      under_60m2: 83,
      '60m2_to_85m2': 309,
      over_85m2: 395,
    },
    facilities: {
      parking_area_m2: 0,
      road_area_m2: 0,
      park_area_m2: 0,
      green_area_m2: 0,
      public_area_m2: 0,
      school_area_m2: 0,
      other_area_m2: 0,
    },
  },
];

const LeftSide = () => {
  return (
    <div className="flex flex-col max-w-[700px] w-full gap-4">
      {/* 필터링 */}
      <div className="flex flex-row overflow-x-scroll">
        {FILTERBUTTON.map((item) => (
          <Button key={item} className="flex-1" variant={'ghost'}>
            <p className="text-2xl font-bold">{item}</p>
          </Button>
        ))}
        <Button>리셋</Button>
      </div>
      {/* 목록 */}
      <div className="flex flex-col gap-2 px-[120px]">
        {ITEM.map((item, index) => (
          <Link key={index} href={`/${index}`}>
            <Card className="relative flex flex-col overflow-hidden bg-transparent p-0 rounded-4xl">
              <Image
                src={'/temp_location.png'}
                fill
                alt="지도"
                className="object-cover -z-10"
              />
              <CardHeader className="relative flex flex-row p-0 justify-between pt-4 px-5">
                <div className="pointer-events-none absolute inset-0 backdrop-blur-xs bg-black/7 -z-10" />
                <div className="flex flex-col gap-2 ">
                  <p className="text-sm font-semibold">{item.address}</p>
                  <h3 className="text-[18px] font-bold truncate w-[200px]">
                    {item.project_name}
                  </h3>
                </div>
                <Badge className="text-sm font-bold bg-[#F4FF92] text-black">
                  {item.approval_status}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-row justify-between items-center">
                <div className="bg-black text-white flex flex-col text-center text-[26px] rounded-4xl py-4 px-2">
                  <p>{item.price_range.max}</p>
                  <p>~</p>
                  <p>{item.price_range.min}</p>
                </div>
                <div className="relative flex flex-col border-2 border-black rounded-3xl p-2 text-right gap-2 overflow-hidden h-fit">
                  <div className="pointer-events-none absolute inset-0 backdrop-blur-xs bg-black/7 -z-10" />
                  <p className="text-[20px] font-bold">{item.project_type}</p>
                  <div className="font-bold">
                    <p className="text-sm ">평균대지지분</p>
                    <p className="text-[20px]">{item.average_land_share}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="relative flex flex-row justify-between py-4 px-5">
                <div className="pointer-events-none absolute inset-0 backdrop-blur-xs bg-black/7 -z-10" />
                <div className="flex flex-col gap-2 font-bold">
                  <p className="text-[18px]">{item.new_households} 신축세대</p>
                  <p>임대 {item.rental_households}</p>
                </div>
                <Bookmark />
                <div className="flex flex-col text-sm text-gray-700 text-right">
                  <p>
                    소유자 수{' '}
                    <span className="font-bold">{item.owners_count}명</span>
                  </p>
                  <p className="font-bold">{item.land_area_m2}m2</p>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeftSide;
