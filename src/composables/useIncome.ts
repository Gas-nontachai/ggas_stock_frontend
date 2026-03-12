import type { Income } from "@/misc/type";

const prefix = "income";

const searchIncome = (data?: any): Promise<Income[]> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/search`, {
    method: "POST",
    body: data,
  });

const getIncome = (income_id: string): Promise<Income> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${income_id}`, {
    method: "GET",
  });

const createIncome = (data: Partial<Income>): Promise<Income> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}`, {
    method: "POST",
    body: data,
  });

const updateIncome = (income_id: string, data: Partial<Income>): Promise<Income> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${income_id}`, {
    method: "PATCH",
    body: data,
  });

const deleteIncome = (income_id: string): Promise<Income> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${income_id}`, {
    method: "DELETE",
  });

export default function useIncome() {
  return {
    searchIncome,
    getIncome,
    createIncome,
    updateIncome,
    deleteIncome,
  };
}
