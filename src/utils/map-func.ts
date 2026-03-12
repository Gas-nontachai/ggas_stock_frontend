export const findLabelById = <T extends Record<string, any>>(
  collection: T[],
  idField: keyof T,
  labelField: keyof T,
  id: string,
  fallback = '-',
): string => {
  const found = collection.find((item) => String(item[idField]) === String(id));
  return found ? String(found[labelField] ?? fallback) : fallback;
};
