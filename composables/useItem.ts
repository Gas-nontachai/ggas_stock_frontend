import type { Item } from "@/misc/type";
const prefix = 'item'

const getItemBy = (data?: any): Promise<Item[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getItemBy`, {
    method: "POST",
    body: data,
})

const getItemByID = (data: { item_id: string }): Promise<Item> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getItemByID`, {
    method: "POST",
    body: data,
})

const insertItemBy = (data: { item: Item, file?: File[] }): Promise<Item> => {
    const formData = new FormData();

    formData.append("item", JSON.stringify(data.item));
    if (data.file?.length) {
        data.file.forEach((file, index) => {
            formData.append(`files`, file);
        });
    }

    return secureFetch(
        `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertItemBy`,
        {
            method: "POST",
            body: formData,
        }
    );
};

const updateItemBy = (data: { item: Item, file?: File[], delete_arr?: string }): Promise<Item> => {
    const formData = new FormData();

    formData.append("item", JSON.stringify(data.item));
    formData.append("delete_arr", JSON.stringify(data.delete_arr));
    if (data.file?.length) {
        data.file.forEach((file, index) => {
            formData.append(`files`, file);
        });
    }

    return secureFetch(
        `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateItemBy`,
        {
            method: "POST",
            body: formData,
        }
    );
};

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