import type { Income } from "@/misc/type";

const prefix = 'income'

const getIncomeBy = (): Promise<Income[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getIncomeBy`, {
    method: "POST",
})

const getIncomeByID = (data: { income_id: string }): Promise<Income> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getIncomeByID`, {
    method: "POST",
    body: data,
})

const insertIncomeBy = (data: Income): Promise<Income> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertIncomeBy`, {
    method: "POST",
    body: data,
})

const updateIncomeBy = (data: Income): Promise<Income> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateIncomeBy`, {
    method: "POST",
    body: data,
})

const deleteIncomeBy = (data: { income_id: string }): Promise<Income> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteIncomeBy`, {
    method: "POST",
    body: data,
})

export default function useIncome() {
    return {
        getIncomeBy,
        getIncomeByID,
        insertIncomeBy,
        updateIncomeBy,
        deleteIncomeBy,
    };
}