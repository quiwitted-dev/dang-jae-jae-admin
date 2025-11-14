'use client';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Bookmark, ChevronLeft, Home, Search, UserRound } from 'lucide-react';
import useStore from '@/store/useStore';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  const isOpen = useStore((state) => state.isOpen);
  const toggleOpen = useStore((state) => state.toggleOpen);
  const clear = useStore((state) => state.clear);
  const myPageTab = useStore((state) => state.myPageTab);
  const settingsTab = useStore((state) => state.settingsTab);
  const pathname = usePathname();

  const router = useRouter();

  const handleSigninToggle = () => {
    toggleOpen();
  };

  const handleLink = (link: string) => {
    router.push(link);
    clear();
  };

  const handleBack = () => {
    router.back();
  };

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
          <p onClick={() => handleLink('/my')}>마이페이지</p>
          <Button
            className="hidden md:flex flex-row"
            variant={'white'}
            onClick={handleSigninToggle}
          >
            <UserRound fill="black" />
            <p>로그인</p>
          </Button>
          <Button variant={'white'}>
            <Bookmark fill="black" />
          </Button>
          <Link href={'/compare'}>
            <Button variant={'white'}>비교보기</Button>
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
              <p onClick={() => handleLink('/my')}>마이페이지</p>
              <Button
                className="hidden md:flex flex-row"
                variant={'white'}
                onClick={handleSigninToggle}
              >
                <UserRound fill="black" />
                <p>로그인</p>
              </Button>
              <Button variant={'white'}>
                <Bookmark fill="black" />
              </Button>
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
              <Button variant={'white'}>
                <Bookmark fill="black" />
              </Button>
              <Link href={'/compare'}>
                <Button variant={'white'}>비교보기</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
