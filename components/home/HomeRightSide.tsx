'use client';

import useStore from '@/store/useStore';
import MapView from './MapView';
import RightSide from './RightSide';

const HomeRightSide = () => {
  const { address } = useStore();

  return (
    <>
      {address && (
        <div className="flex-1 min-h-dvh max-h-screen pt-20">
          <MapView address={address} />
        </div>
      )}
      {!address && <RightSide />}
    </>
  );
};

export default HomeRightSide;
