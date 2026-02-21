import React, { useState, useEffect } from "react";
import { MockDataService } from "../services/MockDataService";
import { ApiService } from "../services/ApiService";
import { CheckCircle, XCircle, Clock, ArrowDownLeft, ArrowUpRight } from "lucide-react";

async function fetchTransactions() {
  try {
    const list = await ApiService.getTransactions();
    return Array.isArray(list) ? list : [];
  } catch {
    return MockDataService.getTransactions();
  }
}

export default function TransactionManager() {
  const [transactions, setTransactions] = useState([]);

  const loadTx = () => fetchTransactions().then(setTransactions);

  useEffect(() => {
    loadTx();
    const interval = setInterval(loadTx, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (txId, status, reason = null, gameCode = null) => {
    MockDataService.updateTransactionStatus(txId, status, reason, gameCode);
    try {
      await ApiService.updateTransaction(Number(txId), status, reason, gameCode);
    } catch (_) {}
    loadTx();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic">ƏMƏLİYYAT SORĞULARI</h2>
        <div className="flex gap-2">
           <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase text-green-500">Avto-Yenilənmə Aktiv</span>
           </div>
        </div>
      </div>

      <div className="bg-[#0f111a] rounded-[32px] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">İstifadəçi</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Növ</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Məbləğ</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarix</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kod</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Hərəkət</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-slate-600 font-bold italic">Heç bir sorğu yoxdur</td>
              </tr>
            ) : transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="p-6">
                  <p className="font-bold text-sm">{tx.username}</p>
                </td>
                <td className="p-6">
                  <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                    {tx.type === 'deposit' ? 'DEPOZİT' : 'ÇIXARIŞ'}
                  </div>
                  {tx.receipt && <p className="text-[9px] text-slate-500 mt-1">Sənəd: {tx.receipt}</p>}
                  {tx.cardNumber && (
                    <div className="mt-1 text-[9px] text-slate-500">
                      <p>Kart: {tx.cardNumber}</p>
                      <p>Tarix: {tx.expiryDate}</p>
                    </div>
                  )}
                </td>
                <td className="p-6">
                   <p className="font-black">{tx.amount.toFixed(2)} ₼</p>
                </td>
                <td className="p-6">
                   <p className="text-[10px] text-slate-500 font-medium">{new Date(tx.date).toLocaleString()}</p>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                      {tx.status === 'pending' && <Clock size={14} className="text-amber-500"/>}
                      {tx.status === 'approved' && <CheckCircle size={14} className="text-green-500"/>}
                      {tx.status === 'rejected' && <XCircle size={14} className="text-red-500"/>}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        tx.status === 'pending' ? 'text-amber-500' : 
                        tx.status === 'approved' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {tx.status === 'pending' ? 'GÖZLƏYİR' : 
                         tx.status === 'approved' ? 'TƏSDİQLƏNDİ' : 'RƏDD EDİLDİ'}
                      </span>
                   </div>
                </td>
                <td className="p-6">
                   <p className="text-[11px] font-mono font-bold text-amber-500 px-2 py-1 bg-amber-500/10 rounded-lg w-fit">
                     {tx.gameCode || "-"}
                   </p>
                </td>
                <td className="p-6 text-right">
                   {tx.status === 'pending' && (
                     <div className="flex justify-end gap-2">
                        <button onClick={() => handleStatusChange(tx.id, "approved")} className="bg-green-500/10 text-green-500 p-2.5 rounded-xl hover:bg-green-500 hover:text-black transition-all border border-green-500/20">
                           <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleStatusChange(tx.id, "rejected")} className="bg-red-500/10 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                           <XCircle size={18} />
                        </button>
                     </div>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
