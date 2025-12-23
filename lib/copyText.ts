'use client';
import toast from 'react-hot-toast';

export const copyText = async (text: string, desc?: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast(`${text ? `${text}(이)가` : ''}클립보드에 복사되었습니다. ${desc}`);
  } catch (error) {
    console.error(error);
    toast('클립보드에 복사 실패하였습니다.');
  }
};
