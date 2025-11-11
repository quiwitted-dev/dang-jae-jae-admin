'use client';

import useStore from '@/store/useStore';
import { Button } from '../ui/button';
import { Pencil } from 'lucide-react';

type LeftSideProps = {
  name: string;
  userId: string;
};

const LeftSide = ({ user }: { user: LeftSideProps }) => {
  const { myPageTab } = useStore();
  return (
    <div className="md:pt-16 px-16">
      {myPageTab === 'none' && (
        <h2 className="text-4xl font-extralight leading-snug">
          안녕하세요!
          <br />
          <span className="font-bold">{user.name}</span>님의
          <br />
          <span className="text-[#FAFFCE]">관심 정비사업장</span>들 입니다.
        </h2>
      )}
      {myPageTab === 'settings' && (
        <div className="flex flex-col">
          <div>
            <p className="text-sm font-extralight text-[#F5B3CB]">닉네임</p>
            <div className="flex flex-row">
              <p>{user.name}</p>
              <Button>
                <Pencil />
                <p>수정</p>
              </Button>
            </div>
            <p className="text-sm font-extralight text-[#F5B3CB]">
              유저 아이디 {user.userId}
            </p>
          </div>

          <div className="border-b border-b-white" />

          <div>
            <p className="text-sm font-extralight text-[#F5B3CB]">고객센터</p>
            <h3 className="text-xl font-semibold">개인정보처리방침</h3>
            <h3 className="text-xl font-semibold">약관 및 정책</h3>
            <h3 className="text-xl font-semibold">
              맞춤형 통계 분석 참여 동의
            </h3>
            <h3 className="text-xl font-semibold">서비스 문의하기</h3>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeftSide;
