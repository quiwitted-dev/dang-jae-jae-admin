'use client';

import useCompareStore from '@/store/useCompareStore';
import { Button } from '../ui/button';
import Image from 'next/image';
import toast from 'react-hot-toast';

type Props = {
  id: string;
  type: 'PUBLIC_DATA' | 'SUBMISSION';
};

const CompareButton = ({ id, type }: Props) => {
  const { compare, setCompare, removeCompare } = useCompareStore();
  const hasId = compare.some((compareId) => compareId?.id === id);
  const index = compare.findIndex((data) => data?.id === id);

  const handleCompare = () => {
    if (hasId) {
      if (index === 0 || index === 1) {
        removeCompare(index);
        toast('비교하기에 제외되었습니다.');
      }
    } else {
      setCompare({ id, dataType: type });
      toast('비교하기에 담았습니다.');
    }
  };

  return (
    <Button
      className={`rounded-full cursor-pointer border ${
        hasId ? 'bg-transparent text-black border-black' : 'border-transparent'
      }`}
      onClick={handleCompare}
    >
      <Image
        src={hasId ? '/black-compare.png' : '/white-compare.png'}
        alt="비교보기 아이콘"
        width={27}
        height={27}
      />
      {hasId ? '비교담김' : '비교담기'}
    </Button>
  );
};

export default CompareButton;
