import type { Income } from "@/misc/type";

const resource = createCrudResource<Income>("income");

const searchIncome = (data?: unknown): Promise<Income[]> => resource.search(data);
const getIncome = (income_id: string): Promise<Income> => resource.get(income_id);
const createIncome = (data: Partial<Income>): Promise<Income> => resource.create(data);
const updateIncome = (income_id: string, data: Partial<Income>): Promise<Income> => resource.update(income_id, data);
const deleteIncome = (income_id: string): Promise<Income> => resource.remove(income_id);

export default function useIncome() {
  return {
    searchIncome,
    getIncome,
    createIncome,
    updateIncome,
    deleteIncome,
  };
}
