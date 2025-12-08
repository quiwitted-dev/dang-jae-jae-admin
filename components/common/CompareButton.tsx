import useCompareStore from '@/store/useCompareStore';
import { Button } from '../ui/button';
import Image from 'next/image';

type Props = {
  id: string;
};

const CompareButton = ({ id }: Props) => {
  const { setCompare } = useCompareStore();

  return (
    <Button
      className="rounded-full"
      onClick={() => {
        setCompare({ id, dataType: 'SUBMISSON' });
        alert('비교하기에 담았습니다.');
      }}
    >
      <Image
        src={'/white-compare.png'}
        alt="비교보기 아이콘"
        width={27}
        height={27}
      />
      비교담기
    </Button>
  );
};

export default CompareButton;
