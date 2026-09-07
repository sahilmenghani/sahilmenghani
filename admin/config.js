const SUPABASE_URL = "https://bflpxidetcwvvezrnejm.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_CqcSMaNerpk-niIiqoWwGQ_kT-QrL8X";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);