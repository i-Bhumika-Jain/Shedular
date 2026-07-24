"use client";

import { useEffect } from "react";

export default function Snackbar({ message, type = "error", onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, 4500);
    return () => window.clearTimeout(timeoutId);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`snackbar snackbar-${type}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}
