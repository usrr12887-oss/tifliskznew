import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  CreditCard,
  Upload,
  Copy,
  Info,
  CheckCircle,
  Users,
  ShieldCheck,
  Zap,
  Clock,
} from "lucide-react";
import { MockDataService } from "./services/MockDataService";
import { TelegramService } from "./services/TelegramService";
const ApiService = {
  getTransactions: async () => ([]),
  getUsers: async () => ([]),
  addTransaction: async () => ({}),
  updateTransaction: async () => ({}),
  updateUserBalance: async () => ({}),
  assignCodeToUser: async () => ({}),
  setWheelResult: async () => ({}),
  registerUser: async () => ({})
};


/* ================= OYUNLAR DATA ================= */
const CASINO_IMAGES = [
  {
    id: 1,
    title: "Rich Fruits",
    category: "slots",
    img: "images/rich-fruits.png",
  },
  {
    id: 2,
    title: "Sevens on Fire",
    category: "slots",
    img: "images/sevens-on-fire.png",
  },
  {
    id: 3,
    title: "Hot Sevens",
    category: "slots",
    img: "images/hot-sevens.png",
  },
  { id: 4, title: "Fire Rage", category: "slots", img: "images/fire-rage.png" },
  {
    id: 5,
    title: "Extra Super 7",
    category: "slots",
    img: "images/extra-super-7.png",
  },
  {
    id: 6,
    title: "Sizzling Hot",
    category: "slots",
    img: "images/sizzling-hot.png",
  },
  {
    id: 7,
    title: "Golden Scatter",
    category: "slots",
    img: "images/golden-scatter2.png",
  },
  {
    id: 8,
    title: "Hot Sevens Extreme",
    category: "slots",
    img: "images/hot-sevens-extreme.png",
  },
  {
    id: 9,
    title: "Lady Luck",
    category: "classic",
    img: "images/lady-luck.png",
  },
  {
    id: 10,
    title: "Ultra 7 Hot",
    category: "slots",
    img: "images/ultra-7-hot.png",
  },
  {
    id: 11,
    title: "Always Cherry",
    category: "slots",
    img: "images/always-cherry.png",
  },
  {
    id: 12,
    title: "Aztec Century",
    category: "slots",
    img: "images/aztec-century.png",
  },
  { id: 13, title: "Hot Slot", category: "slots", img: "images/hot-slot.png" },
  {
    id: 14,
    title: "Fortune Star",
    category: "slots",
    img: "images/fortune-star.png",
  },
  {
    id: 15,
    title: "Simple Diamond",
    category: "slots",
    img: "images/simple-diamond.png",
  },
  {
    id: 16,
    title: "Joker's Fruit",
    category: "slots",
    img: "images/jokers-fruit.png",
  },
  {
    id: 17,
    title: "Hit Jewels",
    category: "slots",
    img: "images/hit-jewels.png",
  },
  {
    id: 18,
    title: "King of Jewels",
    category: "classic",
    img: "images/king-of-jewels.png",
  },
  {
    id: 19,
    title: "Roll of Ramses",
    category: "slots",
    img: "images/roll-of-ramses.jpg",
  },
  {
    id: 20,
    title: "Scatter Wins",
    category: "slots",
    img: "images/scatter-wins.png",
  },
  {
    id: 21,
    title: "Tropical Fruits",
    category: "slots",
    img: "images/tropical-fruits.png",
  },
  {
    id: 22,
    title: "Blackjack",
    category: "classic",
    img: "images/blackjack.png",
  },
  {
    id: 23,
    title: "Box of Ra",
    category: "slots",
    img: "images/box-of-ra.png",
  },
  { id: 24, title: "Bananas", category: "slots", img: "images/bananas.png" },
  {
    id: 25,
    title: "Book of Sphinx",
    category: "slots",
    img: "images/book-of-sphinx.png",
  },
  {
    id: 26,
    title: "Book of Winners",
    category: "slots",
    img: "images/book-of-winners.png",
  },
  { id: 27, title: "Captain", category: "slots", img: "images/captain.png" },
  {
    id: 28,
    title: "Computer World",
    category: "slots",
    img: "images/computer-world.png",
  },
  {
    id: 29,
    title: "Crazy Barmen",
    category: "slots",
    img: "images/crazy-barmen.png",
  },
  {
    id: 30,
    title: "Dolphin Shell",
    category: "slots",
    img: "images/dolphin-shell.png",
  },
  {
    id: 31,
    title: "European Roulette Network",
    category: "classic",
    img: "images/european-roulette-network.png",
  },
  {
    id: 32,
    title: "European Roulette",
    category: "classic",
    img: "images/european-roulette.png",
  },
  {
    id: 33,
    title: "Fortune Wheel",
    category: "slots",
    img: "images/fortune-wheel.png",
  },
  {
    id: 34,
    title: "Fortune Wheel Network",
    category: "slots",
    img: "images/fortune-wheel-network.png",
  },
  {
    id: 35,
    title: "Gates of Avalon",
    category: "slots",
    img: "images/gates-of-avalon.png",
  },
  {
    id: 36,
    title: "Golden Harvest",
    category: "slots",
    img: "images/golden-harvest.png",
  },
  { id: 37, title: "Hearts", category: "slots", img: "images/hearts.png" },
  {
    id: 38,
    title: "Money Lotto",
    category: "slots",
    img: "images/money-lotto.png",
  },
];

const CATEGORIES = [
  { id: "all", label: "Hamısı", icon: <Zap size={18} /> },
  { id: "slots", label: "Slotlar", icon: <Zap size={18} /> },
  { id: "crash", label: "Crash", icon: <Zap size={18} /> },
  { id: "classic", label: "Klassik", icon: <Zap size={18} /> },
  { id: "live", label: "Canlı", icon: <Zap size={18} /> },
];

const WHEEL_SEGMENTS = [
  "1000 ₼",
  "500 ₼",
  "100 ₼",
  "50 ₼",
  "100% bonus",
  "50% bonus",
  "20% bonus",
  "10% bonus",
];
const WHEEL_WINNABLE_INDICES = [6, 7];

function UserApp() {
  /* --- UI & AUTH STATES --- */
  const [activeCategory, setActiveCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  /* --- JACKPOTS & LIVE WIN STATES --- */
  const [smallJP, setSmallJP] = useState(320);
  const [mediumJP, setMediumJP] = useState(820);
  const [bigJP, setBigJP] = useState(1520);
  const [liveWin, setLiveWin] = useState({
    name: "Kamran",
    game: "Aviator",
    amount: 125,
  });

  /* --- MODALS & FORMS STATES --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositFile, setDepositFile] = useState(null);

  const [withdrawCard, setWithdrawCard] = useState("");
  const [withdrawExpiry, setWithdrawExpiry] = useState("");

  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [currentGameCode, setCurrentGameCode] = useState("");
  const [pendingDeposit, setPendingDeposit] = useState(null);

  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState(null);

  const navigate = useNavigate();

  const [adminSettings, setAdminSettings] = useState(() =>
    MockDataService.getAdminSettings(),
  );
  const [lastUpdateId, setLastUpdateId] = useState(
    () => Number(localStorage.getItem("last_telegram_update_id")) || 0,
  );

  /* ================= EFFECTS ================= */

  // Telegram Polling və Command handling məntiqi təhlükəsizlik səbəbilə silindi.
  // Artıq bütün Telegram əməliyyatları yalnız Backend tərəfindən idarə olunur.
  useEffect(() => {
    // Boşaldıldı
  }, []);

  // Track Pending Deposit Status (local + API so admin approval on server is seen)
  useEffect(() => {
    if (!pendingDeposit || !user) return;
    if (pendingDeposit.status !== "pending") return;

    const checkStatus = async () => {
      let current = null;
      try {
        const txs = await ApiService.getTransactions();
        current = txs.find((t) => t.id === pendingDeposit.id);
      } catch {
        const txs = MockDataService.getTransactions();
        current = txs.find((t) => t.id === pendingDeposit.id);
      }
      if (current && current.status !== "pending") {
        try {
          const allUsers = await ApiService.getUsers();
          const fresh =
            Array.isArray(allUsers) &&
            allUsers.find((u) => u.username === user.username);
          if (fresh) setUser({ ...fresh });
        } catch {
          const allUsers = MockDataService.getUsers();
          const fresh = allUsers.find((u) => u.username === user.username);
          if (fresh) setUser({ ...fresh });
        }
        setPendingDeposit(current);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [pendingDeposit, user]);

  // Sync Admin Settings from Server (Production Render)
  useEffect(() => {
    const syncSettings = async () => {
      const serverSettings = await TelegramService.getSettings();
      if (serverSettings && serverSettings.adminCard) {
        setAdminSettings(serverSettings);
      }
    };
    
    syncSettings();
    const interval = setInterval(syncSettings, 10000);
    return () => clearInterval(interval);
  }, []);

  // Removed old pinned polling as it's now handled by the Bot Webhook server-side


  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem("casino_current_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const allUsers = MockDataService.getUsers();
      const fresh = allUsers.find((u) => u.username === parsed.username);
      if (fresh) setUser(fresh);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("casino_current_user", JSON.stringify(user));
      const users = MockDataService.getUsers();
      const currentUser = users.find((u) => u.username === user.username);
      if (currentUser) {
        setBalance(currentUser.balance || 0);
        setCurrentGameCode(currentUser.gameCode || "");
      }
    } else {
      localStorage.removeItem("casino_current_user");
    }

    const t = setInterval(() => {
      setSmallJP((j) => (j >= 500 ? 200 : j + Math.floor(Math.random() * 3)));
      setMediumJP((j) => (j >= 1000 ? 700 : j + Math.floor(Math.random() * 4)));
      setBigJP((j) => (j >= 5000 ? 1200 : j + Math.floor(Math.random() * 10)));
    }, 3000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    const names = [
      "Elvin",
      "Leyla",
      "Murad",
      "Aysel",
      "Samir",
      "Rəşad",
      "Zaur",
      "Fidan",
      "Orxan",
      "Günel",
      "Vüsal",
      "Nigar",
      "Anar",
      "Nərmin",
      "Emin",
      "Sevinc",
      "İlqar",
      "Könül",
      "Rauf",
      "Arzu",
      "Tural",
      "Aytən",
      "Elnur",
      "Lalə",
      "Pərviz",
      "Gülşən",
      "Ceyhun",
      "Fəridə",
      "Ramil",
      "Səbinə",
      "Fuad",
      "Nailə",
      "Kamran",
      "Zeynəb",
      "Ayxan",
      "Aydan",
      "Nicat",
      "Məryəm",
      "Aqil",
      "Türkan",
      "Şahin",
      "Nisə",
      "Rüstəm",
      "Validə",
      "Tahir",
      "Nuranə",
      "Eldar",
      "Fidan",
      "Fariz",
      "Səid",
    ];
    const games = [
      "Rich Fruits",
      "Hot Sevens",
      "Lady Luck",
      "Sevens on Fire",
      "Roulette",
      "Sizzling Hot",
      "Fire Rage",
      "Extra Super 7",
    ];

    const interval = setInterval(() => {
      const isBigWin = Math.random() > 0.8;
      const amount = isBigWin
        ? Math.floor(Math.random() * 4000) + 1000
        : Math.floor(Math.random() * 800) + 100;
      setLiveWin({
        name: names[Math.floor(Math.random() * names.length)],
        game: games[Math.floor(Math.random() * games.length)],
        amount: amount,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = useMemo(() => {
    return CASINO_IMAGES.filter((g) => {
      const matchesSearch = g.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleDepositSubmit = async () => {
    if (!depositAmount || depositAmount <= 0)
      return alert("Məbləği daxil edin.");
    if (!depositFile) return alert("Zəhmət olmasa çeki (skrinşot) yükləyin.");

    // Backend-ə çək ilə birgə göndər
    const res = await TelegramService.requestAction(
      user.id || user.username,
      "deposit",
      parseFloat(depositAmount),
      { note: "Çek yükləndi" },
      depositFile
    );

    if (res.success) {
      // Gözləmə rejimini aktiv et (Status polling başlayacaq)
      setPendingDeposit({ id: res.requestId, status: 'pending', amount: parseFloat(depositAmount) });
      setDepositOpen(false);
      
      // Canlı statusu yoxlamağa başla
      const poll = setInterval(async () => {
          const statusRes = await TelegramService.checkStatus(res.requestId);
          if (statusRes.status !== 'pending') {
              setPendingDeposit(prev => ({ ...prev, status: statusRes.status, reason: statusRes.reason || statusRes.adminCode }));
              if (statusRes.status === 'approved') {
                  setCurrentGameCode(statusRes.adminCode); // Oyun kodunu ekrana çıxar
              }
              clearInterval(poll);
          }
      }, 3000);
    } else {
      alert(res.message || "Xəta baş verdi.");
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawCard || withdrawCard.length < 16)
      return alert("Kart nömrəsini düzgün daxil edin (16 rəqəm).");
    if (!withdrawExpiry) return alert("Kartın bitmə tarixini daxil edin.");

    const res = await TelegramService.requestAction(
      user.id || user.username,
      "withdraw",
      balance || 0,
      { card: withdrawCard, expiry: withdrawExpiry }
    );

    if (res.success) {
      alert("Çıxarış sorğunuz qəbul edildi. Təsdiq gözlənilir.");
      setWithdrawOpen(false);
      setWithdrawCard("");
      setWithdrawExpiry("");
    } else {
      alert(res.message || "Xəta baş verdi.");
    }
  };

  const handleAuth = async () => {
    if (!username || !password || (isRegister && !phone))
      return alert("Bütün xanaları doldurun.");
    let users = [];
    try {
      users = await ApiService.getUsers();
    } catch {
      users = MockDataService.getUsers();
    }
    if (!Array.isArray(users)) users = [];

    if (isRegister) {
      if (users.find((u) => u.username === username))
        return alert("Bu istifadəçi adı artıq mövcuddur.");
      if (users.find((u) => u.phone === phone))
        return alert("Bu telefon nömrəsi artıq qeydiyyatdan keçib.");
      try {
        const res = await ApiService.registerUser({
          username,
          phone,
          password,
        });
        const newUser = res.user
          ? { ...res.user, password }
          : {
              id: res.id,
              username,
              phone,
              password,
              balance: 0,
              role: "user",
              status: "active",
              gameCode: null,
            };
        const updated = [...users, newUser];
        localStorage.setItem("casino_mock_users", JSON.stringify(updated));
        setUser(newUser);
        setAuthOpen(false);
        return;
      } catch (e) {
        const msg = e?.message || "";
        if (msg.includes("istifadəçi") || msg.includes("telefon"))
          return alert(msg);
      }
      const newUser = {
        id: Math.floor(100000 + Math.random() * 900000),
        username,
        phone,
        password,
        balance: 0,
        role: "user",
        status: "active",
        gameCode: null,
      };
      const updated = [...users, newUser];
      localStorage.setItem("casino_mock_users", JSON.stringify(updated));
      setUser(newUser);
      setAuthOpen(false);
    } else {
      const existing = users.find((u) => u.username === username && u.password === password);
      if (!existing) return alert("İstifadəçi adı və ya şifrə yanlışdır.");
      setUser(existing);
      setAuthOpen(false);
      // removed admin redirect
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSidebarOpen(false);
    localStorage.removeItem("casino_current_user");
  };

  const handleWheelSpin = () => {
    if (wheelSpinning || !user) return;
    const winningIndex =
      WHEEL_WINNABLE_INDICES[
        Math.floor(Math.random() * WHEEL_WINNABLE_INDICES.length)
      ];
    const bonusPercent = winningIndex === 6 ? 20 : 10;
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const fullTurns = 360 * 6;
    const finalAngle = fullTurns + (360 - winningIndex * segmentAngle);
    setWheelSpinning(true);
    setWheelResult(null);
    setWheelRotation((prev) => prev + finalAngle);
    const t = 4500;
    setTimeout(() => {
      setWheelSpinning(false);
      setWheelResult(bonusPercent);
      const updatedUser = { ...user, wheelSpun: true, bonusPercent };
      setUser(updatedUser);
      const allUsers = MockDataService.getUsers();
      const updated = allUsers.map((u) => (u.id === user.id ? updatedUser : u));
      localStorage.setItem("casino_mock_users", JSON.stringify(updated));
      if (user)
        localStorage.setItem(
          "casino_current_user",
          JSON.stringify(updatedUser),
        );
      try {
        ApiService.setWheelResult(user.id, bonusPercent).catch(() => {});
      } catch (_) {}
    }, t);
  };

  const handleQuickEnter = async () => {
    const guestId = Math.random().toString(36).slice(2, 8);
    const quickUsername = "Qonaq_" + guestId;
    const quickPassword = Math.random().toString(36).slice(2, 12);
    const quickPhone = "";
    let users = [];
    try {
      users = await ApiService.getUsers();
    } catch {
      users = MockDataService.getUsers();
    }
    if (!Array.isArray(users)) users = [];
    try {
      const res = await ApiService.registerUser({
        username: quickUsername,
        phone: quickPhone,
        password: quickPassword,
      });
      const newUser = res.user
        ? { ...res.user, password: quickPassword }
        : {
            id: res.id,
            username: quickUsername,
            phone: quickPhone,
            password: quickPassword,
            balance: 0,
            role: "user",
            status: "active",
            gameCode: null,
          };
      const updated = [...users, newUser];
      localStorage.setItem("casino_mock_users", JSON.stringify(updated));
      setUser(newUser);
      setAuthOpen(false);
      return;
    } catch (_) {}
    const newUser = {
      id: Math.floor(100000 + Math.random() * 900000),
      username: quickUsername,
      phone: quickPhone,
      password: quickPassword,
      balance: 0,
      role: "user",
      status: "active",
      gameCode: null,
    };
    const updated = [...users, newUser];
    localStorage.setItem("casino_mock_users", JSON.stringify(updated));
    setUser(newUser);
    setAuthOpen(false);
  };

  return (
    <div className="h-screen bg-[#05070a] text-white flex flex-col overflow-hidden font-sans relative">
      <header className="px-5 py-4 bg-[#0a0c12]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center z-50 sticky top-0">
        <div className="flex flex-col">
          <h2 className="font-black text-amber-500 italic text-2xl tracking-tighter uppercase">
            TİFLİS KAZİNO
          </h2>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <div
              onClick={() => setWalletMenuOpen(true)}
              className="bg-white/5 pl-4 pr-1 py-1 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer"
            >
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block uppercase font-black">
                  {user.username}
                </span>
                <span className="text-slate-400 font-bold text-[10px]">
                  Balans oyun daxilindədir
                </span>
              </div>
              <div className="bg-amber-500 p-1.5 rounded-xl text-black">
                <Wallet size={14} />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsRegister(false);
              setAuthOpen(true);
            }}
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase"
          >
            GİRİŞ
          </button>
        )}
      </header>

      <div className="bg-black/40 backdrop-blur-md border-b border-white/5 py-2.5 px-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            Canlı Uduşlar
          </span>
        </div>
        <div
          key={`${liveWin.name}-${liveWin.amount}`}
          className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-500"
        >
          <span className="text-[10px] font-bold text-white/90">
            {liveWin.name} ({liveWin.game})
          </span>
          <span className="text-xs font-black text-green-400">
            +{liveWin.amount.toLocaleString()} ₼
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 pt-4">
          <div className="relative h-44 w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-amber-600 to-amber-900 shadow-2xl shadow-amber-900/20 group">
            <div className="relative h-full p-6 flex flex-col justify-end">
              <span className="text-[10px] font-black bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
                Premium Təcrübə
              </span>
              <h1 className="text-2xl font-black text-white italic tracking-tighter leading-tight mb-1 uppercase">
                ŞANS BU GÜN <br />
                <span className="text-amber-400">SƏNİNDİR!</span>
              </h1>
              {user && !user.wheelSpun && (
                <button
                  onClick={() => setWheelOpen(true)}
                  className="mt-3 w-full max-w-[220px] bg-amber-500 hover:bg-amber-400 border border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] text-black py-3 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all animate-none sm:animate-bounce"
                >
                  🎡 PULSUZ ÇARX — İNDİ FIRLAT
                </button>
              )}
              {user && user.wheelSpun && user.bonusPercent && (
                <p className="mt-2 text-[10px] font-bold text-amber-200 uppercase">
                  Çarx bonusunuz: {user.bonusPercent}% (növbəti depozitə)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0f111a] p-4 rounded-3xl border border-white/5 text-center">
              <span className="text-[8px] font-black text-amber-600/60 uppercase block mb-1">
                Mini
              </span>
              <span className="text-lg font-black text-white">
                {smallJP.toLocaleString()} ₼
              </span>
            </div>
            <div className="bg-[#0f111a] p-4 rounded-3xl border border-white/5 text-center">
              <span className="text-[8px] font-black text-cyan-500/60 uppercase block mb-1">
                Middle
              </span>
              <span className="text-lg font-black text-white">
                {mediumJP.toLocaleString()} ₼
              </span>
            </div>
            <div className="bg-[#0f111a] p-4 rounded-3xl border border-red-500/20 text-center">
              <span className="text-[8px] font-black text-red-500 uppercase block mb-1 animate-pulse">
                Mega
              </span>
              <span className="text-xl font-black text-red-500">
                {bigJP.toLocaleString()} ₼
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${activeCategory === cat.id ? "bg-amber-500 border-amber-500 text-black" : "bg-[#0f111a] border-white/5 text-slate-400"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Oyun axtar..."
              className="w-full bg-[#0f111a] border border-white/5 rounded-[20px] py-4.5 pl-14 pr-4 text-sm outline-none placeholder:text-slate-600 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4 overflow-hidden">
          {filteredGames.map((g) => (
            <div
              key={g.id}
              className="group relative rounded-[24px] overflow-hidden border border-white/5 bg-[#0a0c12] active:scale-95 transition-all"
            >
              <div className="aspect-[4/5] relative">
                <img
                  src={g.img}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col items-center">
                  <div className="h-0.5 w-8 bg-amber-500 mb-2 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
                  <p className="text-[11px] font-black text-white uppercase tracking-tight text-center truncate w-full">
                    {g.title}
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                  <button
                    onClick={() => {
                      if (!user) return setAuthOpen(true);
                      if (!currentGameCode)
                        return alert(
                          "Hələ hər hansı depozitiniz yoxdur. Oyuna daxil olmaq üçün zəhmət olmasa depozit edin.",
                        );
                      setGameModalOpen(true);
                    }}
                    className="bg-amber-500 text-black px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    OYNA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-[#0a0c12]/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center py-3 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-amber-500 transition-all"
        >
          <Home size={22} />
          <span className="text-[9px] font-black uppercase">Əsas</span>
        </button>
        <button
          onClick={() => {
            if (!user) setAuthOpen(true);
            else setTransactionsOpen(true);
          }}
          className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-amber-500 transition-all"
        >
          <CreditCard size={22} />
          <span className="text-[9px] font-black uppercase">Tarixçə</span>
        </button>
        <div className="relative -top-6">
          <button
            onClick={() => {
              if (!user) setAuthOpen(true);
              else setWalletMenuOpen(true);
            }}
            className="bg-gradient-to-br from-amber-400 to-amber-600 p-4.5 rounded-[24px] border-4 border-[#05070a]"
          >
            <Wallet size={24} className="text-black" />
          </button>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-500 uppercase">
            Cüzdan
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-white transition-all"
        >
          <Menu size={22} />
          <span className="text-[9px] font-black uppercase">Menü</span>
        </button>
      </div>

      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
          />
          <aside className="fixed left-0 top-0 h-full w-80 bg-[#0a0c12] z-[70] flex flex-col border-r border-white/10 animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h1 className="text-xl font-black text-amber-500 italic">MENU</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-4">
              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/panel-x9k2m7");
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-amber-500 text-black rounded-2xl text-[11px] font-black"
                >
                  <ShieldCheck size={20} /> ADMIN PANEL
                </button>
              )}
              <button
                onClick={() => {
                  setAboutOpen(true);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-[11px] font-black"
              >
                <Users size={20} className="text-purple-500" /> BİZİM HAQQIMIZDA
              </button>
              <button
                onClick={handleLogout}
                className="w-full p-4 text-[10px] font-black text-slate-500 hover:text-red-500 border border-white/5 rounded-2xl"
              >
                ÇIXIŞ ET
              </button>
            </div>
          </aside>
        </>
      )}

      {aboutOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#10141d] w-full max-w-lg rounded-3xl border border-white/10 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-amber-500 font-black italic uppercase">
                HAQQIMIZDA
              </h3>
              <button onClick={() => setAboutOpen(false)}>
                <X />
              </button>
            </div>
            <p className="text-slate-300">
              Tiflis Kazino - Azərbaycanın ən etibarlı onlayn kazinosu.
            </p>
          </div>
        </div>
      )}

      {depositOpen && user && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#10141d] w-full max-w-md rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-black uppercase text-sm">Balans Artır</h3>
              <button onClick={() => setDepositOpen(false)}>
                <X />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-slate-500 font-black uppercase">
                  Pulu bu karta göndərin:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-bold text-lg">
                    {adminSettings.adminCard}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(adminSettings.adminCard);
                      alert("Kopyalandı!");
                    }}
                    className="p-2 bg-white/5 rounded-xl"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {adminSettings.adminCardName}
                </span>
              </div>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Məbləğ (AZN)"
                className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none"
              />

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-black uppercase">
                  Çeki yükləyin:
                </span>
                <label className="flex items-center gap-3 w-full bg-black p-4 rounded-2xl border border-dashed border-white/20 cursor-pointer hover:border-amber-500 transition-colors">
                  <Upload size={20} className="text-slate-500" />
                  <span className="text-xs text-slate-400">
                    {depositFile ? depositFile.name : "Fayl seçin..."}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setDepositFile(e.target.files[0])}
                  />
                </label>
              </div>

              <button
                onClick={handleDepositSubmit}
                className="w-full bg-green-500 text-black py-5 rounded-2xl font-black text-sm uppercase"
              >
                {" "}
                SORĞU GÖNDƏR
              </button>
            </div>
          </div>
        </div>
      )}

      {walletMenuOpen && user && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-end">
          <div className="bg-[#10141d] w-full rounded-t-[40px] p-8 space-y-6 animate-in slide-in-from-bottom">
            <div className="grid grid-cols-2 gap-5">
              <button
                onClick={() => {
                  setWalletMenuOpen(false);
                  setDepositOpen(true);
                }}
                className="bg-green-500 text-black py-6 rounded-3xl font-black flex flex-col items-center gap-3"
              >
                <ArrowDownLeft size={28} /> DEPOZİT
              </button>
              <button
                onClick={() => {
                  if ((balance || 0) <= 0) {
                    alert(
                      "Çıxarış üçün əvvəl ən azı bir depozit təsdiqlənməlidir.",
                    );
                    return;
                  }
                  setWalletMenuOpen(false);
                  setWithdrawOpen(true);
                }}
                className="bg-red-600 text-white py-6 rounded-3xl font-black flex flex-col items-center gap-3"
              >
                <ArrowUpRight size={28} /> ÇIXARIŞ
              </button>
            </div>
            <button
              onClick={() => setWalletMenuOpen(false)}
              className="w-full bg-white/5 py-4 rounded-2xl text-slate-400 font-black uppercase"
            >
              Ləğv et
            </button>
          </div>
        </div>
      )}

      {withdrawOpen && user && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#10141d] w-full max-w-md rounded-3xl border border-white/10 p-6 space-y-5">
            <h3 className="font-black uppercase text-sm tracking-widest text-center">
              ÇIXARIŞ SORĞUSU
            </h3>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[10px] text-slate-500 font-black uppercase">
                Sizin Oyun Kodunuz
              </span>
              <span className="text-amber-500 font-black text-xl italic tracking-widest">
                {user?.gameCode || "Yoxdur"}
              </span>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                maxLength={16}
                value={withdrawCard}
                onChange={(e) => setWithdrawCard(e.target.value)}
                placeholder="Kartın 16 rəqəmi"
                className="w-full bg-black p-4 rounded-2xl border border-white/10 font-bold text-white"
              />
              <input
                type="text"
                placeholder="MM/YY"
                value={withdrawExpiry}
                onChange={(e) => setWithdrawExpiry(e.target.value)}
                className="w-full bg-black p-4 rounded-2xl border border-white/10 font-bold text-white"
              />
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <p className="text-[10px] text-amber-500 font-bold text-center uppercase">
                  Koddakı bütün vəsait göndəriləcək
                </p>
              </div>
            </div>
            <button
              onClick={handleWithdrawSubmit}
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-sm uppercase"
            >
              TƏSDİQLƏ
            </button>
            <button
              onClick={() => setWithdrawOpen(false)}
              className="w-full text-slate-500 text-[10px] font-bold uppercase"
            >
              Ləğv Et
            </button>
          </div>
        </div>
      )}

      {wheelOpen && user && (
        <div className="fixed inset-0 bg-black/95 z-[250] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#0f111a] w-full max-w-sm rounded-[32px] border border-white/10 p-6 flex flex-col items-center">
            <h3 className="text-lg font-black text-amber-500 uppercase italic mb-2">
              Pulsuz çarx
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-4">
              Yalnız 1 dəfə fırlada bilərsiniz
            </p>
            <div className="relative w-[260px] h-[260px] rounded-full overflow-hidden border-4 border-amber-500/30 shadow-2xl">
              <div
                className="absolute inset-0 rounded-full transition-transform duration-[4500ms] ease-out"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  background: `conic-gradient(${WHEEL_SEGMENTS.map((_, i) => {
                    const start = (i / WHEEL_SEGMENTS.length) * 360;
                    const end = ((i + 1) / WHEEL_SEGMENTS.length) * 360;
                    const col =
                      i === 6 || i === 7
                        ? "#22c55e"
                        : i % 2
                          ? "#b45309"
                          : "#f59e0b";
                    return `${col} ${start}deg ${end}deg`;
                  }).join(", ")})`,
                }}
              >
                {WHEEL_SEGMENTS.map((segment, i) => {
                  const angle =
                    (i * 360) / WHEEL_SEGMENTS.length +
                    360 / WHEEL_SEGMENTS.length / 2;
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 -ml-[50px] -mt-[130px] w-[100px] h-[130px] flex justify-center items-start pt-[14px] origin-bottom text-white font-black text-[11px] uppercase z-10 drop-shadow-md"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      {segment}
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-[18%] rounded-full bg-[#0f111a] border-2 border-amber-500/50 flex items-center justify-center">
                {wheelResult != null ? (
                  <span className="text-2xl font-black text-amber-500 uppercase">
                    {wheelResult}% bonus
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-slate-500 uppercase text-center">
                    Çarx
                  </span>
                )}
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 z-10" />
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-3 max-w-[260px]">
              {WHEEL_SEGMENTS.map((s, i) => (
                <span
                  key={i}
                  className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400"
                >
                  {s}
                </span>
              ))}
            </div>
            {wheelResult != null ? (
              <div className="mt-4 w-full space-y-2">
                <p className="text-center text-sm font-black text-green-500 uppercase">
                  Təbriklər! {wheelResult}% bonus qazandınız
                </p>
                <p className="text-[10px] text-slate-500 text-center">
                  Bonus növbəti təsdiqlənmiş depozitinizə tətbiq ediləcək
                </p>
                <button
                  onClick={() => {
                    setWheelOpen(false);
                    setWheelResult(null);
                  }}
                  className="w-full bg-amber-500 text-black py-3 rounded-xl font-black text-xs uppercase"
                >
                  Bağla
                </button>
              </div>
            ) : (
              <button
                onClick={handleWheelSpin}
                disabled={wheelSpinning}
                className="mt-4 w-full bg-amber-500 text-black py-3 rounded-xl font-black text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wheelSpinning ? "Fırlanır..." : "ÇARXI FIRLAT"}
              </button>
            )}
            <button
              onClick={() => {
                setWheelOpen(false);
                setWheelResult(null);
              }}
              className="mt-2 text-slate-500 text-[10px] font-bold uppercase"
            >
              Ləğv et
            </button>
          </div>
        </div>
      )}

      {authOpen && (
        <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0f111a] p-8 rounded-[40px] w-full max-w-sm border border-white/10 text-center relative overflow-hidden">
            <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4 uppercase">
              {isRegister ? "QEYDİYYAT" : "XOŞ GƏLMİSİNİZ!"}
            </h2>
            <button
              onClick={handleQuickEnter}
              className="w-full bg-white/10 border border-amber-500/50 text-amber-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest mb-6 hover:bg-amber-500/20 transition-colors"
            >
              1 KLİKLƏ DAXİL OL — Avtomatik hesab açılır
            </button>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-4">
              — və ya —
            </p>
            <div className="space-y-4 mb-6">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="İstifadəçi Adı"
                className="w-full bg-black/50 p-5 rounded-2xl border border-white/5 outline-none font-bold"
              />
              {isRegister && (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobil Nömrə"
                  className="w-full bg-black/50 p-5 rounded-2xl border border-white/5 outline-none font-bold"
                />
              )}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrə"
                className="w-full bg-black/50 p-5 rounded-2xl border border-white/5 outline-none font-bold"
              />
            </div>
            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em]"
            >
              {isRegister ? "QEYDİYYAT OL" : "GİRİŞ ET"}
            </button>

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="mt-6 text-amber-500 text-[10px] font-black uppercase tracking-widest block w-full"
            >
              {isRegister
                ? "HESABINIZ VAR? GİRİŞ EDİN"
                : "HESABINIZ YOXDUR? QEYDİYYAT"}
            </button>

            <button
              onClick={() => setAuthOpen(false)}
              className="mt-4 text-slate-500 text-[10px] font-bold uppercase"
            >
              Bağla
            </button>
          </div>
        </div>
      )}

      {/* GAME MODAL with IFRAME */}
      {gameModalOpen && (
        <div className="fixed inset-0 bg-black z-[400] flex flex-col animate-in fade-in duration-300">
          <header className="p-4 bg-[#0a0c12] border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGameModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl"
              >
                <X size={24} />
              </button>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase block leading-none">
                  SİZİN OYUN KODUNUZ
                </span>
                <span className="text-amber-500 font-bold text-lg tracking-[0.2em]">
                  {currentGameCode}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-white/5 rounded-xl"
              >
                <Zap size={18} />
              </button>
            </div>
          </header>
          <div className="flex-1 bg-white relative">
            <iframe
              src="https://fastloto365.com"
              className="w-full h-full border-none"
              title="Game Window"
            />
          </div>
        </div>
      )}
      {transactionsOpen && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#10141d] w-full max-w-lg rounded-[40px] border border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h3 className="font-black uppercase text-sm tracking-widest">
                Əməliyyatlar Tarixçəsi
              </h3>
              <button
                onClick={() => setTransactionsOpen(false)}
                className="p-2 bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {MockDataService.getTransactions()
                .filter((t) => t.username === user?.username)
                .reverse()
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${tx.type === "deposit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                        >
                          {tx.type === "deposit" ? "Depozit" : "Çıxarış"}
                        </span>
                        {tx.type === "deposit" && (
                          <p className="text-sm font-bold mt-1">
                            {tx.amount.toFixed(2)} ₼
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${
                            tx.status === "pending"
                              ? "text-amber-500"
                              : tx.status === "approved"
                                ? "text-green-500"
                                : "text-red-500"
                          }`}
                        >
                          {tx.status === "pending"
                            ? "Gözləyir"
                            : tx.status === "approved"
                              ? "Təsdiqləndi"
                              : "Rədd edildi"}
                        </span>
                        <p className="text-[9px] text-slate-500 mt-1">
                          {new Date(tx.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {tx.status === "rejected" && tx.reason && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-[10px] font-black text-red-500 uppercase mb-1">
                          Rədd Səbəbi:
                        </p>
                        <p className="text-xs text-slate-300 italic">
                          {tx.reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              {MockDataService.getTransactions().filter(
                (t) => t.username === user?.username,
              ).length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <Info size={40} className="mx-auto text-slate-700" />
                  <p className="text-slate-500 font-bold italic">
                    Hələ heç bir əməliyyat yoxdur.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {pendingDeposit && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="bg-[#0f111a] w-full max-w-sm rounded-[48px] border border-white/10 p-10 text-center space-y-8 animate-in zoom-in duration-300">
            {pendingDeposit.status === "pending" && (
              <>
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                    <Clock size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase italic tracking-widest">
                    ÖDƏNİŞİNİZ YOXLANILIR
                  </h3>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed px-4">
                    Zəhmət olmasa gözləyin. Admin tərəfindən ödənişiniz
                    təsdiqlənən kimi balansınız yenilənəcək.
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">
                    Məbləğ
                  </p>
                  <p className="text-xl font-black text-white">
                    {pendingDeposit.amount.toFixed(2)} ₼
                  </p>
                </div>
                <button
                  onClick={() => setPendingDeposit(null)}
                  className="w-full bg-white/5 text-slate-400 py-4 mt-2 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  BAĞLA (GÖZLƏMƏDƏN ÇIX)
                </button>
              </>
            )}

            {pendingDeposit.status === "approved" && (
              <>
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 animate-in zoom-in duration-500">
                  <CheckCircle size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase italic tracking-widest text-green-500">
                    TƏSDİQLƏNDİ!
                  </h3>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">
                    Ödənişiniz uğurla tamamlandı. Artıq balansınızdan istifadə
                    edə bilərsiniz.
                  </p>
                </div>
                <button
                  onClick={() => setPendingDeposit(null)}
                  className="w-full bg-green-500 text-black py-5 rounded-3xl font-black text-xs uppercase tracking-widest"
                >
                  BAŞLA
                </button>
              </>
            )}

            {pendingDeposit.status === "rejected" && (
              <>
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 animate-in zoom-in duration-500">
                  <X size={48} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase italic tracking-widest text-red-500">
                      RƏDD EDİLDİ
                    </h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase">
                      Təəssüf ki, sorğunuz qəbul edilmədi.
                    </p>
                  </div>
                  {pendingDeposit.reason && (
                    <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-3xl">
                      <p className="text-[10px] text-red-500 font-black uppercase mb-1">
                        Səbəb:
                      </p>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        {pendingDeposit.reason}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setPendingDeposit(null)}
                  className="w-full bg-white/5 text-slate-400 py-5 rounded-3xl font-black text-xs uppercase tracking-widest"
                >
                  BAĞLA
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  );
}
