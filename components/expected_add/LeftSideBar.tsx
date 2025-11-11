'use client';

import { ArrowLeft, Plus, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LeftSideBar = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="max-w-[700px] md:w-[700px] bg-[#A7B1E8] text-black min-h-dvh">
      {/* 헤더 */}
      <div className="flex flex-row items-center justify-between px-4 py-5">
        <button className="cursor-pointer" onClick={handleBack}>
          <ArrowLeft />
        </button>
        <Link href={'/'}>
          <button className="cursor-pointer">
            <X />
          </button>
        </Link>
      </div>
      {/* 본문 */}
      <div className="flex flex-col items-center gap-7 md:w-3/4 px-4 mx-auto">
        <h2 className="text-[28px] font-bold text-center">
          당신의 정보력,
          <br /> 예정지 정보를 제공해 주세요
        </h2>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">가칭*</h3>
            <Input
              className="w-3/5 text-end text-[20px]"
              placeholder="서울1구역"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">위치*</h3>
            <Input
              className="w-3/5 text-end text-[20px]"
              placeholder="서울시 서울구 서울동 000-1일대"
            />
          </div>
          <div>
            <p className="text-[10px] leading-relaxed">
              <strong>
                [중요 안내] 개인정보 게시 관련 책임 고지 <br />
              </strong>
              회원님이 게시물에 기재하는 정보는 게시물을 읽는 다른
              이용자에게 직접 공개됩니다.
              <br />
              1. 게시자의 책임: 타인의 개인정보를 무단으로 게시하거나, 본인의
              정보를 공개하여 발생하는 모든 법적, 금전적 책임은 정보를 게시한
              이용자 본인에게 있습니다. <br />
              2. 플랫폼의 면책: 당사는 이용자가 자발적으로 게시한
              개인정보의 노출 및 오용으로 인해 발생하는 피해나 분쟁에
              대해 일체의 책임이 없으며 면책됩니다.
            </p>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              동의서 징구 안내처
            </h3>
            <Input
              className="w-3/5 text-end text-[20px]"
              placeholder="000-0000-0000"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">가격대(시세)</h3>
            <div className="w-3/5 flex flex-row gap-5 justify-between text-[20px]">
              <div className="flex flex-row items-center gap-3">
                <Input className="w-14 text-end text-[20px]" placeholder="1" />
                <p>억</p>
              </div>
              ~
              <div className="flex flex-row items-center gap-3">
                <Input
                  className="w-14 text-end text-[20px]"
                  placeholder="100"
                />
                <p>억</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">소유자 수</h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                className="w-4/5 text-end text-[20px]"
                placeholder="000000"
              />
              명
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              기대 신축 세대수
            </h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                className="w-4/5 text-end text-[20px]"
                placeholder="000000"
              />
              <p className="shrink-0">세대</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">사업지 면적</h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                className="w-4/5 text-end text-[20px]"
                placeholder="000000"
              />
              <p className="shrink-0">m2</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">현재 용적률</h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input className="w-4/5 text-end text-[20px]" placeholder="200" />
              <p className="shrink-0">%</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              미래(기대) 용적률
            </h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input className="w-4/5 text-end text-[20px]" placeholder="200" />
              <p className="shrink-0">%</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              건축년도(노후도)
            </h3>
            <Input
              className="w-3/5 text-end text-[20px]"
              placeholder="1980 - 1988"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">주용도</h3>
            <Input
              className="w-3/5 text-end text-[20px]"
              placeholder="공공주택"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">용도지역</h3>
            <Input
              className="w-3/5 text-end text-[20px]"
              placeholder="3종일반주거"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">적용가능 정책*</h3>
            <Input
              className="w-3/5 text-end text-[20px]"
              placeholder="역세권특별법"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">사업주체*</h3>
            <Input className="w-3/5 text-end text-[20px]" placeholder="조합" />
          </div>
        </div>
        <Button
          className="text-[25px] font-semibold rounded-full p-2 px-10 mb-7"
          size={'none'}
        >
          <Plus /> 예정지 추가하기
        </Button>
      </div>
    </div>
  );
};
export default LeftSideBar;
