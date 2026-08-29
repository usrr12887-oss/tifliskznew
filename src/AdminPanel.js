import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MockDataService } from "./services/MockDataService";
import BotTab from "./admin/BotTab";
import RedirectTab from "./admin/RedirectTab";
import ReportTab from "./admin/ReportTab";
import PushTab from "./admin/PushTab";

const API = "http://localhost:3001/api/admin";
const DEFAULT_PASS = "admin123";

function StatCard({ label, value, color = "amber" }) {
  const colors = {
    amber: "border-amber-500/30 text-amber-400",
    green: "border-green-500/30 text-green-400",
    red: "border-red-500/30 text-red-400",
    blue: "border-blue-500/30 text-blue-400",
  };
  return (
    <div className={`bg-[#0f111a] border rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_ok") === "1");
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [txs, setTxs] = useState([]);
  const [settings, setSettings] = useState({ adminCard: "", adminCardName: "", paymentType: "card" });
  const [editUser, setEditUser] = useState(null);
  const [newCode, setNewCode] = useState("");
  const [newBal, setNewBal] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [approveCodes, setApproveCodes] = useState({});
  // Şifrə dəyişmə
  const [passTab, setPassTab] = useState({ cur: "", n1: "", n2: "" });
  const [localPass, setLocalPass] = useState(() => sessionStorage.getItem("admin_pass") || DEFAULT_PASS);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const reload = () => {
    setUsers(MockDataService.getUsers());
    setTxs(MockDataService.getTransactions());
    const s = MockDataService.getAdminSettings();
    setSettings(s || { adminCard: "", adminCardName: "", paymentType: "card" });
  };

  useEffect(() => { if (authed) reload(); }, [authed]);

  const login = () => {
    if (pass === localPass) {
      sessionStorage.setItem("admin_ok", "1");
      setAuthed(true);
    } else alert("Şifrə yanlışdır!");
  };

  if (!authed) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
      <div className="bg-[#0f111a] rounded-3xl border border-white/10 p-8 w-full max-w-sm space-y-4">
        <h1 className="text-amber-500 font-black text-xl uppercase italic text-center">Admin Panel</h1>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="Admin şifrəsi" className="w-full bg-black p-4 rounded-xl border border-white/10 text-white outline-none" />
        <button onClick={login} className="w-full bg-amber-500 text-black py-4 rounded-xl font-black uppercase">GİRİŞ</button>
        <button onClick={() => navigate("/")} className="w-full text-slate-500 text-xs">← Sayta Qayıt</button>
      </div>
    </div>
  );

  const stats = MockDataService.getFinanceStats();
  const filteredTxs = txs
    .filter(t => filterStatus === "all" || t.status === filterStatus)
    .filter(t => !search || t.username?.toLowerCase().includes(search.toLowerCase()))
    .slice().reverse();

  const filteredUsers = users.filter(u =>
    !search || u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const approveLocal = (txId, code) => {
    MockDataService.updateTransactionStatus(txId, "approved", null, code || "ADMIN");
    showToast("✅ Təsdiqləndi");
    reload();
  };

  const rejectLocal = (txId) => {
    MockDataService.updateTransactionStatus(txId, "rejected", "Admin tərəfindən ləğv edildi");
    showToast("❌ Rədd edildi");
    reload();
  };

  const blockUser = (uid, duration) => {
    const u = users.find(x => x.id === uid);
    if (!u) return;
    const all = MockDataService.getUsers();
    const until = duration === "perm" ? null : Date.now() + duration * 60 * 1000;
    const updated = all.map(x => x.id === uid ? { ...x, blockedUntil: until, blocked: true } : x);
    localStorage.setItem("casino_mock_users", JSON.stringify(updated));
    showToast(`🔒 ${u.username} bloklandı`);
    reload();
  };

  const unblockUser = (uid) => {
    const all = MockDataService.getUsers();
    const updated = all.map(x => x.id === uid ? { ...x, blockedUntil: undefined, blocked: false } : x);
    localStorage.setItem("casino_mock_users", JSON.stringify(updated));
    showToast("✅ Blok açıldı");
    reload();
  };

  const saveCode = () => {
    if (!editUser || !newCode) return;
    MockDataService.assignCodeToUser(editUser.id, newCode);
    showToast("✅ Oyun kodu verildi");
    setEditUser(null); setNewCode(""); reload();
  };

  const saveBal = () => {
    if (!editUser) return;
    const diff = parseFloat(newBal) - (editUser.balance || 0);
    MockDataService.updateUserBalance(editUser.id, diff);
    showToast("✅ Balans yeniləndi");
    setEditUser(null); setNewBal(""); reload();
  };

  const saveSettings = () => {
    MockDataService.updateAdminSettings(settings);
    showToast("✅ Ayarlar saxlandı");
  };

  const changePassword = async () => {
    if (!passTab.cur || !passTab.n1 || !passTab.n2) return showToast("⚠️ Bütün xanaları doldurun");
    if (passTab.n1 !== passTab.n2) return showToast("⚠️ Yeni şifrələr uyğun gəlmir");
    if (passTab.n1.length < 4) return showToast("⚠️ Şifrə ən az 4 simvol");
    // Backend-ə göndər
    try {
      const r = await fetch(`${API}/change-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPass: passTab.cur, newPass: passTab.n1 })
      }).then(r => r.json());
      if (r.ok) {
        setLocalPass(passTab.n1);
        sessionStorage.setItem("admin_pass", passTab.n1);
        setPassTab({ cur: "", n1: "", n2: "" });
        showToast("✅ Şifrə dəyişdirildi");
      } else showToast("❌ " + r.error);
    } catch (_) {
      // Offline: yalnız lokal dəyiş
      if (passTab.cur !== localPass) return showToast("❌ Cari şifrə yanlışdır");
      setLocalPass(passTab.n1);
      sessionStorage.setItem("admin_pass", passTab.n1);
      setPassTab({ cur: "", n1: "", n2: "" });
      showToast("✅ Şifrə dəyişdirildi (lokal)");
    }
  };

  const TABS = [
    { id: "dashboard",    label: "📊 Dashboard" },
    { id: "transactions", label: "💳 Əməliyyatlar" },
    { id: "users",        label: "👥 İstifadəçilər" },
    { id: "report",       label: "📈 Hesabat" },
    { id: "push",         label: "🔔 Bildiriş" },
    { id: "bot",          label: "🤖 Bot" },
    { id: "redirect",     label: "🌐 Redirect" },
    { id: "settings",     label: "⚙️ Ayarlar" },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-[#1a1f2e] border border-white/10 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#0a0c12]/90 backdrop-blur border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 font-black text-xl italic">TIFLIS</span>
          <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-black uppercase">Admin</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/")} className="text-slate-500 text-xs font-bold px-3 py-2 bg-white/5 rounded-xl">← Sayt</button>
          <button onClick={() => { sessionStorage.removeItem("admin_ok"); setAuthed(false); }} className="text-red-400 text-xs font-bold px-3 py-2 bg-red-500/10 rounded-xl">Çıxış</button>
        </div>
      </header>

      {/* Nav */}
      <nav className="flex gap-1 px-6 pt-4 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); reload(); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${tab === t.id ? "bg-amber-500 text-black" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="p-6 space-y-6 max-w-5xl mx-auto">

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase text-slate-300">Ümumi Hesabat</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Ümumi Depozit" value={`${stats.totalDeposits?.toFixed(0)} ₼`} color="green" />
              <StatCard label="Ümumi Çıxarış" value={`${stats.totalWithdrawals?.toFixed(0)} ₼`} color="red" />
              <StatCard label="Xalis Gəlir" value={`${stats.netProfit?.toFixed(0)} ₼`} color="amber" />
              <StatCard label="Gözləyən" value={stats.pendingCount} color="blue" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="İstifadəçi sayı" value={users.length} color="blue" />
              <StatCard label="Əməliyyat sayı" value={txs.length} color="amber" />
              <StatCard label="Təsdiqlənmiş" value={stats.approvedCount} color="green" />
            </div>

            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4">
              <h3 className="text-xs font-black uppercase text-slate-500 mb-3">Son 5 Əməliyyat</h3>
              <div className="space-y-2">
                {txs.slice().reverse().slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-white">{tx.username}</span>
                      <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded ${tx.type === "deposit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {tx.type === "deposit" ? "Depozit" : "Çıxarış"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400">{Number(tx.amount).toFixed(2)} ₼</span>
                      <span className={`block text-[9px] font-black uppercase ${tx.status === "approved" ? "text-green-400" : tx.status === "pending" ? "text-amber-400" : "text-red-400"}`}>
                        {tx.status === "approved" ? "Təsdiqləndi" : tx.status === "pending" ? "Gözləyir" : "Rədd"}
                      </span>
                    </div>
                  </div>
                ))}
                {txs.length === 0 && <p className="text-slate-600 text-xs text-center py-4">Əməliyyat yoxdur</p>}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === "transactions" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <h2 className="text-lg font-black uppercase text-slate-300 flex-1">Əməliyyatlar</h2>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İstifadəçi axtar..."
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none w-40" />
              {["all", "pending", "approved", "rejected"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase ${filterStatus === s ? "bg-amber-500 text-black" : "bg-white/5 text-slate-400"}`}>
                  {s === "all" ? "Hamısı" : s === "pending" ? "Gözləyir" : s === "approved" ? "Təsdiqlənmiş" : "Rədd"}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredTxs.map(tx => {
                const code = approveCodes[tx.id] || "";
                return (
                  <div key={tx.id} className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-white">{tx.username}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${tx.type === "deposit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {tx.type === "deposit" ? "📥 Depozit" : "📤 Çıxarış"}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${tx.status === "approved" ? "bg-green-500/10 text-green-400" : tx.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
                            {tx.status === "approved" ? "✅ Təsdiqləndi" : tx.status === "pending" ? "⏳ Gözləyir" : "❌ Rədd"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{new Date(tx.date).toLocaleString()}</p>
                        {tx.cardNumber && <p className="text-[11px] text-slate-400">💳 {tx.cardNumber} / {tx.expiryDate}</p>}
                        {tx.backendRequestId && <p className="text-[9px] text-slate-600">ID: {tx.backendRequestId}</p>}
                      </div>
                      <span className="text-xl font-black text-amber-400">{Number(tx.amount).toFixed(2)} ₼</span>
                    </div>
                    {tx.status === "pending" && (
                      <div className="flex gap-2 flex-wrap">
                        <input value={code} onChange={e => setApproveCodes(prev => ({...prev, [tx.id]: e.target.value}))}
                          placeholder="Oyun kodu (depozit üçün)"
                          className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs outline-none min-w-[140px]" />
                        <button onClick={() => approveLocal(tx.id, code)}
                          className="bg-green-500 text-black px-4 py-2 rounded-xl text-xs font-black">✅ Təsdiqlə</button>
                        <button onClick={() => rejectLocal(tx.id)}
                          className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-black">❌ Rədd</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredTxs.length === 0 && <div className="text-center py-12 text-slate-600 text-sm">Əməliyyat tapılmadı</div>}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <h2 className="text-lg font-black uppercase text-slate-300 flex-1">İstifadəçilər</h2>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Axtar..."
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none w-36" />
            </div>
            <div className="space-y-3">
              {filteredUsers.map(u => {
                const isBlocked = u.blocked || (u.blockedUntil && Date.now() < u.blockedUntil);
                const txCount = txs.filter(t => t.username === u.username).length;
                return (
                  <div key={u.id} className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">{u.username}</span>
                          {u.role === "admin" && <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-black">ADMIN</span>}
                          {isBlocked && <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-black">BLOK</span>}
                        </div>
                        <p className="text-[11px] text-slate-500">{u.phone || "Nömrə yoxdur"}</p>
                        <p className="text-[11px] text-slate-400">Əməliyyat: {txCount} | Oyun kodu: {u.gameCode || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-amber-400">{Number(u.balance || 0).toFixed(2)} ₼</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { setEditUser(u); setNewCode(u.gameCode || ""); setNewBal(String(u.balance || 0)); }}
                        className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-black">✏️ Düzəlt</button>
                      {!isBlocked ? (
                        <>
                          <button onClick={() => blockUser(u.id, 15)} className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-xl text-xs font-black">⏱️ 15 dəq blok</button>
                          <button onClick={() => blockUser(u.id, "perm")} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-black">🚫 Daimi blok</button>
                        </>
                      ) : (
                        <button onClick={() => unblockUser(u.id)} className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-xl text-xs font-black">✅ Bloku aç</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && <div className="text-center py-12 text-slate-600 text-sm">İstifadəçi tapılmadı</div>}
            </div>
          </div>
        )}

        {tab === "bot"      && <BotTab showToast={showToast} />}
        {tab === "push"     && <PushTab showToast={showToast} />}
        {tab === "redirect" && <RedirectTab showToast={showToast} />}
        {tab === "report"   && <ReportTab showToast={showToast} />}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="space-y-6 max-w-md">
            <h2 className="text-lg font-black uppercase text-slate-300">Sistem Ayarları</h2>
            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-blue-400">🔑 Admin Şifrəsini Dəyiş</h3>
              <div className="space-y-2">
                <input type="password" value={passTab.cur} onChange={e => setPassTab(p => ({ ...p, cur: e.target.value }))}
                  placeholder="Cari şifrə"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                <input type="password" value={passTab.n1} onChange={e => setPassTab(p => ({ ...p, n1: e.target.value }))}
                  placeholder="Yeni şifrə"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                <input type="password" value={passTab.n2} onChange={e => setPassTab(p => ({ ...p, n2: e.target.value }))}
                  placeholder="Yeni şifrəni təkrar daxil edin"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                <button onClick={changePassword} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm uppercase">Şifrəni Dəyiş</button>
              </div>
            </div>

            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-amber-500">💳 Ödəniş Kartı</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Kart Nömrəsi</label>
                  <input value={settings.adminCard} onChange={e => setSettings(s => ({ ...s, adminCard: e.target.value }))}
                    placeholder="4169 0000 0000 0000"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Kart Sahibi</label>
                  <input value={settings.adminCardName} onChange={e => setSettings(s => ({ ...s, adminCardName: e.target.value }))}
                    placeholder="Ad Soyad"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Ödəniş Növü</label>
                  <select value={settings.paymentType} onChange={e => setSettings(s => ({ ...s, paymentType: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white">
                    <option value="card">Bank Kartı</option>
                    <option value="m10">M10</option>
                  </select>
                </div>
                <button onClick={saveSettings} className="w-full bg-amber-500 text-black py-3 rounded-xl font-black text-sm uppercase">Saxla</button>
              </div>
            </div>

            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-blue-400">🔑 Admin Şifrəsini Dəyiş</h3>
              <div className="space-y-2">
                <input type="password" value={passTab.cur} onChange={e => setPassTab(p => ({ ...p, cur: e.target.value }))}
                  placeholder="Cari şifrə"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                <input type="password" value={passTab.n1} onChange={e => setPassTab(p => ({ ...p, n1: e.target.value }))}
                  placeholder="Yeni şifrə"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                <input type="password" value={passTab.n2} onChange={e => setPassTab(p => ({ ...p, n2: e.target.value }))}
                  placeholder="Yeni şifrəni təkrar daxil edin"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                <button onClick={changePassword} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm uppercase">Şifrəni Dəyiş</button>
              </div>
            </div>

            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-red-400">⚠️ Təhlükəli Əməliyyatlar</h3>
              <button onClick={() => { if (window.confirm("Bütün əməliyyatlar silinsin?")) { MockDataService.clearTransactions(); reload(); showToast("🗑️ Tarixçə silindi"); } }}
                className="w-full bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl font-black text-xs uppercase">
                🗑️ Bütün Əməliyyatları Sil
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0f111a] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-amber-500 uppercase">{editUser.username}</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-500">✕</button>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Oyun Kodu</label>
              <input value={newCode} onChange={e => setNewCode(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
              <button onClick={saveCode} className="w-full mt-2 bg-amber-500 text-black py-2.5 rounded-xl font-black text-xs uppercase">Kodu Təyin Et</button>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Balans (₼)</label>
              <input type="number" value={newBal} onChange={e => setNewBal(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
              <button onClick={saveBal} className="w-full mt-2 bg-green-500 text-black py-2.5 rounded-xl font-black text-xs uppercase">Balansı Yenilə</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
