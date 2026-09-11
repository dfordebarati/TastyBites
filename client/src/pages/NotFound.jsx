import { Link } from 'react-router-dom';
import { buttonPrimary } from '../lib/styles';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <p className="font-display text-7xl italic text-brand">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">This page isn't on the menu</h1>
      <p className="mt-3 text-ink-soft">The link might be old, or the page has moved.</p>
      <Link to="/" className={`${buttonPrimary} mt-8 px-6`}>
        Back to the home page
      </Link>
    </div>
  );
}
