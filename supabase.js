import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ Substitua pelos seus dados reais do Supabase:
const SUPABASE_URL = 'https://tqdzwjqeykmejgxfrifs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZHp3anFleWttZWpneGZyaWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTMxNDEsImV4cCI6MjA2NjQ2OTE0MX0.lh5quH3A-wX8IhpWiVXl18xxe_7az-eZ4Pq7xHaoxOE'; // Sua chave completa aqui

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
