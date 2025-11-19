import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextResponse) {
  try {
    const cookie = request.headers.get('cookie') || '';

    const backendRes = await fetch(`${API_URL}/api/favorite`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
    });

    // 백엔드 응답이 실패한 경우
    if (!backendRes.ok) {
      const message = await backendRes.text();
      return NextResponse.json(
        { success: false, message: message || 'favorite API failed' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json(
      { success: true, data },
      { status: backendRes.status }
    );
  } catch (error: any) {
    console.error('POST /api/favorite error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextResponse) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { referenceId, dataType } = await request.json();

    const backendRes = await fetch(`${API_URL}/api/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify({ referenceId, dataType }),
    });

    // 백엔드 응답이 실패한 경우
    if (!backendRes.ok) {
      const message = await backendRes.text();
      return NextResponse.json(
        { success: false, message: message || 'favorite API failed' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json(
      { success: true, data },
      { status: backendRes.status }
    );
  } catch (error: any) {
    console.error('POST /api/favorite error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextResponse) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { id } = await request.json();

    const backendRes = await fetch(`${API_URL}/api/favorite/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
    });

    // 백엔드 응답이 실패한 경우
    if (!backendRes.ok) {
      const message = await backendRes.text();
      return NextResponse.json(
        { success: false, message: message || 'favorite API failed' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json(
      { success: true, data },
      { status: backendRes.status }
    );
  } catch (error: any) {
    console.error('POST /api/favorite error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
