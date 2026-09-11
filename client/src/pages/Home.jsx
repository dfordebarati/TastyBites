import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import MenuCard from '../components/MenuCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_LABELS, formatPrice } from '../lib/format';
import { optimize } from '../lib/image';
import { buttonPrimary } from '../lib/styles';

const CATEGORIES = Object.keys(CATEGORY_LABELS);
const HERO_COURSES = ['Main Course', 'Starter', 'Dessert'];

function PhotoTile({ item, className, transform }) {
  return (
    <Link to={`/menu/${item._id}`} className={`group relative overflow-hidden rounded-md bg-line ${className}`}>
      <img
        src={optimize(item.image, transform)}
        alt={item.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/75 to-transparent p-3 pt-10 sm:p-4 sm:pt-12">
        <p className="font-display text-base leading-tight text-paper sm:text-lg">{item.name}</p>
        <p className="mt-0.5 text-sm tabular-nums text-paper/75">{formatPrice(item.price)}</p>
      </div>
    </Link>
  );
}

function Stat({ label, value }) {
  return (
    <div className="pr-4">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-1 font-display text-3xl tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    api
      .get('/menu-items')
      .then(({ data }) => setItems(data.items))
      .catch(() => setError('The menu could not be loaded right now. Please try again in a moment.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.hash === '#menu' && !loading) {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash, location.key, loading]);

  const term = search.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      (category === 'All' || item.category === category) &&
      (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term))
  );
  const sections = CATEGORIES.map((c) => ({ category: c, items: visible.filter((item) => item.category === c) })).filter(
    (section) => section.items.length > 0
  );

  const featured = HERO_COURSES.map((c) => items.find((item) => item.category === c && item.availability && item.image)).filter(
    Boolean
  );
  const [mainPhoto, ...sidePhotos] = featured;
  const inStock = items.filter((item) => item.availability).length;
  const countFor = (c) => (c === 'All' ? items.length : items.filter((item) => item.category === c).length);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
  };

  return (
    <>
      <section>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 sm:px-8 lg:min-h-[calc(100svh-4rem-1px)] lg:grid-cols-12 lg:gap-12 lg:py-12">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                Delivering daily from noon, free over ₹499
              </p>

              <h1 className="mt-6 font-display text-[3.25rem] leading-[0.95] tracking-[-0.02em] text-ink sm:text-7xl">
                Food worth <em className="text-brand">sitting down</em> for.
              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
                A short, seasonal menu of starters, mains, desserts and drinks, cooked from scratch every day and
                delivered hot to your door.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-6">
                <a href="#menu" className={`${buttonPrimary} px-6`}>
                  Order now
                </a>
                {!user && (
                  <Link
                    to="/register"
                    className="text-sm font-medium text-ink underline decoration-ink/25 underline-offset-[6px] transition-colors hover:decoration-brand"
                  >
                    Create an account
                  </Link>
                )}
              </div>
            </div>

            <dl className="mt-14 grid grid-cols-3">
              <Stat label="On the menu" value={loading ? '-' : items.length} />
              <Stat label="Available now" value={loading ? '-' : inStock} />
              <Stat label="Courses" value={CATEGORIES.length} />
            </dl>
          </div>

          <div className="lg:col-span-7">
            {mainPhoto ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:h-full lg:min-h-140 lg:grid-cols-5 lg:grid-rows-2">
                <PhotoTile
                  item={mainPhoto}
                  className={`col-span-2 aspect-4/3 lg:aspect-auto ${
                    sidePhotos.length ? 'lg:col-span-3 lg:row-span-2' : 'lg:col-span-5 lg:row-span-2'
                  }`}
                  transform="c_fill,w_900,h_1100"
                />
                {sidePhotos.map((item) => (
                  <PhotoTile
                    key={item._id}
                    item={item}
                    className="aspect-square lg:col-span-2 lg:aspect-auto"
                    transform="c_fill,w_600,h_600"
                  />
                ))}
              </div>
            ) : (
              <div className="aspect-4/3 rounded-md bg-line/60 lg:aspect-auto lg:h-full lg:min-h-140" />
            )}
          </div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl scroll-mt-20 px-5 pt-16 sm:px-8 lg:pt-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">Today's menu</p>
            <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">What we're cooking</h2>
          </div>

          <label className="relative block w-full md:w-72">
            <span className="sr-only">Search the menu</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes"
              className="w-full rounded-full bg-paper-soft py-2.5 pl-10 pr-4 text-sm text-ink outline-none ring-1 ring-line transition-shadow placeholder:text-ink-faint focus:ring-ink/40"
            />
          </label>
        </div>

        <div className="no-scrollbar -mx-5 mt-8 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <div className="flex gap-2 whitespace-nowrap">
            {['All', ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  category === c ? 'bg-ink text-paper' : 'bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink'
                }`}
              >
                {c === 'All' ? 'Everything' : CATEGORY_LABELS[c]}
                <span className={`ml-1.5 text-xs tabular-nums ${category === c ? 'text-paper/60' : 'text-ink-faint'}`}>
                  {countFor(c)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading && <Loader label="Loading the menu" />}
        {error && <p className="py-16 text-center text-ink-soft">{error}</p>}

        {!loading && !error && sections.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-ink">
              {term ? `Nothing on the menu matches "${search.trim()}"` : 'Nothing in this section yet'}
            </p>
            <button onClick={clearFilters} className="mt-3 text-sm text-brand underline underline-offset-4">
              Show everything
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          sections.map((section) => (
            <div key={section.category} className="pt-12">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl text-ink">{CATEGORY_LABELS[section.category]}</h3>
                <span className="text-xs text-ink-faint">
                  {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => (
                  <MenuCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          ))}
      </section>
    </>
  );
}
