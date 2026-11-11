'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface AuthDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Open the auth dialog, optionally with a custom message (e.g. "Please sign in to submit a review") */
  openAuthDialog: (message?: string) => void;
  /** Custom message to display in the dialog when opened via openAuthDialog */
  message: string | null;
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openAuthDialog = useCallback((customMessage?: string) => {
    setMessage(customMessage ?? null);
    setOpen(true);
  }, []);

  const handleSetOpen = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setMessage(null);
    }
  }, []);

  const value: AuthDialogContextValue = {
    open,
    setOpen: handleSetOpen,
    openAuthDialog,
    message,
  };

  return (
    <AuthDialogContext.Provider value={value}>{children}</AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext);
  return ctx;
}
