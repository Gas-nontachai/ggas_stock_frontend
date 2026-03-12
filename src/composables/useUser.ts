import type { User } from "@/misc/type";

type UserPayload = Omit<Partial<User>, "user_image"> & {
  image_urls?: string[];
};

const resource = createCrudResource<User, UserPayload, UserPayload>("user");

const searchUser = (data?: unknown): Promise<User[]> => resource.search(data);
const getUser = (user_id: string): Promise<User> => resource.get(user_id);
const createUser = (data: UserPayload): Promise<User> => resource.create(data);
const updateUser = (user_id: string, data: UserPayload): Promise<User> => resource.update(user_id, data);
const deleteUser = (user_id: string): Promise<User> => resource.remove(user_id);

export default function useUser() {
  return {
    searchUser,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };
}
