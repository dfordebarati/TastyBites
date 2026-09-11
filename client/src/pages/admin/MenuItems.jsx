import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DeleteButton from '../../components/DeleteButton';
import PageHeader from '../../components/admin/PageHeader';
import Thumb from '../../components/admin/Thumb';
import { formatPrice } from '../../lib/format';
import { buttonPrimary, inputClass } from '../../lib/styles';

export default function MenuItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/menu-items/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;

    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/menu-items', { params: { search: search || undefined, category: category || undefined } })
        .then(({ data }) => {
          if (ignore) return;
          setItems(data.items);
          setError('');
        })
        .catch(() => {
          if (!ignore) setError('Could not load menu items.');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  const updateItem = (id, changes) =>
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, ...changes } : item)));

  const toggleAvailability = async (item) => {
    const next = !item.availability;
    updateItem(item._id, { availability: next });

    try {
      await api.put(`/menu-items/${item._id}`, { availability: next });
    } catch {
      updateItem(item._id, { availability: item.availability });
      setError(`Could not update the stock status of ${item.name}.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/menu-items/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this item.');
    }
  };

  return (
    <>
      <PageHeader
        title="Menu items"
        description="Everything on the menu. Click a status to switch it between in stock and out of stock."
        action={
          <Link to="/admin/menu-items/new" className={buttonPrimary}>
            Add item
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sm:w-72">
          <span className="sr-only">Search menu items</span>
          <input
            type="search"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="sm:w-52">
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <Loader />
      ) : (
        <div className="relative mt-6 overflow-x-auto rounded-md border border-line bg-paper-soft">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item._id} className="transition-colors hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Thumb item={item} />
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{item.name}</p>
                        <p className="max-w-xs truncate text-xs text-ink-faint">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{item.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailability(item)}
                      title="Click to change"
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                        item.availability
                          ? 'border-olive/30 text-olive hover:bg-olive/10'
                          : 'border-danger/30 text-danger hover:bg-danger/10'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.availability ? 'bg-olive' : 'bg-danger'}`} />
                      {item.availability ? 'In stock' : 'Out of stock'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`/admin/menu-items/${item._id}/edit`}
                      className="text-sm font-medium text-ink transition-colors hover:text-brand"
                    >
                      Edit
                    </Link>
                    <span className="ml-4">
                      <DeleteButton onConfirm={() => handleDelete(item._id)} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && items.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-ink-soft">No menu items match your search.</p>
          )}
        </div>
      )}
    </>
  );
}
