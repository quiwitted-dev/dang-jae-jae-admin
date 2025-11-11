'use client';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Bookmark, Search, UserRound } from 'lucide-react';
import useStore from '@/store/useStore';
import Link from 'next/link';

const Header = () => {
  const { isOpen, toggleOpen } = useStore();

  const handleSigninToggle = () => {
    toggleOpen();
  };

  return (
    <div className="relative flex flex-row md:px-14 px-2 justify-between items-center py-3 gap-1">
      <div className="relative text-black max-w-[400px] w-full ">
        <Input className="bg-white rounded-4xl w-full" />
        <div className="absolute flex flex-row items-center justify-center gap-3 top-1/2 right-0 -translate-y-1/2">
          검색
          <Search />
        </div>
      </div>
      <Link href={'/'}>
        <Image
          src={'/logo.png'}
          alt="로고"
          width={80}
          height={40}
          className="hidden md:block md:absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
        />
      </Link>
      <div className="relative flex flex-row items-center gap-1 md:gap-2">
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
        <Button variant={'white'}>비교보기</Button>
      </div>
    </div>
  );
};

export default Header;
