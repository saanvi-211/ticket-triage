import React from 'react';

const PRIORITY_LABELS = {
  P0: 'CRITICAL',
  P1: 'HIGH',
  P2: 'MEDIUM',
  P3: 'LOW',
};

export default function ResultPanel({ result, error, loading }) {
  if (loading) {
    return (
      <div className="result-panel">
        <div className="result-loading">
          <div className="loading-spinner" />
          <span className="loading-text">PROCESSING_TICKET…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-panel">
        <div className="result-error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-panel">
        <div className="result-empty">
          <span className="result-empty-icon">◈</span>
          <span>AWAITING_INPUT</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
            submit a ticket to see analysis
          </span>
        </div>
      </div>
    );
  }

  const confidencePct = Math.round(result.confidence * 100);

  return (
    <div className="result-panel">
      <div className="result-content">

        {result.isSecurity && (
          <div className="security-banner">
            <span>⚠</span>
            <span>SECURITY ESCALATION — CUSTOM RULE TRIGGERED</span>
          </div>
        )}

        {/* Category + Priority + Urgency */}
        <div className="result-main">
          <span className={`badge ${result.isSecurity ? 'badge-security' : 'badge-category'}`}>
            {result.category}
          </span>
          <span className={`badge badge-priority badge-${result.priority}`}>
            {result.priority} · {PRIORITY_LABELS[result.priority]}
          </span>
          {result.isUrgent && (
            <span className="badge badge-urgent">⚡ URGENT</span>
          )}
        </div>

        {/* Confidence */}
        <div className="confidence-row">
          <div className="confidence-header">
            <span>CONFIDENCE_SCORE</span>
            <span className="confidence-value">{confidencePct}%</span>
          </div>
          <div className="confidence-track">
            <div
              className="confidence-fill"
              style={{
                width: `${confidencePct}%`,
                background: confidencePct > 75
                  ? 'var(--green)'
                  : confidencePct > 45
                  ? 'var(--yellow)'
                  : 'var(--red)',
              }}
            />
          </div>
        </div>

        {/* Keywords */}
        {result.keywords?.length > 0 && (
          <div className="tags-section">
            <span className="tags-label">extracted_keywords</span>
            <div className="tags-row">
              {result.keywords.map((kw) => (
                <span key={kw} className="tag">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Signals */}
        {result.signals?.length > 0 && (
          <div className="tags-section">
            <span className="tags-label">detection_signals</span>
            <div className="tags-row">
              {result.signals.map((sig) => (
                <span key={sig} className="tag tag-signal">{sig}</span>
              ))}
            </div>
          </div>
        )}

        {/* Ticket ID */}
        <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          TICKET_ID: #{String(result.id).padStart(6, '0')} · {new Date(result.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
