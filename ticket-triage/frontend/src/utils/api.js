// utils/api.js

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

export async function analyzeTicket(message) {
  const res = await fetch(`${BASE_URL}/tickets/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.errors?.[0]?.msg || data.error || 'Request failed';
    throw new Error(msg);
  }
  return data.data;
}

export async function fetchTickets(limit = 50, offset = 0) {
  const res = await fetch(`${BASE_URL}/tickets?limit=${limit}&offset=${offset}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch tickets');
  return data;
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/tickets/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
  return data.data;
}
