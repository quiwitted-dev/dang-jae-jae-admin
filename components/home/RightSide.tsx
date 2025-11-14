import { Button } from '../ui/button';
import { MoveRight } from 'lucide-react';
import InfoCard from '../common/InfoCard';
import { DANGJAEJAE_INFO } from '@/constants/home';
import { getMainTitle } from '@/services/api';

const RightSide = async () => {
  const data = await getMainTitle();
  let title = { __html: data.mainTitle.title };
  if (data.success === false) {
    title = { __html: data.mainTitle.title };
  }

  return (
    <div className="hidden md:block pt-20">
      <div
        className="text-[43px] md:max-w-[980px] font-extralight whitespace-normal break-keep"
        dangerouslySetInnerHTML={title}
      />
      <div className="w-16 border-b-2 mt-8 mb-28" />

      <div className="flex flex-row items-center mb-[65px]">
        <p>아직 회원이 아니시라면, </p>
        <Button className="rounded-4xl">
          3초만에 회원가입하기 <MoveRight />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1 md:pb-[140px]">
        {DANGJAEJAE_INFO.map((item) => (
          <InfoCard info={item} key={item.title} />
        ))}
      </div>
    </div>
  );
};

export default RightSide;
