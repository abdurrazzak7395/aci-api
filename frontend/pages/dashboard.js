import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { api } from '../lib/api';

function getProfile(data) {
  return data?.user || data?.data?.user || data?.data || data || null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMe() {
      setLoading(true);
      setError('');

      try {
        const data = await api('/api/me');
        if (!active) return;
        setMe(getProfile(data));
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Request failed');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMe();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setError('');

    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      setError(err?.message || 'Logout failed');
    } finally {
      setLoggingOut(false);
      router.push('/auth/login');
    }
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <div className="toolbar">
          <div className="badge">Dashboard</div>
          <div className="toolbar-actions">
            <Link className="nav-btn nav-btn--dark" href="/exam/reservations">
              My bookings
            </Link>
            <button className="nav-btn nav-btn--accent" type="button" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        <div className="hero">
          <div>
            <h1>Welcome back</h1>
            <p className="subtitle">
              {loading
                ? 'Loading your account...'
                : me?.name || me?.email || me?.login || 'Manage your bookings and reservations'}
            </p>
          </div>
          <div className="hero-chip">
            <span className="hero-chip__label">Portal</span>
            <strong>Booking Center</strong>
          </div>
        </div>

        {error ? <div className="status-card status-card--error">{error}</div> : null}

        <div className="action-grid">
          <Link className="action-card action-card--primary" href="/exam/booking">
            <span className="action-icon">+</span>
            <span className="action-title">Create new booking</span>
            <span className="action-desc">Open the booking page directly and search new test sessions.</span>
          </Link>

          <Link className="action-card action-card--secondary" href="/exam/reservations">
            <span className="action-icon">#</span>
            <span className="action-title">My exam reservations</span>
            <span className="action-desc">See booked exams and start reschedule from one page.</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .dashboard-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(circle at top left, rgba(127, 193, 197, 0.35), transparent 32%),
            linear-gradient(135deg, #edf2f6 0%, #e4ecf3 45%, #f7f0e9 100%);
        }
        .dashboard-card {
          width: min(920px, 100%);
          padding: 32px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 26px 70px rgba(33, 53, 85, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          background: #e1f0ef;
          color: #39656b;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .toolbar-actions {
          display: flex;
          gap: 12px;
        }
        .nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border: 0;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
        }
        .nav-btn--dark {
          background: #0f1b3d;
          color: #fff;
        }
        .nav-btn--accent {
          background: linear-gradient(135deg, #ff8f70 0%, #f56d91 100%);
          color: #fff;
          box-shadow: 0 12px 24px rgba(245, 109, 145, 0.28);
        }
        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }
        h1 {
          margin: 0 0 12px;
          font-size: 54px;
          line-height: 1;
          color: #0f1b3d;
        }
        .subtitle {
          margin: 0;
          max-width: 520px;
          font-size: 20px;
          line-height: 1.5;
          color: #586279;
        }
        .hero-chip {
          min-width: 200px;
          padding: 18px 20px;
          border-radius: 22px;
          background: linear-gradient(145deg, #10305d 0%, #1d5f71 100%);
          color: #fff;
          box-shadow: 0 18px 34px rgba(25, 71, 104, 0.22);
        }
        .hero-chip__label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }
        .status-card {
          margin-bottom: 20px;
          padding: 16px 18px;
          border-radius: 16px;
          font-weight: 600;
        }
        .status-card--error {
          background: linear-gradient(135deg, #fff0ef 0%, #ffe6e5 100%);
          color: #b34034;
          border: 1px solid #ffd2cf;
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }
        .action-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 190px;
          padding: 24px;
          border-radius: 24px;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .action-card:hover {
          transform: translateY(-4px);
        }
        .action-card--primary {
          background: linear-gradient(145deg, #e6f7f2 0%, #d6ecef 100%);
          box-shadow: 0 16px 36px rgba(103, 157, 154, 0.16);
        }
        .action-card--secondary {
          background: linear-gradient(145deg, #eef1ff 0%, #f3e8ff 100%);
          box-shadow: 0 16px 36px rgba(117, 97, 181, 0.14);
        }
        .action-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: rgba(15, 27, 61, 0.08);
          color: #0f1b3d;
          font-size: 28px;
          font-weight: 800;
        }
        .action-title {
          font-size: 28px;
          line-height: 1.1;
          font-weight: 800;
          color: #0f1b3d;
        }
        .action-desc {
          font-size: 17px;
          line-height: 1.6;
          color: #586279;
        }
        @media (max-width: 720px) {
          .dashboard-card {
            padding: 24px;
          }
          .toolbar,
          .toolbar-actions,
          .hero {
            flex-direction: column;
            align-items: stretch;
          }
          h1 {
            font-size: 40px;
          }
          .subtitle {
            font-size: 18px;
          }
          .hero-chip {
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}
