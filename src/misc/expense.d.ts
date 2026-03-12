export type Expense = {
  expense_id: string,
  expense_name: string,
  expense_amount: number,
  expense_category_id: string,
  addby?: string,
  updateby?: string,
  createdAt?: date | string,
  updatedAt?: date | string,
}; 