const BACKEND_API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const TelegramService = {
  /**
   * İstəyi (çəki daxil olmaqla) backend-ə göndərir
   */
  requestAction: async (userId, type, amount, data = {}, file = null) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('type', type);
      formData.append('amount', amount);
      formData.append('data', JSON.stringify(data));
      if (file) {
        formData.append('photo', file);
      }

      const response = await fetch(`${BACKEND_API}/action`, {
        method: "POST",
        body: formData, // JSON yerinə FormData
      });
      
      return await response.json();
    } catch (error) {
      console.error("Connection error:", error);
      return { success: false, message: "Serverlə əlaqə kəsildi." };
    }
  },

  /**
   * Sorğunun canlı statusunu yoxlayır
   */
  checkStatus: async (requestId) => {
    try {
      const resp = await fetch(`${BACKEND_API}/status/${requestId}`);
      return await resp.json();
    } catch (e) {
      return { status: 'pending' };
    }
  },

  /**
   * Admin kart məlumatlarını gətirir
   */
  getSettings: async () => {
    try {
      const resp = await fetch(`${BACKEND_API}/settings`);
      return await resp.json();
    } catch (e) {
      return { adminCard: "Məlumat yoxdur", adminCardName: "Admin" };
    }
  }
};
