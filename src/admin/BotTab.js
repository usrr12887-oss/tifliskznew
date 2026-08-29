import React, { useState, useEffect } from "react";
const API = "http://localhost:3001/api/admin";

export default function BotTab({ showToast }) {
  const [botInfo, setBotInfo] = useState(null);
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [msg, setMsg] = useState("");
  const [chatId, setChatId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [b, w] = await Promise.all([
        fetch(`${API}/bot-info`).then(r => r.json()),
        fetch(`${API}/webhook-info`).then(r => r.json()),
      ]);
      if (b.ok) setBotInfo(b);
      if (w.ok) setWebhookInfo(w.result);
    } catch (_) {}
  };

  useEffect(() => { load(); }, []);

  const sendMsg = async () => {
    if (!msg.trim()) return;
    setLoading(true);
    const r = await fetch(`${API}/send-message`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: msg, chatId: chatId || undefined })
    }).then(r => r.json());
    setLoading(false);
    if (r.ok) { showToast("✅ Mesaj göndərildi"); setMsg(""); }
    else showToast("❌ Xəta: " + (r.description || "bilinmir"));
  };

  const setWebhook = async () => {
    if (!webhookUrl) return;
    const r = await fetch(`${API}/set-webhook`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl })
    }).then(r => r.json());
    showToast(r.ok ? "✅ Webhook quruldu" : "❌ " + r.description);
    load();
  };

  const delWebhook = async () => {
    const r = await fetch(`${API}/delete-webhook`, { method: "POST" }).then(r => r.json());
    showToast(r.ok ? "✅ Webhook silindi (polling aktiv)" : "❌ Xəta");
    load();
  };

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-lg font-black uppercase text-slate-300">🤖 Telegram Bot</h2>

      {/* Bot info */}
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-black uppercase text-amber-500 mb-3">Bot Məlumatı</h3>
        {botInfo ? (
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-500">Ad:</span> <span className="font-bold text-white">{botInfo.bot?.first_name}</span></p>
            <p><span className="text-slate-500">Username:</span> <span className="font-bold text-amber-400">@{botInfo.bot?.username}</span></p>
            <p><span className="text-slate-500">ID:</span> <span className="text-slate-300">{botInfo.bot?.id}</span></p>
            <p><span className="text-slate-500">Qrup ID:</span> <span className="text-slate-300">{botInfo.groupId}</span></p>
          </div>
        ) : <p className="text-slate-600 text-xs">Yüklənir...</p>}

        {webhookInfo && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-1 text-xs">
            <p className="text-slate-500 font-black uppercase">Webhook Status</p>
            <p><span className="text-slate-500">URL:</span> <span className={webhookInfo.url ? "text-green-400" : "text-slate-600"}>{webhookInfo.url || "Yoxdur (Polling aktiv)"}</span></p>
            {webhookInfo.last_error_message && <p className="text-red-400">Xəta: {webhookInfo.last_error_message}</p>}
          </div>
        )}
      </div>

      {/* Send message */}
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase text-amber-500">Qrupa Mesaj Göndər</h3>
        <input value={chatId} onChange={e => setChatId(e.target.value)}
          placeholder="Chat ID (boş buraxın = default qrup)"
          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-white" />
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
          placeholder="Mesaj mətni (HTML dəstəklənir)..."
          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-white resize-none" />
        <button onClick={sendMsg} disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-black text-xs uppercase disabled:opacity-50">
          {loading ? "Göndərilir..." : "📨 Göndər"}
        </button>
      </div>

      {/* Webhook */}
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase text-amber-500">Webhook / Polling</h3>
        <div className="text-[11px] text-slate-500 bg-white/5 rounded-xl p-3">
          <p>🔄 <b>Polling</b> — lokal, webhook lazım deyil</p>
          <p>🌐 <b>Webhook</b> — istehsal serverində, HTTPS lazımdır</p>
        </div>
        <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://yourdomain.com/webhook"
          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-white" />
        <div className="flex gap-2">
          <button onClick={setWebhook} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-black text-xs uppercase">🔗 Webhook Qur</button>
          <button onClick={delWebhook} className="flex-1 bg-orange-500/20 text-orange-400 border border-orange-500/20 py-2.5 rounded-xl font-black text-xs uppercase">🔄 Polling'ə Keç</button>
        </div>
      </div>

      {/* Commands reference */}
      <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4">
        <h3 className="text-xs font-black uppercase text-amber-500 mb-3">Qrupda İşlədilə Bilən Əmrlər</h3>
        <div className="space-y-1.5 text-[11px]">
          {[
            ["/kart 4169... Ad Soyad", "Ödəniş kartını dəyiş"],
            ["/blok istifadeciAdi", "İstifadəçi blok menyusu"],
            ["/bloklar", "Bloklu istifadəçilər"],
            ["/ayarlar", "Cari ayarları göstər"],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex justify-between items-center py-1.5 border-b border-white/5">
              <code className="text-amber-400 text-[10px]">{cmd}</code>
              <span className="text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
