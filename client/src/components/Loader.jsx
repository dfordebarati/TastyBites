export default function Loader({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-20 text-sm text-ink-faint">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
      {label}...
    </div>
  );
}
