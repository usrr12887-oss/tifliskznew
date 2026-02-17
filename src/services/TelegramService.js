const BOT_TOKEN = "8075916360:AAFb0tLQJXgIc4GgfXF12gyk-nxUd3WXzLM";
const CHAT_ID = "-5280601304";

export const TelegramService = {
  sendMessage: async (message, buttons = null) => {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const body = {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      };

      if (buttons) {
        body.reply_markup = {
          inline_keyboard: buttons
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error("Telegram error:", error);
    }
  },

  sendPhoto: async (caption, file, buttons = null) => {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("photo", file);
      formData.append("caption", caption);
      formData.append("parse_mode", "HTML");

      if (buttons) {
        formData.append("reply_markup", JSON.stringify({ inline_keyboard: buttons }));
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Telegram Photo Response:", result);
      if (!result.ok) {
        console.error("Telegram API Error:", result.description);
      }
      return result;
    } catch (error) {
      console.error("Telegram photo error:", error);
    }
  },

  getUpdates: async (offset = 0) => {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Telegram getUpdates error:", error);
      return { ok: false };
    }
  }
};
