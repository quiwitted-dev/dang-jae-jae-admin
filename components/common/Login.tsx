'use client';

import useStore from '@/store/useStore';
import { Bookmark, ChevronLeft, icons, MoveRight, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { permissionKakao } from '@/services/auth.api';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const Login = () => {
  const { toggleOpen } = useStore();
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const agreed = localStorage.getItem('dangJaeJae_terms_agreed') === 'true';
    setIsAgreed(agreed);
  }, []);

  const handleModalToggle = () => {
    toggleOpen();
  };

  const handleKakaoLogin = () => {
    if (!isAgreed) return;
    permissionKakao();
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsAgreed(checked);
    localStorage.setItem('dangJaeJae_terms_agreed', String(checked));
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center w-full md:h-dvh h-full bg-black/50 z-9999"
      onClick={handleModalToggle}
    >
      <Button
        size="icon"
        className="rounded-full bg-black mb-3 w-16 h-16 hidden items-center justify-center md:flex"
      >
        <X className="size-8" />
      </Button>
      <div
        className="md:w-[390px] md:h-[615px] flex flex-col w-full h-dvh relative bg-[#212138] rounded-4xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={'/login_background_img.png'}
          fill
          alt="로그인 페이지 배경"
          className="absolute inset-0 object-cover"
        />
        {/* 모바일 네이게이션 */}
        <div
          className="md:hidden relative flex flex-row md:px-14 px-2 justify-between items-center py-3 gap-1"
        >
          <X onClick={handleModalToggle} />
          <div className="flex items-center gap-1">
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
              className="w-full text-[25px] font-medium bg-[#FAE100] text-[#3C1F1A] py-8 rounded-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleKakaoLogin}
              disabled={!isAgreed}
            >
              카카오톡으로 로그인
            </Button>

            <div className="flex items-center gap-2 mb-6 px-2 bg-black/20 py-2 rounded-xl border border-white/10">
              <input
                type="checkbox"
                id="terms-agree"
                checked={isAgreed}
                onChange={handleCheckChange}
                className="w-5 h-5 accent-[#F4FF92] cursor-pointer"
              />
              <label htmlFor="terms-agree" className="text-sm font-medium cursor-pointer flex flex-row items-center gap-1">
                <span className="text-white">[필수] 이용약관 및 정책 동의</span>
                <Link
                  href="/terms"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOpen();
                  }}
                  className="text-[#F4FF92] underline ml-2 hover:text-white transition-colors font-bold"
                >
                  보기 &gt;
                </Link>
              </label>
            </div>

            <div className="flex flex-row items-center text-sm font-light">
              <p>아직 회원이 아니시라면, </p>
              <Button
                className="rounded-4xl bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleKakaoLogin}
                disabled={!isAgreed}
              >
                3초만에 회원가입하기 <MoveRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
