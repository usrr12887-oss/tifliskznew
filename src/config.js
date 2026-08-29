// API mərkəzi konfiqurasiya
// Production: REACT_APP_API_URL=<dəyər> (.env.production-dan)
// Development: http://localhost:3001/api
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const API_URL = API_BASE;
export const ADMIN_API = `${API_BASE}/admin`;
export const PUSH_API = `${API_BASE}/push`;

export default API_BASE;
