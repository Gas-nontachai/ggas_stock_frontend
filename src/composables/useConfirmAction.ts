import Swal from 'sweetalert2';

export type ConfirmActionOptions = {
  confirmTitle?: string;
  confirmText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  loadingTitle?: string;
  loadingText?: string;
  successTitle?: string;
  successText?: string;
  errorTitle?: string;
  errorText?: string;
  showErrorToast?: boolean;
  toast?: boolean;
};

const defaults: Required<ConfirmActionOptions> = {
  confirmTitle: 'Are you sure?',
  confirmText: 'This action cannot be undone.',
  confirmButtonText: 'Yes, continue',
  cancelButtonText: 'Cancel',
  loadingTitle: 'Submitting...',
  loadingText: 'Please wait while we submit the form.',
  successTitle: 'Success',
  successText: 'Action completed successfully!',
  errorTitle: 'Error',
  errorText: 'Something went wrong, please try again.',
  showErrorToast: false,
  toast: true,
};

export default function useConfirmAction() {
  const confirmAndRun = async (
    action: () => Promise<void>,
    options?: ConfirmActionOptions,
  ): Promise<boolean> => {
    const opts = { ...defaults, ...options };

    const result = await Swal.fire({
      title: opts.confirmTitle,
      text: opts.confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: opts.confirmButtonText,
      cancelButtonText: opts.cancelButtonText,
      customClass: {
        confirmButton: 'swal2-confirm-white',
        cancelButton: 'swal2-cancel-white',
      },
    });

    if (!result.isConfirmed) {
      return false;
    }

    Swal.fire({
      title: opts.loadingTitle,
      text: opts.loadingText,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showConfirmButton: false,
    });

    try {
      await action();
      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: opts.successTitle,
        text: opts.successText,
        toast: opts.toast,
        position: opts.toast ? 'top-end' : 'center',
        showConfirmButton: !opts.toast,
        timer: opts.toast ? 3000 : undefined,
      });
      return true;
    } catch {
      Swal.close();
      if (opts.showErrorToast) {
        await Swal.fire({
          icon: 'error',
          title: opts.errorTitle,
          text: opts.errorText,
          toast: opts.toast,
          position: opts.toast ? 'top-end' : 'center',
          showConfirmButton: true,
        });
      }
      return false;
    }
  };

  return { confirmAndRun };
}
