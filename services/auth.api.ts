import { API_URL } from "./api";

export const permissionKakao = async () => {
  if (typeof window === "undefined") return;
  window.location.href = `${API_URL}/api/auth/kakao`;
};

export const LoginKakao = async (code: string) => {
  const res = await fetch(`/api/auth/kakao/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = "카카오 로그인에 실패했습니다.";
    try {
      const errorData = JSON.parse(text);
      message = errorData.message || errorData.error || message;
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }

  const data = await res.json();

  return data;
};

export const logout = async () => {
  const res = await fetch(`/api/auth/logout`, { method: "POST" });
  if (!res.ok) {
    throw new Error("로그아웃 실패");
  }
  const data = await res.json();
  return data;
};

export const deleteAccount = async () => {
  const res = await fetch(`/api/auth`, { method: "DELETE" });

  const data = await res.json();

  if (data.success === false) {
    throw new Error(data.message || "회원 탈퇴에 실패했습니다.");
  }

  return data;
};
