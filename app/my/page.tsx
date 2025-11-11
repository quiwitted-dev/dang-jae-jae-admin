import LeftSide from '@/components/my/LeftSide';
import RightSide from '@/components/my/RightSide';

export const user = {
  name: '카카오톡아이이이이디',
  userId: 'Fheoiid80',
};

const MyPage = () => {
  return (
    <div className="flex flex-row bg-[#212138] min-h-dvh">
      <div className="max-w-[600px] md:w-[600px]">
        <LeftSide user={user} />
      </div>
      <div className="flex flex-1">
        <RightSide />
      </div>
    </div>
  );
};
export default MyPage;
