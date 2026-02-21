import React, { useState, useEffect } from "react";
import { Users, CreditCard, Settings, LayoutDashboard, LogOut, ChevronRight, Menu, X } from "lucide-react";
import UserManager from "./UserManager";
import TransactionManager from "./TransactionManager";
import FinanceManager from "./FinanceManager";
import { MockDataService } from "../services/MockDataService";
import { ApiService } from "../services/ApiService";

async function fetchStats() {
  let users = [];
  let txs = [];
  try {
    users = await ApiService.getUsers();
    txs = await ApiService.getTransactions();
  } catch {
    users = MockDataService.getUsers();
    txs = MockDataService.getTransactions();
  }
  users = Array.isArray(users) ? users : [];
  txs = Array.isArray(txs) ? txs : [];
  const pendingDeps = txs.filter(t => t.type === 'deposit' && t.status === 'pending').length;
  const pendingWiths = txs.filter(t => t.type === 'withdraw' && t.status === 'pending').length;
  return { users: users.length, pendingDeps, pendingWiths };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pendingDeps: 0, pendingWiths: 0 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const load = () => fetchStats().then(setStats);
    load();
    const inv = setInterval(load, 5000);
    return () => clearInterval(inv);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "users", label: "İstifadəçilər", icon: <Users size={20} /> },
    { id: "transactions", label: "Əməliyyatlar", icon: <CreditCard size={20} /> },
    { id: "finance", label: "Maliyyə", icon: <CreditCard size={20} /> },
    { id: "settings", label: "Ayarlar", icon: <Settings size={20} /> },
  ];

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0a0c12]">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-amber-500 italic">ADMIN PANEL</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Control Center</p>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/5 rounded-xl">
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
              activeTab === item.id 
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
              : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm font-bold">{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={16} />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center gap-3 p-4 text-slate-500 hover:text-red-500 transition-colors font-bold text-sm"
        >
          <LogOut size={20} /> Sayta Qayıt
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#05070a] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 flex-col shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-80 bg-[#0a0c12] animate-in slide-in-from-left duration-300">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 bg-[#0a0c12] border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black text-amber-500 italic">ADMIN</h2>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-xl">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          {activeTab === "dashboard" && (
            <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
              <h1 className="text-2xl lg:text-3xl font-black italic uppercase">Xoş Gəlmisiniz, Admin</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-[#0f111a] p-6 lg:p-8 rounded-[32px] border border-white/5 group hover:border-amber-500/30 transition-all">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Ümumi İstifadəçi</p>
                  <h3 className="text-3xl lg:text-4xl font-black text-white group-hover:text-amber-500 transition-colors uppercase italic">{stats.users} <span className="text-xs italic text-slate-600">nəfər</span></h3>
                </div>
                <div className="bg-[#0f111a] p-6 lg:p-8 rounded-[32px] border border-white/5 group hover:border-green-500/30 transition-all">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Gözləyən Depozitlər</p>
                  <h3 className="text-3xl lg:text-4xl font-black text-white group-hover:text-green-500 transition-colors uppercase italic">{stats.pendingDeps} <span className="text-xs italic text-slate-600">ədəd</span></h3>
                </div>
                <div className="bg-[#0f111a] p-6 lg:p-8 rounded-[32px] border border-white/5 group hover:border-red-500/30 transition-all">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Gözləyən Çıxarışlar</p>
                  <h3 className="text-3xl lg:text-4xl font-black text-white group-hover:text-red-500 transition-colors uppercase italic">{stats.pendingWiths} <span className="text-xs italic text-slate-600">ədəd</span></h3>
                </div>
              </div>
              
              <div className="bg-amber-500 p-6 lg:p-8 rounded-[32px] flex flex-col lg:flex-row lg:items-center justify-between shadow-2xl shadow-amber-500/20 gap-4">
                  <div className="space-y-1">
                      <h3 className="text-black font-black text-lg lg:text-xl uppercase italic">Sistem Hesabatı Hazırdır</h3>
                      <p className="text-black/60 text-xs font-bold font-sans">Maliyyə statistikaları yeniləndi.</p>
                  </div>
                  <button onClick={() => setActiveTab('finance')} className="bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase w-full lg:w-auto">HESABATA BAX</button>
              </div>
            </div>
          )}

          {activeTab === "users" && <UserManager />}
          {activeTab === "transactions" && <TransactionManager />}
          {activeTab === "finance" && <FinanceManager />}
          {activeTab === "settings" && (
            <div className="p-10 text-center text-slate-500 italic">Settings component coming soon...</div>
          )}
        </main>
      </div>
    </div>
  );
}
