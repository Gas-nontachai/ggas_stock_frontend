export type AsyncSubmitOptions = {
  onInvalid?: () => void;
  onSuccess?: () => void | Promise<void>;
  onError?: () => void | Promise<void>;
};

export default function useAsyncSubmit() {
  const runSubmit = async (
    validate: () => Promise<boolean>,
    action: () => Promise<void>,
    options?: AsyncSubmitOptions,
  ): Promise<boolean> => {
    const valid = await validate();
    if (!valid) {
      await options?.onInvalid?.();
      return false;
    }

    try {
      await action();
      await options?.onSuccess?.();
      return true;
    } catch {
      await options?.onError?.();
      return false;
    }
  };

  return { runSubmit };
}
