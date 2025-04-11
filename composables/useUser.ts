import type { User } from "@/misc/type";

const prefix = 'user'

const getUserBy = (data?: any): Promise<User[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getUserBy`, {
    method: "POST",
    body: data,
})

const getUserByID = (data: { user_id: string }): Promise<User> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getUserByID`, {
    method: "POST",
    body: data,
})

const insertUserBy = (data: User): Promise<User> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertUserBy`, {
    method: "POST",
    body: data,
})

const updateUserBy = (data: User): Promise<User> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateUserBy`, {
    method: "POST",
    body: data,
})

const deleteUserBy = (data: { user_id: string }): Promise<User> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteUserBy`, {
    method: "POST",
    body: data,
})

export default function useUser() {
    return {
        getUserBy,
        getUserByID,
        insertUserBy,
        updateUserBy,
        deleteUserBy,
    };
}