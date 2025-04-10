export type Expense = {
  expense_id: string,
  expense_name: string,
  expense_amount: number,
  category: string,
  expense_image: string,
  addby?: string,
  updateby?: string,
  createdAt?: date | string,
  updatedAt?: date | string,
};
