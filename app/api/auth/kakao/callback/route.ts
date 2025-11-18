import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(request: Request) {
  const body = await request.json();
  const code = body?.code;

  if (!code) {
    return NextResponse.json({ message: 'code is required' }, { status: 400 });
  }

  // 1. 백엔드로 요청
  const backendRes = await fetch(`${API_URL}/api/auth/kakao/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    credentials: 'include',
    // redirect: 'manual',
  });
  console.log(backendRes);

  // 2. 백엔드가 쿠키를 내려줬다면 이걸 가져온다
  const setCookie = backendRes.headers.get('set-cookie');

  // 3. 백엔드 응답 본문 읽기
  const text = await backendRes.text();

  let response;
  try {
    response = NextResponse.json(JSON.parse(text), {
      status: backendRes.status,
    });
  } catch {
    // JSON이 아닐 경우 HTML 그대로 전달
    response = new NextResponse(text, {
      status: backendRes.status,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // 4. 백엔드 쿠키를 프론트 응답에 다시 실어 보내기
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }

  return response;
}
