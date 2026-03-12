import type { Item } from "@/misc/type";

const prefix = "item";

type ItemPayload = Omit<Partial<Item>, "item_image"> & {
  image_urls?: string[];
};

const searchItem = (data?: any): Promise<Item[]> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/search`, {
    method: "POST",
    body: data,
  });

const getItem = (item_id: string): Promise<Item> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${item_id}`, {
    method: "GET",
  });

const createItem = (data: ItemPayload): Promise<Item> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}`, {
    method: "POST",
    body: data,
  });

const updateItem = (item_id: string, data: ItemPayload): Promise<Item> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${item_id}`, {
    method: "PATCH",
    body: data,
  });

const deleteItem = (item_id: string): Promise<Item> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${item_id}`, {
    method: "DELETE",
  });

export default function useItem() {
  return {
    searchItem,
    getItem,
    createItem,
    updateItem,
    deleteItem,
  };
}
