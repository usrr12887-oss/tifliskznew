const API_BASE = '/api';

async function get(url) {
  const res = await fetch(`${API_BASE}${url}`, { method: 'GET' });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

async function post(url, body) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const ApiService = {
  async getUsers() {
    return get('/users.php');
  },

  async registerUser({ username, phone, password }) {
    return post('/users.php', { username, phone, password });
  },

  async getTransactions() {
    return get('/transactions.php');
  },

  async addTransaction(tx) {
    const body = {
      username: tx.username,
      amount: tx.amount,
      type: tx.type,
      receipt: tx.receipt instanceof File ? tx.receipt.name : tx.receipt,
      cardNumber: tx.cardNumber ?? null,
      expiryDate: tx.expiryDate ?? null,
    };
    return post('/transactions.php', body);
  },

  async updateTransaction(txId, status, reason = null, gameCode = null) {
    return post('/transaction-update.php', { txId, status, reason, gameCode });
  },

  async updateUserBalance(userId, balanceDelta) {
    return post('/user-update.php', { userId, balanceDelta });
  },

  async assignCodeToUser(userId, gameCode) {
    return post('/user-update.php', { userId, balanceDelta: 0, gameCode });
  },

  async setWheelResult(userId, bonusPercent) {
    return post('/user-update.php', { userId, balanceDelta: 0, wheelSpun: true, bonusPercent });
  },
};

export async function isApiAvailable() {
  try {
    await fetch(`${API_BASE}/users.php`, { method: 'GET' });
    return true;
  } catch {
    return false;
  }
}
