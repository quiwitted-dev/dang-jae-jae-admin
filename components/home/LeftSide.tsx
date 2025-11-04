import { Bookmark } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import Image from 'next/image';

const FILTERBUTTON = [
  '위치',
  '사업성격',
  '사업단계',
  '시세',
  '권리자수',
  '신축세대수',
];

const ITEM = [
  {
    address: '강남구 개포동 185',
    project_name: '개포주공6,7단지아파트 재건축',
    approval_status: '추진위원회승인',
    price_range: {
      min: '30억',
      max: '41억',
    },
    map: '',
    project_type: '재건축',
    average_land_share: '26.19평',
    new_households: 2548,
    rental_households: 300,
    owners_count: 1081,
    land_area_m2: 132132.0,
    status: '진행중',
  },
  {
    address: '강남구 개포동 185',
    project_name: '개포주공6,7단지아파트 재건축',
    approval_status: '추진위원회승인',
    price_range: {
      min: '30억',
      max: '41억',
    },
    map: '',
    project_type: '재건축',
    average_land_share: '26.19평',
    new_households: 2548,
    rental_households: 300,
    owners_count: 1081,
    land_area_m2: 132132.0,
    status: '진행중',
  },
  {
    address: '강남구 개포동 185',
    project_name: '개포주공6,7단지아파트 재건축',
    approval_status: '추진위원회승인',
    price_range: {
      min: '30억',
      max: '41억',
    },
    map: '',
    project_type: '재건축',
    average_land_share: '26.19평',
    new_households: 2548,
    rental_households: 300,
    owners_count: 1081,
    land_area_m2: 132132.0,
    status: '진행중',
  },
];

const LeftSide = () => {
  return (
    <div className="flex flex-col max-w-[640px] w-full overflow-auto">
      {/* 필터링 */}
      <div className="flex flex-row">
        {FILTERBUTTON.map((item) => (
          <Button key={item} className="flex-1">
            {item}
          </Button>
        ))}
        <Button>리셋</Button>
      </div>
      {/* 목록 */}
      <div className="flex flex-col gap-2 px-[120px]">
        {ITEM.map((item, index) => (
          <Card
            key={index}
            className="relative flex flex-col overflow-hidden bg-transparent p-0 rounded-4xl"
          >
            <Image
              src={'/temp_location.png'}
              fill
              alt="지도"
              className="object-cover -z-10"
            />
            <CardHeader className="relative flex flex-row p-0 justify-between pt-4 px-5">
              <div className="pointer-events-none absolute inset-0 backdrop-blur-xs bg-black/7 -z-10" />
              <div className="flex flex-col gap-2 ">
                <p className="text-sm">{item.address}</p>
                <h3 className="text-[18px] font-bold truncate w-[200px]">{item.project_name}</h3>
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
        ))}
      </div>
    </div>
  );
};

export default LeftSide;
