import type { Platform } from "@/misc/type";

const prefix = 'platform'

const getPlatformBy = (): Promise<Platform[]> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getPlatformBy`, {
    method: "POST",
})

const getPlatformByID = (data: { platform_id: string }): Promise<Platform> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getPlatformByID`, {
    method: "POST",
    body: data,
})

const insertPlatformBy = (data: Platform): Promise<Platform> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertPlatformBy`, {
    method: "POST",
    body: data,
})

const updatePlatformBy = (data: Platform): Promise<Platform> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updatePlatformBy`, {
    method: "POST",
    body: data,
})

const deletePlatformBy = (data: { platform_id: string }): Promise<Platform> => secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deletePlatformBy`, {
    method: "POST",
    body: data,
})

export default function usePlatform() {
    return {
        getPlatformBy,
        getPlatformByID,
        insertPlatformBy,
        updatePlatformBy,
        deletePlatformBy,
    };
}