'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { SubmissionUserDetail } from '@/types/submission.type';
import BookmarkCompareGroup from './[id]/BookmarkCompareGroup';
import PriceEditForm from './[id]/PriceEditForm';

const SubmissionUserSideBar = ({
  submissionData,
}: {
  submissionData: SubmissionUserDetail;
}) => {
  const [popup, setPopup] = useState(false);
  const projectArea = Number(submissionData.projectArea);
  const ownerCount = Number(submissionData.ownerCount);
  const average_land_share =
    projectArea > 0 && ownerCount > 0
      ? ((projectArea / ownerCount) * 0.3025).toFixed(2)
      : '-';

  const [min, max] = submissionData.priceRange?.match(/\d+/g) ?? [];

  return (
    <div className="relative bg-linear-to-b from-[#A1ACEB] to-[#FFFEB1] text-black min-h-dvh whitespace-normal break-keep pb-10">
      <div className="flex max-w-[400px] mx-auto px-4 pt-4">
        <div className="md:flex hidden flex-col items-center justify-center gap-3">
          <div className="w-full flex flex-row justify-between mt-5">
            <p>
              <span>{submissionData.location.split(' ')[1]}</span>{' '}
              <span className="font-medium">
                {submissionData.location.split(' ').slice(2).join(' ')}
              </span>
            </p>
            <p className="font-semibold">{submissionData.businessType}</p>
          </div>
          <div className="text-3xl font-normal">
            <p className="font-bold text-red-600 text-base">
              *예정지*로 하기사항 전부가 불확실 합니다.
            </p>
            <h3>
              기대 신축 세대수{' '}
              <span className="font-extrabold">
                {submissionData.expectedNewUnits}
              </span>{' '}
              세대
            </h3>
            <h3>
              평균 대지지분{' '}
              <span className="font-extrabold">{average_land_share}</span>평
            </h3>
            <h3>
              가능성{' '}
              <span className="font-extrabold">
                {submissionData.applicablePolicy}
              </span>
            </h3>
          </div>

          <BookmarkCompareGroup
            id={submissionData.id}
            type="SUBMISSION"
            address={submissionData.location}
          />

          <div className="flex flex-row gap-4 md:px-0 pb-5">
            <h4 className="text-[20px] font-bold whitespace-nowrap">
              요즘시세
            </h4>
            <p className="text-xs font-medium text-gray-500 whitespace-pre-line break-keep">
              <span className="text-gray-700">{`${
                submissionData.renovationPrice?.user.nickname ??
                submissionData.user.nickname
              }님이 올려주신 시세입니다.`}</span>
              {`\n시세의 대략적인 정보이며 사용자 누구나 올리실 수 있습니다. 당신의 정보력을 보여주세요!`}
            </p>
          </div>

          <PriceEditForm
            data={submissionData}
            type="SUBMISSION"
            min={min}
            max={max}
          />

          <div className="mt-6 px-5 md:px-0 w-full">
            <div className="mb-4 text-sm font-normal text-[#49454F]">
              <div>
                <p>
                  주용도 :{' '}
                  <span className="text-black">
                    {submissionData.mainUsage ?? '-'}
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  기타 :{' '}
                  <span className="text-black font-semibold">
                    {submissionData.notes ?? '-'}
                  </span>
                </p>
                <p className="font-bold">
                  현재 용적률{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.currentVolumeRatio
                      ? Number(submissionData.currentVolumeRatio).toFixed(2) ??
                        '-'
                      : '-'}{' '}
                    %
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-black font-bold">
                  {submissionData.usageZone}
                </p>
                <p>
                  미래용적률{' '}
                  <span className="text-black font-bold">
                    {submissionData.expectedVolumeRatio ?? '-'}
                  </span>{' '}
                  %
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  소유자수 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.ownerCount ?? '-'}
                  </span>{' '}
                  세대
                </p>
                <ArrowRight />
                <p>
                  신축세대수 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.expectedNewUnits ?? '-'}
                  </span>{' '}
                  세대
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  정비구역면적 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.projectArea}
                  </span>{' '}
                  m²
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  노후도 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.constructionYear ?? '-'}년도 건축물
                  </span>{' '}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  사업주체 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.businessEntity ?? '-'}
                  </span>{' '}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  사업성격 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.businessType ?? '-'}
                  </span>{' '}
                </p>
              </div>
            </div>

            <div className="text-sm text-red-600 mb-4 whitespace-normal break-keep">
              <p>
                사용자가 작성한 정보로 틀릴 수 있습니다.
                <br />
                구역확정이 되며 크게 변경될 수 있습니다.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                variant={'default'}
                size={'none'}
                className="text-yellow-200 bg-gray-400 py-4 px-6 rounded-4xl mx-auto cursor-pointer"
                onClick={() => setPopup(true)}
              >
                동의서 안내
              </Button>
            </div>
            {/* todo : 전문가 분석 레포트 */}
            {/* <div></div> */}

            {/* footer */}
            {/* <div className="flex flex-col text-[10px] text-gray-500 gap-5 my-16">
              <strong>당신의재건축재개발</strong>
              <div>
                <div className="flex flex-row gap-2">
                  <p>개인정보 처리방침</p>|<p>약관 및 정책</p>
                </div>
                <div className="flex flex-row gap-2">
                  <p>경기도 용인시 수지구 용구대로 2790번길 7</p>|
                  <p>APP고객센터 : jajattok@gmail.com</p>
                </div>
              </div>
              <p>© 2025 당신의재재 All Rights Reserved.</p>
            </div> */}
          </div>
        </div>
      </div>

      {popup && (
        <div
          className="absolute flex inset-0 bg-gray-100/50 items-center justify-center"
          onClick={() => setPopup(false)}
        >
          <ApprovePopup phoneNumber={submissionData.consentContact} />
        </div>
      )}
    </div>
  );
};

export default SubmissionUserSideBar;

export const ApprovePopup = ({ phoneNumber }: { phoneNumber: string }) => {
  return (
    <div className="flex flex-col bg-white rounded-3xl text-black max-w-[390px] p-6">
      <p className="text-base font-semibold">
        동의서 징구 안내처 전화번호 입니다.
      </p>
      <p className="mx-auto text-lg font-bold">{phoneNumber}</p>
      <p className="whitespace-normal break-keep text-gray-600 text-xs font-semibold">
        이 정보는 다른 회원님이 올려주신 정보이며, 저희 [당신의재재]가
        확인하거나 보증한 내용이 아닙니다. [당신의재재]는 해당 정보제공으로
        어떠한 금전적 요구나 이득을 취하지 않습니다.
      </p>
    </div>
  );
};
