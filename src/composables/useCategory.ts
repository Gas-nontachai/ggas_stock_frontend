import type { Category } from "@/misc/type";

const resource = createCrudResource<Category>("category");

const searchCategory = (data?: unknown): Promise<Category[]> => resource.search(data);
const getCategory = (category_id: string): Promise<Category> => resource.get(category_id);
const createCategory = (data: Partial<Category>): Promise<Category> => resource.create(data);
const updateCategory = (category_id: string, data: Partial<Category>): Promise<Category> => resource.update(category_id, data);
const deleteCategory = (category_id: string): Promise<Category> => resource.remove(category_id);

export default function useCategory() {
  return {
    searchCategory,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
