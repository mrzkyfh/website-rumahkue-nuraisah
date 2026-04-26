window.RUMAHKUE_CONFIG = Object.assign(
  {
    // Dapatkan URL & Anon Key dari Dashboard Supabase > Settings > API
    supabaseUrl: "https://xhdlezdgckbflzmyawrk.supabase.co", // Contoh: "https://xyz.supabase.co"
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZGxlemRnY2tiZmx6bXlhd3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDU3MTQsImV4cCI6MjA5MjcyMTcxNH0.4Kw-2FpAAe1J-lCRYM9xKWzHJOD8d3Vqbgjm7u2S_fQ", // Contoh: "eyJhbG..."
    supabaseProductsTable: "products",
    legacyProductsApiBase: "https://rumah-kue-api.mrzkyfh.workers.dev"
  },
  window.RUMAHKUE_CONFIG || {}
);
