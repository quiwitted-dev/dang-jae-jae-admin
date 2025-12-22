'use client';

import { copyText } from '@/lib/copyText';

const Footer = () => {
  return (
    <footer className="text-center my-2 font-[#F4F4F4] text-sm">
      당신의재재
      <br />
      사업자등록번호 | 475-46-01292 대표 | 이필순
      <br />
      주소 | 경기도 용인시 수지구 용구대로2790번길 7, 3층 302호 <br />
      <span
        onClick={() => copyText('jajattok@gmail.com')}
        className="cursor-pointer"
      >
        연락처 | jajattok@gmail.com
      </span>
    </footer>
  );
};

export default Footer;
