import { Link } from 'react-router-dom';
import Logo from './Logo';
import { buttonPrimary } from '../lib/styles';

const hours = [
  ['Mon to Thu', '12 pm - 10 pm'],
  ['Fri & Sat', '12 pm - 11 pm'],
  ['Sunday', '11 am - 9 pm'],
];

const explore = [
  ['/#menu', "Today's menu"],
  ['/cart', 'Your cart'],
  ['/orders', 'Your orders'],
  ['/register', 'Create an account'],
];

const headingClass = 'text-xs font-medium uppercase tracking-[0.14em] text-ink-faint';

export default function Footer() {
  return (
    <footer className="mt-24 bg-paper-soft">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 pb-12 pt-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
              Hungry <em className="text-brand">already?</em>
            </p>
            <p className="mt-3 max-w-md text-ink-soft">
              Order before 10 pm and we will have it at your door, still hot, in about 40 minutes.
            </p>
          </div>
          <Link to="/#menu" className={`${buttonPrimary} self-start px-7 md:self-auto`}>
            Order now
          </Link>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <Logo size="lg" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
              A small kitchen with a short menu. We cook what is in season, deliver it hot, and change the board when
              something runs out.
            </p>
            <address className="mt-6 space-y-1.5 text-sm not-italic text-ink-soft">
              <p>14 Park Street, Kolkata 700016</p>
              <p>
                <a href="tel:+919830012345" className="transition-colors hover:text-ink">
                  +91 98300 12345
                </a>
              </p>
              <p>
                <a href="mailto:hello@tastybites.in" className="transition-colors hover:text-ink">
                  hello@tastybites.in
                </a>
              </p>
            </address>
          </div>

          <div className="lg:col-span-4">
            <p className={headingClass}>Delivery hours</p>
            <dl className="mt-5 space-y-2.5 text-sm">
              {hours.map(([days, time]) => (
                <div key={days} className="flex max-w-64 justify-between gap-6">
                  <dt className="text-ink-soft">{days}</dt>
                  <dd className="tabular-nums text-ink">{time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-ink-soft">Free delivery on orders over ₹499.</p>
          </div>

          <div className="lg:col-span-3">
            <p className={headingClass}>Explore</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {explore.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-ink-soft transition-colors hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-10 pt-4 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} TastyBites. All prices in INR, GST extra.</p>
          <Link to="/admin/login" className="transition-colors hover:text-ink">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
