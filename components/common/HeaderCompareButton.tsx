import Image from 'next/image';
import { Button } from '../ui/button';

type HeaderCompareButtonProps = {
  hasTitle: boolean;
};

const HeaderCompareButton = ({ hasTitle }: HeaderCompareButtonProps) => {
  return (
    <Button
      variant={'white'}
      className="flex items-center h-10 flex-row justify-center py-2 px-3 cursor-pointer gap-0"
    >
      {' '}
      <Image
        src={'/black-compare.png'}
        alt="비교보기 아이콘"
        width={27}
        height={27}
      />
      {hasTitle && <p>비교보기</p>}
    </Button>
  );
};

export default HeaderCompareButton;
