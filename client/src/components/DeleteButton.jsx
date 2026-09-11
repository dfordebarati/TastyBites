import { useState } from 'react';

export default function DeleteButton({
  onConfirm,
  label = 'Delete',
  confirmLabel = 'Yes, delete',
  busyLabel = 'Deleting...',
  triggerClassName = 'text-sm text-ink-faint transition-colors hover:text-danger',
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className={triggerClassName}>
        {label}
      </button>
    );
  }

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-3 text-sm">
      <span className="text-ink-soft">Sure?</span>
      <button onClick={handleConfirm} disabled={busy} className="font-medium text-danger hover:underline">
        {busy ? busyLabel : confirmLabel}
      </button>
      <button onClick={() => setConfirming(false)} disabled={busy} className="text-ink-faint hover:text-ink">
        Keep it
      </button>
    </span>
  );
}
