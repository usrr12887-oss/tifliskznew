require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Fayl yükləmə üçün
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3001;

// Məlumatları saxlamaq üçün direktoriyanı yarat
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

// Yardımçı funksiyalar
const getSettings = () => {
    if (!fs.existsSync(SETTINGS_FILE)) return { adminCard: "0000 0000 0000 0000", adminCardName: "Admin" };
    return JSON.parse(fs.readFileSync(SETTINGS_FILE));
};
const saveSettings = (data) => fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));

const getRequests = () => {
    if (!fs.existsSync(REQUESTS_FILE)) return {};
    return JSON.parse(fs.readFileSync(REQUESTS_FILE));
};
const saveRequest = (id, data) => {
    const reqs = getRequests();
    reqs[id] = data;
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(reqs, null, 2));
};

app.use(cors());
app.use(express.json());

// 1. API: Kart məlumatlarını gətir
app.get('/api/settings', (req, res) => res.json(getSettings()));

// 2. API: Müştəri tərəfindən Depozit/Çıxarış göndərilməsi
app.post('/api/action', upload.single('photo'), async (req, res) => {
    const { userId, type, amount, data } = req.body;
    const requestId = Date.now().toString();
    const settings = getSettings();

    try {
        let message = `🔔 <b>YENİ ${type === 'deposit' ? 'DEPOZİT' : 'ÇIXARIŞ'} SORĞUSU</b>\n\n`;
        message += `👤 İSTİFADƏÇİ: <code>${userId}</code>\n`;
        message += `💰 MƏBLƏĞ: <b>${amount} AZN</b>\n`;
        
        if (type === 'withdraw') {
            const parsedData = JSON.parse(data);
            message += `💳 KART: <code>${parsedData.card}</code>\n`;
            message += `📅 TARİX: ${parsedData.expiry}\n`;
        }
        
        message += `\n🆔 Sorğu ID: <code>${requestId}</code>\n`;
        message += `\n📝 <i>Təsdiq etmək üçün OYUN KODU yazaraq bu mesajı reply edin.</i>\n`;
        message += `📝 <i>Rədd etmək üçün SƏBƏB yazaraq bu mesajı reply edin və əksinə düyməni sıxın.</i>`;

        let tgRes;
        if (req.file && type === 'deposit') {
            // Şəkil ilə göndər
            const form = new FormData();
            form.append('chat_id', process.env.TELEGRAM_GROUP_ID);
            form.append('photo', fs.createReadStream(req.file.path));
            form.append('caption', message);
            form.append('parse_mode', 'HTML');
            form.append('reply_markup', JSON.stringify({
                inline_keyboard: [
                    [{ text: "✅ TƏSDİQLƏ", callback_data: `approve_${requestId}` },
                     { text: "❌ LƏĞV ET", callback_data: `reject_${requestId}` }]
                ]
            }));

            const resp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: form
            });
            tgRes = await resp.json();
            fs.unlinkSync(req.file.path); // Müvəqqəti faylı sil
        } else {
            // Sadə mesaj kimi göndər
            const resp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_GROUP_ID,
                    text: message,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "✅ TƏSDİQLƏ", callback_data: `approve_${requestId}` },
                             { text: "❌ LƏĞV ET", callback_data: `reject_${requestId}` }]
                        ]
                    }
                })
            });
            tgRes = await resp.json();
        }

        saveRequest(requestId, { userId, type, amount, status: 'pending', tgMsgId: tgRes.result?.message_id });
        res.json({ success: true, requestId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// 3. API: Sorğunun statusunu yoxla (Frontend üçün)
app.get('/api/status/:id', (req, res) => {
    const reqs = getRequests();
    const request = reqs[req.params.id];
    res.json(request || { status: 'not_found' });
});

// 4. Telegram Webhook (Admin cavabları və düymələr üçün)
app.post('/webhook', async (req, res) => {
    const update = req.body;

    // A. Düymə sıxıldıqda (Approve/Reject)
    if (update.callback_query) {
        const [action, requestId] = update.callback_query.data.split('_');
        const reqs = getRequests();
        const request = reqs[requestId];

        if (!request) return res.sendStatus(200);

        if (action === 'approve') {
           if (!request.adminCode) {
               return await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                       callback_query_id: update.callback_query.id,
                       text: "⚠️ Əvvəlcə oyun kodunu reply olaraq yazın!",
                       show_alert: true
                   })
               });
           }
           request.status = 'approved';
        } else {
           request.status = 'rejected';
           request.reason = request.adminCode || "Məlumat düzgün deyil.";
        }

        saveRequest(requestId, request);
        
        // Telegram-dakı mesajı yenilə
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_GROUP_ID,
                text: `📌 Sorğu #${requestId} ${request.status === 'approved' ? 'TƏSDİQLƏNDİ ✅' : 'RƏDD EDİLDİ ❌'}\nOyun Kodu/Səbəb: ${request.adminCode || request.reason}`
            })
        });
    }

    // B. Admin reply yazdıqda (Oyun kodu və ya Səbəb)
    if (update.message && update.message.reply_to_message) {
        const text = update.message.text;
        const replyToId = update.message.reply_to_message.message_id;
        
        // Kartı dəyişmək əmri
        if (text.startsWith('/kart')) {
            const parts = text.split(' ');
            if (parts.length >= 2) {
                saveSettings({ adminCard: parts[1], adminCardName: parts.slice(2).join(' ') || "Admin" });
                return res.sendStatus(200);
            }
        }

        const reqs = getRequests();
        const requestId = Object.keys(reqs).find(id => reqs[id].tgMsgId === replyToId);
        
        if (requestId) {
            reqs[requestId].adminCode = text;
            saveRequest(requestId, reqs[requestId]);
            // Müvəqqəti cavab ver
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_GROUP_ID,
                    text: `✍️ Qeyd alındı: "${text}". İndi yuxarıdakı düyməni sıxaraq tamamlayın.`
                })
            });
        }
    }

    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
