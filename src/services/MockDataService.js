import { TelegramService } from "./TelegramService";

const MOCK_USERS_KEY = "casino_mock_users";
const MOCK_TRANSACTIONS_KEY = "casino_mock_transactions";
const MOCK_ADMIN_SETTINGS_KEY = "casino_admin_settings";

const initialUsers = [
  { id: 2, username: "user1", phone: "0502223344", password: "123", balance: 500, role: "user", status: "active", gameCode: null },
];

const initialSettings = {
  adminCard: "4127 0000 1111 2222",
  adminCardName: "Tiflis Kazino Admin"
};

export const MockDataService = {
  getUsers: () => {
    const data = localStorage.getItem(MOCK_USERS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(data);
  },

  getAdminSettings: () => {
    const data = localStorage.getItem(MOCK_ADMIN_SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_ADMIN_SETTINGS_KEY, JSON.stringify(initialSettings));
      return initialSettings;
    }
    return JSON.parse(data);
  },

  updateAdminSettings: (settings) => {
    localStorage.setItem(MOCK_ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  },

  updateUserBalance: (userId, amount) => {
    const users = MockDataService.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, balance: (u.balance || 0) + amount } : u);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));
    return updated;
  },

  assignCodeToUser: (userId, code) => {
    const users = MockDataService.getUsers();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, gameCode: code } : u);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedUsers));
    return updatedUsers;
  },

  setWheelResult: (userId, bonusPercent) => {
    const users = MockDataService.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, wheelSpun: true, bonusPercent } : u);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));
    return updated;
  },

  blockUserDeposit: (userId, durationMinutes = 15) => {
    const users = MockDataService.getUsers();
    const blockUntil = Date.now() + durationMinutes * 60 * 1000;
    const updated = users.map(u => String(u.id) === String(userId) ? { ...u, depositBlockedUntil: blockUntil } : u);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));
    return updated;
  },


  getTransactions: () => {
    const data = localStorage.getItem(MOCK_TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addTransaction: (tx) => {
    const txs = MockDataService.getTransactions();
    // Save only filename in storage to avoid serialization issues
    const storageTx = { ...tx, id: Date.now(), status: "pending", date: new Date().toISOString() };
    if (tx.receipt instanceof File) {
      storageTx.receipt = tx.receipt.name;
    }
    txs.push(storageTx);
    localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(txs));

    const users = MockDataService.getUsers();
    const user = users.find(u => u.username === tx.username);

    // Telegram Notification
    const typeLabel = tx.type === "deposit" ? "DEPOZİT" : "ÇIXARIŞ";
    const emoji = tx.type === "deposit" ? "📥" : "📤";
    const details = tx.type === "deposit" 
      ? `\n<b>Çek:</b> ${storageTx.receipt || "Yoxdur"}` + (user?.bonusPercent ? `\n<b>Tətbiq ediləcək Bonus:</b> ${user.bonusPercent}%` : "")
      : `\n<b>Oyun Kodu:</b> <code>${user?.gameCode || "Yoxdur"}</code>\n<b>Kart:</b> ${tx.cardNumber}\n<b>Tarix:</b> ${tx.expiryDate}`;

    const message = `${emoji} <b>YENİ ${typeLabel} SORĞUSU</b>\n\n` +
      `<b>İstifadəçi:</b> ${tx.username}\n` +
      `<b>Müştəri ID:</b> ${user?.id || "Yoxdur"}\n` +
      `<b>Məbləğ:</b> ${tx.amount} AZN` +
      details +
      `\n\n<b>Status:</b> Gözləyir` +
      (tx.type === "deposit" ? `\n\n<i>⚠️ Zəhmət olmasa təsdiqləyərkən oyun kodunu daxil edin.</i>` : "");

    const buttons = [
      [
        { text: "✅ Təsdiqlə", callback_data: `approve_${storageTx.id}` },
        { text: "❌ Ləğv et", callback_data: `reject_${storageTx.id}` }
      ]
    ];

    const telegramPromise = (tx.type === "deposit" && tx.receipt instanceof File)
      ? TelegramService.sendPhoto(message, tx.receipt, buttons)
      : TelegramService.sendMessage(message, buttons);

    telegramPromise.then(result => {
      if (result && result.ok) {
        const msgId = result.result.message_id;
        const txs = MockDataService.getTransactions();
        const updated = txs.map(t => t.id === storageTx.id ? { ...t, telegramMessageId: msgId } : t);
        localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(updated));
      }
    });

    return storageTx;
  },


  updateTransactionStatus: (txId, status, reason = null, gameCode = null) => {
    const txs = MockDataService.getTransactions();
    const updatedTxs = txs.map(t => {
      if (t.id === Number(txId)) {
        return { ...t, status, reason: reason, gameCode: gameCode || t.gameCode };
      }
      return t;
    });
    localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(updatedTxs));
    
    if (status === "approved") {
      const tx = txs.find(t => t.id === Number(txId));
      if (tx) {
        const users = MockDataService.getUsers();
        const user = users.find(u => u.username === tx.username);
        if (user) {
          const amount = tx.type === "deposit" ? tx.amount : -tx.amount;
          MockDataService.updateUserBalance(user.id, amount);
          
          if (tx.type === "deposit" && gameCode) {
            MockDataService.assignCodeToUser(user.id, gameCode);
          }
        }
      }
    }
    return updatedTxs;
  },


  getFinanceStats: () => {
    const txs = MockDataService.getTransactions();
    const approved = txs.filter(t => t.status === "approved");
    
    const totalDeposits = approved.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = approved.filter(t => t.type === "withdraw").reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalDeposits,
      totalWithdrawals,
      netProfit: totalDeposits - totalWithdrawals,
      pendingCount: txs.filter(t => t.status === "pending").length,
      approvedCount: approved.length
    };
  },

  clearTransactions: () => {
    localStorage.removeItem(MOCK_TRANSACTIONS_KEY);
    return [];
  }
};

