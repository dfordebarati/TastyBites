import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/menu-items', label: 'Menu items' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="bg-ink text-paper lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
          <div>
            <Link to="/" aria-label="View the site">
              <Logo size="sm" />
            </Link>
            <p className="hidden text-xs text-paper/50 lg:mt-1 lg:block">Kitchen admin</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-paper/70 hover:text-paper lg:hidden">
            Log out
          </button>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 text-sm lg:mt-2 lg:flex-col lg:pb-0">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-2 transition-colors ${
                  isActive ? 'bg-paper/10 text-paper' : 'text-paper/60 hover:bg-paper/5 hover:text-paper'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-paper/10 px-6 py-5 lg:block">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-paper/50">{user?.email}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <Link to="/" className="text-paper/60 transition-colors hover:text-paper">
              View site
            </Link>
            <button onClick={handleLogout} className="text-paper/60 transition-colors hover:text-paper">
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
