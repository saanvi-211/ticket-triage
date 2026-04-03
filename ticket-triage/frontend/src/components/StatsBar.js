import React from 'react';

export default function StatsBar({ stats }) {
  const total = stats?.total ?? '—';
  const urgent = stats?.urgentCount ?? '—';

  const topCategory = stats?.byCategory?.length
    ? [...stats.byCategory].sort((a, b) => b.count - a.count)[0]?.category
    : '—';

  const topPriority = stats?.byPriority?.length
    ? [...stats.byPriority].sort((a, b) => {
        const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
        return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
      }).find(p => p.count > 0)?.priority
    : '—';

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <span className="stat-label">total_tickets</span>
        <span className="stat-value">{total}</span>
        <span className="stat-sub">all time</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">urgent_flags</span>
        <span className="stat-value" style={{ color: urgent > 0 ? 'var(--red)' : 'inherit' }}>
          {urgent}
        </span>
        <span className="stat-sub">require attention</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">top_category</span>
        <span className="stat-value" style={{ fontSize: '1.1rem', paddingTop: 4 }}>{topCategory}</span>
        <span className="stat-sub">most common</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">highest_priority</span>
        <span className="stat-value" style={{
          fontSize: '1.4rem',
          color: topPriority === 'P0' ? 'var(--red)'
            : topPriority === 'P1' ? 'var(--orange)'
            : topPriority === 'P2' ? 'var(--yellow)'
            : 'var(--green)'
        }}>
          {topPriority}
        </span>
        <span className="stat-sub">active in log</span>
      </div>
    </div>
  );
}
