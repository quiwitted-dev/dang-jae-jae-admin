'use client';

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Pencil,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '../ui/input';
import {
  GyeonggiSubmissionDetail,
  SubmissionPublicDetail,
} from '@/types/submission.type';

type GyeonggiSideBarProps = {
  publicData: GyeonggiSubmissionDetail;
};

const GyeonggiSideBar = ({ publicData }: GyeonggiSideBarProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const { id } = publicData;

  const average_land_share =
    (+publicData.projectAreaM2 / +publicData.ownerCount) * 0.3025;

  const handleGoHome = () => {
    if (id !== undefined) {
      router.push(`/?id=${id}`);
    } else {
      router.push('/');
    }
  };

  const handleEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleSave = () => {};

  return (
    <div className="bg-linear-to-b from-[#F8F4F1] via-[rgb(242,236,251)] to-[#F1E6E6] max-w-[700px] md:w-[700px] text-black min-h-dvh">
      <div className="flex flex-row items-center justify-between px-4 py-5">
        <div className="flex flex-row gap-4 text-[18px] font-bold">
          <button onClick={handleGoHome} className="cursor-pointer">
            <ArrowLeft />
          </button>
          {publicData.imprvZoneNm}
        </div>
        <button onClick={handleGoHome} className="cursor-pointer">
          <X />
        </button>
      </div>
      <div className="flex max-w-[400px] mx-auto">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="text-3xl font-normal">
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

          <div className="flex flex-row gap-3">
            <Button className="rounded-full">
              <Bookmark />
            </Button>
            <Button className="rounded-full">비교담기</Button>
          </div>

          <div className="flex flex-row gap-4 px-5 md:px-0">
            <h4 className="text-[20px] font-bold whitespace-nowrap">
              요즘시세
            </h4>
            <p className="text-xs font-medium text-gray-500 whitespace-pre-line break-keep">
              <span className="text-gray-700">{`-님이 올려주신 시세입니다.`}</span>
              {`\n시세의 대략적인 정보이며 사용자 누구나 올리실 수 있습니다. 당신의 정보력을 보여주세요!`}
            </p>
          </div>

          <div className="border-2 relative border-black rounded-4xl flex flex-row p-3 gap-8 mx-2 md:mx-0">
            <div
              className="absolute -top-5 left-5 w-7 h-7 bg-black rounded-full flex items-center justify-center cursor-pointer"
              onClick={handleEdit}
            >
              <Pencil className="text-white" size={15} />
            </div>
            <div className="text-[40px] font-normal text-center">
              <div className="flex flex-row items-center">
                {isEdit ? (
                  <Input className="text-right" placeholder="" required />
                ) : (
                  <span className="font-playfair">0</span>
                )}
                억
              </div>
              <p>~</p>
              <div className="flex flex-row items-center">
                {isEdit ? (
                  <Input className="text-right" placeholder="" required />
                ) : (
                  <span className="font-playfair">0</span>
                )}
                억
              </div>
            </div>

            <div className="flex flex-col justify-around">
              {isEdit ? (
                <p className="text-xs font-medium text-gray-500 whitespace-normal break-keep">
                  현재 구역의 전반적인 시세를 알려주세요~! 억 단위이며 천단위는
                  반올림 해주세요. <br />
                  <span className="text-red-600">빨간색은 필수</span>입니다.
                </p>
              ) : (
                <p className="text-xs font-medium text-gray-500 whitespace-normal break-keep">
                  사용자가 게시한 대략적인 <strong>시세정보</strong>이며 매물
                  별로 크게 상이할 수 있고,{' '}
                  <strong className="text-gray-700">
                    참고 목적으로만 제공됩니다.
                  </strong>{' '}
                  당신의재재는 시세내용의 정확성을 보증하지 않습니다.
                </p>
              )}

              <div className="flex flex-row text-[14px] font-semibold justify-between items-center border-b border-b-gray py-2">
                <p>최소 초기 투자금</p>
                <div className="flex flex-row items-end">
                  {isEdit ? (
                    <Input className="text-right" placeholder="" required />
                  ) : (
                    <span className="font-playfair">0</span>
                  )}
                  억
                </div>
              </div>
              <div className="flex flex-row text-[14px] font-semibold justify-between items-center">
                <p className="whitespace-nowrap">프리미엄(P)</p>
                <div className="flex flex-row items-end">
                  {isEdit ? (
                    <Input className="text-right" placeholder="" required />
                  ) : (
                    <span className="font-playfair">0</span>
                  )}
                  억
                </div>
              </div>
            </div>
          </div>
          {isEdit && (
            <Button className="rounded-4xl font-medium items-center flex flex-row cursor-pointer">
              <Check />
              완료
            </Button>
          )}

          <div className="mt-6 px-5 md:px-0">
            <div className="mb-4 text-sm font-normal text-[#49454F]">
              <div>
                <p>
                  사업예정기간 :{' '}
                  <span className="text-black">
                    {publicData.projectedStartDate ?? '-'}
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
                    {publicData.newVolumeRatio}
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
                  <span className="text-black font-extrabold">-</span> 세대
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
                135m²미만{' '}
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
