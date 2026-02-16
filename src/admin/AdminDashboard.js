import React, { useState, useEffect } from "react";
import { Users, CreditCard, Settings, LayoutDashboard, LogOut, ChevronRight } from "lucide-react";
import UserManager from "./UserManager";
import TransactionManager from "./TransactionManager";
import CodeManager from "./CodeManager";
import FinanceManager from "./FinanceManager";
import { MockDataService } from "../services/MockDataService";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ users: 0, pendingDeps: 0, pendingWiths: 0 });

  useEffect(() => {
    const fetchData = () => {
      const users = MockDataService.getUsers().length;
      const txs = MockDataService.getTransactions();
      const pendingDeps = txs.filter(t => t.type === 'deposit' && t.status === 'pending').length;
      const pendingWiths = txs.filter(t => t.type === 'withdraw' && t.status === 'pending').length;
      setStats({ users, pendingDeps, pendingWiths });
    };
    fetchData();
    const inv = setInterval(fetchData, 5000);
    return () => clearInterval(inv);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "users", label: "İstifadəçilər", icon: <Users size={20} /> },
    { id: "transactions", label: "Əməliyyatlar", icon: <CreditCard size={20} /> },
    { id: "codes", label: "Oyun Kodları", icon: <CreditCard size={20} /> },
    { id: "finance", label: "Maliyyə", icon: <CreditCard size={20} /> },
    { id: "settings", label: "Ayarlar", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#05070a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0c12] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black text-amber-500 italic">ADMIN PANEL</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Control Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black italic uppercase">Xoş Gəlmisiniz, Admin</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0f111a] p-8 rounded-[32px] border border-white/5 group hover:border-amber-500/30 transition-all">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Ümumi İstifadəçi</p>
                <h3 className="text-4xl font-black text-white group-hover:text-amber-500 transition-colors uppercase italic">{stats.users} <span className="text-xs italic text-slate-600">nəfər</span></h3>
              </div>
              <div className="bg-[#0f111a] p-8 rounded-[32px] border border-white/5 group hover:border-green-500/30 transition-all">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Gözləyən Depozitlər</p>
                <h3 className="text-4xl font-black text-white group-hover:text-green-500 transition-colors uppercase italic">{stats.pendingDeps} <span className="text-xs italic text-slate-600">ədəd</span></h3>
              </div>
              <div className="bg-[#0f111a] p-8 rounded-[32px] border border-white/5 group hover:border-red-500/30 transition-all">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Gözləyən Çıxarışlar</p>
                <h3 className="text-4xl font-black text-white group-hover:text-red-500 transition-colors uppercase italic">{stats.pendingWiths} <span className="text-xs italic text-slate-600">ədəd</span></h3>
              </div>
            </div>
            
            <div className="bg-amber-500 p-8 rounded-[32px] flex items-center justify-between shadow-2xl shadow-amber-500/20">
                <div className="space-y-1">
                    <h3 className="text-black font-black text-xl uppercase italic">Sistem Hesabatı Hazırdır</h3>
                    <p className="text-black/60 text-xs font-bold font-sans">Maliyyə və istifadəçi statistikaları yeniləndi. Detallar üçün yan menyudan istifadə edin.</p>
                </div>
                <button onClick={() => setActiveTab('finance')} className="bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase">HESABATA BAX</button>
            </div>
          </div>
        )}

        {activeTab === "users" && <UserManager />}
        {activeTab === "transactions" && <TransactionManager />}
        {activeTab === "codes" && <CodeManager />}
        {activeTab === "finance" && <FinanceManager />}
        {activeTab === "settings" && (
          <div className="p-10 text-center text-slate-500 italic">Settings component coming soon...</div>
        )}
      </main>
    </div>
  );
}
