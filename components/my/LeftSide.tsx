'use client';

import useStore from '@/store/useStore';
import { Button } from '../ui/button';
import { Pencil, X } from 'lucide-react';
import { DANGJAEJAE_INFO } from '@/constants/home';
import InfoCard from '../common/InfoCard';
import SettingsNavigation from './SettingsNavigation';
import { useState } from 'react';
import TermsModal from './TermsModal';
import { Switch } from '../ui/switch';
import { User } from '@/types/user.type';
import { Input } from '../ui/input';
import { putUser } from '@/services/user.api.server';

const LeftSide = ({ user }: { user: User }) => {
  const myPageTab = useStore((state) => state.myPageTab);
  const setSettingsTab = useStore((state) => state.setSettingsTab);
  const settingsTab = useStore((state) => state.settingsTab);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [nickname, setNickname] = useState(user.nickname);

  const handleSettingTabs = (
    tab: 'privacy' | 'policies' | 'analysis' | 'service' | 'none'
  ) => {
    setSettingsTab(tab);
  };

  const getTabClass = (
    tab: 'privacy' | 'policies' | 'analysis' | 'service' | 'none'
  ) => {
    const isActive = settingsTab === tab;

    if (isActive) {
      return 'text-xl font-semibold relative inline-block after:absolute after:w-0 after:h-[2px] after:left-0 after:bottom-0 after:bg-[#0700DB] after:transition-all after:duration-300 hover:after:w-full underline underline-offset-4 decoration-2 decoration-[#0700DB]';
    } else {
      return 'text-xl font-semibold relative inline-block after:absolute after:w-0 after:h-[2px] after:left-0 after:bottom-0 after:bg-[#0700DB] after:transition-all after:duration-300 hover:after:w-full';
    }
  };

  const handleTab = (
    tab: 'privacy' | 'policies' | 'analysis' | 'service' | 'none'
  ) => {
    handleSettingTabs(tab);
    setIsTermsModalOpen(true);
  };

  const handleNicknameSubmit = async (nickname: string) => {
    try {
      const data = await putUser(nickname);
      if (data) setNickname(data?.nickname);
    } finally {
      setIsEdit(false);
    }
  };

  return (
    <div className="pt-16 lg:px-16">
      {myPageTab === 'none' && (
        <div className="flex flex-row justify-between gap-4 mb-16 lg:mb-0">
          <h2 className="text-4xl font-extralight leading-snug">
            안녕하세요!
            <br />
            <span className="font-bold">{nickname}</span>님의
            <br />
            <p className="whitespace-normal break-keep">
              <span className="text-[#FAFFCE]">관심 정비사업장</span>들 입니다.
            </p>
          </h2>
          <div className="lg:hidden block">
            <SettingsNavigation />
          </div>
        </div>
      )}
      {myPageTab === 'settings' && (
        <div className="flex flex-col relative">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-extralight text-[#F5B3CB]">닉네임</p>
            <div className="flex flex-row justify-between items-center gap-5">
              {!isEdit ? (
                <p className="text-4xl bold">{nickname}</p>
              ) : (
                <Input
                  placeholder="변경하고 싶은 닉네임 입력"
                  onChange={(e) => setEditNickname(e.target.value)}
                />
              )}

              <Button
                className="py-2 px-3 rounded-4xl bg-[#D5B3CB] text-black hover:bg-[#F5B3CB] hover:cursor-pointer"
                size={'none'}
                onClick={() => {
                  isEdit ? handleNicknameSubmit(editNickname) : setIsEdit(true);
                }}
              >
                <Pencil />
                <p>{isEdit ? '확인' : '수정'}</p>
              </Button>
            </div>
            <p className="text-sm font-extralight text-[#F5B3CB]">
              {/* todo : 여기 카카오 아이디(ex : 4549379906)인데 뭐로 해야하지?  */}
              유저 아이디
            </p>
          </div>

          <div className="border-b border-b-white/20 my-9" />

          <div className="flex flex-col gap-3 mb-9">
            <p className="text-sm font-extralight text-[#F5B3CB]">고객센터</p>
            <h3
              className={getTabClass('privacy')}
              onClick={() => handleTab('privacy')}
            >
              개인정보처리방침
            </h3>
            <h3
              className={getTabClass('policies')}
              onClick={() => handleTab('policies')}
            >
              약관 및 정책
            </h3>
            <div className="flex flex-row justify-between">
              <h3
                className={getTabClass('analysis')}
                // onClick={() => handleTab('analysis')}
              >
                맞춤형 통계 분석 참여 동의
              </h3>
              <div className="relative">
                <Switch
                  checked={checked}
                  onCheckedChange={setChecked}
                  className={`data-[state=checked]:bg-transparent data-[state=unchecked]:bg-transparent w-[70px] h-[34px] rounded-full border border-black `}
                />
                <span className="absolute inset-0 flex items-center justify-center text-black text-sm font-normal pointer-events-none">
                  {checked ? '동의함' : '거절'}
                </span>
              </div>
            </div>
            <h3
              className={getTabClass('service')}
              // onClick={() => handleTab('service')}
            >
              서비스 문의하기
            </h3>
          </div>

          <div className="flex flex-col gap-1 mb-9">
            {DANGJAEJAE_INFO.map((item) => (
              <InfoCard info={item} key={item.title} />
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              size={'none'}
              className="mb-9 py-3 px-4 bg-[#A7B1E8] hover:bg-[#95a3ef] w-fit rounded-4xl hover:cursor-pointer"
            >
              <p className="text-sm font-bold text-black">탈퇴하기</p>
            </Button>
          </div>

          {isTermsModalOpen && (
            <div className="lg:hidden absolute inset-0">
              <div className="relative">
                <X
                  className="absolute top-2 right-2 text-black"
                  onClick={() => setIsTermsModalOpen(false)}
                />
                <TermsModal />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default LeftSide;
