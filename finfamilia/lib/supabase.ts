import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Anon key é pública por design — segura para estar no bundle
const SUPABASE_URL = 'https://gldbahoiiqvtmitgycoo.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZGJhaG9paXF2dG1pdGd5Y29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzI3ODgsImV4cCI6MjA5MDMwODc4OH0.8Nxz6P68kBPQA-5PVxJ6UW9wiHVu4pkt_TKKPh2D4p8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
