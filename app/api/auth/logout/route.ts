import { NextResponse } from 'next/server';

export async function POST() {
  // 쿠키 삭제
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set('userAccessToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0, // 즉시 만료
  });

  response.cookies.set('userRefreshToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
