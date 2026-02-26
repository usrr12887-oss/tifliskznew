/**
 * Təhlükəsizlik səbəbilə artıq birbaşa Telegram API çağırılmır.
 * Bütün sorğular backend qatından (Node.js) keçir.
 */

const BACKEND_API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';

export const TelegramService = {
  /**
   * Depozit və ya Çıxarış sorğusunu backend-ə göndərir
   */
  requestAction: async (userId, type, amount, data = {}) => {
    try {
      const response = await fetch(`${BACKEND_API}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type,
          amount,
          data,
          requestId: `${userId}-${Date.now()}` // Unique request ID for de-duplication
        }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Backend connection error:", error);
      return { success: false, message: "Serverlə əlaqə kəsildi." };
    }
  },

  // Köhnə metodlar silindi və ya dummy edildi (layihədə qırılma olmaması üçün)
  sendMessage: async () => ({ success: false, message: "Direct access disabled" }),
  getUpdates: async () => ({ ok: true, result: [] }), // Polling artıq frontend-də olmamalıdır
  checkBlock: async () => ({ blocked: false })
};
