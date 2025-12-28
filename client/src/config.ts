export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  zego: {
    appId: parseInt(import.meta.env.VITE_ZEGO_APP_ID),
    serverUrl: import.meta.env.VITE_ZEGO_SERVER_URL,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  },
}
