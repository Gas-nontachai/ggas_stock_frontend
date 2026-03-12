type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  show: boolean;
  text: string;
  type: SnackbarType;
  timeout: number;
}

export const useAppSnackbar = () => {
  const state = useState<SnackbarState>('app-snackbar', () => ({
    show: false,
    text: '',
    type: 'info',
    timeout: 3000,
  }));

  const open = (text: string, type: SnackbarType = 'info', timeout = 3000) => {
    state.value.show = false;
    state.value.text = text;
    state.value.type = type;
    state.value.timeout = timeout;
    requestAnimationFrame(() => {
      state.value.show = true;
    });
  };

  return {
    state,
    open,
    success: (text: string, timeout?: number) => open(text, 'success', timeout),
    error: (text: string, timeout?: number) => open(text, 'error', timeout),
    warning: (text: string, timeout?: number) => open(text, 'warning', timeout),
    info: (text: string, timeout?: number) => open(text, 'info', timeout),
  };
};
