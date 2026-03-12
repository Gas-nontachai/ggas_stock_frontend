export default defineNuxtPlugin(() => {
  const { accessToken } = useSession();
  const { start, stop } = useSessionEvents();

  watch(
    () => accessToken.value,
    (token) => {
      if (token) {
        start(token);
        return;
      }

      stop();
    },
    { immediate: true },
  );
});
