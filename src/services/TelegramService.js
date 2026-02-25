const API_BASE = '/api/send-message.php';

export const TelegramService = {
  sendMessage: async (message, buttons = null, replyToMessageId = null) => {
    try {
      const url = `${API_BASE}?method=sendMessage`;
      const body = {
        text: message,
        parse_mode: "HTML",
      };

      if (replyToMessageId) {
        body.reply_to_message_id = replyToMessageId;
      }

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
      const url = `${API_BASE}?method=sendPhoto`;
      const formData = new FormData();
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
      const url = `${API_BASE}?method=getUpdates&offset=${offset}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Telegram getUpdates error:", error);
      return { ok: false };
    }
  },

  getChat: async () => {
    try {
      const url = `${API_BASE}?method=getChat`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Telegram getChat error:", error);
      return { ok: false };
    }
  },

  pinChatMessage: async (message_id) => {
    try {
      const url = `${API_BASE}?method=pinChatMessage`;
      const body = {
        message_id: message_id
      };
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error("Telegram pinChatMessage error:", error);
      return { ok: false };
    }
  }
};

