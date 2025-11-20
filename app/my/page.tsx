import LeftSide from '@/components/my/LeftSide';
import RightSide from '@/components/my/RightSide';
import { getUser } from '@/services/user.api.server';
import { redirect } from 'next/navigation';

const MyPage = async () => {
  const user = await getUser();

  if (!user) return redirect('/');
  return (
    <div className="flex lg:flex-row flex-col bg-[#212138] min-h-dvh lg:px-0 px-2">
      <div className="lg:max-w-[600px] lg:md:w-[600px]">
        <LeftSide user={user} />
      </div>
      <div className="flex flex-1">
        <RightSide />
      </div>
    </div>
  );
};
export default MyPage;
