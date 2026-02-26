require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3001;

// Render-də müvəqqəti saxlama (Restartda sıfırlanacaq, amma daha sürətlidir)
let SETTINGS = { adminCard: "0000 0000 0000 0000", adminCardName: "Admin" };
let REQUESTS = {};

app.use(cors());
app.use(express.json());

// API: Ayarları gətir
app.get('/api/settings', (req, res) => res.json(SETTINGS));

// API: Depozit/Çıxarış göndərilməsi
app.post('/api/action', upload.single('photo'), async (req, res) => {
    const { userId, type, amount, data } = req.body;
    const requestId = Date.now().toString();

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
        message += `\n📝 <b>TƏSDİQ ÜÇÜN:</b> Bu mesajı <code>OYUN KODU</code> yazaraq REPLY edin, sonra düyməni sıxın.`;

        let tgRes;
        const inline_keyboard = [[
            { text: "✅ TƏSDİQLƏ", callback_data: `approve_${requestId}` },
            { text: "❌ LƏĞV ET", callback_data: `reject_${requestId}` }
        ]];

        if (req.file && type === 'deposit') {
            const form = new FormData();
            form.append('chat_id', process.env.TELEGRAM_GROUP_ID);
            form.append('photo', fs.createReadStream(req.file.path));
            form.append('caption', message);
            form.append('parse_mode', 'HTML');
            form.append('reply_markup', JSON.stringify({ inline_keyboard }));

            const resp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: 'POST', body: form });
            tgRes = await resp.json();
            fs.unlinkSync(req.file.path);
        } else {
            const resp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_GROUP_ID,
                    text: message,
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard }
                })
            });
            tgRes = await resp.json();
        }

        REQUESTS[requestId] = { userId, type, amount, status: 'pending', tgMsgId: tgRes.result?.message_id };
        res.json({ success: true, requestId });
    } catch (error) {
        console.error("Action Error:", error);
        res.status(500).json({ success: false });
    }
});

app.get('/api/status/:id', (req, res) => {
    res.json(REQUESTS[req.params.id] || { status: 'not_found' });
});

// WEBHOOK HANDLER
app.post('/webhook', async (req, res) => {
    const update = req.body;
    
    // 1. Düymələr (Callback Query)
    if (update.callback_query) {
        const data = update.callback_query.data;
        const [action, requestId] = data.split('_');
        const reqItem = REQUESTS[requestId];

        if (reqItem) {
            if (action === 'approve') {
                if (!reqItem.adminCode) {
                    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ callback_query_id: update.callback_query.id, text: "⚠️ Əvvəlcə oyun kodunu reply edin!", show_alert: true })
                    });
                    return res.sendStatus(200);
                }
                reqItem.status = 'approved';
            } else {
                reqItem.status = 'rejected';
                reqItem.reason = reqItem.adminCode || "Məlumatlar yanlışdır.";
            }

            // Düymələri sil və statusu yaz
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: process.env.TELEGRAM_GROUP_ID, message_id: update.callback_query.message.message_id, reply_markup: { inline_keyboard: [] } })
            });

            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: process.env.TELEGRAM_GROUP_ID, text: `✅ Sorğu #${requestId} tamamlandı: ${reqItem.status.toUpperCase()}`, reply_to_message_id: update.callback_query.message.message_id })
            });
        }
        return res.sendStatus(200);
    }

    // 2. Mesajlar və Əmrlər
    if (update.message) {
        const text = update.message.text || "";

        // /kart əmri (HƏR YERDƏ İŞLƏYİR)
        if (text.startsWith('/kart')) {
            const parts = text.split(' ');
            if (parts.length >= 2) {
                SETTINGS.adminCard = parts[1];
                SETTINGS.adminCardName = parts.slice(2).join(' ') || "Admin";
                await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: process.env.TELEGRAM_GROUP_ID, text: `✅ Kart yeniləndi:\n💳 ${SETTINGS.adminCard}\n👤 ${SETTINGS.adminCardName}` })
                });
            }
            return res.sendStatus(200);
        }

        // Reply (Oyun kodu yazıldıqda)
        if (update.message.reply_to_message) {
            const replyToId = update.message.reply_to_message.message_id;
            const requestId = Object.keys(REQUESTS).find(id => REQUESTS[id].tgMsgId === replyToId);
            
            if (requestId) {
                REQUESTS[requestId].adminCode = text;
                await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: process.env.TELEGRAM_GROUP_ID, text: `✍️ Kod qeydə alındı: "${text}". İndi TƏSDİQLƏ düyməsini sıxa bilərsiniz.`, reply_to_message_id: update.message.message_id })
                });
            }
        }
    }

    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server is active on ${PORT}`));
