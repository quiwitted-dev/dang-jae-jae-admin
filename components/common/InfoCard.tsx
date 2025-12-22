import Image from 'next/image';

type InfoCardProps = {
  img: string;
  title: string;
  desc: string;
  color: string;
};

const InfoCard = ({ info }: { info: InfoCardProps }) => {
  return (
    <div key={info.title} className="flex flex-row">
      <div className="xl:block hidden relative p-0 min-w-[94px]">
        <Image src={info.img} alt={info.title} fill className="object-cover" />
      </div>
      <div className="xl:py-10 xl:px-7 py-5 pr-3 flex flex-col gap-4 bg-white/4">
        <h3 className={`${info.color} text-base`}>{info.title}</h3>
        <p className="text-white whitespace-normal break-keep">{info.desc}</p>
      </div>
    </div>
  );
};

export default InfoCard;
