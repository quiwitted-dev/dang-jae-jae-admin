'use client';

import { ArrowRight } from 'lucide-react';
import { SeoulSubmissionDetail } from '@/types/submission.type';
import BookmarkCompareGroup from './[id]/BookmarkCompareGroup';
import PriceEditForm from './[id]/PriceEditForm';

type SeoulSideBarProps = {
  publicData: SeoulSubmissionDetail;
};

const SeoulSideBar = ({ publicData }: SeoulSideBarProps) => {
  const projectArea = Number(publicData.projectAreaM2);
  const ownerCount = Number(publicData.ownerCount);
  const average_land_share =
    projectArea > 0 && ownerCount > 0
      ? ((projectArea / ownerCount) * 0.3025).toFixed(2)
      : '-';
  const [_, ...address] = publicData.representativeLotNumber.split(' ');

  return (
    <div className="bg-linear-to-b from-[#F8F4F1] via-[rgb(242,236,251)] to-[#F1E6E6] text-black min-h-dvh whitespace-normal break-keep">
      <div className="flex max-w-[400px] mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="md:flex hidden w-full flex-row justify-between mt-5">
            <p>
              <span>{publicData.representativeLotNumber.split(' ')[1]}</span>{' '}
              <span className="font-medium">
                {publicData.representativeLotNumber
                  .split(' ')
                  .slice(2)
                  .join(' ')}
              </span>
            </p>
            <p className="font-semibold">{publicData.businessType}</p>
          </div>
          <div className="text-3xl font-normal w-full">
            <div className="md:hidden flex flex-row py-4">
              <p className="text-[11px] font-[#49454F]">**</p>
              <p className="text-[11px] font-[#49454F]">
                정비구역의 대표위치만 지도상에 표시됩니다.
                <br /> 상세한 구역면적은 [토지이음]에서 확인하실 수 있습니다.
              </p>
            </div>
            <h3>
              일반분양 세대수{' '}
              <span className="font-extrabold">
                {publicData.totalSaleUnits - publicData.ownerCount < 0
                  ? '-'
                  : publicData.totalSaleUnits - publicData.ownerCount}
              </span>{' '}
              세대
            </h3>
            <h3>
              평균 대지지분{' '}
              <span className="font-extrabold">{average_land_share}</span>평
            </h3>
            <h3>
              진행단계{' '}
              <span className="font-extrabold">{publicData.currentStage}</span>
            </h3>
          </div>

          <BookmarkCompareGroup
            id={publicData.id}
            type="PUBLIC_DATA"
            address={publicData.representativeLotNumber}
          />

          <div className="flex flex-row gap-4 md:px-0 pb-5">
            <h4 className="text-[20px] font-bold whitespace-nowrap">
              요즘시세
            </h4>
            <p className="text-xs font-medium text-gray-500 whitespace-pre-line break-keep">
              <span className="text-gray-700">{` ${
                publicData.renovationPrice?.user.nickname ?? '-'
              } 님이 올려주신 시세입니다.`}</span>
              {`\n시세의 대략적인 정보이며 사용자 누구나 올리실 수 있습니다. 당신의 정보력을 보여주세요!`}
            </p>
          </div>

          <PriceEditForm data={publicData} type="PUBLIC_DATA" />

          <div className="mt-6 px-5 md:px-0">
            <div className="mb-4 text-sm font-normal text-[#49454F]">
              <div>
                <p>
                  주용도 :{' '}
                  <span className="text-black">
                    {publicData.mainUsage ?? '-'}
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  기타 : <span>-</span>
                </p>
                <p className="font-bold">
                  용적률{' '}
                  <span className="text-black font-extrabold">
                    {publicData.buildingCoverageRatio ?? '-'}
                  </span>{' '}
                  %
                </p>
              </div>
              <div className="flex flex-row justify-between">
                {/* 용도지역 예)제3종 일반주거지역 */}
                <p className="text-black font-bold truncate max-w-[250px]">
                  {publicData.usageZone}
                </p>
                <p className="font-bold">
                  건폐율{' '}
                  <span className="text-black font-extrabold">
                    {publicData.volumeRatio ?? '-'}
                  </span>{' '}
                  %
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  소유자수 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.ownerCount ?? '-'}
                  </span>{' '}
                  세대
                </p>
                <ArrowRight />
                <p>
                  분양세대수 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.totalSaleUnits ?? '-'}
                  </span>{' '}
                  세대
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  정비구역면적 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.projectAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </p>
                <p>
                  임대 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.rentalUnits ?? '-'}
                  </span>{' '}
                  세대
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  신축 지상층수 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.newConstructionFloors ?? '-'}
                  </span>{' '}
                  층
                </p>
              </div>
            </div>

            <div className="text-sm text-black mb-4 whitespace-normal break-keep">
              <p>
                본 서비스에서 사용된 데이터는 서울시 공공누리 제1유형으로 개방한
                공공저작물을 활용하였으며, 해당 저작물의 원본출처는 [정비사업
                정보몽땅] 입니다.
              </p>
              <p className="text-gray-600">
                공공데이터의 정보와 실제 진행 현황과 차이가 있을 수 있습니다.
                제공된 정보의 정확성 여부와 무관하게, 이를 이용한 투자 결과에
                대한 책임은 전적으로 이용자에게 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 w-full">
              <div>
                <div>
                  택지면적{' '}
                  <span className="text-black font-extrabold">
                    {publicData.residentialLandAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
                <div>
                  공원면적{' '}
                  <span className="text-black font-extrabold">
                    {publicData.parkAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
                <div>
                  공공공지{' '}
                  <span className="text-black font-extrabold">
                    {publicData.publicOpenSpaceAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
                <div>
                  기타면적{' '}
                  <span className="text-black font-extrabold">
                    {publicData.otherAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div>도로면적 - m²</div>
                <div>녹지면적 - m²</div>
                <div>학교면적 - m²</div>
              </div>
            </div>

            <div className="mb-4">
              <div>
                60m²이하{' '}
                <span className="font-bold">
                  {publicData.unitsUnder60M2 ?? '-'}
                </span>{' '}
                세대
              </div>
              <div>
                60m²초과~85m²이하{' '}
                <span className="font-bold">
                  {publicData.units60To85M2 ?? '-'}
                </span>{' '}
                세대
              </div>
              <div>
                85m²초과{' '}
                <span className="font-bold">
                  {publicData.unitsOver85M2 ?? '-'}
                </span>{' '}
                세대
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoulSideBar;
