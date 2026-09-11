import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DeleteButton from '../../components/DeleteButton';
import PageHeader from '../../components/admin/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/format';

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    api
      .get('/users')
      .then(({ data }) => setUsers(data.users))
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this user.');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader
        title="Users"
        description={`${users.length} registered ${users.length === 1 ? 'account' : 'accounts'}. New sign-ups always get the user role.`}
      />

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="relative overflow-x-auto rounded-md border border-line bg-paper-soft">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => {
              const isSelf = user._id === currentUser?._id;

              return (
                <tr key={user._id} className="transition-colors hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                        {initials(user.name)}
                      </span>
                      <span className="font-medium text-ink">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        user.role === 'admin' ? 'bg-ink text-paper' : 'bg-line/70 text-ink-soft'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-soft">{formatDate(user.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {isSelf ? (
                      <span className="text-xs text-ink-faint">You</span>
                    ) : (
                      <DeleteButton onConfirm={() => handleDelete(user._id)} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
