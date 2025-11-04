import Image from 'next/image';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Bookmark, Search } from 'lucide-react';

const Header = () => {
  return (
    <div className="relative flex flex-row px-14 justify-between items-center py-3">
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
        className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
      />
      <div className="relateive flex flex-row items-center">
        <Button>
          <Avatar className="rounded-lg">
            <AvatarImage
              src="https://github.com/evilrabbit.png"
              alt="@evilrabbit"
            />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <p>로그인</p>
        </Button>
        <Button>
          <Bookmark />
        </Button>
        <Button>비교하기 </Button>
      </div>
    </div>
  );
};

export default Header;
