import type { Item } from "@/misc/type";

const prefix = 'item'

const getItemBy = (): Promise<Item[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getItemBy`, {
    method: "POST",
})

const getItemByID = (data: { item_id: string }): Promise<Item> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getItemByID`, {
    method: "POST",
    body: data,
})

const insertItemBy = (data: Item): Promise<Item> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertItemBy`, {
    method: "POST",
    body: data,
})

const updateItemBy = (data: Item): Promise<Item> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateItemBy`, {
    method: "POST",
    body: data,
})

const deleteItemBy = (data: { item_id: string }): Promise<Item> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteItemBy`, {
    method: "POST",
    body: data,
})

export default function useItem() {
    return {
        getItemBy,
        getItemByID,
        insertItemBy,
        updateItemBy,
        deleteItemBy,
    };
}