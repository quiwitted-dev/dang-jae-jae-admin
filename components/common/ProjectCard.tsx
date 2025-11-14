import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Bookmark } from 'lucide-react';
import { ProjectType } from '@/types/type';

const ProjectCard = ({ item }: { item: ProjectType }) => {
  return (
    <Card className="relative flex flex-col overflow-hidden bg-transparent p-0 rounded-4xl aspect-300/220 min-w-[350px] max-w-[500px] mx-auto">
      <Image
        src={'/temp_location.png'}
        fill
        alt="지도"
        className="object-cover -z-10"
      />
      <CardHeader className="relative flex flex-row p-0 justify-between pt-2 px-3">
        <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold">{item.address}</p>
          <h3 className="text-sm font-bold truncate w-40">
            {item.project_name}
          </h3>
        </div>
        <Badge className="text-xs font-bold bg-[#F4FF92] text-black h-fit">
          {item.approval_status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-row justify-between items-center px-3 py-1 flex-1">
        <div className="bg-black text-white flex flex-col text-center text-lg rounded-3xl py-2 px-1.5">
          <div className="flex flex-row items-center">
            <p className="font-playfair">
              {item.price_range.max.toString().replace(/0{8}$/, '')}
            </p>
            <span className="text-sm">억</span>
          </div>
          <p className="p-0 m-0 font-playfair leading-none text-sm">~</p>
          <div className="flex flex-row items-center">
            <p className="font-playfair">
              {item.price_range.min.toString().replace(/0{8}$/, '')}
            </p>
            <span className="text-sm">억</span>
          </div>
        </div>
        <div className="relative flex flex-col border-2 border-black rounded-2xl p-1.5 text-right gap-1 overflow-hidden h-fit">
          <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
          <p className="text-sm font-bold">{item.project_type}</p>
          <div className="font-bold">
            <p className="text-xs">평균대지지분</p>
            <p className="text-sm">{item.average_land_share} 평</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="relative flex flex-row justify-between py-2 px-3">
        <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
        <div className="flex flex-col gap-1 font-bold">
          <p className="text-sm">{item.new_households} 신축세대</p>
          <p className="text-xs">임대 {item.rental_households}</p>
        </div>
        <Bookmark size={16} />
        <div className="flex flex-col text-xs text-gray-700 text-right">
          <p>
            소유자 수 <span className="font-bold">{item.owners_count}명</span>
          </p>
          <p className="font-bold">{item.land_area_m2}m2</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
