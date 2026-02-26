/**
 * Təhlükəsizlik səbəbilə bütün sorğular Render-də yerləşən backend proxy vasitəsilə icra olunur.
 */

const BACKEND_URL = 'https://tiflis-casino-1.onrender.com/api/action';

export const TelegramService = {
  /**
   * Depozit və ya Çıxarış sorğusunu birbaşa Render backend-ə göndərir
   */
  requestAction: async (userId, type, amount, data = {}) => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type,
          amount,
          data,
          requestId: `${userId}-${Date.now()}`
        }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Backend connection error:", error);
      return { success: false, message: "Serverlə əlaqə kəsildi (Render)." };
    }
  },

  // Köhnə metodlar artıq istifadə edilmir
  sendMessage: async () => ({ success: false }),
  getUpdates: async () => ({ ok: true, result: [] }),
  checkBlock: async () => ({ blocked: false })
};
