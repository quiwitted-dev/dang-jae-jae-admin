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
      <div className="relative p-0 min-w-[94px]">
        <Image src={info.img} alt={info.title} fill />
      </div>
      <div className="py-10 px-7 flex flex-col gap-4 bg-white/4">
        <h3 className={`${info.color} text-base`}>{info.title}</h3>
        <p className="text-white">{info.desc}</p>
      </div>
    </div>
  );
};

export default InfoCard;
