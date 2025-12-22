import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function DELETE(request: Request) {
  try {
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${API_URL}/api/auth`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
    });

    console.log(backendRes);

    // 백엔드 응답이 실패한 경우
    if (!backendRes.ok) {
      const message = await backendRes.text();
      return NextResponse.json(
        { success: false, message: message || "auth DELETE API failed" },
        { status: backendRes.status }
      );
    }
    const res = NextResponse.json({ success: true }, { status: backendRes.status });

    res.cookies.set({
      name: "userAccessToken",
      value: "",
      maxAge: 0,
    });
    res.cookies.set({
      name: "userRefreshToken",
      value: "",
      maxAge: 0,
    });

    return res;
  } catch (error: any) {
    console.error("DELETE /api/auth error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
