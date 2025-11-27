export const getUser = async () => {
  const res = await fetch(`/api/user`, {
    method: 'GET',
  });
  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`유저 정보 조회 실패 ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data.user;
};
