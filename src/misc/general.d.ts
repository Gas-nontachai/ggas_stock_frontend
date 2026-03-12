export type FetchOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  headers?: { [key: string]: string },
  body?: any,
}
