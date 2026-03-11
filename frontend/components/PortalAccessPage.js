import { useState } from 'react';
import { useRouter } from 'next/router';

import { api } from '../lib/api';

export default function PortalAccessPage({ mode = 'user' }) {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const isAdminMode = mode === 'admin';

  async function submit(e) {
    e.preventDefault();
    setMsg(isAdminMode ? 'Checking admin access...' : 'Checking user access...');

    try {
      const res = await api('/api/auth/portal-login', {
        method: 'POST',
        body: { login, password },
      });

      const user = res.user || {};

      if (isAdminMode && user.role !== 'ADMIN') {
        setMsg('This login is not an admin account.');
        return;
      }

      sessionStorage.setItem('portalAccessToken', res.accessToken);
      sessionStorage.setItem('portal_login', login);
      sessionStorage.setItem('portal_password', password);
      sessionStorage.setItem('portal_user', JSON.stringify(user));

      if (user.role === 'ADMIN') {
        setMsg('Admin access granted. Redirecting...');
        router.push('/admin/users');
        return;
      }

      setMsg('Approved. Continue to SVP login.');
      router.push('/auth/login');
    } catch (err) {
      setMsg(JSON.stringify(err.data || err.message));
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-heading">
          <h1>{isAdminMode ? 'Admin access' : 'User access'}</h1>
          <p>
            {isAdminMode
              ? 'Only approved admin accounts can enter the admin panel from this page.'
              : 'Only approved users created by the admin can continue to the SVP login step.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>Username / Email</label>
          <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Enter approved login" required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter assigned password" required />

          <button type="submit" className="auth-submit">{isAdminMode ? 'Admin login' : 'User login'}</button>
          <p className="auth-message">{msg}</p>
        </form>
      </div>
    </div>
  );
}
