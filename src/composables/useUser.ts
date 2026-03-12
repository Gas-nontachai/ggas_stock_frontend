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

const insertUserBy = (data: { user: User, file?: File[] }): Promise<User> => {
    const formData = new FormData();

    formData.append("user", JSON.stringify(data.user));
    if (data.file?.length) {
        data.file.forEach((file, index) => {
            formData.append(`files`, file);
        });
    }

    return secureFetch(
        `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertUserBy`,
        {
            method: "POST",
            body: formData,
        }
    );
};

const updateUserBy = (data: { user: User, file?: File[] }): Promise<User> => {
    const formData = new FormData();

    formData.append("user", JSON.stringify(data.user));
    if (data.file?.length) {
        data.file.forEach((file, index) => {
            formData.append(`files`, file);
        });
    }

    return secureFetch(
        `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateUserBy`,
        {
            method: "POST",
            body: formData,
        }
    );
};

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