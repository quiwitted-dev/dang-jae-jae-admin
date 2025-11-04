import { ArrowLeft, Bookmark, X } from 'lucide-react';
import { Button } from '../ui/button';

type DetailSideBarProps = {
  address: string;
  project_name: string;
  approval_status: string;
  price_range: {
    min: number;
    max: number;
    min_initial_investment: number;
    premium: number;
  };
  nick_name: string;
  map: string;
  project_type: string;
  average_land_share: number;
  new_households: number;
  rental_households: number;
  owners_count: number;
  land_area_m2: number;
  status: string;
  details: {
    usage: string;
    purpose_area: string;
    floor_area_ratio: string;
    building_coverage: string;
    owners: number;
    total_households: number;
    reconstruction_area_m2: number;
    buildings: number;
    planned_buildings: number;
  };
  area_distribution: {
    under_60m2: number;
    '60m2_to_85m2': number;
    over_85m2: number;
  };
  facilities: {
    parking_area_m2: number;
    road_area_m2: number;
    park_area_m2: number;
    green_area_m2: number;
    public_area_m2: number;
    school_area_m2: number;
    other_area_m2: number;
  };
};

const DetailSideBar = ({ data }: { data: DetailSideBarProps }) => {
  return (
    <div className="bg-linear-to-b from-[#F8F4F1] via-[#F2ECFB] to-[#F1E6E6] max-w-[700px] text-black">
      <div className="flex flex-row items-center justify-between px-4 py-5">
        <div className="flex flex-row gap-4">
          <ArrowLeft />
          {data.project_name}
        </div>
        <X />
      </div>

      <div className="flex flex-col px-20">
        <div>
          <h3>
            일반분양 세대수 <span>{data.rental_households}</span>
          </h3>
          <h3>
            평균 대지지분 <span>{data.average_land_share}</span>평
          </h3>
          <h3>
            진행단계 <span>{data.approval_status}</span>
          </h3>
        </div>

        <div className="flex flex-row">
          <Button>
            <Bookmark />
          </Button>
          <Button>비교담기</Button>
        </div>

        <div className="flex felx-row">
          <h4>요즘시세</h4>
          <p>{`${data.nick_name}님이 올려주신 시세입니다.\n시세의 대략적인 정보이며 사용자 누구나 올리실 수 있습니다. 당신의 정보력을 보여주세요! `}</p>
        </div>

        <div className="border-2 border-black rounded-4xl flex flex-row">
          <div>
            <div>{data.price_range.min}억</div>
            <p>~</p>
            <div>{data.price_range.max}억</div>
          </div>

          <div>
            <p>
              사용자가 게시한 대략적인 시세정보이며 매물 별로 크게 상이할 수
              있고, 참고 목적으로만 제공됩니다. 당신의재재는 시세내용의 정확성을
              보증하지 않습니다.
            </p>
            <div className="flex flex-row">
              <p>최소 초기 투자금</p>
              <p>{data.price_range.min_initial_investment}</p>
            </div>
            <div className="flex flex-row">
              <p>프리미엄(P)</p>
              <p>{data.price_range.premium}억</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <div>
              <h4>주용도 : </h4>
              <p>{data.details.usage}</p>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p>
              본 서비스에서 사용된 데이터는 서울시 공공누리 제1유형으로 가공한
              공공저작물을 활용하였으며, 해당 저작물의 원본출처는 (정비사업
              정보공개) 입니다.
            </p>
            <p>공공데이터의 정보는 실제 진행 현황과 상이가 있을 수 있습니다.</p>
            <p>
              게재된 정보의 정확성 여부와 무관하게, 이를 이용한 투자 결정에 대한
              책임은 전적으로 이용자에게 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div>택지면적 - m²</div>
              <div>공원면적 - m²</div>
              <div>공공공지 - m²</div>
              <div>기타면적 - m²</div>
            </div>
            <div>
              <div>도로면적 - m²</div>
              <div>녹지면적 - m²</div>
              <div>학교면적 - m²</div>
            </div>
          </div>

          <div className="mb-4">
            <div>
              60m²이하{' '}
              <span className="font-bold">
                {data.area_distribution.under_60m2}
              </span>{' '}
              세대
            </div>
            <div>
              60m²초과~85m²이하{' '}
              <span className="font-bold">
                {data.area_distribution['60m2_to_85m2']}
              </span>{' '}
              세대
            </div>
            <div>
              85m²초과{' '}
              <span className="font-bold">
                {data.area_distribution.over_85m2}
              </span>{' '}
              세대
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSideBar;
