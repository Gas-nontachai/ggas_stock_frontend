type PresignSingleRequest = {
  filename: string;
  mime_type: string;
  size_bytes: number;
};

type PresignBatchRequest = {
  files: PresignSingleRequest[];
};

type PresignedFile = {
  file_id: string;
  bucket: string;
  object_key: string;
  put_url: string;
  expires_in: number;
  required_headers?: Record<string, string>;
};

type ConfirmResponse = {
  file_id: string;
  object_key: string;
  public_url: string;
  status: "CONFIRMED";
};

const prefix = "storage";

const presign = (data: PresignSingleRequest | PresignBatchRequest): Promise<{ files?: PresignedFile[] } & PresignedFile> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/presign`, {
    method: "POST",
    body: data,
  });

const confirmFile = (file_id: string): Promise<ConfirmResponse> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/confirm`, {
    method: "POST",
    body: { file_id },
  });

const deleteFile = (file_id: string): Promise<{ file_id: string; status: "DELETED" }> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/delete`, {
    method: "POST",
    body: { file_id },
  });

const uploadToPresignedUrl = async (putUrl: string, file: File, headers?: Record<string, string>) => {
  await $fetch.raw(putUrl, {
    method: "PUT",
    body: file,
    headers: {
      ...(headers || {}),
    },
  });
};

const uploadFilesAndGetPublicUrls = async (files: File[]): Promise<string[]> => {
  if (!files.length) {
    return [];
  }

  const presigned = await presign({
    files: files.map((file) => ({
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })),
  });

  const signedFiles = presigned.files ?? [];

  if (signedFiles.length !== files.length) {
    throw new Error("Invalid presign response");
  }

  const publicUrls: string[] = [];

  for (let i = 0; i < signedFiles.length; i += 1) {
    const signed = signedFiles[i];
    const file = files[i];

    await uploadToPresignedUrl(signed.put_url, file, signed.required_headers);
    const confirmed = await confirmFile(signed.file_id);
    publicUrls.push(confirmed.public_url);
  }

  return publicUrls;
};

export default function useStorage() {
  return {
    presign,
    confirmFile,
    deleteFile,
    uploadFilesAndGetPublicUrls,
  };
}
