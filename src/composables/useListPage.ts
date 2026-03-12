export default function useListPage<TFilters extends Record<string, any>>(initialFilters: TFilters) {
  const loading = ref(false);
  const searchQuery = ref('');
  const dialogs = reactive<Record<string, boolean>>({});
  const filters = ref<TFilters>(structuredClone(initialFilters));

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const openDialog = (name: string) => {
    dialogs[name] = true;
  };

  const closeDialog = (name: string) => {
    dialogs[name] = false;
  };

  const clearSearch = () => {
    searchQuery.value = '';
  };

  const resetFilters = () => {
    filters.value = structuredClone(initialFilters);
  };

  return {
    loading,
    searchQuery,
    dialogs,
    filters,
    setLoading,
    openDialog,
    closeDialog,
    clearSearch,
    resetFilters,
  };
}
