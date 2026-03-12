import type { Category } from "@/misc/type";

const prefix = "category";

const searchCategory = (data?: any): Promise<Category[]> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/search`, {
    method: "POST",
    body: data,
  });

const getCategory = (category_id: string): Promise<Category> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${category_id}`, {
    method: "GET",
  });

const createCategory = (data: Partial<Category>): Promise<Category> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}`, {
    method: "POST",
    body: data,
  });

const updateCategory = (category_id: string, data: Partial<Category>): Promise<Category> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${category_id}`, {
    method: "PATCH",
    body: data,
  });

const deleteCategory = (category_id: string): Promise<Category> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${category_id}`, {
    method: "DELETE",
  });

export default function useCategory() {
  return {
    searchCategory,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
