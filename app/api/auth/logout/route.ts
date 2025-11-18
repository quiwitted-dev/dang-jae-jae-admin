import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookies = request.headers.get('cookie') || '';

  const hasAccessToken = cookies.includes('userAccessToken=');

  if (!hasAccessToken) {
    return NextResponse.json(
      { error: '인증 필요: access token 없음' },
      { status: 401 }
    );
  }

  // 로그아웃 처리
  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set('userAccessToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('userRefreshToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
