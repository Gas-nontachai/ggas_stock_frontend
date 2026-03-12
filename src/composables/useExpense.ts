import type { Expense } from "@/misc/type";

const resource = createCrudResource<Expense>("expense");

const searchExpense = (data?: unknown): Promise<Expense[]> => resource.search(data);
const getExpense = (expense_id: string): Promise<Expense> => resource.get(expense_id);
const createExpense = (data: Partial<Expense>): Promise<Expense> => resource.create(data);
const updateExpense = (expense_id: string, data: Partial<Expense>): Promise<Expense> => resource.update(expense_id, data);
const deleteExpense = (expense_id: string): Promise<Expense> => resource.remove(expense_id);

export default function useExpense() {
  return {
    searchExpense,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
