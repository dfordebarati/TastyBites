import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Field from '../components/Field';
import { safeRedirect } from '../lib/redirect';
import { buttonPrimary, inputClass } from '../lib/styles';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(form.email, form.password);
      navigate(redirect ?? (user.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log you in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const registerLink = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        redirect === '/checkout'
          ? 'Log in to place your order. Your cart is saved.'
          : 'Log in to your account to order and track your food.'
      }
      footer={
        <>
          New to TastyBites?{' '}
          <Link to={registerLink} className="font-medium text-ink underline underline-offset-4 hover:text-brand">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
