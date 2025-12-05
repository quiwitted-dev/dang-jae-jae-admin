'use client';

import useStore from '@/store/useStore';
import MapView from './MapView';
import RightSide from './RightSide';

const HomeRightSide = () => {
  const { address } = useStore();

  return (
    <>
      {address && (
        <div className="flex-1 pr-4">
          <MapView address={address} />
        </div>
      )}
      {!address && <RightSide />}
    </>
  );
};

export default HomeRightSide;
