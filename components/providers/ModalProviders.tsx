// components/providers/ModalProvider.tsx
'use client';
import { useEffect } from 'react';
import useStore from '@/store/useStore';
import Login from '../common/Login';

export default function ModalProvider() {
  const { isOpen } = useStore();

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 스크롤 막기
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫힐 때 스크롤 복원
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return isOpen ? <Login /> : null;
}
