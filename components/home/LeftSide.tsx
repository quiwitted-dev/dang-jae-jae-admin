import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import Link from 'next/link';
import ProjectCard from '../common/ProjectCard';
import { ApprovedSubmissionList } from '@/types/type';

// export const ITEM = [
//   {
//     address: '강남구 개포동 185',
//     project_name: '개포주공6,7단지아파트 재건축',
//     approval_status: '추진위원회승인',
//     price_range: {
//       min: 3000000000,
//       max: 4100000000,
//       min_initial_investment: 2500000000,
//       premium: 0,
//     },
//     nick_name: '닉네임닉네01099990000',
//     map: '/temp_map.png',
//     project_type: '재건축',
//     average_land_share: 26.19,
//     new_households: 2548,
//     rental_households: 300,
//     owners_count: 1081,
//     land_area_m2: 132132.0,
//     status: '진행중',
//     details: {
//       usage: '공공주택 및 부대 복리시설',
//       purpose_area: '제3종 일반주거지역',
//       floor_area_ratio: '230.55%',
//       building_coverage: '21.16%',
//       owners: 564,
//       total_households: 787,
//       reconstruction_area_m2: 48837.5,
//       buildings: 3,
//       planned_buildings: 20,
//       etc: '',
//     },
//     area_distribution: {
//       under_60m2: 83,
//       '60m2_to_85m2': 309,
//       over_85m2: 395,
//     },
//     facilities: {
//       parking_area_m2: 0,
//       road_area_m2: 0,
//       park_area_m2: 0,
//       green_area_m2: 0,
//       public_area_m2: 0,
//       school_area_m2: 0,
//       other_area_m2: 0,
//     },
//   },
//   {
//     address: '강남구 개포동 185',
//     project_name: '개포주공6,7단지아파트 재건축',
//     approval_status: '추진위원회승인',
//     price_range: {
//       min: 3000000000,
//       max: 4100000000,
//       min_initial_investment: 2500000000,
//       premium: 0,
//     },
//     nick_name: '닉네임닉네01099990000',
//     map: '/temp_map.png',
//     project_type: '재건축',
//     average_land_share: 26.19,
//     new_households: 2548,
//     rental_households: 300,
//     owners_count: 1081,
//     land_area_m2: 132132.0,
//     status: '진행중',
//     details: {
//       usage: '공공주택 및 부대 복리시설',
//       purpose_area: '제3종 일반주거지역',
//       floor_area_ratio: '230.55%',
//       building_coverage: '21.16%',
//       owners: 564,
//       total_households: 787,
//       reconstruction_area_m2: 48837.5,
//       buildings: 3,
//       planned_buildings: 20,
//       etc: '',
//     },
//     area_distribution: {
//       under_60m2: 83,
//       '60m2_to_85m2': 309,
//       over_85m2: 395,
//     },
//     facilities: {
//       parking_area_m2: 0,
//       road_area_m2: 0,
//       park_area_m2: 0,
//       green_area_m2: 0,
//       public_area_m2: 0,
//       school_area_m2: 0,
//       other_area_m2: 0,
//     },
//   },
//   {
//     address: '강남구 개포동 185',
//     project_name: '개포주공6,7단지아파트 재건축',
//     approval_status: '추진위원회승인',
//     price_range: {
//       min: 3000000000,
//       max: 4100000000,
//       min_initial_investment: 2500000000,
//       premium: 0,
//     },
//     nick_name: '닉네임닉네01099990000',
//     map: '/temp_map.png',
//     project_type: '재건축',
//     average_land_share: 26.19,
//     new_households: 2548,
//     rental_households: 300,
//     owners_count: 1081,
//     land_area_m2: 132132.0,
//     status: '진행중',
//     details: {
//       usage: '공공주택 및 부대 복리시설',
//       purpose_area: '제3종 일반주거지역',
//       floor_area_ratio: '230.55%',
//       building_coverage: '21.16%',
//       owners: 564,
//       total_households: 787,
//       reconstruction_area_m2: 48837.5,
//       buildings: 3,
//       planned_buildings: 20,
//       etc: '',
//     },
//     area_distribution: {
//       under_60m2: 83,
//       '60m2_to_85m2': 309,
//       over_85m2: 395,
//     },
//     facilities: {
//       parking_area_m2: 0,
//       road_area_m2: 0,
//       park_area_m2: 0,
//       green_area_m2: 0,
//       public_area_m2: 0,
//       school_area_m2: 0,
//       other_area_m2: 0,
//     },
//   },
// ];

const LeftSide = async ({ data }: { data: ApprovedSubmissionList }) => {
  const submissions = data.submissions.slice(0, 20);
  return (
    <div className="flex flex-col max-w-[700px] w-full gap-4">
      {/* 목록 */}
      <div className="flex flex-col gap-2 md:px-[120px] px-2">
        {submissions.map((item) => (
          <ProjectCard key={item.id} item={item} />
        ))}
      </div>
      <div className="relative flex flex-col flex-1 min-h-[650px] mt-10">
        <Image
          src={'/faces.png'}
          width={400}
          height={300}
          alt="얼굴 아이콘들"
          className="absolute bottom-0 left-0 right-0 w-full object-contain -z-10 md:px-[120px]"
        />

        <div>
          <p className="text-white whitespace-pre-line break-keep text-center text-[28px] font-bold">
            {`찾는 사업장이 없나요? \n예정지 인가요? \n사업장을 추가하여 \n다른사람들에게 알려주세요`}
          </p>
        </div>

        <Link href={'/expected_add'}>
          <Button
            className="absolute mx-auto bottom-9 left-1/2 -translate-x-1/2 text-[25px] font-semibold rounded-full"
            size={'lg'}
          >
            <Plus /> 예정지 추가하기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LeftSide;
