import React, { useState, useEffect } from "react";
import { MockDataService } from "../services/MockDataService";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function FinanceManager() {
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    netProfit: 0,
    pendingCount: 0,
    approvedCount: 0
  });

  useEffect(() => {
    setStats(MockDataService.getFinanceStats());
    const interval = setInterval(() => {
        setStats(MockDataService.getFinanceStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { 
      label: "Ümumi Depozitlər", 
      value: `${stats.totalDeposits.toLocaleString()} ₼`, 
      icon: <ArrowDownLeft size={24} />, 
      color: "text-green-500", 
      bg: "bg-green-500/10" 
    },
    { 
      label: "Ümumi Çıxarışlar", 
      value: `${stats.totalWithdrawals.toLocaleString()} ₼`, 
      icon: <ArrowUpRight size={24} />, 
      color: "text-red-500", 
      bg: "bg-red-500/10" 
    },
    { 
      label: "Xalis Mənfəət", 
      value: `${stats.netProfit.toLocaleString()} ₼`, 
      icon: <TrendingUp size={24} />, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10" 
    }
  ];

  const handleReset = () => {
    if (window.confirm("Bütün maliyyə əməliyyatları tarixçəsini sıfırlamaq istədiyinizə əminsiniz?")) {
        MockDataService.clearTransactions();
        setStats(MockDataService.getFinanceStats());
        alert("Maliyyə sıfırlandı.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic uppercase">Ümumi Maliyyə</h2>
        <button 
            onClick={handleReset}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all"
        >
            BÜTÜN STATİSTİKANİ SIFIRLA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-[#0f111a] p-8 rounded-[32px] border border-white/5 space-y-4">
             <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
                {card.icon}
             </div>
             <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{card.label}</p>
                <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#0f111a] p-8 rounded-[32px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center">
                    <Clock size={24} />
                </div>
                <div>
                    <h3 className="font-black text-sm uppercase">Gözləyən Sorğular</h3>
                    <p className="text-slate-500 text-xs">Təsdiq gözləyən əməliyyat sayı</p>
                </div>
            </div>
            <span className="text-4xl font-black text-white">{stats.pendingCount}</span>
         </div>

         <div className="bg-[#0f111a] p-8 rounded-[32px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <h3 className="font-black text-sm uppercase">Uğurlu Əməliyyatlar</h3>
                    <p className="text-slate-500 text-xs">Cəmi təsdiqlənmiş əməliyyat sayı</p>
                </div>
            </div>
            <span className="text-4xl font-black text-white">{stats.approvedCount}</span>
         </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[32px] text-center space-y-2">
         <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.2em]">Sistem Məlumatı</p>
         <p className="text-slate-400 text-sm max-w-xl mx-auto italic">
            Maliyyə hesabatları real vaxt rejimində depozit və çıxarış təsdiqləri əsasında yenilənir. 
            Xalis mənfəət depozitlərin çıxarışlardan olan fərqi kimi hesablanır.
         </p>
      </div>
    </div>
  );
}
