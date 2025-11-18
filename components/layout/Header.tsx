'use client';

import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ChevronLeft, Home, LogOut, Search, UserRound } from 'lucide-react';
import useStore from '@/store/useStore';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { logout } from '@/services/auth.api';
type headerProps = {
  isLoggedIn: boolean;
};

const Header = ({ isLoggedIn }: headerProps) => {
  const toggleOpen = useStore((state) => state.toggleOpen);
  const clear = useStore((state) => state.clear);
  const isLogin = useAuthStore((state) => state.isLogin);
  const setIsLogin = useAuthStore((state) => state.setIsLogin);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    clear();
  }, [pathname]);

  useEffect(() => {
    if (isLoggedIn) {
      setIsLogin(isLoggedIn);
    } else {
      setIsLogin(isLoggedIn);
    }
  }, [isLoggedIn]);

  const handleLoginToggle = () => {
    toggleOpen();
  };

  const handleLink = (link: string) => {
    router.push(link);
  };

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    const data = await logout();
    if (data.success === true) {
      setIsLogin(false);
      alert('로그아웃');
    }
  };

  // Todo : 비교보기 버튼 비교담기 상태에 따라 아이콘 표현 달리하기 (가능한가?)

  return (
    <>
      {/* 데스크탑 */}
      <div className="hidden lg:relative lg:flex flex-row md:px-14 px-2 justify-between items-center py-3 gap-1">
        <div className="relative text-black max-w-[400px] w-full ">
          <Input className="bg-white rounded-4xl w-full" />
          <div className="absolute flex flex-row items-center justify-center gap-3 top-1/2 right-0 -translate-y-1/2">
            검색
            <Search />
          </div>
        </div>
        <Image
          src={'/logo.png'}
          alt="로고"
          width={80}
          height={40}
          onClick={() => handleLink('/')}
          className="hidden lg:block lg:absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 hover:cursor-pointer"
        />
        <div className="relative flex flex-row items-center gap-1 md:gap-2">
          <Button
            className="hidden md:flex flex-row"
            variant={'white'}
            onClick={() => {
              isLogin ? handleLink('/my') : handleLoginToggle();
            }}
          >
            <UserRound fill="black" />
            {isLogin ? <></> : <p>로그인</p>}
          </Button>

          {isLogin && (
            <Button
              className="hidden md:flex flex-row"
              variant={'white'}
              onClick={handleLogout}
            >
              <LogOut fill="black" />
            </Button>
          )}

          <Link href={'/compare'}>
            <Button variant={'white'}>
              <Image
                src={'/Compare.png'}
                alt="비교보기 아이콘"
                width={27}
                height={27}
              />
              비교보기
            </Button>
          </Link>
        </div>
      </div>

      {/* 모바일 */}
      <div className="lg:hidden">
        {pathname === '/' && (
          <div className="relative flex flex-row px-2 justify-between items-center py-3 gap-1">
            <div className="relative text-black max-w-[400px] w-full ">
              <Input className="bg-white rounded-4xl w-full" />
              <div className="absolute flex flex-row items-center justify-center gap-3 top-1/2 right-0 -translate-y-1/2">
                검색
                <Search />
              </div>
            </div>
            <div className="relative flex flex-row items-center gap-1 md:gap-2">
              <p onClick={() => handleLink('/my')}>my</p>
              <Button
                className="flex flex-row"
                variant={'white'}
                onClick={handleLoginToggle}
              >
                <UserRound fill="black" />
              </Button>
              {/* <Button variant={'white'}>
                <Bookmark fill="black" />
              </Button> */}
              <Link href={'/compare'}>
                <Button variant={'white'}>비교보기</Button>
              </Link>
            </div>
          </div>
        )}

        {pathname === '/my' && (
          <div className="relative flex flex-row px-2 justify-between items-center py-3 gap-1 bg-[#212138]">
            <div className="flex flex-row items-center justify-center gap-7">
              <ChevronLeft onClick={handleBack} />
              <Home onClick={() => handleLink('/')} />
            </div>
            <div className="relative flex flex-row items-center gap-1">
              {/* <Button variant={'white'}>
                <Bookmark fill="black" />
              </Button> */}
              <Link href={'/compare'}>
                <Button variant={'white'}>
                  <Image
                    src={'/Compare.png'}
                    alt="비교보기 아이콘"
                    width={27}
                    height={27}
                  />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {pathname === '/compare' && (
          <div className="relative flex flex-row px-2 justify-between items-center py-3 gap-1 bg-white text-black">
            <div className="flex flex-row items-center justify-center gap-7">
              <ChevronLeft onClick={handleBack} />
              <Home onClick={() => handleLink('/')} />
            </div>
            <div className="relative flex flex-row items-center gap-1">
              {/* <Button variant={'white'}>
                <Bookmark fill="black" />
              </Button> */}
              <Link href={'/compare'}>
                <Button
                  variant={'white'}
                  className="border border-black rounded-full p-1"
                >
                  <Image
                    src={'/Compare.png'}
                    alt="비교보기 아이콘"
                    width={27}
                    height={27}
                  />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
