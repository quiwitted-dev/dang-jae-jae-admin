export const getUser = async () => {
  const res = await fetch(`/api/user`, {
    method: 'GET',
  });
  if (res.status === 401 || res.status === 403) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    let message = '유저 정보 조회 실패';
    try {
      const errorData = JSON.parse(text);
      message = errorData.message || errorData.error || message;
    } catch {
      message = text || `${message} ${res.status} ${res.statusText}`;
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.data.user;
};
