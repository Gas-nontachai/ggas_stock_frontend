export type CrudResource<TModel, TCreate = Partial<TModel>, TUpdate = TCreate> = {
  search: (data?: unknown) => Promise<TModel[]>
  get: (id: string) => Promise<TModel>
  create: (data: TCreate) => Promise<TModel>
  update: (id: string, data: TUpdate) => Promise<TModel>
  remove: (id: string) => Promise<TModel>
}

export const createCrudResource = <TModel, TCreate = Partial<TModel>, TUpdate = TCreate>(
  resource: string,
): CrudResource<TModel, TCreate, TUpdate> => {
  const endpoint = (suffix = '') => `${useRuntimeConfig().public.apiBaseUrl}/${resource}${suffix}`

  return {
    search: (data?: unknown) =>
      secureFetch(endpoint('/search'), {
        method: 'POST',
        body: data,
      }),
    get: (id: string) =>
      secureFetch(endpoint(`/${id}`), {
        method: 'GET',
      }),
    create: (data: TCreate) =>
      secureFetch(endpoint(), {
        method: 'POST',
        body: data,
      }),
    update: (id: string, data: TUpdate) =>
      secureFetch(endpoint(`/${id}`), {
        method: 'PATCH',
        body: data,
      }),
    remove: (id: string) =>
      secureFetch(endpoint(`/${id}`), {
        method: 'DELETE',
      }),
  }
}
