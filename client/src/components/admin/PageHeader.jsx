import { Link } from 'react-router-dom';

export default function PageHeader({ title, description, action, back }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link to={back.to} className="text-sm text-ink-faint transition-colors hover:text-ink">
            &larr; {back.label}
          </Link>
        )}
        <h1 className={`font-display text-4xl tracking-tight text-ink ${back ? 'mt-2' : ''}`}>{title}</h1>
        {description && <p className="mt-2 text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
