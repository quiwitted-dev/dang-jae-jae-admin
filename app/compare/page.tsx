'use client';

import {
  getSubmissionPublicDetail,
  getSubmissionUserDetail,
} from '@/services/submission.api';
import useCompareStore, { CompareItem } from '@/store/useCompareStore';
import {
  SubmissionPublicDetail,
  SubmissionUserDetail,
} from '@/types/submission.type';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const defaultValue = {
  zoneName: '',
  address: '',
  projectArenaM2: '',
  residentialLandAreaM2: '',
  minPrice: '',
  maxPrice: '',
  averageLandScale: '',
  ownerCount: '',
  associationSaleUnits: '',
  generalSaleUnits: '',
  rentalUnits: '',
  newConstructionUnits: '',
  newVolumeRatio: '',
  currentStage: '',
  businessType: '',
  businessOperator: '',
};

const mapPublicResultToCompare = (data: SubmissionPublicDetail) => {
  // 경기/서울 데이터 스키마가 달라서 키 존재 여부로 분기
  if (data.dataSource === 'GYEONGGI') {
    return {
      zoneName: data.imprvZoneNm ?? '',
      address: data.address ?? '',
      projectArenaM2: data.projectAreaM2 ?? '',
      residentialLandAreaM2: '0',
      minPrice: data.renovationPrice?.minPrice ?? '0',
      maxPrice: data.renovationPrice?.maxPrice ?? '0',
      averageLandScale: `${getAverageLandSclae(
        +data.projectAreaM2,
        +data.ownerCount
      )}`,
      ownerCount: `${data.ownerCount ?? ''}`,
      associationSaleUnits: `${data.memberSaleUnits ?? 0}`,
      generalSaleUnits: `${data.generalSaleUnits ?? '0'}`,
      rentalUnits: `${data.rentalUnits ?? '0'}`,
      newConstructionUnits: `${+data.totalSaleUnits + +data.rentalUnits}`,
      newVolumeRatio: data.newVolumeRatio ?? '0',
      currentStage: data.currentStage ?? '-',
      businessType: data.projectType ?? '-',
      businessOperator: data.businessOperatorName ?? '-',
    };
  }

  return {
    zoneName: data.renovationZoneName ?? '-',
    address: data.representativeLotNumber ?? '-',
    projectArenaM2: data.projectAreaM2 ?? '0',
    residentialLandAreaM2: data.residentialLandAreaM2 ?? '0',
    minPrice: data.renovationPrice?.minPrice ?? '0',
    maxPrice: data.renovationPrice?.maxPrice ?? '0',
    averageLandScale: `${getAverageLandSclae(
      +data.projectAreaM2,
      +data.ownerCount
    )}`,
    ownerCount: `${data.ownerCount ?? '0'}`,
    associationSaleUnits: `${data.ownerCount ?? '0'}`,
    generalSaleUnits: `${+data.totalSaleUnits - +data.ownerCount < 0
      ? 0
      : +data.totalSaleUnits - +data.ownerCount
      }`,
    rentalUnits: `${data.rentalUnits}`,
    newConstructionUnits: `${+data.rentalUnits + +data.totalSaleUnits}`,
    newVolumeRatio: data.buildingCoverageRatio ?? '0',
    currentStage: data.currentStage ?? '',
    businessType: data.businessType ?? '',
    businessOperator: data.businessOperatorName ?? '-',
  };
};

const mapUserResultToCompare = (data: SubmissionUserDetail) => ({
  zoneName: data.tempName ?? '-',
  address: data.location ?? '-',
  projectArenaM2: data.projectArea ?? '0',
  residentialLandAreaM2: '0',
  minPrice:
    data.renovationPrice?.minPrice ??
    data.priceRange?.match(/\d+/g)?.[0] ??
    '0',
  maxPrice:
    data.renovationPrice?.maxPrice ??
    data.priceRange?.match(/\d+/g)?.[1] ??
    '0',
  averageLandScale: `${getAverageLandSclae(
    +data.projectArea,
    +data.ownerCount
  )}`,
  ownerCount: `${data.ownerCount ?? '0'}`,
  associationSaleUnits: '0',
  generalSaleUnits: '0',
  rentalUnits: '0',
  newConstructionUnits: `${data.expectedNewUnits ?? '0'}`,
  newVolumeRatio: data.expectedVolumeRatio ?? '0',
  currentStage: '예정지',
  businessType: data.businessType ?? '-',
  businessOperator: data.businessEntity ?? '-',
});

export const getAverageLandSclae = (dividend: number, divisor: number) => {
  if (dividend === 0 || divisor === 0) {
    return 0;
  }

  const result = ((dividend / divisor) * 0.3025).toFixed(2);
  return result;
};

const ComparePage = () => {
  const { compare, removeCompare } = useCompareStore();
  const [compare1, setCompare1] = useState(defaultValue);
  const [compare2, setCompare2] = useState(defaultValue);
  const [widthOffset, setWidthOffset] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const computeOffset = (width: number) => {
      if (width < 555) return 14;
      if (width < 768) return 9;
      if (width < 1150) return 17;
      if (width < 1500) return 12;
      return 7;
    };

    const handleResize = () => setWidthOffset(computeOffset(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCompareData = async () => {
      // 슬랏 초기화 후 현재 compare 상태에 맞춰 다시 채운다.
      setCompare1(defaultValue);
      setCompare2(defaultValue);

      const nonNullItems = compare
        .map((item, index) => ({ item, index }))
        .filter(
          (entry): entry is { item: CompareItem; index: number } =>
            entry.item !== null
        );

      if (nonNullItems.length === 0) {
        return;
      }

      const tasks = nonNullItems.map(({ item }) =>
        item.dataType === 'PUBLIC_DATA'
          ? getSubmissionPublicDetail(item.id)
          : getSubmissionUserDetail(item.id)
      );
      const results = await Promise.all(tasks);

      results.forEach((result, idx) => {
        const { item, index } = nonNullItems[idx];
        const mapped =
          item.dataType === 'PUBLIC_DATA'
            ? mapPublicResultToCompare(result as SubmissionPublicDetail)
            : mapUserResultToCompare(result as SubmissionUserDetail);

        if (index === 0) {
          setCompare1(mapped);
        } else {
          setCompare2(mapped);
        }
      });
    };

    fetchCompareData();
  }, [compare]);

  const handleGoHome = () => {
    router.push('/');
  };

  const getPercentage = (dividend: number, divisor: number) => {
    if (dividend === 0 || divisor === 0) {
      return 0;
    }
    const result = Math.round((+dividend / +divisor) * 100);
    if (result > 100) {
      return 100;
    }
    return result;
  };

  const getAdjustedPercentage = (dividend: number, divisor: number) => {
    const base = getPercentage(dividend, divisor);
    if (base >= 100) return 100;
    if (base + widthOffset >= 100) return base;
    if (base === 0) return 0;
    return base + widthOffset;
  };

  const getArea = (area: number) => {
    const converted = +area * 0.3025;

    if (!converted) return 0;
    if (converted < 100) {
      return Math.floor(converted) / 2;
    }
    return Math.floor(converted / 100) / 2;
  };

  return (
    <div
      className="flex flex-row min-h-dvh relative pb-20  overflow-hidden
    "
    >
      {/* 왼쪽 50% - 그라데이션 */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-linear-to-b from-[#F2EEEB] via-[#CFCCFF] to-[#D1DFD3]"></div>

      {/* 오른쪽 50% - 그라데이션 */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-b from-[#F2EEEB] via-[#EECFD3] to-[#E7DDE3]"></div>

      {/* 좌측 md이상 */}
      <section className="hidden md:flex flex-1 flex-col relative text-black items-center pt-4 z-20">
        {compare[0] ? (
          <X
            width={34}
            height={34}
            strokeWidth={1}
            className="cursor-pointer"
            onClick={() => removeCompare(0)}
          />
        ) : (
          <Plus
            width={34}
            height={34}
            strokeWidth={1}
            className="cursor-pointer"
            onClick={() => handleGoHome()}
          />
        )}

        <div className="flex flex-col gap-2 text-center pt-4 h-20 ">
          <h3 className="text-[18px] font-bold">{compare1.zoneName}</h3>
          <p className="text-xl font-thin">{compare1.address}</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare1.projectArenaM2} m²</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare1.residentialLandAreaM2} m²
            </p>
          </div>
        </div>

        {/* 일반분양수 % */}
        <h3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-extrabold">
          {getPercentage(
            +compare1.generalSaleUnits,
            +compare1.newConstructionUnits
          )}
          <span className="font-light">%</span>
        </h3>
      </section>

      {/* 좌측 모바일 */}
      <div className="absolute md:hidden flex flex-col text-black items-center pt-4 top-0 left-0 w-1/2 h-[300px] z-20">
        <div className="w-full h-[34px]">
          {compare[0] ? (
            <X
              width={34}
              height={34}
              strokeWidth={1}
              className="cursor-pointer mx-auto"
              onClick={() => removeCompare(0)}
            />
          ) : (
            <Plus
              width={34}
              height={34}
              strokeWidth={1}
              className="cursor-pointer mx-auto"
              onClick={() => handleGoHome()}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 text-center pt-4 w-full h-32">
          <h3 className="text-base font-bold truncate ">{compare1.zoneName}</h3>
          <p className="text-base font-thin whitespace-normal break-keep px-5">
            {compare1.address}
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-[30px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare1.projectArenaM2} m²</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare1.residentialLandAreaM2} m²
            </p>
          </div>
        </div>
      </div>

      {/* 우측 모바일 */}
      <div className="absolute md:hidden flex flex-col text-black items-center pt-4 top-0 right-0 w-1/2 h-[300px] z-20">
        <div className="w-full h-[34px]">
          {compare[1] ? (
            <X
              width={34}
              height={34}
              strokeWidth={1}
              className="cursor-pointer mx-auto"
              onClick={() => removeCompare(1)}
            />
          ) : (
            <Plus
              width={34}
              height={34}
              strokeWidth={1}
              className="cursor-pointer mx-auto"
              onClick={() => handleGoHome()}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 text-center pt-4 w-full h-32">
          <h3 className="text-base font-bold truncate ">{compare2.zoneName}</h3>
          <p className="text-base font-thin whitespace-normal break-keep px-5">
            {compare2.address}
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-[30px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare2.projectArenaM2} m²</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare2.residentialLandAreaM2} m²
            </p>
          </div>
        </div>
      </div>

      {/* 메인 비교 */}
      <section className="flex-1 flex flex-col items-center justify-center relative z-10 text-black md:px-0 px-4 pb-20 md:pb-0">
        {/* Top Line with 위치 */}
        <div className="md:mt-20 mt-28 w-full flex items-center justify-center">
          <div className="w-full relative">
            <div className="h-px bg-black md:w-full w-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white rounded-full md:w-[60px] md:h-[60px] w-10 h-10 flex items-center justify-center text-sm font-normal">
              위치
            </div>
          </div>
        </div>

        {/* 면적 Bubble */}
        <div className="relative flex w-full h-[250px]">
          <div className="absolute inset-y-0 left-0 w-1/2 -z-10 ">
            <div
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-radial-[at_75%_50%] from-[##D5B3CB00] to-[#98b6af] transition-all duration-500 rounded-l-full"
              style={{
                width: `${getArea(+compare1.projectArenaM2) / 2}px`,
                height: `${getArea(+compare1.projectArenaM2)}px`,
              }} // 왼쪽 비율
            />
            <div
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-radial-[at_75%_50%] from-[#f3eae9] to-[#c4a9dc] transition-all duration-500 rounded-l-full"
              style={{
                width: `${getArea(+compare1.residentialLandAreaM2) / 2}px`,
                height: `${getArea(+compare1.residentialLandAreaM2)}px`,
              }} // 왼쪽 비율
            />
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 -z-10 ">
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-radial-[at_25%_50%] from-[#D5B3CB00] to-[#98b6af]  transition-all duration-500 rounded-r-full"
              style={{
                width: `${getArea(+compare2.projectArenaM2) / 2}px`,
                height: `${getArea(+compare2.projectArenaM2)}px`,
              }} // 오른쪽 비율
            />
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-radial-[at_25%_50%] from-[#f3eae9] to-[#c4a9dc]  transition-all duration-500 rounded-r-full"
              style={{
                width: `${getArea(+compare2.residentialLandAreaM2) / 2}px`,
                height: `${getArea(+compare2.residentialLandAreaM2)}px`,
              }} // 오른쪽 비율
            />
          </div>
          <div className="rounded-full flex items-center justify-center mx-auto">
            <span className="text-sm font-normal text-black">면적</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center w-full max-w-4xl gap-2">
          {/* 가격 비교 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              {compare[0] ? (
                <>
                  <span className="text-xl font-semibold">
                    {compare1.minPrice}억
                  </span>
                  <span className="text-xl font-semibold">~</span>
                  <span className="text-xl font-semibold">
                    {compare1.maxPrice}억
                  </span>
                </>
              ) : (
                <span className="text-xl font-semibold">억</span>
              )}
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm font-normal shrink-0">
              가격
            </div>
            <div className="flex-1 text-left pl-4">
              {compare[1] ? (
                <>
                  {' '}
                  <span className="text-xl font-semibold">
                    {compare2.minPrice}억
                  </span>
                  <span className="text-xl font-semibold">~</span>
                  <span className="text-xl font-semibold">
                    {compare2.maxPrice}억
                  </span>
                </>
              ) : (
                <span className="text-xl font-semibold">억</span>
              )}
            </div>
          </div>

          {/* 평균 대지지분 */}
          <div className="flex items-center w-full gap-16">
            <div className="flex-1 text-right pr-4 h-[60px]">
              <span className="text-4xl font-bold whitespace-nowrap">
                {compare1.averageLandScale === 'Infinity'
                  ? '0'
                  : compare1.averageLandScale}
                <span className="text-xl">평</span>
              </span>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-black text-white
                  rounded-full w-[60px] h-[60px] flex items-center
                  justify-center text-sm font-normal text-center"
            >
              평균
              <br />
              대지지분
            </div>
            <div className="flex-1 text-left pl-4  h-[60px]">
              <span className="text-4xl font-bold whitespace-nowrap">
                {compare2.averageLandScale === 'Infinity'
                  ? '0'
                  : compare2.averageLandScale}
                <span className="text-xl">평</span>
              </span>
            </div>
          </div>

          {/* 소유자 수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full h-[60px]">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{
                    width: `${getPercentage(
                      +compare1.ownerCount,
                      +compare1.newConstructionUnits
                    )}%`,
                  }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{
                    width: `${getPercentage(
                      +compare2.ownerCount,
                      +compare2.newConstructionUnits
                    )}%`,
                  }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>
                {getPercentage(
                  +compare1.ownerCount,
                  +compare1.newConstructionUnits
                )}
                %
              </span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-20">
                <span className="text-base font-thin text-white">
                  {compare1.ownerCount}명
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-black text-white
                  rounded-full w-[60px] h-[60px] flex items-center
                  justify-center text-sm font-normal text-center"
              >
                소유자 수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  {compare2.ownerCount}명
                </span>
              </div>
              <span>
                {getPercentage(
                  +compare2.ownerCount,
                  +compare2.newConstructionUnits
                )}
                %
              </span>
            </div>
          </div>

          {/* 조합원 분양수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full h-[60px]">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{
                    width: `${getPercentage(
                      +compare1.associationSaleUnits,
                      +compare1.newConstructionUnits
                    )}%`,
                  }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{
                    width: `${getPercentage(
                      +compare2.associationSaleUnits,
                      +compare2.newConstructionUnits
                    )}%`,
                  }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>
                {getPercentage(
                  +compare1.associationSaleUnits,
                  +compare1.newConstructionUnits
                )}
                %
              </span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-20">
                <span className="text-base font-thin text-white">
                  {compare1.associationSaleUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-black text-white
                  rounded-full w-[60px] h-[60px] flex items-center
                  justify-center text-sm font-normal text-center"
              >
                조합원
                <br />
                분양수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  {compare2.associationSaleUnits}세대
                </span>
              </div>
              <span>
                {getPercentage(
                  +compare2.associationSaleUnits,
                  +compare2.newConstructionUnits
                )}
                %
              </span>
            </div>
          </div>

          {/* 일반 분양수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full h-[60px]">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#F4FF92] transition-all duration-500 rounded-l-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare1.generalSaleUnits,
                      +compare1.newConstructionUnits
                    )}%`,
                  }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#F4FF92] transition-all duration-500 rounded-r-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare2.generalSaleUnits,
                      +compare2.newConstructionUnits
                    )}%`,
                  }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>
                {getPercentage(
                  +compare1.generalSaleUnits,
                  +compare1.newConstructionUnits
                )}
                %
              </span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-20">
                <span className="text-base font-thin text-black">
                  {compare1.generalSaleUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-black text-white
                  rounded-full w-[60px] h-[60px] flex items-center
                  justify-center text-sm font-normal text-center"
              >
                일반
                <br />
                분양수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-black">
                  {compare2.generalSaleUnits}세대
                </span>
              </div>
              <span>
                {getPercentage(
                  +compare2.generalSaleUnits,
                  +compare2.newConstructionUnits
                )}
                %
              </span>
            </div>
          </div>

          {/* 임대 세대수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full h-[60px]">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#FF0000] transition-all duration-500 rounded-l-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare1.rentalUnits,
                      +compare1.newConstructionUnits
                    )}%`,
                  }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#FF0000] transition-all duration-500 rounded-r-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare2.rentalUnits,
                      +compare2.newConstructionUnits
                    )}%`,
                  }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>
                {getPercentage(
                  +compare1.rentalUnits,
                  +compare1.newConstructionUnits
                )}
                %
              </span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-20">
                <span className="text-base font-thin text-black">
                  {compare1.rentalUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-black text-white
                  rounded-full w-[60px] h-[60px] flex items-center
                  justify-center text-sm font-normal text-center"
              >
                임대
                <br />
                세대수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-black">
                  {compare2.rentalUnits}세대
                </span>
              </div>
              <span>
                {getPercentage(
                  +compare2.rentalUnits,
                  +compare2.newConstructionUnits
                )}
                %
              </span>
            </div>
          </div>

          {/* 신축 총 세대수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full h-[60px]">
              {/* 임대 세대수 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#FF0000] transition-all duration-500 rounded-l-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare1.rentalUnits,
                      +compare1.newConstructionUnits
                    )}%`,
                  }} // 왼쪽 비율
                />
              </div>

              {/* 임대 세대수 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#FF0000] transition-all duration-500 rounded-r-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare2.rentalUnits,
                      +compare2.newConstructionUnits
                    )}%`,
                  }} // 오른쪽 비율
                />
              </div>

              {/* 일반 분양수 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-20">
                <div
                  className="absolute inset-y-0 right-0 bg-[#F4FF92] transition-all duration-500 rounded-l-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare1.generalSaleUnits,
                      +compare1.newConstructionUnits
                    )}%`,
                  }} // 왼쪽 비율
                />
              </div>

              {/* 일반 분양수 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-20">
                <div
                  className="absolute inset-y-0 left-0 bg-[#F4FF92] transition-all duration-500 rounded-r-4xl"
                  style={{
                    width: `${getAdjustedPercentage(
                      +compare2.generalSaleUnits,
                      +compare2.newConstructionUnits
                    )}%`,
                  }} // 오른쪽 비율
                />
              </div>

              {/* 신축 총 세대수 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-30">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{
                    width: `${compare1.newConstructionUnits === '0'
                      ? 0
                      : compare1.newConstructionUnits
                        ? 100
                        : 0
                      }%`,
                  }} // 왼쪽 비율
                />
              </div>

              {/* 신축 총 세대수 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-30">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{
                    width: `${compare2.newConstructionUnits === '0'
                      ? 0
                      : compare2.newConstructionUnits
                        ? 100
                        : 0
                      }%`,
                  }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>
                {compare1.newConstructionUnits === '0'
                  ? 0
                  : compare1.newConstructionUnits
                    ? 100
                    : 0}
                %
              </span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-20">
                <span className="text-base font-thin text-black">
                  {compare1.newConstructionUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-black text-white
                  rounded-full w-[60px] h-[60px] flex items-center
                  justify-center text-sm font-normal text-center"
              >
                신축
                <br />총 세대수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-black">
                  {compare2.newConstructionUnits}세대
                </span>
              </div>
              <span>
                {compare2.newConstructionUnits === '0'
                  ? 0
                  : compare2.newConstructionUnits
                    ? 100
                    : 0}
                %
              </span>
            </div>
          </div>

          {/* 신축용적률 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">
                {compare1.newVolumeRatio}%
              </span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              신축
              <br />
              용적률
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">
                {compare2.newVolumeRatio}%
              </span>
            </div>
          </div>

          {/* 현재단계 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">
                {compare1.currentStage}
              </span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              현재단계
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">
                {compare2.currentStage}
              </span>
            </div>
          </div>

          {/* 사업성격 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">
                {compare1.businessType}
              </span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              사업성격
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">
                {compare2.businessType}
              </span>
            </div>
          </div>

          {/* 시행주체 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">
                {compare1.businessOperator}
              </span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              시행주체
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">
                {compare2.businessOperator}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 우측 md이상 */}
      <section className="hidden md:flex flex-1 flex-col relative text-black items-center pt-4 z-20">
        {compare[1] ? (
          <X
            width={34}
            height={34}
            strokeWidth={1}
            className="cursor-pointer"
            onClick={() => removeCompare(1)}
          />
        ) : (
          <Plus
            width={34}
            height={34}
            strokeWidth={1}
            className="cursor-pointer"
            onClick={() => handleGoHome()}
          />
        )}
        <div className="flex flex-col gap-2 text-center pt-4">
          <h3 className="text-[18px] font-bold">{compare2.zoneName}</h3>
          <p className="text-xl font-thin">{compare2.address}</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare2.projectArenaM2} m²</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare2.residentialLandAreaM2} m²
            </p>
          </div>
        </div>

        <h3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-extrabold">
          {getPercentage(
            +compare2.generalSaleUnits,
            +compare2.newConstructionUnits
          )}
          <span className="font-light">%</span>
        </h3>
      </section>
    </div>
  );
};

export default ComparePage;
