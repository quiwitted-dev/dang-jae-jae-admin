export interface UserApiResponse {
  success: boolean;
  user: User;
}

export interface User {
  id: 'string';
  kakaoId: 'string';
  nickname: 'string';
  email: 'string';
  phoneNumber: 'string';
  createdAt: 'string';
  updatedAt: 'string';
}
