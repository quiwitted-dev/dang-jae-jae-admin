import { Button } from '../ui/button';
import { MoveRight } from 'lucide-react';
import InfoCard from '../common/InfoCard';
import { DANGJAEJAE_INFO } from '@/constants/home';

const RightSide = () => {
  return (
    <div className="hidden md:block pt-20">
      <h3 className="text-[43px] md:max-w-[980px] font-extralight whitespace-normal break-keep">
        복잡한 정비사업? 데이터로 1분 만에 끝내세요! 친절하고 쉬운 통합 데이터로
        딱 핵심만 알려드릴게요. 가장 확실한 투자 독립! 지금 바로 무료로
        시작해보세요.
      </h3>
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
