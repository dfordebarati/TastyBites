import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Field from '../components/Field';
import { safeRedirect } from '../lib/redirect';
import { buttonPrimary, inputClass } from '../lib/styles';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      navigate(redirect ?? '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loginLink = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';

  return (
    <AuthLayout
      title="Create an account"
      subtitle="It only takes a minute, and you need one to order. Browsing the menu is open to everyone."
      footer={
        <>
          Already have an account?{' '}
          <Link to={loginLink} className="font-medium text-ink underline underline-offset-4 hover:text-brand">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full name" htmlFor="name">
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={2}
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Password" htmlFor="password" hint="At least 6 characters">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className={inputClass}
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className={inputClass}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`${buttonPrimary} w-full`}>
          {submitting ? 'Creating your account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
