import React, { useState } from "react";
import { MockDataService } from "../services/MockDataService";

export default function ReportTab({ showToast }) {
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo]     = useState(today);
  const [timeFrom, setTimeFrom] = useState("00:00");
  const [timeTo, setTimeTo]     = useState("23:59");
  const [report, setReport]     = useState(null);

  const generate = () => {
    const from = new Date(`${dateFrom}T${timeFrom}:00`).getTime();
    const to   = new Date(`${dateTo}T${timeTo}:59`).getTime();

    const allTxs  = MockDataService.getTransactions();
    const allUsers = MockDataService.getUsers();

    const filtered = allTxs.filter(tx => {
      const d = new Date(tx.date).getTime();
      return d >= from && d <= to;
    });

    const approved   = filtered.filter(t => t.status === "approved");
    const rejected   = filtered.filter(t => t.status === "rejected");
    const pending    = filtered.filter(t => t.status === "pending");
    const deposits   = approved.filter(t => t.type === "deposit");
    const withdraws  = approved.filter(t => t.type === "withdraw");

    const totalDep   = deposits.reduce((s, t) => s + Number(t.amount), 0);
    const totalWith  = withdraws.reduce((s, t) => s + Number(t.amount), 0);

    // Ən aktiv istifadəçilər
    const userMap = {};
    filtered.forEach(t => {
      if (!userMap[t.username]) userMap[t.username] = { count: 0, total: 0 };
      userMap[t.username].count++;
      userMap[t.username].total += Number(t.amount);
    });
    const topUsers = Object.entries(userMap)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    setReport({ filtered, approved, rejected, pending, deposits, withdraws, totalDep, totalWith, topUsers, from, to, allUsers });
    showToast("✅ Hesabat hazırlandı");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-lg font-black uppercase text-slate-300">📊 Tarix Üzrə Hesabat</h2>

      {/* Filter */}
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase text-amber-500">Müddəti Seçin</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Başlanğıc Tarixi</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Başlanğıc Saatı</label>
            <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Bitmə Tarixi</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Bitmə Saatı</label>
            <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setDateFrom(today); setDateTo(today); setTimeFrom("00:00"); setTimeTo("23:59"); }} className="px-3 py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-black">Bu gün</button>
          <button onClick={() => {
            const d = new Date(); d.setDate(d.getDate() - 7);
            setDateFrom(d.toISOString().slice(0, 10)); setDateTo(today);
          }} className="px-3 py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-black">Son 7 gün</button>
          <button onClick={() => {
            const d = new Date(); d.setDate(1);
            setDateFrom(d.toISOString().slice(0, 10)); setDateTo(today);
          }} className="px-3 py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-black">Bu ay</button>
          <button onClick={generate} className="flex-1 bg-amber-500 text-black py-2 rounded-xl font-black text-xs uppercase">📊 Hesabat Et</button>
        </div>
      </div>

      {/* Results */}
      {report && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Ümumi Depozit", value: `${report.totalDep.toFixed(2)} ₼`, color: "text-green-400" },
              { label: "Ümumi Çıxarış", value: `${report.totalWith.toFixed(2)} ₼`, color: "text-red-400" },
              { label: "Xalis Gəlir",   value: `${(report.totalDep - report.totalWith).toFixed(2)} ₼`, color: "text-amber-400" },
              { label: "Əməliyyat",     value: report.filtered.length, color: "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f111a] border border-white/5 rounded-2xl p-3">
                <p className="text-[9px] text-slate-500 uppercase font-black mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Depozit", count: report.deposits.length, color: "text-green-400" },
              { label: "Çıxarış", count: report.withdraws.length, color: "text-red-400" },
              { label: "Gözləyir", count: report.pending.length, color: "text-amber-400" },
            ].map(s => (
              <div key={s.label} className="bg-[#0f111a] border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[9px] text-slate-500 uppercase font-black mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              </div>
            ))}
          </div>

          {report.topUsers.length > 0 && (
            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4">
              <h3 className="text-xs font-black uppercase text-amber-500 mb-3">Ən Aktiv İstifadəçilər</h3>
              <div className="space-y-2">
                {report.topUsers.map(([name, info], i) => (
                  <div key={name} className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-black text-sm w-5">#{i+1}</span>
                      <span className="text-white font-bold text-sm">{name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-black text-sm">{info.total.toFixed(2)} ₼</span>
                      <span className="text-slate-500 text-[10px] block">{info.count} əməliyyat</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4">
            <h3 className="text-xs font-black uppercase text-amber-500 mb-3">Əməliyyat Siyahısı ({report.filtered.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {report.filtered.slice().reverse().map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-white">{tx.username}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-black ${tx.type === "deposit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {tx.type === "deposit" ? "Dep" : "Çıx"}
                    </span>
                    <span className="text-slate-600 ml-1">{new Date(tx.date).toLocaleString("az")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-amber-400">{Number(tx.amount).toFixed(2)} ₼</span>
                    <span className={`block text-[9px] font-black ${tx.status === "approved" ? "text-green-400" : tx.status === "pending" ? "text-amber-400" : "text-red-400"}`}>
                      {tx.status === "approved" ? "✅" : tx.status === "pending" ? "⏳" : "❌"}
                    </span>
                  </div>
                </div>
              ))}
              {report.filtered.length === 0 && <p className="text-slate-600 text-xs text-center py-6">Bu müddətdə əməliyyat yoxdur</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
