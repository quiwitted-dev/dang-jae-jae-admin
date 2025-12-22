'use client';

import useStore from '@/store/useStore';
import MapView from './MapView';
import RightSide from './RightSide';

const HomeRightSide = () => {
  const { address } = useStore();

  return (
    <>
      {address && (
        <div className="md:flex-1 mt-[52px] pr-4 hidden md:block mx-auto">
          <MapView address={address} />
        </div>
      )}
      <div className="relative">{!address && <RightSide />}</div>
    </>
  );
};

export default HomeRightSide;
