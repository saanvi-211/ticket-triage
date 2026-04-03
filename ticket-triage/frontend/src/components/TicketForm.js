import React, { useState } from 'react';

const EXAMPLES = [
  "I was charged twice for my subscription this month",
  "Production server is down! All customers affected",
  "My account got hacked, unauthorized access detected",
  "Can't reset my password, account is locked",
  "Would love a dark mode feature in the dashboard",
  "The app crashes every time I try to export data",
];

const MAX_CHARS = 5000;

export default function TicketForm({ onSubmit, loading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onSubmit(message.trim());
  };

  const handlePill = (text) => {
    setMessage(text);
  };

  const charLen = message.length;
  const charClass = charLen > MAX_CHARS ? 'error' : charLen > MAX_CHARS * 0.85 ? 'warn' : '';

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="field-label" htmlFor="ticket-msg">ticket_message</label>
        <textarea
          id="ticket-msg"
          className="ticket-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the support issue in detail…"
          disabled={loading}
          maxLength={MAX_CHARS}
          aria-label="Support ticket message"
        />
        <span className={`char-count ${charClass}`}>
          {charLen} / {MAX_CHARS}
        </span>
      </div>

      <div className="example-pills">
        <span className="example-label">quick examples →</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="pill"
            onClick={() => handlePill(ex)}
            disabled={loading}
          >
            {ex.length > 36 ? ex.slice(0, 34) + '…' : ex}
          </button>
        ))}
      </div>

      <button
        className="submit-btn"
        type="submit"
        disabled={loading || !message.trim() || charLen > MAX_CHARS}
      >
        {loading ? (
          <>
            <span className="spinner" />
            ANALYZING…
          </>
        ) : (
          '▶  ANALYZE_TICKET'
        )}
      </button>
    </form>
  );
}
