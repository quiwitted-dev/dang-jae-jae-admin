import Image from 'next/image';

type DetailRightSideProps = {
  map: string;
};

const DetailRightSide = ({ map }: DetailRightSideProps) => {
  return (
    <Image
      src={map}
      width={800}
      height={1000}
      alt="지도"
      className="w-full h-full object-cover"
    />
  );
};
export default DetailRightSide;
