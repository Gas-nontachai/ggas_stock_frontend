import type { Expense } from "@/misc/type";

const prefix = "expense";

const searchExpense = (data?: any): Promise<Expense[]> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/search`, {
    method: "POST",
    body: data,
  });

const getExpense = (expense_id: string): Promise<Expense> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${expense_id}`, {
    method: "GET",
  });

const createExpense = (data: Partial<Expense>): Promise<Expense> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}`, {
    method: "POST",
    body: data,
  });

const updateExpense = (expense_id: string, data: Partial<Expense>): Promise<Expense> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${expense_id}`, {
    method: "PATCH",
    body: data,
  });

const deleteExpense = (expense_id: string): Promise<Expense> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${expense_id}`, {
    method: "DELETE",
  });

export default function useExpense() {
  return {
    searchExpense,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
