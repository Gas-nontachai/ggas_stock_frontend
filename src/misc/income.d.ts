import type { Item, Platform } from "./type";

export type Income = {
  income_id: string,
  income_sell_price: number,
  platform_id: string,
  note: string,
  item_id: string,
  addby?: string,
  updateby?: string,
  createdAt?: date | string,
  updatedAt?: date | string,
  tb_item?: Item
  tb_platform?: Platform
};
