'use client';

import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Bookmark,
  ChevronLeft,
  Home,
  LogOut,
  Search,
  UserRound,
} from 'lucide-react';
import useStore from '@/store/useStore';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { logout } from '@/services/auth.api';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
type headerProps = {
  isLoggedIn: boolean;
};

const Header = ({ isLoggedIn }: headerProps) => {
  const toggleOpen = useStore((state) => state.toggleOpen);
  const clear = useStore((state) => state.clear);
  const setAddress = useStore((state) => state.setAddress);
  const isLogin = useAuthStore((state) => state.isLogin);
  const setIsLogin = useAuthStore((state) => state.setIsLogin);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams?.get('keyword') ?? '');
  const [showHeader, setShowHeader] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    clear();
  }, [pathname]);

  useEffect(() => {
    setKeyword(searchParams?.get('keyword') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (isLoggedIn) {
      setIsLogin(isLoggedIn);
    } else {
      setIsLogin(isLoggedIn);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLogin && pathname.startsWith('/my')) {
      router.replace('/');
    }
  }, [isLogin, pathname, router]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const goingUp = y < lastY.current;
      // 일정 높이 이상 내려갔을 때만 숨김 처리
      if (y > 80) setShowHeader(goingUp);
      else setShowHeader(true);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const height = showHeader ? '48px' /* 헤더 실제 높이 */ : '0px';
    document.documentElement.style.setProperty('--header-offset', height);
  }, [showHeader]);

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
      setAddress('');
      toast('로그아웃 되었습니다.');
      if (pathname.startsWith('/my')) {
        router.replace('/');
      }
    }
  };

  const performKeywordSearch = () => {
    const params = new URLSearchParams(searchParams?.toString());
    if (!keyword.trim()) {
      params.delete('keyword');
    } else {
      params.set('keyword', keyword.trim());
    }
    params.set('page', '1');
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ''}`, { scroll: false });
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performKeywordSearch();
    }
  };
  const isDetail = /^\/[^/]+$/.test(pathname);
  return (
    <div
      className={`sticky top-0 z-50 bg-black ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* 데스크탑 */}
      <div className="hidden md:relative md:flex flex-row md:px-14 px-2 justify-between items-center py-3 gap-1 ">
        <div className="relative text-black max-w-[400px] w-full ">
          <Input
            className="bg-white rounded-4xl w-full pr-16"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            placeholder="검색어를 입력하세요"
          />
          <Button
            variant="ghost"
            className="absolute flex flex-row items-center justify-center gap-2 top-1/2 right-1 -translate-y-1/2 rounded-full px-3"
            onClick={performKeywordSearch}
          >
            검색
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Image
          src={'/logo.png'}
          alt="로고"
          width={80}
          height={40}
          onClick={() => handleLink('/')}
          className="hidden lg:block md:absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 hover:cursor-pointer"
        />
        <div className="relative flex flex-row items-center gap-1 md:gap-2">
          <Button
            className="hidden md:flex flex-row h-10 cursor-pointer"
            variant={'white'}
            onClick={() => {
              isLogin ? handleLink('/my') : handleLoginToggle();
            }}
          >
            {isLogin ? <Bookmark fill="black" /> : <UserRound fill="black" />}

            {isLogin ? <></> : <p>로그인</p>}
          </Button>

          {pathname === '/my' && isLogin && (
            <Button
              className="hidden md:flex flex-row w-10 h-10 cursor-pointer"
              variant={'white'}
              onClick={handleLogout}
            >
              <LogOut fill="black" />
            </Button>
          )}

          <Link href={'/compare'}>
            <Button
              variant={'white'}
              className="flex items-center h-10 flex-row justify-center cursor-pointer"
            >
              <Image
                src={'/black-compare.png'}
                alt="비교보기 아이콘"
                width={27}
                height={27}
              />
              <p>비교보기</p>
            </Button>
          </Link>
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden">
        {pathname === '/' && (
          <div className="relative flex flex-row px-2 justify-between items-center py-1 gap-1">
            <div className="relative text-black md:max-w-[400px] max-w-[180px] w-full ">
              <Input
                className="bg-white rounded-4xl w-full pr-14 md:text-base text-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
              />
              <Button
                variant="ghost"
                className="absolute flex flex-row items-center justify-center gap-2 top-1/2 right-1 -translate-y-1/2 rounded-full px-2"
                onClick={performKeywordSearch}
              >
                <p className="absolute top-1/2 -translate-y-1/2 -translate-x-7 pt-[2px]">
                  검색
                </p>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative flex flex-row items-center gap-1 md:gap-2">
              <Button
                className="flex flex-row w-10 h-10 cursor-pointer"
                variant={'white'}
                onClick={() => {
                  isLogin ? handleLink('/my') : handleLoginToggle();
                }}
              >
                {isLogin ? (
                  <Bookmark fill="black" />
                ) : (
                  <UserRound fill="black" />
                )}
              </Button>
              <Link href={'/compare'}>
                <Button
                  variant={'white'}
                  size={'none'}
                  className="flex items-center h-10 flex-row justify-center p-2 cursor-pointer  leading-none"
                >
                  {' '}
                  <Image
                    src={'/black-compare.png'}
                    alt="비교보기 아이콘"
                    width={27}
                    height={27}
                  />
                  <p>비교보기</p>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {pathname === '/my' && (
          <div className="relative flex flex-row px-2 justify-between items-center py-3 gap-1 bg-[#212138]">
            <div className="flex flex-row items-center justify-center gap-7">
              <ChevronLeft onClick={handleBack} className="cursor-pointer" />
              <Home
                onClick={() => handleLink('/')}
                className="cursor-pointer"
              />
            </div>
            <div className="relative flex flex-row items-center gap-1">
              {isLogin && (
                <Button
                  className="w-10 h-10 cursor-pointer"
                  variant={'white'}
                  onClick={handleLogout}
                >
                  <LogOut fill="black" />
                </Button>
              )}
              <Link href={'/compare'}>
                <Button
                  variant={'white'}
                  className="flex items-center h-10 flex-row justify-center p-2 cursor-pointer"
                >
                  {' '}
                  <Image
                    src={'/black-compare.png'}
                    alt="비교보기 아이콘"
                    width={27}
                    height={27}
                  />
                  <p>비교보기</p>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {pathname === '/compare' && (
          <div className="relative flex flex-row px-2 justify-between items-center py-3 gap-1 bg-[#F8F4F1] text-black">
            <div className="flex flex-row items-center justify-center gap-7">
              <ChevronLeft onClick={handleBack} className="cursor-pointer" />
              <Home
                onClick={() => handleLink('/')}
                className="cursor-pointer"
              />
            </div>
            <div className="relative flex flex-row items-center gap-1">
              <Button
                className="flex flex-row w-10 h-10 cursor-pointer"
                variant={'white'}
                onClick={() => {
                  isLogin ? handleLink('/my') : handleLoginToggle();
                }}
              >
                {isLogin ? (
                  <Bookmark fill="black" />
                ) : (
                  <UserRound fill="black" />
                )}
              </Button>
              <Link href={'/compare'}>
                <Button
                  variant={'white'}
                  className="border border-black rounded-full p-1 cursor-pointer"
                >
                  <Image
                    src={'/black-compare.png'}
                    alt="비교보기 아이콘"
                    width={27}
                    height={27}
                  />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isDetail && (
          <div className="relative flex flex-row px-2 justify-between items-center py-3 gap-1 bg-[#F8F4F1] text-black">
            <div className="flex flex-row items-center justify-center gap-7">
              <ChevronLeft onClick={handleBack} className="cursor-pointer" />
            </div>
            <div className="relative flex flex-row items-center gap-1">
              <Button
                className="flex flex-row w-10 h-10 cursor-pointer"
                variant={'white'}
                onClick={() => {
                  isLogin ? handleLink('/my') : handleLoginToggle();
                }}
              >
                {isLogin ? (
                  <Bookmark fill="black" />
                ) : (
                  <UserRound fill="black" />
                )}
              </Button>
              <Link href={'/compare'}>
                <Button
                  variant={'white'}
                  className="border border-black rounded-full p-1 cursor-pointer"
                >
                  <Image
                    src={'/black-compare.png'}
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
    </div>
  );
};

export default Header;
