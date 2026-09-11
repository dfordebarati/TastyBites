import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Field from '../../components/Field';
import PageHeader from '../../components/admin/PageHeader';
import { optimize } from '../../lib/image';
import { buttonPrimary, buttonSecondary, inputClass } from '../../lib/styles';

const emptyForm = { name: '', description: '', category: '', price: '', availability: true };

export default function MenuItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/menu-items/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;

    api
      .get(`/menu-items/${id}`)
      .then(({ data }) => {
        if (ignore) return;
        const { name, description, category, price, availability, image } = data.item;
        setForm({ name, description, category, price, availability });
        setExistingImage(image);
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        setError('Could not load this menu item.');
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, isEdit]);

  useEffect(() => {
    if (!imageFile) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description);
    payload.append('category', form.category);
    payload.append('price', form.price);
    payload.append('availability', form.availability);
    if (imageFile) payload.append('image', imageFile);

    try {
      if (isEdit) {
        await api.put(`/menu-items/${id}`, payload);
      } else {
        await api.post('/menu-items', payload);
      }
      navigate('/admin/menu-items');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const shownImage = preview || (existingImage && optimize(existingImage, 'c_fill,w_800,h_600'));

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit menu item' : 'New menu item'}
        description={
          isEdit
            ? 'Update the details, price, photo or stock status.'
            : 'Add a dish to the menu. It appears on the website as soon as you save it.'
        }
        back={{ to: '/admin/menu-items', label: 'Menu items' }}
      />

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Field label="Item name" htmlFor="name">
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={100}
              className={inputClass}
            />
          </Field>

          <Field label="Description" htmlFor="description" hint={`${form.description.length}/1000`}>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              maxLength={1000}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-ink">Category</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((c) => (
                <label
                  key={c}
                  className={`cursor-pointer rounded-md border px-3 py-2.5 text-center text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ink/30 ${
                    form.category === c
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line bg-paper-soft text-ink-soft hover:border-ink/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={form.category === c}
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Price" htmlFor="price">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
                ₹
              </span>
              <input
                id="price"
                name="price"
                type="number"
                step="1"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                className={`${inputClass} pl-7`}
              />
            </div>
          </Field>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">Photo</p>
            <label
              htmlFor="image"
              className="group relative flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-ink/25 bg-paper-soft transition-colors hover:border-ink/50"
            >
              {shownImage ? (
                <>
                  <img src={shownImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute bottom-3 right-3 rounded bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100">
                    Change photo
                  </span>
                </>
              ) : (
                <span className="px-6 text-center text-sm text-ink-soft">
                  Click to choose a photo
                  <span className="mt-1 block text-xs text-ink-faint">JPG, PNG, WEBP or AVIF, up to 3 MB</span>
                </span>
              )}
            </label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="sr-only"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-line bg-paper-soft px-4 py-3">
            <span>
              <span className="block text-sm font-medium text-ink">In stock</span>
              <span className="text-xs text-ink-faint">Switch off to mark it sold out.</span>
            </span>
            <input
              type="checkbox"
              name="availability"
              checked={form.availability}
              onChange={handleChange}
              className="peer sr-only"
            />
            <span className="relative h-6 w-11 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-olive peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30" />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6 lg:col-span-5">
          {error && (
            <p role="alert" className="mr-auto text-sm text-danger">
              {error}
            </p>
          )}
          <Link to="/admin/menu-items" className={buttonSecondary}>
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className={buttonPrimary}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add item'}
          </button>
        </div>
      </form>
    </>
  );
}
