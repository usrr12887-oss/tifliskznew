import React, { useState, useEffect, useMemo } from "react";
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
  Award,
  Bell,
  Zap,
  Trophy,
  MessageCircle
} from "lucide-react";

/* ================= OYUNLAR DATA ================= */
const CASINO_IMAGES = [
  { id: 1, title: "Rich Fruits", category: "slots", img: "/images/rich-fruits.png" },
  { id: 2, title: "Sevens on Fire", category: "slots", img: "/images/sevens-on-fire.png" },
  { id: 3, title: "Hot Sevens", category: "slots", img: "/images/hot-sevens.png" },
  { id: 4, title: "Fire Rage", category: "slots", img: "/images/fire-rage.png" },
  { id: 5, title: "Extra Super 7", category: "slots", img: "/images/extra-super-7.png" },
  { id: 6, title: "Sizzling Hot", category: "slots", img: "/images/sizzling-hot.png" },
  { id: 7, title: "Golden Scatter", category: "crash", img: "/images/golden-scatter.png" },
  { id: 8, title: "Hot Sevens Extreme", category: "slots", img: "/images/hot-sevens-extreme.png" },
  { id: 9, title: "Lady Luck", category: "classic", img: "/images/lady-luck.png" },
  { id: 10, title: "Ultra 7 Hot", category: "slots", img: "/images/ultra-7-hot.png" },
  { id: 11, title: "Always Cherry", category: "slots", img: "/images/always-cherry.png" },
  { id: 12, title: "Aztec Century", category: "slots", img: "/images/aztec-century.png" },
  { id: 13, title: "Hot Slot", category: "slots", img: "/images/hot-slot.png" },
  { id: 14, title: "Fortune Star", category: "slots", img: "/images/fortune-star.png" },
  { id: 15, title: "Simple Diamond", category: "slots", img: "/images/simple-diamond.png" },
  { id: 16, title: "Joker's Fruit", category: "slots", img: "/images/jokers-fruit.png" },
  { id: 17, title: "Hit Jewels", category: "slots", img: "/images/hit-jewels.png" },
  { id: 18, title: "King of Jewels", category: "classic", img: "/images/king-of-jewels.png" },
  { id: 19, title: "Roll of Ramses", category: "slots", img: "/images/roll-of-ramses.jpg" },
  { id: 20, title: "Scatter Wins", category: "slots", img: "/images/scatter-wins.png" },
  { id: 21, title: "Tropical Fruits", category: "slots", img: "/images/tropical-fruits.png" },
];

const CATEGORIES = [
  { id: "all", label: "Hamısı", icon: <Zap size={18}/> },
  { id: "slots", label: "Slotlar", icon: < Zap size={18}/> },
  { id: "crash", label: "Crash", icon: < Zap size={18}/> },
  { id: "classic", label: "Klassik", icon: < Zap size={18}/> },
  { id: "live", label: "Canlı", icon: < Zap size={18}/> },
];

export default function App() {
  /* --- UI & AUTH STATES --- */
  const [activeCategory, setActiveCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  /* --- JACKPOTS & LIVE WIN STATES --- */
  const [smallJP, setSmallJP] = useState(320);
  const [mediumJP, setMediumJP] = useState(820);
  const [bigJP, setBigJP] = useState(1520);
  const [liveWin, setLiveWin] = useState({ name: "Kamran", game: "Aviator", amount: 125 });

  /* --- MODALS & FORMS STATES --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState("card");
  const [depositAmount, setDepositAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawCard, setWithdrawCard] = useState("");

  /* ================= EFFECTS ================= */
  
  useEffect(() => {
    const t = setInterval(() => {
      setSmallJP((j) => (j >= 500 ? 200 : j + Math.floor(Math.random() * 3)));
      setMediumJP((j) => (j >= 1000 ? 700 : j + Math.floor(Math.random() * 4)));
      setBigJP((j) => (j >= 5000 ? 1200 : j + Math.floor(Math.random() * 10)));
    }, 3000);
    return () => clearInterval(t);
  }, []);

useEffect(() => {
  const names = [
    "Elvin", "Leyla", "Murad", "Aysel", "Samir", "Rəşad", "Zaur", "Fidan", "Orxan", "Günel",
    "Vüsal", "Nigar", "Anar", "Nərmin", "Emin", "Sevinc", "İlqar", "Könül", "Rauf", "Arzu",
    "Tural", "Aytən", "Elnur", "Lalə", "Pərviz", "Gülşən", "Ceyhun", "Fəridə", "Ramil", "Səbinə",
    "Fuad", "Nailə", "Kamran", "Zeynəb", "Ayxan", "Aydan", "Nicat", "Məryəm", "Aqil", "Türkan",
    "Şahin", "Nisə", "Rüstəm", "Validə", "Tahir", "Nuranə", "Eldar", "Fidan", "Fariz", "Səid"
  ];
  const games = ["Rich Fruits", "Hot Sevens", "Lady Luck", "Sevens on Fire", "Roulette", "Sizzling Hot", "Fire Rage", "Extra Super 7"];
  
  const interval = setInterval(() => {
    // 80% şansla 100-900 AZN, 20% şansla 1000-5000 AZN uduş
    const isBigWin = Math.random() > 0.8;
    const amount = isBigWin 
      ? Math.floor(Math.random() * 4000) + 1000 
      : Math.floor(Math.random() * 800) + 100;

    setLiveWin({
      name: names[Math.floor(Math.random() * names.length)],
      game: games[Math.floor(Math.random() * games.length)],
      amount: amount
    });
  }, 4000); // Yenilənmə sürəti
  return () => clearInterval(interval);
}, []);;

  /* ================= FUNCTIONS ================= */
  const filteredGames = useMemo(() => {
    return CASINO_IMAGES.filter((g) => {
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleCopyCard = () => {
    navigator.clipboard.writeText("4189 8000 8638 3815");
    alert("Kart nömrəsi kopyalandı!");
  };

  const handleDepositSubmit = () => {
    if (!depositAmount || depositAmount <= 0) return alert("Məbləği daxil edin.");
    setBalance(prev => prev + parseFloat(depositAmount));
    setDepositOpen(false);
    setDepositAmount("");
    setReceiptFile(null);
    alert("Balansınız yeniləndi!");
  };

  const handleWithdrawSubmit = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt > balance) return alert("Balans kifayət deyil.");
    setBalance(prev => prev - amt);
    setWithdrawOpen(false);
    setWithdrawAmount("");
    alert("Çıxarış sorğusu qəbul edildi.");
  };

  return (
    <div className="h-screen bg-[#05070a] text-white flex flex-col overflow-hidden font-sans relative">
      
      {/* 1. HEADER */}
      <header className="px-5 py-4 bg-[#0a0c12]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center z-50 sticky top-0">
        <div className="flex flex-col">
          <h2 className="font-black text-amber-500 italic text-2xl tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">YETIMLER</h2>
          <span className="text-[7px] font-black text-amber-500/50 uppercase tracking-[0.3em] -mt-1">Premium Casino</span>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <div onClick={() => setWalletMenuOpen(true)} className="bg-white/5 pl-4 pr-1 py-1 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block uppercase font-black leading-none">{user.username}</span>
                <span className="text-amber-500 font-bold text-sm leading-tight">{balance.toFixed(2)} ₼</span>
              </div>
              <div className="bg-amber-500 p-1.5 rounded-xl text-black">
                <Wallet size={14} />
              </div>
            </div>
            <button className="relative p-2 text-slate-400">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0c12]"></span>
            </button>
          </div>
        ) : (
          <button onClick={() => setAuthOpen(true)} className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all">GİRİŞ</button>
        )}
      </header>

  {/* 2. CANLI UDUŞLAR (ƏN YUXARIDA) */}
<div className="bg-black/40 backdrop-blur-md border-b border-white/5 py-2.5 px-4 flex items-center justify-between z-40 relative group cursor-default">
  <div className="flex items-center gap-2 shrink-0">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Canlı Uduşlar</span>
  </div>
  
  <div key={`${liveWin.name}-${liveWin.amount}`} className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-500">
    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
       <span className="text-[10px] font-bold text-white/90">{liveWin.name}</span>
       <div className="w-1 h-1 bg-white/20 rounded-full"></div>
       <span className="text-[9px] text-amber-500/80 font-black uppercase tracking-tighter">
         {liveWin.game}
       </span>
    </div>
    <span className="text-xs font-black text-green-400 tracking-tight">
      +{liveWin.amount.toLocaleString()} ₼
    </span>
  </div>
</div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* HERO BANNER */}
        <div className="px-4 pt-4">
          <div className="relative h-44 w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-amber-600 to-amber-900 shadow-2xl shadow-amber-900/20 group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596838132731-dd9ce7497b5b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="relative h-full p-6 flex flex-col justify-end">
              <span className="text-[10px] font-black bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full mb-2 uppercase tracking-widest text-white border border-white/20">Xoş Gəldin Bonusu</span>
              <h1 className="text-2xl font-black text-white italic tracking-tighter leading-tight mb-1 uppercase">İLK DEPOZİTƏ <br/><span className="text-amber-400">+100% BONUS</span></h1>
              <p className="text-[10px] text-white/60 font-medium">Uduş şansını ikiqat artır!</p>
            </div>
            <div className="absolute top-4 right-6 animate-bounce">
                <Zap size={32} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            </div>
          </div>
        </div>

        {/* JACKPOTLAR */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0f111a] p-4 rounded-3xl border border-white/5 text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                <span className="text-[8px] font-black text-amber-600/60 uppercase block mb-1 tracking-widest">Mini</span>
                <span className="text-lg font-black text-white group-hover:scale-110 transition-transform duration-300 block">{smallJP.toLocaleString()} ₼</span>
            </div>
            <div className="bg-[#0f111a] p-4 rounded-3xl border border-white/5 text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                <span className="text-[8px] font-black text-cyan-500/60 uppercase block mb-1 tracking-widest">Middle</span>
                <span className="text-lg font-black text-white group-hover:scale-110 transition-transform duration-300 block">{mediumJP.toLocaleString()} ₼</span>
            </div>
            <div className="bg-[#0f111a] p-4 rounded-3xl border border-red-500/20 text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                <span className="text-[8px] font-black text-red-500 uppercase block mb-1 tracking-widest animate-pulse">Mega</span>
                <span className="text-xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{bigJP.toLocaleString()} ₼</span>
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                  activeCategory === cat.id 
                  ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20" 
                  : "bg-[#0f111a] border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 mb-6">
          <div className="relative group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Minlərlə oyun arasından axtar..." 
              className="w-full bg-[#0f111a] border border-white/5 rounded-[20px] py-4.5 pl-14 pr-4 text-sm outline-none focus:border-amber-500/20 focus:ring-1 focus:ring-amber-500/10 transition-all placeholder:text-slate-600 font-medium"
            />
          </div>
        </div>

        {/* GAMES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4 overflow-hidden">
          {filteredGames.length > 0 ? filteredGames.map((g) => (
            <div key={g.id} className="group relative rounded-[24px] overflow-hidden border border-white/5 bg-[#0a0c12] active:scale-95 transition-all duration-300">
              <div className="aspect-[4/5] relative">
                <img src={g.img} alt={g.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col items-center">
                 <div className="h-0.5 w-8 bg-amber-500 mb-2 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
                 <p className="text-[11px] font-black text-white uppercase tracking-tight text-center truncate w-full">{g.title}</p>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                 <button className="bg-amber-500 text-black px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">OYNA</button>
              </div>
            </div>
          )) : (
            <div className="col-span-2 py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                 <Search size={24} className="text-slate-600" />
               </div>
               <p className="text-sm text-slate-500 font-medium tracking-tight">Heç bir oyun tapılmadı</p>
            </div>
          )}
        </div>

        {/* PROVIDERS SECTION */}
        <div className="mt-12 px-6 pb-12 opacity-30">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-center mb-6">Partnyor Provayderlər</p>
           <div className="flex flex-wrap justify-center gap-8 grayscale brightness-200">
              <div className="h-4 w-16 bg-white/20 rounded-sm"></div>
              <div className="h-4 w-20 bg-white/20 rounded-sm"></div>
              <div className="h-4 w-12 bg-white/20 rounded-sm"></div>
              <div className="h-4 w-24 bg-white/20 rounded-sm"></div>
              <div className="h-4 w-14 bg-white/20 rounded-sm"></div>
           </div>
        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION - APP-LIKE GLASSMORPHISM */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0a0c12]/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center py-3 z-50 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        
        <button onClick={() => {setSidebarOpen(false); window.scrollTo({top: 0, behavior: 'smooth'})}} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-amber-500 transition-all active:scale-90">
          <Home size={22}/><span className="text-[9px] font-black uppercase tracking-wider">Əsas</span>
        </button>

        <div className="relative -top-6">
            <button 
                onClick={() => setWalletMenuOpen(true)} 
                className="bg-gradient-to-br from-amber-400 to-amber-600 p-4.5 rounded-[24px] shadow-[0_10px_25px_rgba(245,158,11,0.4)] border-4 border-[#05070a] transform active:scale-95 transition-all duration-300 relative group"
            >
                <div className="absolute inset-0 bg-white/20 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Wallet size={24} className="text-black" />
            </button>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-500 uppercase tracking-widest whitespace-nowrap">
                Cüzdan
            </span>
        </div>

        <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-white transition-all active:scale-90">
          <Menu size={22}/><span className="text-[9px] font-black uppercase tracking-wider">Menü</span>
        </button>
      </div>

      {/* MODALS (SIDEBAR, ABOUT, DEPOSIT, WITHDRAW, PROFILE, AUTH) */}
      
      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" />
          <aside className="fixed left-0 top-0 h-full w-80 bg-[#0a0c12] z-[70] flex flex-col border-r border-white/10 animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-amber-500 italic leading-none">YETIMLER</h1>
                <span className="text-[8px] font-black text-amber-500/30 uppercase tracking-widest mt-1">Menu Browser</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              ><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <div className="pb-4">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-2">İstifadəçi Bölməsi</p>
                <button onClick={() => {setProfileOpen(true); setSidebarOpen(false);}} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-[11px] font-black hover:bg-white/10 transition-all border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-2 rounded-xl text-blue-500"><Info size={18}/></div>
                    MƏNİM HESABIM
                  </div>
                  <Zap size={14} className="text-slate-700" />
                </button>
              </div>

              <div className="pb-4">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-2">Maliyyə Əməliyyatları</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => {setDepositOpen(true); setSidebarOpen(false);}} className="flex flex-col items-center gap-2 p-4 bg-green-500/10 text-green-500 rounded-2xl text-[10px] font-black border border-green-500/10 hover:bg-green-500/20 transition-all">
                    <ArrowDownLeft size={20}/> DEPOZİT
                  </button>
                  <button onClick={() => {setWithdrawOpen(true); setSidebarOpen(false);}} className="flex flex-col items-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black border border-red-500/10 hover:bg-red-500/20 transition-all">
                    <ArrowUpRight size={20}/> ÇIXARIŞ
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-2">Məlumat</p>
                <button onClick={() => {setAboutOpen(true); setSidebarOpen(false);}} className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-[11px] font-black hover:bg-white/10 transition-all border border-white/5 mb-2">
                  <Users size={20} className="text-purple-500"/> BİZİM HAQQIMIZDA
                </button>
                <button className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-[11px] font-black hover:bg-white/10 transition-all border border-white/5">
                   <ShieldCheck size={20} className="text-amber-500"/> TƏHLÜKƏSİZLİK
                </button>
              </div>

              {/* VIP CARD MENTION */}
              <div className="mt-8 relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform duration-700">
                    <Award size={80} />
                 </div>
                 <h4 className="text-xs font-black text-white mb-1 uppercase italic">YETIMLER VIP</h4>
                 <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Özəl bonuslar və sürətli çıxarışlar üçün VIP statusu əldə edin.</p>
                 <button className="text-[9px] font-black text-amber-500 uppercase tracking-widest underline decoration-2 underline-offset-4">Ətraflı Öyrən</button>
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
               <button onClick={() => {setUser(null); setSidebarOpen(false);}} className="w-full py-4 text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2">
                 <X size={16}/> ÇIXIŞ ET
               </button>
            </div>
          </aside>
        </>
      )}

      {/* HAQQIMIZDA */}
      {aboutOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#10141d] w-full max-w-lg rounded-3xl border border-white/10 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
               <h3 className="text-amber-500 font-black italic">BİZİM HAQQIMIZDA</h3>
               <button onClick={() => setAboutOpen(false)}><X /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 text-sm text-slate-300">
               <p>2018-ci ildən fəaliyyət göstərən Yetimler Casino, regionun ən etibarlı və şəffaf platformasıdır.</p>
               <div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-3">
                  <h4 className="text-white font-black flex items-center gap-2"><ShieldCheck size={20} className="text-green-500"/> LİSENZİYA</h4>
                  <p>Lisenziya: Curacao No. 8048/JAZ. SSL şifrələmə ilə qorunur.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* DEPOZIT */}
      {depositOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#10141d] w-full max-w-md rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h3 className="font-black uppercase text-sm">Balans Artır</h3>
              <button onClick={() => setDepositOpen(false)}><X /></button>
            </div>
            <div className="flex p-3 gap-2 bg-black/40">
              <button onClick={() => setDepositMethod('card')} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${depositMethod === 'card' ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'}`}>BANK KARTI</button>
              <button onClick={() => setDepositMethod('c2c')} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${depositMethod === 'c2c' ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'}`}>KARTDAN KARTA</button>
            </div>
            <div className="p-6 space-y-5">
              <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="Məbləğ (AZN)" className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none" />
              {depositMethod === 'card' ? (
                <div className="space-y-4">
                  <input placeholder="Kart Nömrəsi" className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none" />
                  <div className="flex gap-3"><input placeholder="MM/YY" className="flex-1 bg-black p-4 rounded-2xl border border-white/10 outline-none" /><input placeholder="CVV" className="flex-1 bg-black p-4 rounded-2xl border border-white/10 outline-none" /></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 bg-amber-500/5 border border-dashed border-amber-500/30 rounded-2xl flex justify-between items-center">
                    <span className="font-mono text-amber-500 font-bold tracking-widest">4189 8000 8638 3815</span>
                    <button onClick={handleCopyCard} className="p-3 bg-amber-500 text-black rounded-xl"><Copy size={18}/></button>
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer">
                    <span className="text-[10px] font-black text-slate-500 uppercase">{receiptFile || "Qəbzi yükləyin"}</span>
                    <input type="file" className="hidden" onChange={e => setReceiptFile(e.target.files[0]?.name)} />
                  </label>
                </div>
              )}
              <button onClick={handleDepositSubmit} className="w-full bg-green-500 text-black py-5 rounded-2xl font-black text-sm uppercase">TƏSDİQLƏ</button>
            </div>
          </div>
        </div>
      )}

      {/* CÜZDAN QUICK MENU */}
      {walletMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-end">
          <div className="bg-[#10141d] w-full rounded-t-[40px] p-8 space-y-6 border-t border-white/10 animate-in slide-in-from-bottom">
            <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto" />
            <div className="grid grid-cols-2 gap-5">
              <button onClick={() => { setWalletMenuOpen(false); setDepositOpen(true); }} className="bg-green-500 text-black py-6 rounded-3xl font-black flex flex-col items-center gap-3">
                <ArrowDownLeft size={28}/> DEPOZİT
              </button>
              <button onClick={() => { setWalletMenuOpen(false); setWithdrawOpen(true); }} className="bg-red-600 text-white py-6 rounded-3xl font-black flex flex-col items-center gap-3">
                <ArrowUpRight size={28}/> ÇIXARIŞ
              </button>
            </div>
            <button onClick={() => setWalletMenuOpen(false)} className="w-full bg-white/5 py-4 rounded-2xl text-slate-400 font-black uppercase">Ləğv et</button>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {withdrawOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#10141d] w-full max-w-md rounded-3xl border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-black uppercase text-sm tracking-widest">Vəsait Çıxarışı</h3>
                <button onClick={() => setWithdrawOpen(false)}><X size={18}/></button>
            </div>
            <div className="p-5 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl border border-amber-500/20 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Mövcud Balans</p>
              <p className="text-3xl font-black text-amber-500">{balance.toFixed(2)} ₼</p>
            </div>
            <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Məbləğ" className="w-full bg-black p-4 rounded-2xl border border-white/10 font-black text-lg text-white" />
            <input value={withdrawCard} onChange={e => setWithdrawCard(e.target.value)} placeholder="Sizin Kart Nömrəniz" className="w-full bg-black p-4 rounded-2xl border border-white/10 font-mono text-center" />
            <button onClick={handleWithdrawSubmit} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-sm uppercase shadow-lg shadow-red-900/40">ÇIXARIŞI TƏSDİQLƏ</button>
          </div>
        </div>
      )}

      {/* PROFILE INFO MODAL */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#10141d] w-full max-w-md rounded-3xl border border-white/10 p-8 relative">
            <button onClick={() => setProfileOpen(false)} className="absolute top-6 right-6 text-slate-500"><X size={20}/></button>
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center text-black font-black text-3xl">
                    {user?.username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-white uppercase">{user?.username}</h3>
                <p className="text-xs text-green-500 font-bold uppercase tracking-widest">VIP Hesab</p>
            </div>
            <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase">İstifadəçi ID</span>
                    <span className="font-mono font-bold">#YM-{Math.floor(Math.random()*900000)+100000}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Ümumi Balans</span>
                    <span className="font-bold text-amber-500">{balance.toFixed(2)} AZN</span>
                </div>
            </div>
            <button onClick={() => {setUser(null); setProfileOpen(false);}} className="w-full mt-8 text-red-500 text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all">Çıxış Et</button>
          </div>
        </div>
      )}

      {/* AUTH MODAL - PREMIUM DESIGN */}
      {authOpen && (
        <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0f111a] p-8 rounded-[40px] w-full max-w-sm border border-white/10 text-center relative overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent -z-10"></div>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
            
            <div className="mb-10 mt-4">
              <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                 <Zap size={32} className="text-amber-500 fill-amber-500/20" />
              </div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">XOŞ GƏLMİSİNİZ!</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Yetimler Casino Premium</p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="relative group">
                <input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="İstifadəçi Adı" 
                  className="w-full bg-black/50 p-5 rounded-2xl border border-white/5 outline-none focus:border-amber-500/40 focus:ring-4 focus:ring-amber-500/5 font-bold transition-all text-sm placeholder:text-slate-700" 
                />
              </div>
              <button 
                onClick={() => {if(username){setUser({username}); setAuthOpen(false);}}} 
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                GİRİS ETMƏK
              </button>
              
              <div className="pt-4 flex flex-col gap-4">
                 <div className="h-[1px] bg-white/5 w-full"></div>
                 <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">və ya sosial şəbəkə ilə</p>
                 <div className="flex justify-center gap-4">
                    <button className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><Zap size={20} className="text-slate-400" /></button>
                    <button className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><MessageCircle size={20} className="text-slate-400" /></button>
                 </div>
              </div>
            </div>
            
            <button onClick={() => setAuthOpen(false)} className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors"><X size={20}/></button>
          </div>
        </div>
      )}

    
      
      {/* FLOATING SUPPORT BUTTON */}
      <div className="fixed bottom-24 right-5 z-[60]">
        <button className="w-14 h-14 bg-amber-500 rounded-2xl shadow-2xl shadow-amber-500/40 flex items-center justify-center text-black active:scale-95 transition-all group overflow-hidden relative">
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
           <MessageCircle size={28} className="relative z-10" />
           <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#05070a] rounded-full"></span>
        </button>
      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; font-family: 'Outfit', sans-serif; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
