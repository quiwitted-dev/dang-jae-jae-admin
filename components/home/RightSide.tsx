'use client';

import { Button } from '../ui/button';
import { MoveRight } from 'lucide-react';
import InfoCard from '../common/InfoCard';
import { DANGJAEJAE_INFO } from '@/constants/home';
import { getMainTitle } from '@/services/api';
import { useEffect, useState } from 'react';
import { MainTitleResponse } from '@/types/type';
import useAuthStore from '@/store/useAuthStore';
import useStore from '@/store/useStore';

const RightSide = () => {
  const [data, setData] = useState<MainTitleResponse>();
  const { isLogin } = useAuthStore();
  const { toggleOpen } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMainTitle();
        setData(data);
      } catch {}
    };
    fetchData();
  }, []);

  const handleLoginToggle = () => {
    toggleOpen();
  };

  if (!data) {
    return <div className="hidden md:block">데이터를 불러오는중...</div>;
  }

  return (
    <div className="hidden md:block sticky top-16 pt-20">
      <div
        className="text-4xl md:max-w-[980px] font-thin whitespace-normal break-keep"
        dangerouslySetInnerHTML={{ __html: data.mainTitle.title }}
      />
      <div className="w-16 border-b-2 mt-8 xl:mb-14 mb-5" />

      <div className="flex flex-row items-center xl:mb-10 mb-10">
        {isLogin ? (
          <p>환영합니다! 오늘도 당재재와 함께 즐거운 시간 보내세요!</p>
        ) : (
          <>
            <p>아직 회원이 아니시라면, </p>
            <Button
              className="rounded-4xl cursor-pointer"
              onClick={handleLoginToggle}
            >
              3초만에 회원가입하기 <MoveRight />
            </Button>
          </>
        )}
      </div>

      <div className="hidden lg:grid grid-cols-2 gap-1 md:pb-[140px] lg:max-w-[1000px]">
        {DANGJAEJAE_INFO.map((item) => (
          <InfoCard info={item} key={item.title} />
        ))}
      </div>
    </div>
  );
};

export default RightSide;
