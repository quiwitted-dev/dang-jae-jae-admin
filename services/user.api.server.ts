'use server';

import { cookies } from 'next/headers';
import { DOMAIL_URL } from './api';
import { User } from '@/types/user.type';

export const getUser = async (): Promise<User | null> => {
  const cookieStore = cookies();
  const cookie = (await cookieStore)
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join(';');

  const res = await fetch(`${DOMAIL_URL}/api/user`, {
    method: 'GET',
    headers: { cookie },
  });

  if (res.status === 401) return null;

  if (!res.ok) {
    throw new Error(`유저 정보 조회 실패 ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data.user;
};

export const putUser = async (nickname: string): Promise<User | null> => {
  const cookieStore = cookies();
  const cookie = (await cookieStore)
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join(';');

  const res = await fetch(`${DOMAIL_URL}/api/user`, {
    method: 'PUT',
    headers: { cookie },
    body: JSON.stringify({ nickname }),
  });

  if (res.status === 401) return null;

  if (!res.ok) {
    throw new Error(`유저 닉네임 변경 실패 ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data.user;
};
