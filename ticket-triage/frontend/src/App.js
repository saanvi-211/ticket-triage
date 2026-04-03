import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TicketForm from './components/TicketForm';
import ResultPanel from './components/ResultPanel';
import TicketTable from './components/TicketTable';
import StatsBar from './components/StatsBar';
import { analyzeTicket, fetchTickets, fetchStats } from './utils/api';

function App() {
  const [result, setResult] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      const [ticketData, statsData] = await Promise.all([fetchTickets(), fetchStats()]);
      setTickets(ticketData.data);
      setStats(statsData);
    } catch (e) {
      console.error('Failed to load tickets:', e);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSubmit = async (message) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeTicket(message);
      setResult(data);
      // Refresh list
      const [ticketData, statsData] = await Promise.all([fetchTickets(), fetchStats()]);
      setTickets(ticketData.data);
      setStats(statsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-bracket">[</span>
            <span className="logo-text">TRIAGE<span className="logo-ai">AI</span></span>
            <span className="logo-bracket">]</span>
            <span className="logo-cursor">_</span>
          </div>
          <div className="header-meta">
            <span className="header-tag">v1.0.0</span>
            <span className="header-sep">//</span>
            <span className="header-tag">support intelligence</span>
            <span className="status-dot" title="System Online" />
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Stats bar */}
        <StatsBar stats={stats} />

        {/* Top section: Form + Result */}
        <div className="top-grid">
          <section className="section">
            <div className="section-label">
              <span className="label-num">01</span>
              <span>submit_ticket</span>
            </div>
            <TicketForm onSubmit={handleSubmit} loading={loading} />
          </section>

          <section className="section">
            <div className="section-label">
              <span className="label-num">02</span>
              <span>analysis_result</span>
            </div>
            <ResultPanel result={result} error={error} loading={loading} />
          </section>
        </div>

        {/* Bottom section: Ticket list */}
        <section className="section section-full">
          <div className="section-label">
            <span className="label-num">03</span>
            <span>ticket_log</span>
            <span className="section-count">{tickets.length} entries</span>
          </div>
          <TicketTable tickets={tickets} loading={ticketsLoading} />
        </section>
      </main>

      <footer className="app-footer">
        <span>TRIAGE_AI // LOCAL_NLP_ENGINE // NO_EXTERNAL_APIS</span>
        <span className="footer-blink">■</span>
      </footer>
    </div>
  );
}

export default App;
