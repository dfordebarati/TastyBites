import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Field from '../components/Field';
import { buttonPrimary, inputClass } from '../lib/styles';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && isAdmin) return <Navigate to="/admin" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        logout();
        setError('This login is for restaurant staff only.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log you in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Staff only"
      title="Admin login"
      subtitle="Manage the menu, stock and registered users."
      footer={
        <Link to="/" className="transition-colors hover:text-ink">
          &larr; Back to the website
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Admin email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`${buttonPrimary} w-full`}>
          {submitting ? 'Logging in...' : 'Log in to dashboard'}
        </button>
      </form>
    </AuthLayout>
  );
}
