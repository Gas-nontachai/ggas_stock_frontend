import type { Platform } from "@/misc/type";

const prefix = "platform";

type PlatformPayload = Omit<Partial<Platform>, "platform_image"> & {
  image_urls?: string[];
};

const searchPlatform = (data?: any): Promise<Platform[]> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/search`, {
    method: "POST",
    body: data,
  });

const getPlatform = (platform_id: string): Promise<Platform> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${platform_id}`, {
    method: "GET",
  });

const createPlatform = (data: PlatformPayload): Promise<Platform> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}`, {
    method: "POST",
    body: data,
  });

const updatePlatform = (platform_id: string, data: PlatformPayload): Promise<Platform> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${platform_id}`, {
    method: "PATCH",
    body: data,
  });

const deletePlatform = (platform_id: string): Promise<Platform> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/${platform_id}`, {
    method: "DELETE",
  });

export default function usePlatform() {
  return {
    searchPlatform,
    getPlatform,
    createPlatform,
    updatePlatform,
    deletePlatform,
  };
}
