require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const multer = require('multer');
const FormData = require('form-data');
const webPush = require('web-push');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_ID = process.env.TELEGRAM_GROUP_ID;
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ============================================================
//  YADDAŞ (server yenidən başlayanda sıfırlanır)
// ============================================================
let SETTINGS = { adminCard: '0000 0000 0000 0000', adminCardName: 'Admin', paymentType: 'card' };
let REQUESTS = {};
let BLOCKED_USERS = {};
let pollingOffset = 0;

// VAPID qurulumu
try {
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@tifliskz.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} catch(e) { console.warn('VAPID qurulmadı:', e.message); }

// ============================================================
//  CORS
// ============================================================
const allowedOrigins = [
    ...(process.env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean),
    'http://localhost:3000',
    'http://localhost:3005',
    'http://localhost:3006',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) return callback(null, true);
        callback(new Error('CORS not allowed'));
    },
    credentials: true
}));
app.use(express.json());

// ============================================================
//  YARDIMÇI: Telegram-a mesaj göndər
// ============================================================
async function tgSend(method, body) {
    try {
        const r = await fetch(`${TG}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await r.json();
    } catch (e) {
        console.error(`tgSend(${method}) error:`, e.message);
        return { ok: false };
    }
}

async function tgAnswer(callbackId, text, alert = false) {
    return tgSend('answerCallbackQuery', { callback_query_id: callbackId, text, show_alert: alert });
}

// ============================================================
//  TELEGRAM LONG-POLLING  (webhook gerekmez!)
// ============================================================
async function processUpdate(update) {
    // --- CALLBACK QUERY (düymə basıldı) ---
    if (update.callback_query) {
        const cq = update.callback_query;
        const cbData = cq.data || '';

        // approve_ID veya reject_ID
        if (cbData.startsWith('approve_') || cbData.startsWith('reject_')) {
            const parts = cbData.split('_');
            const action = parts[0];
            const requestId = parts.slice(1).join('_');
            const reqItem = REQUESTS[requestId];

            if (!reqItem) {
                await tgAnswer(cq.id, '⚠️ Sorğu tapılmadı (server yenidən başlamış ola bilər).', true);
                return;
            }

            if (reqItem.status !== 'pending') {
                await tgAnswer(cq.id, `ℹ️ Sorğu artıq ${reqItem.status} vəziyyətindədir.`, true);
                return;
            }

            if (action === 'approve') {
                if (!reqItem.adminCode) {
                    await tgAnswer(cq.id, '⚠️ Əvvəlcə oyun kodunu bu sorğuya REPLY olaraq yazın!', true);
                    return;
                }
                reqItem.status = 'approved';
                await tgAnswer(cq.id, '✅ Sorğu təsdiqləndi!');
            } else {
                reqItem.status = 'rejected';
                reqItem.reason = reqItem.rejectReason || 'Admin tərəfindən ləğv edildi.';
                await tgAnswer(cq.id, '❌ Sorğu ləğv edildi.');
            }

            // Düymələri sil
            await tgSend('editMessageReplyMarkup', {
                chat_id: GROUP_ID,
                message_id: cq.message.message_id,
                reply_markup: { inline_keyboard: [] }
            });

            const emoji = reqItem.status === 'approved' ? '✅' : '❌';
            const statusText = reqItem.status === 'approved'
                ? `TƏSDİQLƏNDİ — Oyun kodu: <code>${reqItem.adminCode}</code>`
                : `LƏĞV EDİLDİ — Səbəb: ${reqItem.reason}`;

            await tgSend('sendMessage', {
                chat_id: GROUP_ID,
                text: `${emoji} Sorğu #<code>${requestId}</code>\n${statusText}`,
                parse_mode: 'HTML',
                reply_to_message_id: cq.message.message_id
            });
        }

        // block_15_userId  veya  block_perm_userId
        if (cbData.startsWith('block_')) {
            const parts = cbData.split('_');
            const blockType = parts[1]; // '15' or 'perm'
            const targetUserId = parts.slice(2).join('_');

            if (blockType === '15') {
                const until = Date.now() + 15 * 60 * 1000;
                BLOCKED_USERS[targetUserId] = { until, reason: '15 dəqiqəlik blok (admin)' };
                await tgAnswer(cq.id, `⏱️ ${targetUserId} — 15 dəqiqə blok edildi.`);
                await tgSend('sendMessage', {
                    chat_id: GROUP_ID,
                    text: `⏱️ <code>${targetUserId}</code> istifadəçisi 15 dəqiqəlik blok edildi.`,
                    parse_mode: 'HTML',
                    reply_to_message_id: cq.message.message_id
                });
            } else if (blockType === 'perm') {
                BLOCKED_USERS[targetUserId] = { until: null, reason: 'Daimi blok (admin)' };
                await tgAnswer(cq.id, `🚫 ${targetUserId} — daimi blok edildi.`);
                await tgSend('sendMessage', {
                    chat_id: GROUP_ID,
                    text: `🚫 <code>${targetUserId}</code> istifadəçisi DAİMİ BLOK edildi.`,
                    parse_mode: 'HTML',
                    reply_to_message_id: cq.message.message_id
                });
            }
        }

        // unblock_userId
        if (cbData.startsWith('unblock_')) {
            const targetUserId = cbData.replace('unblock_', '');
            delete BLOCKED_USERS[targetUserId];
            await tgAnswer(cq.id, `✅ ${targetUserId} blokdan çıxarıldı.`);
            await tgSend('sendMessage', {
                chat_id: GROUP_ID,
                text: `✅ <code>${targetUserId}</code> blokdan çıxarıldı.`,
                parse_mode: 'HTML',
                reply_to_message_id: cq.message.message_id
            });
        }

        return;
    }

    // --- MESAJ ---
    if (update.message) {
        const msg = update.message;
        const text = (msg.text || '').trim();

        // /kart nömrə Ad Soyad
        // Misal: /kart 4169 7388 9032 1234 Elvin Həsənov
        if (text.startsWith('/kart')) {
            const content = text.replace('/kart', '').trim();
            // Kart nömrəsini (16 rəqəm, boşluqlu/ya da bitişik) ayır
            const cardMatch = content.match(/(\d[\d\s]{13,18}\d)/);
            if (cardMatch) {
                const card = cardMatch[1].trim();
                const name = content.replace(cardMatch[1], '').trim() || 'Admin';
                SETTINGS.adminCard = card;
                SETTINGS.adminCardName = name;
                await tgSend('sendMessage', {
                    chat_id: GROUP_ID,
                    text: `✅ Ödəniş kartı yeniləndi!\n\n💳 Kart: <code>${card}</code>\n👤 Ad: ${name}\n\nSaytda dərhal görünəcək.`,
                    parse_mode: 'HTML',
                    reply_to_message_id: msg.message_id
                });
            } else {
                await tgSend('sendMessage', {
                    chat_id: GROUP_ID,
                    text: `⚠️ Düzgün format:\n<code>/kart 4169 7388 9032 1234 Ad Soyad</code>`,
                    parse_mode: 'HTML',
                    reply_to_message_id: msg.message_id
                });
            }
            return;
        }

        // /blok istifadəçiAdı — blok menyusu göndər
        if (text.startsWith('/blok')) {
            const targetUser = text.replace('/blok', '').trim();
            if (!targetUser) {
                await tgSend('sendMessage', {
                    chat_id: GROUP_ID,
                    text: `⚠️ Format: <code>/blok istifadəçiAdı</code>`,
                    parse_mode: 'HTML',
                    reply_to_message_id: msg.message_id
                });
                return;
            }
            await tgSend('sendMessage', {
                chat_id: GROUP_ID,
                text: `🔒 <b>${targetUser}</b> üçün blok növü seçin:`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '⏱️ 15 dəqiqə', callback_data: `block_15_${targetUser}` },
                        { text: '🚫 Daimi', callback_data: `block_perm_${targetUser}` },
                        { text: '✅ Bloku aç', callback_data: `unblock_${targetUser}` }
                    ]]
                },
                reply_to_message_id: msg.message_id
            });
            return;
        }

        // /bloklar — bütün bloklu istifadəçiləri göstər
        if (text.startsWith('/bloklar')) {
            const entries = Object.entries(BLOCKED_USERS);
            if (!entries.length) {
                await tgSend('sendMessage', { chat_id: GROUP_ID, text: 'ℹ️ Bloklu istifadəçi yoxdur.', reply_to_message_id: msg.message_id });
                return;
            }
            const lines = entries.map(([id, info]) => {
                const timeLeft = info.until ? `${Math.max(0, Math.ceil((info.until - Date.now()) / 60000))} dəq` : 'Daimi';
                return `• <code>${id}</code> — ${timeLeft}`;
            }).join('\n');
            await tgSend('sendMessage', {
                chat_id: GROUP_ID,
                text: `🔒 <b>Bloklu istifadəçilər:</b>\n${lines}`,
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
            return;
        }

        // /ayarlar — cari kart məlumatları
        if (text.startsWith('/ayarlar')) {
            await tgSend('sendMessage', {
                chat_id: GROUP_ID,
                text: `⚙️ <b>Cari Ayarlar:</b>\n💳 Kart: <code>${SETTINGS.adminCard}</code>\n👤 Ad: ${SETTINGS.adminCardName}`,
                parse_mode: 'HTML',
                reply_to_message_id: msg.message_id
            });
            return;
        }

        // REPLY — oyun kodu yazıldı
        if (msg.reply_to_message) {
            const replyToId = msg.reply_to_message.message_id;
            const requestId = Object.keys(REQUESTS).find(id => REQUESTS[id].tgMsgId === replyToId);
            if (requestId && REQUESTS[requestId].status === 'pending') {
                REQUESTS[requestId].adminCode = text;
                await tgSend('sendMessage', {
                    chat_id: GROUP_ID,
                    text: `✍️ Oyun kodu qeydə alındı: <b>${text}</b>\n\nİndi <b>TƏSDİQLƏ</b> düyməsini sıxa bilərsiniz.`,
                    parse_mode: 'HTML',
                    reply_to_message_id: msg.message_id
                });
            }
        }
    }
}

async function startPolling() {
    console.log('🔄 Telegram polling başladı...');
    // Webhook-u sil (polling ilə ziddiyyət olmasın)
    await fetch(`${TG}/deleteWebhook`).catch(() => {});

    const poll = async () => {
        try {
            const r = await fetch(`${TG}/getUpdates?offset=${pollingOffset}&timeout=25&limit=10`);
            const data = await r.json();
            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    pollingOffset = update.update_id + 1;
                    await processUpdate(update);
                }
            }
        } catch (e) {
            console.error('Polling xətası:', e.message);
        }
        setTimeout(poll, 1000);
    };
    poll();
}

// ============================================================
//  REST API
// ============================================================

// Ayarları gətir
app.get('/api/settings', (req, res) => res.json(SETTINGS));

// İstifadəçi bloklanıb-yoxla
app.get('/api/user-status/:userId', (req, res) => {
    const userId = req.params.userId;
    const block = BLOCKED_USERS[userId];
    if (!block) return res.json({ blocked: false });

    if (block.until !== null && Date.now() > block.until) {
        delete BLOCKED_USERS[userId];
        return res.json({ blocked: false });
    }
    const minutesLeft = block.until ? Math.ceil((block.until - Date.now()) / 60000) : null;
    res.json({ blocked: true, permanent: block.until === null, minutesLeft, reason: block.reason });
});

// Admin: İstifadəçini blok et (API vasitəsilə)
app.post('/api/block-user', (req, res) => {
    const { userId, duration, reason } = req.body; // duration: 15 | 'perm'
    if (!userId) return res.status(400).json({ error: 'userId tələb olunur' });
    if (duration === 'perm' || duration === null) {
        BLOCKED_USERS[userId] = { until: null, reason: reason || 'Admin tərəfindən daimi blok' };
    } else {
        const minutes = parseInt(duration) || 15;
        BLOCKED_USERS[userId] = { until: Date.now() + minutes * 60 * 1000, reason: reason || `${minutes} dəqiqəlik blok` };
    }
    res.json({ success: true, blocked: BLOCKED_USERS[userId] });
});

// Admin: Bloku aç
app.post('/api/unblock-user', (req, res) => {
    const { userId } = req.body;
    delete BLOCKED_USERS[userId];
    res.json({ success: true });
});

// Admin: Bütün blokları göstər
app.get('/api/blocked-users', (req, res) => {
    // Müddəti bitmiş blokları təmizlə
    for (const [id, info] of Object.entries(BLOCKED_USERS)) {
        if (info.until && Date.now() > info.until) delete BLOCKED_USERS[id];
    }
    res.json(BLOCKED_USERS);
});

// Depozit / Çıxarış göndər
app.post('/api/action', upload.single('photo'), async (req, res) => {
    const { userId, type, amount, data } = req.body;

    // Blok yoxlaması
    const block = BLOCKED_USERS[userId];
    if (block) {
        if (block.until === null || Date.now() < block.until) {
            const msg = block.until
                ? `Hesabınız ${Math.ceil((block.until - Date.now()) / 60000)} dəqiqəlik bloklanıb.`
                : 'Hesabınız daimi olaraq bloklanıb. Adminlə əlaqə saxlayın.';
            return res.json({ success: false, message: msg, blocked: true });
        } else {
            delete BLOCKED_USERS[userId];
        }
    }

    const requestId = Date.now().toString();

    try {
        let message = `🔔 <b>YENİ ${type === 'deposit' ? 'DEPOZİT' : 'ÇIXARIŞ'} SORĞUSU</b>\n\n`;
        message += `👤 İSTİFADƏÇİ: <code>${userId}</code>\n`;
        message += `💰 MƏBLƏĞ: <b>${amount} AZN</b>\n`;

        if (type === 'withdraw') {
            try {
                const parsedData = JSON.parse(data);
                message += `💳 KART: <code>${parsedData.card}</code>\n`;
                message += `📅 TARİX: ${parsedData.expiry}\n`;
            } catch (_) {}
        }

        message += `\n🆔 Sorğu ID: <code>${requestId}</code>`;
        message += `\n\n📝 <b>TƏSDİQ ÜÇÜN:</b> Bu mesajı <u>oyun kodunu</u> REPLY olaraq yazın, sonra düyməni basın.`;

        const inline_keyboard = [[
            { text: '✅ TƏSDİQLƏ', callback_data: `approve_${requestId}` },
            { text: '❌ LƏĞV ET', callback_data: `reject_${requestId}` }
        ], [
            { text: `⏱️ 15dəq blok`, callback_data: `block_15_${userId}` },
            { text: `🚫 Daimi blok`, callback_data: `block_perm_${userId}` }
        ]];

        let tgRes;
        if (req.file && type === 'deposit') {
            const form = new FormData();
            form.append('chat_id', GROUP_ID);
            form.append('photo', fs.createReadStream(req.file.path));
            form.append('caption', message);
            form.append('parse_mode', 'HTML');
            form.append('reply_markup', JSON.stringify({ inline_keyboard }));

            const resp = await fetch(`${TG}/sendPhoto`, { method: 'POST', body: form });
            tgRes = await resp.json();
            try { fs.unlinkSync(req.file.path); } catch (_) {}
        } else {
            tgRes = await tgSend('sendMessage', {
                chat_id: GROUP_ID,
                text: message,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard }
            });
        }

        REQUESTS[requestId] = {
            userId, type, amount,
            status: 'pending',
            tgMsgId: tgRes.result?.message_id
        };

        res.json({ success: true, requestId });
    } catch (error) {
        console.error('Action Error:', error);
        res.status(500).json({ success: false, message: 'Server xətası' });
    }
});

// Sorğu statusunu yoxla
app.get('/api/status/:id', (req, res) => {
    const item = REQUESTS[req.params.id];
    if (!item) return res.json({ status: 'not_found' });
    res.json(item);
});

// Bot yoxla
app.get('/api/test-bot', async (req, res) => {
    try {
        const r = await fetch(`${TG}/getMe`);
        const data = await r.json();
        res.json(data.ok ? { success: true, bot: data.result } : { success: false, error: data.description });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Test mesajı göndər
app.get('/api/send-test', async (req, res) => {
    const data = await tgSend('sendMessage', {
        chat_id: GROUP_ID,
        text: '✅ Tiflis Kazino serveri aktiv! Polling işləyir.'
    });
    res.json(data);
});

// ---- ADMIN BOT MANAGEMENT ----

// Bot məlumatları
app.get('/api/admin/bot-info', async (req, res) => {
    try {
        const r = await fetch(`${TG}/getMe`);
        const data = await r.json();
        res.json({ ok: data.ok, bot: data.result, groupId: GROUP_ID });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Qrupa xüsusi mesaj göndər
app.post('/api/admin/send-message', async (req, res) => {
    const { text, chatId } = req.body;
    if (!text) return res.status(400).json({ ok: false, error: 'Mətn tələb olunur' });
    const data = await tgSend('sendMessage', {
        chat_id: chatId || GROUP_ID,
        text,
        parse_mode: 'HTML'
    });
    res.json(data);
});

// Webhook qur (domain üçün)
app.post('/api/admin/set-webhook', async (req, res) => {
    const { webhookUrl } = req.body;
    if (!webhookUrl) return res.status(400).json({ ok: false, error: 'webhookUrl tələb olunur' });
    try {
        const r = await fetch(`${TG}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl })
        });
        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Webhook sil (polling rejiminə qayıt)
app.post('/api/admin/delete-webhook', async (req, res) => {
    try {
        const r = await fetch(`${TG}/deleteWebhook`, { method: 'POST' });
        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Cari webhook məlumatı
app.get('/api/admin/webhook-info', async (req, res) => {
    try {
        const r = await fetch(`${TG}/getWebhookInfo`);
        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Admin şifrəsini serverdə saxla (runtime)
let ADMIN_PASSWORD_OVERRIDE = null;
app.post('/api/admin/change-password', (req, res) => {
    const { currentPass, newPass } = req.body;
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';
    const currentActual = ADMIN_PASSWORD_OVERRIDE || defaultPass;
    if (currentPass !== currentActual) return res.json({ ok: false, error: 'Cari şifrə yanlışdır' });
    if (!newPass || newPass.length < 4) return res.json({ ok: false, error: 'Yeni şifrə ən az 4 simvol olmalıdır' });
    ADMIN_PASSWORD_OVERRIDE = newPass;
    res.json({ ok: true });
});

// Admin şifrəsini yoxla
app.post('/api/admin/verify-password', (req, res) => {
    const { pass } = req.body;
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';
    const actual = ADMIN_PASSWORD_OVERRIDE || defaultPass;
    res.json({ ok: pass === actual });
});

// Redirect siyahısını idarə et
let REDIRECTS = {}; // { fromPath: toUrl }
app.get('/api/admin/redirects', (req, res) => res.json(REDIRECTS));
app.post('/api/admin/redirects', (req, res) => {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ ok: false });
    REDIRECTS[from] = to;
    res.json({ ok: true, redirects: REDIRECTS });
});
app.delete('/api/admin/redirects/:key', (req, res) => {
    const key = decodeURIComponent(req.params.key);
    delete REDIRECTS[key];
    res.json({ ok: true });
});

// Redirect middleware (yuxarıda qeydiyyat olduğundan dynamic olar)
app.use((req, res, next) => {
    const match = REDIRECTS[req.path];
    if (match) return res.redirect(302, match);
    next();
});


// ---- PUSH BİLDİRİŞLƏR (real web-push) ----
let PUSH_SUBSCRIPTIONS = [];

// VAPID public key - frontend-ə ver
app.get('/api/push/vapid-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// İstifadəçi abunəlik qeydiyyatı
app.post('/api/push/subscribe', (req, res) => {
    const { username, subscription } = req.body;
    if (!subscription || !subscription.endpoint) return res.status(400).json({ ok: false });
    PUSH_SUBSCRIPTIONS = PUSH_SUBSCRIPTIONS.filter(s => s.username !== username);
    PUSH_SUBSCRIPTIONS.push({ username, subscription, addedAt: new Date().toISOString() });
    console.log(`🔔 Push abunə: ${username} (cəmi: ${PUSH_SUBSCRIPTIONS.length})`);
    res.json({ ok: true, total: PUSH_SUBSCRIPTIONS.length });
});

app.get('/api/admin/push-subscribers', (req, res) => {
    res.json({ subscribers: PUSH_SUBSCRIPTIONS.map(s => ({ username: s.username, addedAt: s.addedAt })), total: PUSH_SUBSCRIPTIONS.length });
});

app.post('/api/admin/send-push', async (req, res) => {
    const { title, body, targetUsername, url } = req.body;
    if (!title || !body) return res.status(400).json({ ok: false, error: 'title ve body lazimdir' });
    const targets = targetUsername
        ? PUSH_SUBSCRIPTIONS.filter(s => s.username === targetUsername)
        : PUSH_SUBSCRIPTIONS;

    if (targets.length === 0) return res.json({ ok: false, error: 'Abunəçi tapılmadı' });

    const payload = JSON.stringify({ title, body, url: url || '/', icon: '/logo192.png', badge: '/logo192.png' });
    let sent = 0, failed = 0;
    for (const s of targets) {
        try {
            await webPush.sendNotification(s.subscription, payload);
            sent++;
        } catch (e) {
            failed++;
            // Süresi keçmiş abunəliyi sil
            if (e.statusCode === 410 || e.statusCode === 404) {
                PUSH_SUBSCRIPTIONS = PUSH_SUBSCRIPTIONS.filter(x => x.username !== s.username);
            }
        }
    }

    const tgMsg = `🔔 <b>PUSH GÖNDƏRİLDİ</b>\n<b>Başlıq:</b> ${title}\n<b>Mətn:</b> ${body}\n<b>Göndərildi:</b> ${sent} | <b>Uğursuz:</b> ${failed}`;
    await tgSend('sendMessage', { chat_id: GROUP_ID, text: tgMsg, parse_mode: 'HTML' });

    res.json({ ok: true, sent, failed });
});

// ---- DOMAIN REDIRECT ----
let DOMAIN_REDIRECTS = {}; // { 'tifliskz.com': '1.tifliskz.com' }

app.get('/api/admin/domain-redirects', (req, res) => res.json(DOMAIN_REDIRECTS));

app.post('/api/admin/domain-redirects', (req, res) => {
    const { fromDomain, toDomain, https: useHttps } = req.body;
    if (!fromDomain || !toDomain) return res.status(400).json({ ok: false });
    DOMAIN_REDIRECTS[fromDomain] = { to: toDomain, https: useHttps !== false };
    res.json({ ok: true, redirects: DOMAIN_REDIRECTS });
});

app.delete('/api/admin/domain-redirects/:domain', (req, res) => {
    delete DOMAIN_REDIRECTS[decodeURIComponent(req.params.domain)];
    res.json({ ok: true });
});

// Domain redirect middleware
app.use((req, res, next) => {
    const host = req.hostname;
    const rule = DOMAIN_REDIRECTS[host];
    if (rule) {
        const proto = rule.https ? 'https' : 'http';
        return res.redirect(302, `${proto}://${rule.to}${req.originalUrl}`);
    }
    next();
});

// ============================================================

//  BAŞLAT
// ============================================================
app.listen(PORT, async () => {
    console.log(`✅ Server port ${PORT}-da işləyir`);
    console.log(`🤖 Bot token: ${BOT_TOKEN?.slice(0, 15)}...`);
    console.log(`💬 Group ID: ${GROUP_ID}`);
    startPolling();
});
