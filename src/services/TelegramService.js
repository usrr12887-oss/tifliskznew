const API_BASE = '/api/send-message.php';

export const TelegramService = {
  sendMessage: async (message, buttons = null, replyToMessageId = null) => {
    try {
      const body = {
        text: message
      };

      const response = await fetch(API_BASE, {
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
    // Note: sendPhoto might need updates on the PHP side too if you use it
    console.warn("sendPhoto is not currently supported by send-message.php");
    return { ok: false, error: 'Not supported' };
  },

  getUpdates: async (offset = 0) => {
    // Note: getUpdates is typically a polling mechanism, you may need a separate endpoint for this if required
     console.warn("getUpdates is not currently supported by send-message.php");
     return { ok: false, result: [] };
  },

  getChat: async () => {
    // Note: getChat
     console.warn("getChat is not currently supported by send-message.php");
     return { ok: false };
  },

  pinChatMessage: async (message_id) => {
     console.warn("pinChatMessage is not currently supported by send-message.php");
     return { ok: false };
  }
};

