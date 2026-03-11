import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { api } from '../../lib/api';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    login: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'USER',
    isApproved: true,
  });

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('portalAccessToken') : '';

  async function loadUsers(currentToken) {
    try {
      const res = await api('/api/admin/users', { token: currentToken });
      setUsers(res.users || []);
    } catch (err) {
      setMsg(JSON.stringify(err.data || err.message));
    }
  }

  useEffect(() => {
    const portalToken = typeof window !== 'undefined' ? sessionStorage.getItem('portalAccessToken') : '';
    const portalUser = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('portal_user') || '{}') : {};

    if (!portalToken || portalUser.role !== 'ADMIN') {
      router.replace('/auth/access');
      return;
    }

    loadUsers(portalToken);
  }, [router]);

  async function createUser(e) {
    e.preventDefault();
    setMsg('Creating user...');

    try {
      await api('/api/admin/users', {
        method: 'POST',
        token,
        body: form,
      });
      setForm({
        login: '',
        password: '',
        email: '',
        fullName: '',
        phone: '',
        role: 'USER',
        isApproved: true,
      });
      setMsg('User created successfully.');
      loadUsers(token);
    } catch (err) {
      setMsg(JSON.stringify(err.data || err.message));
    }
  }

  async function toggleApproval(user) {
    setMsg('Updating user...');
    try {
      await api(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        token,
        body: { isApproved: !user.isApproved },
      });
      setMsg('User updated successfully.');
      loadUsers(token);
    } catch (err) {
      setMsg(JSON.stringify(err.data || err.message));
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-card">
        <div className="admin-head">
          <div>
            <h1>Admin users</h1>
            <p>Create users, set password, and approve who can access the portal.</p>
          </div>
          <button type="button" className="ghost-btn" onClick={() => router.push('/dashboard')}>
            Dashboard
          </button>
        </div>

        <form className="admin-form" onSubmit={createUser}>
          <input value={form.fullName} onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))} placeholder="Full name" required />
          <input value={form.login} onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))} placeholder="Login / email" required />
          <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" />
          <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone" />
          <input type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="Password" required />
          <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <label className="checkbox">
            <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm((s) => ({ ...s, isApproved: e.target.checked }))} />
            <span>Approved</span>
          </label>
          <button type="submit" className="primary-btn">Create user</button>
        </form>

        {msg ? <div className="message">{msg}</div> : null}

        <div className="user-list">
          {users.map((user) => (
            <div className="user-card" key={user.id}>
              <div>
                <strong>{user.fullName || user.login}</strong>
                <p>{user.login}</p>
                <p>{user.phone || '-'}</p>
              </div>
              <div>
                <p>{user.role}</p>
                <p>{user.isApproved ? 'Approved' : 'Pending'}</p>
              </div>
              <button type="button" className="ghost-btn" onClick={() => toggleApproval(user)}>
                {user.isApproved ? 'Block' : 'Approve'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .admin-shell { min-height: 100vh; padding: 24px; background: #f3f5f7; }
        .admin-card { width: min(1100px, 100%); margin: 0 auto; background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 20px 45px rgba(10,31,68,.08); }
        .admin-head { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
        .admin-head h1 { margin: 0 0 6px; }
        .admin-head p { margin: 0; color: #64748b; }
        .admin-form { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
        .admin-form input, .admin-form select { min-height: 44px; border: 1px solid #d4dce5; border-radius: 10px; padding: 0 12px; }
        .checkbox { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; }
        .primary-btn, .ghost-btn { min-height: 44px; padding: 0 16px; border-radius: 10px; border: 0; cursor: pointer; font-weight: 700; }
        .primary-btn { background: #127d87; color: #fff; }
        .ghost-btn { background: #eef2f6; color: #24324d; }
        .message { padding: 12px 14px; border-radius: 12px; background: #f6f7f9; margin-bottom: 16px; }
        .user-list { display: grid; gap: 12px; }
        .user-card { display: grid; grid-template-columns: 1.4fr .7fr auto; gap: 12px; align-items: center; padding: 16px; border: 1px solid #dde4ec; border-radius: 14px; }
        .user-card p { margin: 4px 0 0; color: #64748b; }
        @media (max-width: 900px) {
          .admin-form, .user-card, .admin-head { grid-template-columns: 1fr; display: grid; }
        }
      `}</style>
    </div>
  );
}
