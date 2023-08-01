import { useState } from 'react';

export function useSnackbar() {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  return {
    snackbarOpen,
    snackbarMessage,
    setSnackbarOpen,
    setSnackbarMessage
  };
}
