export type QueryWhere = Record<string, unknown>
export type QuerySorter = {
  field: string
  order: 'ASC' | 'DESC'
}

export type QueryInclude = Array<Record<string, unknown>>

export const buildSearchQuery = (params?: {
  where?: QueryWhere
  sorter?: QuerySorter
  include?: QueryInclude
}) => {
  const query: Record<string, unknown> = {}

  if (params?.where) {
    query.where = params.where
  }

  if (params?.sorter) {
    query.sorter = params.sorter
  }

  if (params?.include) {
    query.include = params.include
  }

  return query
}
