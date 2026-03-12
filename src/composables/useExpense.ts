import type { Expense } from "@/misc/type";

const prefix = 'expense'

const getExpenseBy = (data?: any): Promise<Expense[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getExpenseBy`, {
    method: "POST",
    body: data,
})

const getExpenseByID = (data: { expense_id: string }): Promise<Expense> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getExpenseByID`, {
    method: "POST",
    body: data,
})

const insertExpenseBy = (data: Expense): Promise<Expense> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertExpenseBy`, {
    method: "POST",
    body: data,
})

const updateExpenseBy = (data: Expense): Promise<Expense> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateExpenseBy`, {
    method: "POST",
    body: data,
})

const deleteExpenseBy = (data: { expense_id: string }): Promise<Expense> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteExpenseBy`, {
    method: "POST",
    body: data,
})

export default function useExpense() {
    return {
        getExpenseBy,
        getExpenseByID,
        insertExpenseBy,
        updateExpenseBy,
        deleteExpenseBy,
    };
}