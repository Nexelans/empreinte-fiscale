/**
 * Simple toast hook using React state
 * Replacement for deprecated shadcn toast component
 */

import { useState, useCallback } from 'react';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 1000;

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

// Global toast state
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({
      title,
      description,
      type = 'default',
      duration = 5000,
      ...props
    }: Omit<Toast, 'id'>) => {
      const id = generateId();

      const newToast: Toast = {
        id,
        title,
        description,
        type,
        duration,
        ...props,
      };

      setToasts((prevToasts) => {
        // Limit number of toasts
        const updatedToasts = [...prevToasts, newToast];
        if (updatedToasts.length > TOAST_LIMIT) {
          updatedToasts.shift();
        }
        return updatedToasts;
      });

      // Auto-dismiss after duration
      if (duration > 0) {
        const timeout = setTimeout(() => {
          dismiss(id);
        }, duration);
        toastTimeouts.set(id, timeout);
      }

      return {
        id,
        dismiss: () => dismiss(id),
        update: (props: Partial<Toast>) => update(id, props),
      };
    },
    []
  );

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      // Clear timeout
      const timeout = toastTimeouts.get(toastId);
      if (timeout) {
        clearTimeout(timeout);
        toastTimeouts.delete(toastId);
      }

      setToasts((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== toastId)
      );
    } else {
      // Dismiss all
      toastTimeouts.forEach((timeout) => clearTimeout(timeout));
      toastTimeouts.clear();
      setToasts([]);
    }
  }, []);

  const update = useCallback((toastId: string, props: Partial<Toast>) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === toastId ? { ...toast, ...props } : toast
      )
    );
  }, []);

  return {
    toast,
    toasts,
    dismiss,
  };
}

// Export a global toast function for use outside of React components
let globalToastFn: ((props: Omit<Toast, 'id'>) => void) | null = null;

export function setGlobalToast(fn: (props: Omit<Toast, 'id'>) => void) {
  globalToastFn = fn;
}

export function toast(props: Omit<Toast, 'id'>) {
  if (globalToastFn) {
    globalToastFn(props);
  } else {
    console.warn('Toast function called before initialization');
  }
}
