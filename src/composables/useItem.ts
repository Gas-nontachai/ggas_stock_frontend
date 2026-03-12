import type { Item } from "@/misc/type";

type ItemPayload = Omit<Partial<Item>, "item_image"> & {
  image_urls?: string[];
};

const resource = createCrudResource<Item, ItemPayload, ItemPayload>("item");

const searchItem = (data?: unknown): Promise<Item[]> => resource.search(data);
const getItem = (item_id: string): Promise<Item> => resource.get(item_id);
const createItem = (data: ItemPayload): Promise<Item> => resource.create(data);
const updateItem = (item_id: string, data: ItemPayload): Promise<Item> => resource.update(item_id, data);
const deleteItem = (item_id: string): Promise<Item> => resource.remove(item_id);

export default function useItem() {
  return {
    searchItem,
    getItem,
    createItem,
    updateItem,
    deleteItem,
  };
}
