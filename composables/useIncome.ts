import type { Income } from "@/misc/type";

const prefix = 'income'

const getIncomeBy = (data?: any): Promise<Income[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getIncomeBy`, {
    method: "POST",
    body: data,
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

const updateIncomeBy = (data: Income, update: '' | 'mark_re_sell' = ''): Promise<Income> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateIncomeBy`, {
    method: "POST",
    body: {
        ...data,
        update: update || undefined,
    }
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