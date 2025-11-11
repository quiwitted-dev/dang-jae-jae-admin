import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { MoveRight } from 'lucide-react';

const RIGHT_ITEM = [
  {
    img: '/blue.png',
    title: '정비사업 올인원 (ALL-IN-ONE)',
    desc: '흩어진 모든 재개발, 재건축, 정비사업 정보를 한곳에 모아, 시간 낭비 없이 핵심을 바로 파악합니다.',
    color: 'text-[#705DFF]',
  },
  {
    img: '/pink.png',
    title: '투명한 데이터 (DATA TRANSPARENCY)',
    desc: '방대한 사업 정보를 집약하고, 대지지분, 사업 진행 속도 등을 정량적 분석을 통해 객관적인 수치로 투명하게 제공합니다.',
    color: 'text-[#F3A6DC]',
  },
  {
    img: '/green.png',
    title: '스마트 비교 분석 (SMART COMPARISON)',
    desc: '관심 사업장들을 다각도로 비교 분석하여, 개인의 목표와 상황에 가장 적합한 최적의 자산을 스스로 선택할 수 있도록 돕습니다.',
    color: 'text-[#00FF95]',
  },
  {
    img: '/yellow.png',
    title: '성장 로드맵 (SUCCESS ROADMAP)',
    desc: '노동 수익만으로는 따라갈 수 없는 자산 가격 상승에 대응하고, 객관적인 데이터 분석을 통해 당신의 자산 성장 로드맵을 만들어갑니다.',
    color: 'text-[#F4FF92]',
  },
];

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
        {RIGHT_ITEM.map((item) => (
          <div key={item.title} className="flex flex-row">
            <div className="relative p-0 min-w-[94px]">
              <Image src={item.img} alt={item.title} fill />
            </div>
            <div className="py-10 px-7 flex flex-col gap-4 bg-white/4">
              <h3 className={`${item.color} text-base`}>{item.title}</h3>
              <p className="text-white">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSide;
