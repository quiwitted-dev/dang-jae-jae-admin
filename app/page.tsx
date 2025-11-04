import LeftSide from '@/components/home/LeftSide';
import RightSide from '@/components/home/RightSide';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-row">
      <LeftSide />
      <RightSide />
    </main>
  );
}
