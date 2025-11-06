import { Bookmark, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';

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
    map: '/temp_map.png',
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
      etc: '',
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
      {/* 목록 */}
      <div className="flex flex-col gap-2 md:px-[120px] px-2">
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
                <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
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
                  <div className="flex flex-row">
                    <p className="font-playfair">
                      {item.price_range.max.toString().replace(/0{8}$/, '')}
                    </p>
                    억
                  </div>
                  <p className="p-0 m-0 font-playfair leading-none">~</p>
                  <div className="flex flex-row">
                    <p className="font-playfair">
                      {item.price_range.min.toString().replace(/0{8}$/, '')}
                    </p>
                    억
                  </div>
                </div>
                <div className="relative flex flex-col border-2 border-black rounded-3xl p-2 text-right gap-2 overflow-hidden h-fit">
                  <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
                  <p className="text-[20px] font-bold">{item.project_type}</p>
                  <div className="font-bold">
                    <p className="text-sm ">평균대지지분</p>
                    <p className="text-[20px]">{item.average_land_share}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="relative flex flex-row justify-between py-4 px-5">
                <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
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
      <div className="md:hidden relative flex flex-col flex-1 min-h-[650px] mt-10 ">
        <Image
          src={'/faces.png'}
          width={400}
          height={300}
          alt="얼굴 아이콘들"
          className="absolute bottom-0 left-0 right-0 w-full object-contain -z-10"
        />

        <div>
          <p className="text-white whitespace-pre-line break-keep text-center text-[28px] font-bold">
            {`찾는 사업장이 없나요? \n예정지 인가요? \n사업장을 추가하여 \n다른사람들에게 알려주세요`}
          </p>
        </div>

        <Button
          className="absolute mx-auto bottom-9 left-1/2 -translate-x-1/2 text-[25px] font-semibold rounded-full"
          size={'lg'}
        >
          <Plus /> 예정지 추가하기
        </Button>
      </div>
    </div>
  );
};

export default LeftSide;
