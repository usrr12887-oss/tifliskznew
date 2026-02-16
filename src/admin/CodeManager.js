import React, { useState, useEffect } from "react";
import { MockDataService } from "../services/MockDataService";
import { Plus, Trash2, Key, Users, X } from "lucide-react";

export default function CodeManager() {
  const [codes, setCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    setCodes(MockDataService.getGameCodes());
    setUsers(MockDataService.getUsers());
  }, []);

  const handleBulkAdd = () => {
    const codeList = bulkText.split("\n").map(c => c.trim()).filter(c => c);
    if (codeList.length === 0) return;
    const updated = MockDataService.addGameCodes(codeList);
    setCodes(updated);
    setBulkText("");
    setShowBulkModal(false);
    alert(`${codeList.length} oyun kodu əlavə edildi.`);
  };

  const handleAssign = (userId, code) => {
    const updated = MockDataService.assignCodeToUser(userId, code);
    setUsers(updated);
    alert("Kod istifadəçiyə təyin edildi.");
  };

  const handleClear = () => {
    if (window.confirm("Bütün kodları silmək istəyirsiniz?")) {
      const updated = MockDataService.clearCodes();
      setCodes(updated);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic uppercase">Oyun Kodları</h2>
        <div className="flex gap-3">
            <button 
                onClick={() => setShowBulkModal(true)}
                className="bg-amber-500 text-black px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2"
            >
                <Plus size={16} /> TOPLU ƏLAVƏ ET
            </button>
            <button 
                onClick={handleClear}
                className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2"
            >
                <Trash2 size={16} /> TƏMİZLƏ
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Assignment Section */}
        <div className="bg-[#0f111a] rounded-[32px] border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-2">
            <Users size={20} className="text-amber-500" />
            <h3 className="font-black text-sm uppercase">İstifadəçilərə Kod Təyini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                   <th className="p-4 text-[10px] font-black text-slate-500 uppercase">İstifadəçi</th>
                   <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Hazırkı Kod</th>
                   <th className="p-4 text-[10px] font-black text-slate-500 uppercase text-right">Yeni Kod</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'admin').map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="p-4">
                        <p className="font-bold text-sm">{user.username}</p>
                    </td>
                    <td className="p-4">
                        <span className={`text-[10px] font-mono font-bold ${user.gameCode ? 'text-green-500' : 'text-slate-600'}`}>
                           {user.gameCode || "Yoxdur"}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                        <select 
                            onChange={(e) => handleAssign(user.id, e.target.value)}
                            value={user.gameCode || ""}
                            className="bg-black border border-white/10 rounded-lg p-1.5 text-[10px] font-bold outline-none"
                        >
                            <option value="">Kod seçin...</option>
                            {codes.map(c => (
                                <option key={c.id} value={c.code}>{c.code}</option>
                            ))}
                        </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Codes Pool Section */}
        <div className="bg-[#0f111a] rounded-[32px] border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-2">
            <Key size={20} className="text-amber-500" />
            <h3 className="font-black text-sm uppercase">Kod Hovuzu ({codes.length})</h3>
          </div>
          <div className="p-6 max-h-[400px] overflow-y-auto">
             <div className="flex flex-wrap gap-2">
                {codes.length === 0 ? (
                    <p className="text-slate-600 italic text-sm">Hələ kod əlavə edilməyib.</p>
                ) : codes.map(c => (
                    <div key={c.id} className={`bg-white/5 border px-3 py-1.5 rounded-lg flex items-center gap-2 ${c.used ? 'border-red-500/20' : 'border-green-500/20'}`}>
                        <span className="text-[10px] font-mono text-slate-300">{c.code}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${c.used ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6">
            <div className="bg-[#10141d] w-full max-w-xl rounded-[40px] border border-white/10 p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black italic uppercase">Toplu Kod Əlavə Et</h3>
                    <button onClick={() => setShowBulkModal(false)}><X /></button>
                </div>
                <p className="text-xs text-slate-500">Hər sətirdə bir kod olmaqla kodları aşağıdakı sahəyə yapışdırın.</p>
                <textarea 
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    rows="10" 
                    placeholder="Kod1&#10;Kod2&#10;Kod3..." 
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none font-mono text-sm"
                />
                <button 
                    onClick={handleBulkAdd}
                    className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black text-sm uppercase"
                >
                    ƏLAVƏ ET
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
