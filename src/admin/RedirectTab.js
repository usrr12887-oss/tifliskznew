import React, { useState, useEffect } from "react";
const API = "http://localhost:3001/api/admin";

export default function RedirectTab({ showToast }) {
  const [pathRedirects, setPathRedirects] = useState({});
  const [domainRedirects, setDomainRedirects] = useState({});
  const [activeSection, setActiveSection] = useState("domain");

  // Path redirect form
  const [pathFrom, setPathFrom] = useState("");
  const [pathTo, setPathTo] = useState("");

  // Domain redirect form
  const [domFrom, setDomFrom] = useState("");
  const [domTo, setDomTo] = useState("");
  const [useHttps, setUseHttps] = useState(true);

  const load = async () => {
    try {
      const [p, d] = await Promise.all([
        fetch(`${API}/redirects`).then(r => r.json()),
        fetch(`${API}/domain-redirects`).then(r => r.json()),
      ]);
      setPathRedirects(p || {});
      setDomainRedirects(d || {});
    } catch (_) {}
  };

  useEffect(() => { load(); }, []);

  const addPath = async () => {
    if (!pathFrom || !pathTo) return showToast("⚠️ Hər iki xananı doldurun");
    const from = pathFrom.startsWith("/") ? pathFrom : "/" + pathFrom;
    const r = await fetch(`${API}/redirects`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: pathTo })
    }).then(r => r.json());
    if (r.ok) { showToast("✅ Əlavə edildi"); setPathFrom(""); setPathTo(""); load(); }
  };

  const delPath = async (key) => {
    await fetch(`${API}/redirects/${encodeURIComponent(key)}`, { method: "DELETE" });
    showToast("🗑️ Silindi"); load();
  };

  const addDomain = async () => {
    if (!domFrom || !domTo) return showToast("⚠️ Hər iki xananı doldurun");
    // Protokolu sil
    const from = domFrom.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const to = domTo.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const r = await fetch(`${API}/domain-redirects`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDomain: from, toDomain: to, https: useHttps })
    }).then(r => r.json());
    if (r.ok) { showToast("✅ Domain redirect əlavə edildi"); setDomFrom(""); setDomTo(""); load(); }
  };

  const delDomain = async (key) => {
    await fetch(`${API}/domain-redirects/${encodeURIComponent(key)}`, { method: "DELETE" });
    showToast("🗑️ Silindi"); load();
  };

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-lg font-black uppercase text-slate-300">🌐 Redirect İdarəetmə</h2>

      {/* Section switch */}
      <div className="flex gap-2">
        <button onClick={() => setActiveSection("domain")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase ${activeSection === "domain" ? "bg-amber-500 text-black" : "bg-white/5 text-slate-400"}`}>
          🌐 Domain Redirect
        </button>
        <button onClick={() => setActiveSection("path")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase ${activeSection === "path" ? "bg-amber-500 text-black" : "bg-white/5 text-slate-400"}`}>
          🔗 Yol Redirect
        </button>
      </div>

      {/* DOMAIN REDIRECT */}
      {activeSection === "domain" && (
        <>
          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-500">Domain → Subdomain Yönləndir</h3>
            <div className="text-[11px] text-slate-500 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 space-y-1">
              <p>📌 <b className="text-blue-400">Nümunə:</b> tifliskz.com → 1.tifliskz.com</p>
              <p>Əsas domenə daxil olan ziyarətçilər avtomatik subdomenə yönləndirilir.</p>
              <p className="text-slate-600">⚠️ Bu funksiyanın işləməsi üçün serverin həmin domendə işləməsi lazımdır.</p>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Hansı Domendən</label>
                <input value={domFrom} onChange={e => setDomFrom(e.target.value)}
                  placeholder="tifliskz.com"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase block mb-1">Hara Yönləndir</label>
                <input value={domTo} onChange={e => setDomTo(e.target.value)}
                  placeholder="1.tifliskz.com"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useHttps} onChange={e => setUseHttps(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                <span className="text-xs text-slate-400 font-bold">HTTPS istifadə et (istehsal üçün tövsiyə edilir)</span>
              </label>
              <button onClick={addDomain} className="w-full bg-amber-500 text-black py-2.5 rounded-xl font-black text-xs uppercase">
                ➕ Domain Redirect Əlavə Et
              </button>
            </div>
          </div>

          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-black uppercase text-amber-500 mb-3">Aktiv Domain Redirect-lər</h3>
            {Object.keys(domainRedirects).length === 0
              ? <p className="text-slate-600 text-xs text-center py-4">Heç bir domain redirect yoxdur</p>
              : Object.entries(domainRedirects).map(([from, rule]) => (
                <div key={from} className="flex items-center justify-between p-3 bg-white/5 rounded-xl gap-2">
                  <div className="flex-1 overflow-hidden space-y-0.5">
                    <code className="text-amber-400 text-[11px] block">{from}</code>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 text-[9px]">→</span>
                      <code className="text-green-400 text-[11px]">{rule.https ? "https" : "http"}://{rule.to}</code>
                    </div>
                  </div>
                  <button onClick={() => delDomain(from)} className="text-red-400 text-[11px] font-black bg-red-500/10 px-3 py-1.5 rounded-lg shrink-0">Sil</button>
                </div>
              ))
            }
          </div>

          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4">
            <h3 className="text-xs font-black uppercase text-amber-500 mb-3">Nginx ilə Konfiqurasiya</h3>
            <pre className="bg-black/50 rounded-xl p-3 text-[10px] text-green-400 overflow-x-auto whitespace-pre-wrap">{`# /etc/nginx/sites-available/tifliskz.conf

server {
    listen 80;
    server_name tifliskz.com www.tifliskz.com;
    return 301 https://1.tifliskz.com$request_uri;
}

server {
    listen 443 ssl;
    server_name 1.tifliskz.com;
    # SSL sertifikat...
    location / {
        proxy_pass http://localhost:3005;
    }
    location /api {
        proxy_pass http://localhost:3001;
    }
}`}</pre>
          </div>
        </>
      )}

      {/* PATH REDIRECT */}
      {activeSection === "path" && (
        <>
          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-500">Yol → URL Yönləndir</h3>
            <div className="text-[11px] text-slate-500 bg-white/5 rounded-xl p-3">
              <p>Nümunə: <code className="text-amber-400">/promo</code> → <code className="text-green-400">https://t.me/tifliskazinocom</code></p>
            </div>
            <div className="space-y-2">
              <input value={pathFrom} onChange={e => setPathFrom(e.target.value)}
                placeholder="/promo"
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
              <input value={pathTo} onChange={e => setPathTo(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white" />
              <button onClick={addPath} className="w-full bg-amber-500 text-black py-2.5 rounded-xl font-black text-xs uppercase">➕ Əlavə Et</button>
            </div>
          </div>

          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-black uppercase text-amber-500 mb-3">Aktiv Yol Redirect-lər</h3>
            {Object.keys(pathRedirects).length === 0
              ? <p className="text-slate-600 text-xs text-center py-4">Heç bir redirect yoxdur</p>
              : Object.entries(pathRedirects).map(([f, t]) => (
                <div key={f} className="flex items-center justify-between p-3 bg-white/5 rounded-xl gap-2">
                  <div className="flex-1 overflow-hidden">
                    <code className="text-amber-400 text-[11px] block truncate">{f}</code>
                    <code className="text-green-400 text-[10px] block truncate">→ {t}</code>
                  </div>
                  <button onClick={() => delPath(f)} className="text-red-400 text-[11px] font-black bg-red-500/10 px-3 py-1.5 rounded-lg shrink-0">Sil</button>
                </div>
              ))
            }
          </div>
        </>
      )}
    </div>
  );
}
