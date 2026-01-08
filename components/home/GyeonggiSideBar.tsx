'use client';

import { ArrowRight } from 'lucide-react';
import { GyeonggiSubmissionDetail } from '@/types/submission.type';
import BookmarkCompareGroup from './[id]/BookmarkCompareGroup';
import PriceEditForm from './[id]/PriceEditForm';

type GyeonggiSideBarProps = {
  publicData: GyeonggiSubmissionDetail;
};

const GyeonggiSideBar = ({ publicData }: GyeonggiSideBarProps) => {
  const projectArea = Number(publicData.projectAreaM2);
  const ownerCount = Number(publicData.ownerCount);
  const average_land_share =
    projectArea > 0 && ownerCount > 0
      ? ((projectArea / ownerCount) * 0.3025).toFixed(2)
      : '-';

  const dateFormatter = (date: string) => {
    if (!date) return '-';
    const translateDate = new Date(date.replace(' ', 'T'));
    const year = String(translateDate.getFullYear());
    return year;
  };

  return (
    <div className="bg-linear-to-b from-[#F8F4F1] via-[rgb(242,236,251)] to-[#F1E6E6] text-black min-h-dvh whitespace-normal break-keep">
      <div className="flex max-w-[400px] mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="md:flex hidden w-full flex-row justify-between mt-5">
            <p>
              <span>{publicData.address.split(' ')[1]}</span>{' '}
              <span className="font-medium">
                {publicData.address.split(' ').slice(2).join(' ')}
              </span>
            </p>
            <p className="font-semibold">{publicData.projectType}</p>
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
                {publicData.generalSaleUnits}
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
            address={publicData.address}
          />

          <div className="flex flex-row gap-4 md:px-0 pb-5">
            <h4 className="text-[20px] font-bold whitespace-nowrap">
              요즘시세
            </h4>
            <p className="text-xs font-medium text-gray-500 whitespace-pre-line break-keep">
              <span className="text-gray-700">{`${publicData.renovationPrice?.user.nickname ?? '-'
                }님이 올려주신 시세입니다.`}</span>
              {`\n시세의 대략적인 정보이며 사용자 누구나 올리실 수 있습니다. 당신의 정보력을 보여주세요!`}
            </p>
          </div>

          <PriceEditForm data={publicData} type="PUBLIC_DATA" />

          <div className="mt-6 px-5 md:px-0">
            <div className="mb-4 text-sm font-bold text-[#49454F]">
              <div>
                <p>
                  사업예정기간 :{' '}
                  <span className="text-black">
                    {dateFormatter(publicData.projectedStartDate)}~
                    {dateFormatter(publicData.projectedEndDate)}
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
                    {publicData.newVolumeRatio}%
                  </span>
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
                  신축세대수 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.totalSaleUnits}
                  </span>{' '}
                  세대
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  정비구역면적 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.projectAreaM2}
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
            </div>

            <div className="text-sm text-black mb-4 whitespace-normal break-keep">
              <p>
                본 서비스에서 사용된 정보는 경기도에서 상업적이용으로 개방한
                공공데이터를 그대로 적용 하였으며, 해당 저작물의 원본 데이터
                출처는 [경기도 정비사업 온누리] 입니다.
                <br />
                <span className="text-gray-600">
                  공공데이터의 정보와 실제 진행 현황과 차이가 있을 수 있습니다.
                  제공된 정보의 정확성 여부와 무관하게, 이를 이용한 투자 결과에
                  대한 책임은 전적으로 이용자에게 있습니다.
                </span>
              </p>
            </div>

            <div className="mb-4">
              <div>
                정비예정구역고시일자{' '}
                <span className="font-bold">
                  {publicData.designatedZoneNotificationDate?.split('T')[0] ??
                    '-'}
                </span>
              </div>
              <div>
                정비구역지정예정일자{' '}
                <span className="font-bold">
                  {publicData.designatedZoneExpectedDate?.split('T')[0] ?? '-'}
                </span>
              </div>
              <div>
                정비계획승인일자{' '}
                <span className="font-bold">
                  {publicData.planApprovalDate?.split('T')[0] ?? '-'}
                </span>
              </div>
              <div>
                정비구역지정일자(최초지정){' '}
                <span className="font-bold">
                  {publicData.zoneDesignationDateInitial?.split('T')[0] ?? '-'}
                </span>
              </div>
              <div>
                정비구역지정일자(변경지정){' '}
                <span className="font-bold">
                  {publicData.zoneDesignationDateChanged?.split('T')[0] ?? '-'}
                </span>
              </div>
              <div>
                추진위승인일자{' '}
                <span className="font-bold">
                  {publicData.promotionCommitteeApprovalDate?.split('T')[0] ??
                    '-'}
                </span>
              </div>
              <div>
                조합설립인가{' '}
                <span className="font-bold">
                  {publicData.associationEstablishmentApprovalDate?.split(
                    'T'
                  )[0] ?? '-'}
                </span>
              </div>
              <div>
                사업시행인가{' '}
                <span className="font-bold">
                  {publicData.projectImplementationApprovalDate?.split(
                    'T'
                  )[0] ?? '-'}
                </span>
              </div>
              <div>
                관리처분인가{' '}
                <span className="font-bold">
                  {publicData.managementDispositionApprovalDate?.split(
                    'T'
                  )[0] ?? '-'}
                </span>
              </div>
              <div>
                착공일자{' '}
                <span className="font-bold">
                  {publicData.managementDispositionApprovalDate?.split(
                    'T'
                  )[0] ?? '-'}
                </span>
              </div>
              <div>
                일반분양일자{' '}
                <span className="font-bold">
                  {publicData.managementDispositionApprovalDate?.split(
                    'T'
                  )[0] ?? '-'}
                </span>
              </div>
              <div>
                준공일자{' '}
                <span className="font-bold">
                  {publicData.managementDispositionApprovalDate?.split(
                    'T'
                  )[0] ?? '-'}
                </span>
              </div>
              <div>
                이전고시일자{' '}
                <span className="font-bold">
                  {publicData.managementDispositionApprovalDate?.split(
                    'T'
                  )[0] ?? '-'}
                </span>
              </div>
              <div>
                40m²미만{' '}
                <span className="font-bold">
                  {publicData.newUnitsUnder40M2 ?? 0}
                </span>{' '}
                세대
              </div>
              <div>
                40~60m²미만{' '}
                <span className="font-bold">
                  {publicData.newUnits40To60M2 ?? 0}
                </span>{' '}
                세대
              </div>
              <div>
                60~85m²미만{' '}
                <span className="font-bold">
                  {publicData.newUnits60To85M2 ?? 0}
                </span>{' '}
                세대
              </div>
              <div>
                85~135m²미만{' '}
                <span className="font-bold">
                  {publicData.newUnits85To135M2 ?? 0}
                </span>{' '}
                세대
              </div>
              <div>
                135m²이상{' '}
                <span className="font-bold">
                  {publicData.newUnitsOver135M2 ?? 0}
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

export default GyeonggiSideBar;
