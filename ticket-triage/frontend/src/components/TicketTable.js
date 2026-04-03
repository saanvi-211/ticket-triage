import React from 'react';

const PRIORITY_COLOR = {
  P0: 'var(--red)',
  P1: 'var(--orange)',
  P2: 'var(--yellow)',
  P3: 'var(--green)',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TicketTable({ tickets, loading }) {
  if (loading) {
    return (
      <div className="ticket-table-wrap">
        <div className="table-loading">LOADING_RECORDS…</div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="ticket-table-wrap">
        <div className="table-empty">NO_RECORDS_FOUND // submit a ticket above</div>
      </div>
    );
  }

  return (
    <div className="ticket-table-wrap">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>#</th>
            <th>message</th>
            <th>category</th>
            <th>priority</th>
            <th>urgent</th>
            <th>confidence</th>
            <th>keywords</th>
            <th>time</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className={t.isSecurity ? 'row-security' : ''}>
              <td style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                #{String(t.id).padStart(4, '0')}
              </td>
              <td className="ticket-message-cell">
                <span className="ticket-message-text" title={t.message}>
                  {t.message}
                </span>
              </td>
              <td>
                <span style={{
                  color: t.isSecurity ? 'var(--security)' : 'var(--cyan)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}>
                  {t.category}
                </span>
              </td>
              <td>
                <span style={{
                  color: PRIORITY_COLOR[t.priority] || 'var(--text)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}>
                  {t.priority}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                {t.isUrgent
                  ? <span style={{ color: 'var(--red)', fontSize: '0.7rem' }}>⚡ YES</span>
                  : <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>—</span>
                }
              </td>
              <td>
                <span style={{
                  color: t.confidence > 0.75 ? 'var(--green)'
                    : t.confidence > 0.45 ? 'var(--yellow)'
                    : 'var(--red)',
                  fontSize: '0.72rem',
                }}>
                  {Math.round(t.confidence * 100)}%
                </span>
              </td>
              <td>
                <div className="ticket-keywords">
                  {(t.keywords || []).slice(0, 3).map((kw) => (
                    <span key={kw} className="tag" style={{ fontSize: '0.6rem' }}>{kw}</span>
                  ))}
                  {(t.keywords || []).length > 3 && (
                    <span className="tag" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                      +{t.keywords.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="ticket-time">{timeAgo(t.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
