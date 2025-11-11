'use client';
import { HandCoins, Mail, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import useStore from '@/store/useStore';
import { ITEM } from '../home/LeftSide';
import ProjectCard from '../common/ProjectCard';
import Link from 'next/link';

const RightSide = () => {
  const { myPageTab, setMyPageTab } = useStore();

  const activeTab = (tab: string) => {
    const isActive = tab === myPageTab;
    if (isActive) {
      return 'flex flex-col bg-transparent border border-[#FAFFCE] text-[#FAFFCE] hover:text-black';
    } else {
      return 'flex flex-col';
    }
  };

  return (
    <div className="flex flex-col w-full md:px-9 md:pt-16 md:gap-20">
      <div className="flex flex-row gap-5 justify-end">
        <Button
          size={'none'}
          variant={'yellow'}
          className={activeTab('message')}
          onClick={() => setMyPageTab('message')}
        >
          <Mail />
          메세지
        </Button>
        <Button
          size={'none'}
          variant={'yellow'}
          className={activeTab('assetManagement')}
          onClick={() => setMyPageTab('assetManagement')}
        >
          <HandCoins />
          자산 관리
        </Button>
        <Button
          size={'none'}
          variant={'yellow'}
          className={activeTab('settings')}
          onClick={() => setMyPageTab('settings')}
        >
          <Settings />
          계정 설정
        </Button>
      </div>

      {myPageTab === 'none' && (
        <div className="grid 3xl:grid-cols-3 2xl:grid-cols-2 grid-cols-1 gap-4">
          {ITEM.map((item, index) => (
            <Link href={`/${index}`} key={index}>
              <div className="flex flex-col gap-4 text-[#FAFFCE]">
                <h3 className="text-4xl text-center font-medium">
                  {item.address}
                </h3>
                <ProjectCard item={item} />
                <p className="text-center text-base">{item.project_name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {myPageTab === 'settings' && <div></div>}
    </div>
  );
};
export default RightSide;
