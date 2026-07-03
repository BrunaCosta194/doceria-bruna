import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enquanto as chaves não estiverem no .env, o app roda com dados de exemplo.
export const supabaseConfigurado = Boolean(url && anon);

export const supabase = supabaseConfigurado
  ? createClient(url, anon)
  : null;
