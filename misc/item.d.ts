export type Item = {
  item_id: string,
  item_name: string,
  item_buy_price: number,
  note: string,
  item_image: string,
  addby?: string,
  updateby?: string,
  createdAt?: date | string,
  updatedAt?: date | string,
};
