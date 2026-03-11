import { useState } from 'react';
import { useRouter } from 'next/router';

import { api } from '../../lib/api';

export default function AccessLogin() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('Checking approval access...');

    try {
      const res = await api('/api/auth/portal-login', {
        method: 'POST',
        body: { login, password },
      });

      sessionStorage.setItem('portalAccessToken', res.accessToken);
      sessionStorage.setItem('portal_login', login);
      sessionStorage.setItem('portal_password', password);
      sessionStorage.setItem('portal_user', JSON.stringify(res.user || {}));

      if (res.nextStep === 'ADMIN') {
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
          <h1>Portal access</h1>
          <p>Only approved users created by the admin can continue to the SVP login step.</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>Username / Email</label>
          <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Enter approved login" required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter assigned password" required />

          <button type="submit" className="auth-submit">Continue</button>
          <p className="auth-message">{msg}</p>
        </form>
      </div>
    </div>
  );
}
