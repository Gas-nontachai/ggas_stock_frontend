import type { Platform } from "@/misc/type";

type PlatformPayload = Omit<Partial<Platform>, "platform_image"> & {
  image_urls?: string[];
};

const resource = createCrudResource<Platform, PlatformPayload, PlatformPayload>("platform");

const searchPlatform = (data?: unknown): Promise<Platform[]> => resource.search(data);
const getPlatform = (platform_id: string): Promise<Platform> => resource.get(platform_id);
const createPlatform = (data: PlatformPayload): Promise<Platform> => resource.create(data);
const updatePlatform = (platform_id: string, data: PlatformPayload): Promise<Platform> => resource.update(platform_id, data);
const deletePlatform = (platform_id: string): Promise<Platform> => resource.remove(platform_id);

export default function usePlatform() {
  return {
    searchPlatform,
    getPlatform,
    createPlatform,
    updatePlatform,
    deletePlatform,
  };
}
