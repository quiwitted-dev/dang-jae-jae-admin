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
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const defaultValue = {
  zoneName: '',
  address: '',
  projectArenaM2: '',
  residentialLandAreaM2: '',
  price: '',
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
      price: '0',
      averageLandScale: `${(
        (+data.projectAreaM2 / +data.ownerCount) *
        0.3025
      ).toFixed(2)}`,
      ownerCount: `${data.ownerCount ?? ''}`,
      associationSaleUnits: '0',
      generalSaleUnits: `${data.generalSaleUnits ?? '0'}`,
      rentalUnits: `${data.rentalUnits ?? '0'}`,
      newConstructionUnits: `${+data.totalSaleUnits + +data.rentalUnits}`,
      newVolumeRatio: data.newVolumeRatio ?? '0',
      currentStage: data.currentStage ?? '-',
      businessType: data.projectType ?? '-',
      businessOperator: '-',
    };
  }

  return {
    zoneName: data.renovationZoneName ?? '-',
    address: data.representativeLotNumber ?? '-',
    projectArenaM2: data.projectAreaM2 ?? '0',
    residentialLandAreaM2: data.residentialLandAreaM2 ?? '0',
    price: '0',
    averageLandScale: `${(
      (+data.projectAreaM2 / +data.ownerCount) *
      0.3025
    ).toFixed(2)}`,
    ownerCount: `${data.ownerCount ?? '0'}`,
    associationSaleUnits: '0',
    generalSaleUnits: `${+data.totalSaleUnits - +data.ownerCount}`,
    rentalUnits: `${data.rentalUnits ?? '0'}`,
    newConstructionUnits: `${+data.rentalUnits + +data.totalSaleUnits}`,
    newVolumeRatio: data.volumeRatio ?? '0',
    currentStage: data.currentStage ?? '',
    businessType: data.businessType ?? '',
    businessOperator: '-',
  };
};

const mapUserResultToCompare = (data: SubmissionUserDetail) => ({
  zoneName: data.tempName ?? '-',
  address: data.location ?? '-',
  projectArenaM2: data.projectArea ?? '0',
  residentialLandAreaM2: '0',
  price: data.priceRange ?? '0',
  averageLandScale: `${(
    (+data.projectArea / +data.ownerCount) *
    0.3025
  ).toFixed(2)}`,
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

const ComparePage = () => {
  const { compare, removeCompare } = useCompareStore();
  const [compare1, setCompare1] = useState(defaultValue);
  const [compare2, setCompare2] = useState(defaultValue);

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
        item.dataType === 'PUBLIC'
          ? getSubmissionPublicDetail(item.id)
          : getSubmissionUserDetail(item.id)
      );

      const results = await Promise.all(tasks);

      results.forEach((result, idx) => {
        const { item, index } = nonNullItems[idx];
        const mapped =
          item.dataType === 'PUBLIC'
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

  return (
    <div className="flex flex-row min-h-dvh relative">
      {/* 왼쪽 50% - 그라데이션 */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-linear-to-b from-[#F2EEEB] via-[#CFCCFF] to-[#D1DFD3]"></div>

      {/* 오른쪽 50% - 그라데이션 */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-b from-[#F2EEEB] via-[#EECFD3] to-[#E7DDE3]"></div>

      {/* 좌측 md이상 */}
      <section className="hidden md:flex flex-1 flex-col relative text-black items-center pt-4">
        <X
          width={34}
          height={34}
          strokeWidth={1}
          className="cursor-pointer"
          onClick={() => removeCompare(0)}
        />
        <div className="flex flex-col gap-2 text-center pt-4">
          <h3 className="text-[18px] font-bold">{compare1.zoneName}</h3>
          <p className="text-xl font-thin">{compare1.address}</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare1.projectArenaM2} m2</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare1.residentialLandAreaM2} m2
            </p>
          </div>
        </div>

        {/* 일반분양수 % */}
        <h3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-extrabold">
          {compare1.generalSaleUnits}
          <span className="font-light">%</span>
        </h3>
      </section>

      {/* 좌측 모바일 */}
      <div className="absolute md:hidden flex flex-col text-black items-center pt-4 top-0 left-0 w-1/2 h-[300px] z-20">
        <div className="w-full h-[34px]">
          <X
            width={34}
            height={34}
            strokeWidth={1}
            onClick={() => removeCompare(0)}
            className="mx-auto"
          />
        </div>
        <div className="flex flex-col gap-2 text-center pt-4 w-full">
          <h3 className="text-[18px] font-bold truncate ">
            {compare1.zoneName}
          </h3>
          <p className="text-xl font-thin">{compare1.address}</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare1.projectArenaM2} m2</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare1.residentialLandAreaM2} m2
            </p>
          </div>
        </div>
      </div>

      {/* 우측 모바일 */}
      <div className="absolute md:hidden flex flex-col text-black items-center pt-4 top-0 right-0 w-1/2 h-[300px] z-20">
        <div className="w-full h-[34px]">
          <X
            width={34}
            height={34}
            strokeWidth={1}
            onClick={() => removeCompare(1)}
            className="mx-auto"
          />
        </div>
        <div className="flex flex-col gap-2 text-center pt-4 w-full">
          <h3 className="text-[18px] font-bold truncate ">
            {compare2.zoneName}
          </h3>
          <p className="text-xl font-thin">{compare2.address}</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare2.projectArenaM2} m2</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare2.residentialLandAreaM2} m2
            </p>
          </div>
        </div>
      </div>

      {/* 메인 비교 */}
      <section className="flex-1 flex flex-col items-center justify-center relative z-10 text-black md:px-0 px-4">
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
        {/* Todo : 면적도 계산할 수 있으면 계산 (가능할 듯?) */}
        <div className="relative flex w-full h-[250px]">
          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10 ">
            <div
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-radial-[at_75%_30%] from-white/70 to-[#E2D2E0] to-90% transition-all duration-500 rounded-l-full"
              style={{
                width: `${
                  +(+compare1.projectArenaM2 * 0.3025).toString().slice(0, 3) /
                  2 /
                  2
                }px`,
                height: `${
                  +(+compare1.projectArenaM2 * 0.3025).toString().slice(0, 3) /
                  2
                }px`,
              }} // 왼쪽 비율
            />
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10 ">
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-radial-[at_30%_25%] from-white/10 to-[#268F79]/30 to-90% transition-all duration-500 rounded-r-full"
              style={{
                width: `${
                  +(+compare2.projectArenaM2 * 0.3025).toString().slice(0, 3) /
                  2 /
                  2
                }px`,
                height: `${
                  +(+compare2.projectArenaM2 * 0.3025).toString().slice(0, 3) /
                  2
                }px`,
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
              <span className="text-xl font-semibold">{compare1.price}억</span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm font-normal shrink-0">
              가격
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-xl font-semibold">{compare2.price}억</span>
            </div>
          </div>

          {/* 평균 대지지분 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-4xl font-bold">
                {compare1.averageLandScale === 'Infinity'
                  ? '0'
                  : compare1.averageLandScale}
                <span className="text-xl">평</span>
              </span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm font-normal text-center shrink-0">
              평균
              <br />
              대지지분
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-4xl font-bold">
                {compare2.averageLandScale === 'Infinity'
                  ? '0'
                  : compare2.averageLandScale}
                <span className="text-xl">평</span>
              </span>
            </div>
          </div>

          {/* 소유자 수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${0}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>0%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">
                  {compare1.ownerCount}명
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm">
                소유자 수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  {compare2.ownerCount}명
                </span>
              </div>
              <span>0%</span>
            </div>
          </div>

          {/* 조합원 분양수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${0}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>0 %</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">
                  {compare1.associationSaleUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm">
                조합원
                <br />
                분양수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  {compare2.associationSaleUnits}세대
                </span>
              </div>
              <span>0%</span>
            </div>
          </div>

          {/* 일반 분양수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${0}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>0%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">
                  {compare1.generalSaleUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm text-center">
                일반
                <br />
                분양수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  {compare2.generalSaleUnits}세대
                </span>
              </div>
              <span>0%</span>
            </div>
          </div>

          {/* 임대 세대수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${0}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>0%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">
                  {compare1.rentalUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm whitespace-normal break-keep text-center">
                임대
                <br />
                세대수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  {compare2.rentalUnits}세대
                </span>
              </div>
              <span>0%</span>
            </div>
          </div>

          {/* 신축 총 세대수 */}
          {/* Todo : 신축 총 세대수 계산 해야함. */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${0}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>0%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">
                  {compare1.newConstructionUnits}세대
                </span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[70px] h-[70px] flex items-center justify-center text-sm whitespace-normal break-keep text-center">
                신축
                <br />총 세대수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  {compare2.newConstructionUnits}세대
                </span>
              </div>
              <span>0%</span>
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
      <section className="hidden md:flex flex-1 flex-col relative text-black items-center pt-4">
        <X
          width={34}
          height={34}
          strokeWidth={1}
          className="cursor-pointer"
          onClick={() => removeCompare(1)}
        />
        <div className="flex flex-col gap-2 text-center pt-4">
          <h3 className="text-[18px] font-bold">{compare2.zoneName}</h3>
          <p className="text-xl font-thin">{compare2.address}</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">{compare2.projectArenaM2} m2</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">
              {compare2.residentialLandAreaM2} m2
            </p>
          </div>
        </div>

        <h3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-extrabold">
          {compare2.generalSaleUnits}
          <span className="font-light">%</span>
        </h3>
      </section>
    </div>
  );
};

export default ComparePage;
