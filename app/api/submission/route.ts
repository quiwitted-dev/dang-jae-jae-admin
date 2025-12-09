import { API_URL } from '@/services/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { form } = await request.json();


    const backendRes = await fetch(`${API_URL}/api/submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify(form),
    });


    // 백엔드 응답이 실패한 경우
    if (!backendRes.ok) {
      const message = await backendRes.text();
      console.log('백엔드 오류 응답:', message);
      return NextResponse.json(
        { success: false, message: message || 'submission API failed' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json(
      { success: true, data },
      { status: backendRes.status }
    );
  } catch (error: any) {
    console.error('POST /api/submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
