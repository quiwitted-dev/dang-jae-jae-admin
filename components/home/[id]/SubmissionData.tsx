'use client';

import { SubmissionUserDetail } from '@/types/submission.type';
import SubmissionUserSideBar from '../SubmissionUserSideBar';
import DetailRightSide from '../DetailRightSide';
import { Bookmark, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HeaderCompareButton from '@/components/common/HeaderCompareButton';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import useAuthStore from '@/store/useAuthStore';

const SubmissionData = ({
  submissionData,
}: {
  submissionData: SubmissionUserDetail;
}) => {
  const { isLogin } = useAuthStore();
  const { toggleOpen } = useStore();
  const router = useRouter();

  const handleLoginToggle = () => {
    toggleOpen();
  };

  const handleLink = (link: string) => {
    router.push(link);
  };

  const handleBack = () => {
    router.back();
  };
  return (
    <>
      {/* 헤더 */}
      <div className="md:hidden order-1 flex flex-row px-2 justify-between items-center py-3 gap-1 bg-[#A1ACEB] text-black">
        <div className="flex flex-row items-center justify-center gap-2">
          <ChevronLeft onClick={handleBack} className="cursor-pointer" />
          <span className="text-base font-bold truncate w-[170px]">
            {submissionData.tempName}
          </span>
        </div>
        <div className="relative flex flex-row items-center gap-1">
          <Button
            className="flex flex-row w-10 h-10 cursor-pointer"
            variant={'white'}
            onClick={() => {
              isLogin ? handleLink('/my') : handleLoginToggle();
            }}
          >
            <Bookmark fill="black" />
          </Button>
          <Link href={'/compare'}>
            <HeaderCompareButton hasTitle={true} />
          </Link>
        </div>
      </div>

      {/* 왼쪽 사이드바 */}
      <div className="order-2 md:order-1">
        <SubmissionUserSideBar submissionData={submissionData} />
      </div>

      {/* 우측 맵 */}
      <div className="flex-1 md:h-[calc(100vh)] rounded-xl md:sticky md:top-0 order-1 md:order-2">
        <DetailRightSide type="SUBMISSION" publicData={submissionData} />
      </div>
    </>
  );
};

export default SubmissionData;
