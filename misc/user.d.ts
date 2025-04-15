export type User = {
  user_id: string,
  username: string,
  email: string,
  user_image?: string,
  password?: string,
  createdAt?: date | string,
  updatedAt?: date | string,
};
