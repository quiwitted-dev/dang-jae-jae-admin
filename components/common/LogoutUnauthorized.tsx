'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LogoutUnauthorized = () => {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      router.replace('/');
    });
  }, [router]);
  return null;
};

export default LogoutUnauthorized;
