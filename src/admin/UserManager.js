import React, { useState, useEffect } from "react";
import { MockDataService } from "../services/MockDataService";
import { Search, UserPlus, Edit2, Trash2, Check, X, History } from "lucide-react";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");
  const [selectedUserTxs, setSelectedUserTxs] = useState(null);

  useEffect(() => {
    setUsers(MockDataService.getUsers());
  }, []);

  const handleEditBalance = (user) => {
    setEditingUser(user);
    setNewBalance(user.balance.toString());
  };

  const handleViewTransactions = (user) => {
    const txs = MockDataService.getTransactions().filter(t => t.username === user.username);
    setSelectedUserTxs({ user, txs });
  };

  const saveBalance = () => {
    if (!newBalance || isNaN(newBalance)) return;
    const amount = parseFloat(newBalance) - editingUser.balance;
    const updated = MockDataService.updateUserBalance(editingUser.id, amount);
    setUsers(updated);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic">İSTİFADƏÇİ İDARƏETMƏSİ</h2>
        <button className="bg-amber-500 text-black px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-amber-400 transition-colors">
          <UserPlus size={16} /> YENİ İSTİFADƏÇİ
        </button>
      </div>

      <div className="relative group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
        <input 
          placeholder="İstifadəçi adı və ya ID ilə axtar..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0f111a] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-amber-500/20 transition-all font-medium"
        />
      </div>

      <div className="bg-[#0f111a] rounded-[32px] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">İstifadəçi</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rol</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Balans</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 font-black">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.username}</p>
                      <p className="text-[10px] text-slate-500">ID: #{user.id} {user.phone && `• ${user.phone}`}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-6">
                  {editingUser?.id === user.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={newBalance} 
                        onChange={(e) => setNewBalance(e.target.value)}
                        className="w-24 bg-black border border-amber-500/50 rounded-lg p-2 text-sm outline-none font-bold"
                      />
                      <button onClick={saveBalance} className="text-green-500 hover:text-green-400"><Check size={20}/></button>
                      <button onClick={() => setEditingUser(null)} className="text-red-500 hover:text-red-400"><X size={20}/></button>
                    </div>
                  ) : (
                    <p className="font-black text-amber-500">{user.balance.toFixed(2)} ₼</p>
                  )}
                </td>
                <td className="p-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                  <span className="text-xs font-bold text-slate-300">Aktiv</span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleViewTransactions(user)} title="Tarixçə" className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all"><History size={16}/></button>
                    <button onClick={() => handleEditBalance(user)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit2 size={16}/></button>
                    <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserTxs && (
        <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-[#0a0c12] w-full max-w-2xl rounded-[32px] border border-white/10 flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <div>
                        <h3 className="font-black uppercase text-sm tracking-widest text-amber-500">ƏMƏLİYYAT TARİXÇƏSİ</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{selectedUserTxs.user.username} (ID: {selectedUserTxs.user.id})</p>
                    </div>
                    <button onClick={() => setSelectedUserTxs(null)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {selectedUserTxs.txs.length === 0 ? (
                        <p className="text-center py-10 text-slate-600 italic">Hələ heç bir əməliyyat yoxdur.</p>
                    ) : selectedUserTxs.txs.reverse().map(tx => (
                        <div key={tx.id} className="bg-white/2 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                            <div>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {tx.type === 'deposit' ? 'Depozit' : 'Çıxarış'}
                                </span>
                                <p className="text-lg font-black mt-1">{tx.amount.toFixed(2)} ₼</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    tx.status === 'pending' ? 'text-amber-500' : 
                                    tx.status === 'approved' ? 'text-green-500' : 'text-red-500'
                                }`}>
                                    {tx.status === 'pending' ? 'Gözləyir' : 
                                    tx.status === 'approved' ? 'Təsdiqləndi' : 'Rədd edildi'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-1">{new Date(tx.date).toLocaleString()}</p>
                                {tx.reason && <p className="text-[10px] text-red-400 italic mt-1 max-w-[200px]">{tx.reason}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
