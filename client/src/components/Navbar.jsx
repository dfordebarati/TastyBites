import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import { buttonPrimary, buttonSecondary } from '../lib/styles';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const links = [
    { to: '/#menu', label: 'Menu' },
    ...(user ? [{ to: '/orders', label: 'My orders' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ];

  const linkClass = 'text-ink-soft transition-colors hover:text-ink';

  const cartLink = (
    <Link to="/cart" aria-label={`Cart, ${count} items`} className={`${linkClass} inline-flex items-center gap-1.5`}>
      Cart
      <span
        className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.7rem] font-medium tabular-nums ${
          count ? 'bg-brand text-paper' : 'bg-line text-ink-soft'
        }`}
      >
        {count}
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" aria-label="TastyBites home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-7 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </Link>
          ))}
          {cartLink}
          {user ? (
            <button onClick={handleLogout} className={linkClass}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-brand"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm md:hidden">
          {cartLink}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-ink/5"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="bg-paper md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-5 pb-5 pt-2">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="py-3 text-base text-ink">
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <p className="pt-4 text-sm text-ink-faint">Signed in as {user.name}</p>
                <button onClick={handleLogout} className={`${buttonSecondary} mt-3`}>
                  Log out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-5">
                <Link to="/login" className={buttonSecondary}>
                  Log in
                </Link>
                <Link to="/register" className={buttonPrimary}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
