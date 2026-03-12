export type Platform = {
  platform_id: string,
  platform_name: string,
  platform_image: string[] | null,
  addby?: string,
  updateby?: string,
  createdAt?: date | string,
  updatedAt?: date | string,
};
