export type User = {
  user_id: string;
  keycloak_sub?: string;
  username: string;
  email: string;
  user_image?: string[] | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
