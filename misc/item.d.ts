import type { Category, User } from "./type";

export type Item = {
  item_id: string,
  item_name: string,
  item_buy_price: number,
  note: string,
  item_image: string,
  item_category_id: string,
  item_status: number,
  addby?: string,
  updateby?: string,
  createdAt?: date | string,
  updatedAt?: date | string,
  tb_category?: Category
  tb_user?: User
};
