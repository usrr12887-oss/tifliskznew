import React, { useState, useEffect } from "react";
const API = "http://localhost:3001/api/admin";

export default function PushTab({ showToast }) {
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const r = await fetch(`${API}/push-subscribers`).then(r => r.json());
      setSubscribers(r.subscribers || []);
      setTotal(r.total || 0);
    } catch (_) {}
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!title.trim() || !body.trim()) return showToast("⚠️ Başlıq və mətn tələb olunur");
    setSending(true);
    try {
      const r = await fetch(`${API}/send-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, targetUsername: target || undefined })
      }).then(r => r.json());
      setSending(false);
      if (r.ok) {
        showToast(`✅ ${r.sent} abunəçiyə göndərildi`);
        setTitle(""); setBody(""); setTarget("");
      } else {
        showToast("❌ " + (r.error || "Xəta"));
      }
    } catch (_) { setSending(false); showToast("❌ Server cavab vermir"); }
  };

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-lg font-black uppercase text-slate-300">🔔 Push Bildirişlər</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0f111a] border border-blue-500/20 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Aktiv Abunəçi</p>
          <p className="text-3xl font-black text-blue-400">{total}</p>
        </div>
        <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 uppercase font-black mb-2">Necə işləyir?</p>
          <p className="text-[10px] text-slate-400">İstifadəçilər saytı telefona əlavə etdikdə bildiriş icazəsi verir. Admin buradan mesaj göndərir.</p>
        </div>
      </div>

      {/* Send form */}
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-black uppercase text-amber-500">Bildiriş Göndər</h3>
        <div>
          <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Hədəf İstifadəçi (boş = hamısı)</label>
          <select value={target} onChange={e => setTarget(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white">
            <option value="">— Bütün abunəçilər ({total} nəfər) —</option>
            {subscribers.map(s => (
              <option key={s.username} value={s.username}>{s.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Başlıq</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Tiflis Kazino"
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none text-white" />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Mətn</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
            placeholder="Bugün xüsusi bonus var! Daxil olun..."
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none text-white resize-none" />
        </div>
        {/* Quick templates */}
        <div className="flex flex-wrap gap-2">
          {[
            ["🎁 Bonus", "Bugün xüsusi 20% depozit bonusu!"],
            ["🎮 Kod", "Telegram qrupumuzda pulsuz oyun kodu paylanır!"],
            ["💰 Uduş", "Bu həftə böyük uduşlar sizi gözləyir!"],
          ].map(([t, b]) => (
            <button key={t} onClick={() => { setTitle("Tiflis Kazino"); setBody(b); }}
              className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-xl text-[10px] font-black hover:bg-white/10">
              {t}
            </button>
          ))}
        </div>
        <button onClick={send} disabled={sending}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm uppercase disabled:opacity-50">
          {sending ? "Göndərilir..." : `📨 Göndər ${target ? `→ ${target}` : `→ Hamısı`}`}
        </button>
      </div>

      {/* Subscriber list */}
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-black uppercase text-amber-500">Abunəçi Siyahısı</h3>
          <button onClick={load} className="text-[10px] text-slate-500 font-black">🔄 Yenilə</button>
        </div>
        {subscribers.length === 0
          ? <p className="text-slate-600 text-xs text-center py-6">Heç bir abunəçi yoxdur.<br/>İstifadəçilər saytı telefona əlavə etdikdə burada görünəcək.</p>
          : <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {subscribers.map(s => (
              <div key={s.username} className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl">
                <span className="text-white text-xs font-bold">{s.username}</span>
                <span className="text-slate-500 text-[10px]">{new Date(s.addedAt).toLocaleDateString("az")}</span>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
