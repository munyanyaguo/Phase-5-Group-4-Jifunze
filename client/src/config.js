export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com')
  ? 'https://jifunze-31gc.onrender.com'
  : 'http://localhost:5000');
