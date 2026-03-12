import type { User } from "@/misc/type";

const prefix = "user";

type UserPayload = Omit<Partial<User>, "user_image"> & {
  image_urls?: string[];
};

const searchUser = (data?: any): Promise<User[]> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/search`, {
    method: "POST",
    body: data,
  });

const getUser = (user_id: string): Promise<User> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${user_id}`, {
    method: "GET",
  });

const createUser = (data: UserPayload): Promise<User> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}`, {
    method: "POST",
    body: data,
  });

const updateUser = (user_id: string, data: UserPayload): Promise<User> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${user_id}`, {
    method: "PATCH",
    body: data,
  });

const deleteUser = (user_id: string): Promise<User> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${user_id}`, {
    method: "DELETE",
  });

export default function useUser() {
  return {
    searchUser,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };
}
