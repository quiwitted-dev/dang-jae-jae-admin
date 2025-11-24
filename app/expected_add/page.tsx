import ExpectedAddForm from '@/components/expected_add/ExpectedAddForm';
import Image from 'next/image';

const ExpectedAdd = () => {
  return (
    <div className="flex flex-row">
      <ExpectedAddForm/>

      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-[390px] aspect-390/194">
          <Image
            src="/logo-color.png"
            alt="당재재 로고"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ExpectedAdd;
