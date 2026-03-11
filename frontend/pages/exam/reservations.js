import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { api } from '../../lib/api';

function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.exam_reservations)) return payload.exam_reservations;
  if (Array.isArray(payload?.data?.exam_reservations)) return payload.data.exam_reservations;
  if (Array.isArray(payload?.reservations)) return payload.reservations;
  if (Array.isArray(payload?.data?.reservations)) return payload.data.reservations;
  return [];
}

function getReservationId(item) {
  return item?.id || item?.reservation_id || item?.exam_reservation_id || '';
}

function getOccupationId(item) {
  return item?.occupation_id || item?.occupation?.id || item?.occupation?.occupation_id || '';
}

function getMethodology(item) {
  return item?.methodology_type || item?.methodology || item?.exam_session?.methodology_type || 'in_person';
}

function getStatus(item) {
  return item?.status || item?.reservation_status || item?.payment_status || 'Unknown';
}

function getDate(item) {
  return item?.exam_date || item?.scheduled_at || item?.date || item?.exam_session?.exam_date || '';
}

function getCenterName(item) {
  return (
    item?.test_center_name ||
    item?.test_center?.name ||
    item?.test_center?.test_center_name ||
    item?.exam_session?.test_center_name ||
    item?.exam_session?.test_center?.name ||
    item?.site_city ||
    '-'
  );
}

function getSiteId(item) {
  return item?.site_id || item?.test_center?.site_id || item?.exam_session?.site_id || '';
}

function getLanguageCode(item) {
  return item?.language_code || item?.prometric_code || '-';
}

export default function ReservationsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState('');
  const [error, setError] = useState('');

  async function loadReservations() {
    setLoading(true);
    setError('');

    try {
      const data = await api('/api/svp/exam-reservations?locale=en');
      setItems(pickArray(data));
    } catch (err) {
      setError(err?.message || 'Failed to load booked reservations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function startReschedule(item) {
    const reservationId = getReservationId(item);
    const occupationId = getOccupationId(item);

    if (!reservationId || !occupationId) {
      setError('Missing reservation ID or occupation ID');
      return;
    }

    setLoadingId(String(reservationId));
    setError('');

    try {
      await api('/api/svp/reservation-credits/use', {
        method: 'POST',
        body: {
          methodology_type: getMethodology(item),
          reservation_id: Number(reservationId),
          occupation_id: Number(occupationId),
        },
      });

      const query = new URLSearchParams({
        reschedule: '1',
        reservationId: String(reservationId),
        occupationId: String(occupationId),
        methodology: String(getMethodology(item)),
        examDate: String(getDate(item) || ''),
        siteId: String(getSiteId(item) || ''),
        languageCode: String(getLanguageCode(item) || ''),
      });

      router.push(`/exam/booking?${query.toString()}`);
    } catch (err) {
      setError(err?.message || 'Failed to start reschedule');
    } finally {
      setLoadingId('');
    }
  }

  return (
    <div className="page-shell">
      <div className="page-card">
        <div className="page-head">
          <div>
            <p className="eyebrow">Reservations</p>
            <h1>Booked exams</h1>
            <p className="muted">Existing bookings from the real API appear here.</p>
          </div>
          <div className="actions">
            <Link href="/dashboard" className="secondary-btn">
              Dashboard
            </Link>
            <button className="secondary-btn" type="button" onClick={loadReservations} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error ? <div className="status-card status-error">{error}</div> : null}

        {loading ? <div className="empty-card">Loading booked reservations...</div> : null}

        {!loading && items.length === 0 ? <div className="empty-card">No booked reservations found.</div> : null}

        <div className="reservation-grid">
          {items.map((item) => {
            const reservationId = getReservationId(item);
            return (
              <div className="reservation-card" key={reservationId}>
                <div className="reservation-top">
                  <h2>#{reservationId}</h2>
                  <span>{getStatus(item)}</span>
                </div>
                <div className="detail-list">
                  <div>
                    <span>Test center</span>
                    <strong>{getCenterName(item)}</strong>
                  </div>
                  <div>
                    <span>Exam date</span>
                    <strong>{getDate(item) || '-'}</strong>
                  </div>
                  <div>
                    <span>Occupation ID</span>
                    <strong>{getOccupationId(item) || '-'}</strong>
                  </div>
                  <div>
                    <span>Language</span>
                    <strong>{getLanguageCode(item)}</strong>
                  </div>
                  <div>
                    <span>Site ID</span>
                    <strong>{getSiteId(item) || '-'}</strong>
                  </div>
                </div>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={() => startReschedule(item)}
                  disabled={loadingId === String(reservationId)}
                >
                  {loadingId === String(reservationId) ? 'Opening...' : 'Reschedule'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .page-shell {
          min-height: 100vh;
          padding: 24px;
          background: #efefef;
        }
        .page-card {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding: 28px;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 20px 45px rgba(10, 31, 68, 0.08);
        }
        .page-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #5a7a7d;
          font-weight: 700;
        }
        h1 {
          margin: 0 0 8px;
          color: #101728;
        }
        .muted {
          margin: 0;
          color: #5f6777;
        }
        .secondary-btn,
        .primary-btn {
          min-height: 44px;
          padding: 0 16px;
          border: 0;
          border-radius: 12px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .secondary-btn {
          background: #101728;
          color: #fff;
        }
        .primary-btn {
          background: #83bcc0;
          color: #fff;
        }
        .status-card,
        .empty-card {
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 18px;
        }
        .status-error {
          background: #fff1f1;
          color: #9d2020;
        }
        .empty-card {
          background: #f6f7f9;
          color: #5f6777;
        }
        .reservation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }
        .reservation-card {
          padding: 20px;
          border-radius: 18px;
          background: #f6f7f9;
          border: 1px solid #dde2ea;
        }
        .reservation-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }
        .reservation-top h2 {
          margin: 0;
          color: #101728;
        }
        .detail-list {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }
        .detail-list div {
          padding: 12px;
          border-radius: 12px;
          background: #fff;
        }
        .detail-list span {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          color: #5f6777;
          text-transform: uppercase;
        }
        .detail-list strong {
          color: #101728;
          word-break: break-word;
        }
        @media (max-width: 720px) {
          .page-head,
          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
