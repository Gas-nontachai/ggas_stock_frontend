import type { Category } from "@/misc/type";

const prefix = 'category'

const getCategoryBy = (): Promise<Category[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getCategoryBy`, {
    method: "POST",
})

const getCategoryByID = (data: { category_id: string }): Promise<Category> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getCategoryByID`, {
    method: "POST",
    body: data,
})

const insertCategoryBy = (data: Category): Promise<Category> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertCategoryBy`, {
    method: "POST",
    body: data,
})

const updateCategoryBy = (data: Category): Promise<Category> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateCategoryBy`, {
    method: "POST",
    body: data,
})

const deleteCategoryBy = (data: { category_id: string }): Promise<Category> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteCategoryBy`, {
    method: "POST",
    body: data,
})

export default function useCategory() {
    return {
        getCategoryBy,
        getCategoryByID,
        insertCategoryBy,
        updateCategoryBy,
        deleteCategoryBy,
    };
}