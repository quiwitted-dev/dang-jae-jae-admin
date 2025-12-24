import { HandCoins, Mail, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import useStore from '@/store/useStore';

const SettingsNavigation = () => {
  const myPageTab = useStore((state) => state.myPageTab);
  const setMyPageTab = useStore((state) => state.setMyPageTab);
  const setSettingsTab = useStore((state) => state.setSettingsTab);

  const activeTab = (tab: string) => {
    const isActive = tab === myPageTab;
    if (isActive) {
      return 'flex flex-col bg-transparent border border-[#FAFFCE] text-[#FAFFCE] hover:text-black';
    } else {
      return 'flex flex-col';
    }
  };

  return (
    <div className="flex lg:flex-row flex-col gap-5">
      <Button
        size={'none'}
        variant={'yellow'}
        // className={activeTab('message')}
        // onClick={() => setMyPageTab('message')}
      >
        <Mail />
        메세지
      </Button>
      <Button
        size={'none'}
        variant={'yellow'}
        // className={activeTab('assetManagement')}
        // onClick={() => setMyPageTab('assetManagement')}
      >
        <HandCoins />
        자산 관리
      </Button>
      <Button
        size={'none'}
        variant={'yellow'}
        className={`flex flex-col bg-[#FAFFCE] border border-[#FAFFCE] text-black`}
        onClick={() => {
          setMyPageTab('settings');
          setSettingsTab('privacy');
        }}
      >
        <Settings />
        계정 설정
      </Button>
    </div>
  );
};

export default SettingsNavigation;
