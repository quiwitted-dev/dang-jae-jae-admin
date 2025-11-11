'use client';

import useStore from '@/store/useStore';
import { Bookmark, ChevronLeft, icons, MoveRight, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import Header from '../layout/Header';

const Signin = () => {
  const { toggleOpen } = useStore();
  const handleModalToggle = () => {
    toggleOpen();
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center w-full md:h-dvh h-full bg-black/50"
      onClick={handleModalToggle}
    >
      <Button
        size="icon"
        className="rounded-full bg-black mb-3 w-16 h-16 hidden items-center justify-center md:flex"
      >
        <X className="size-8" />
      </Button>
      <div
        className="md:w-[390px] md:h-[615px] flex flex-col w-full h-dvh relative bg-black rounded-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={'/signin_background.png'}
          fill
          alt="로그인 페이지 배경"
          className="absolute inset-0 object-cover"
        />
        {/* 모바일 네이게이션 */}
        <div
          className="md:hidden relative flex flex-row md:px-14 px-2 justify-between items-center py-3 gap-1"
          // onClick={(e) => e.stopPropagation()}
        >
          <ChevronLeft onClick={handleModalToggle} />
          <div className="flex items-center gap-1">
            <Button variant={'white'}>
              <Bookmark fill="black" />
            </Button>
            <Button variant={'white'}>비교보기</Button>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full text-white text-[37px] font-extralight py-9 px-7">
          <h3>
            <span className="text-[#F4FF92]">
              당신의재건축재개발
              <br />
            </span>
            사용을 위해
            <br />
            <strong>로그인</strong>을 해주세요
          </h3>

          <div>
            <Button
              variant={'link'}
              className="w-full text-[25px] font-medium bg-[#FAE100] text-[#3C1F1A] py-8 rounded-full mb-5"
            >
              카카오톡으로 로그인
            </Button>
            <div className="flex flex-row items-center text-sm font-light">
              <p>아직 회원이 아니시라면, </p>
              <Button className="rounded-4xl bg-white/20">
                3초만에 회원가입하기 <MoveRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
