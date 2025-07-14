import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://tqdzwjqeykmejgxfrifs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZHp3anFleWttZWpneGZyaWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTMxNDEsImV4cCI6MjA2NjQ2OTE0MX0.lh5quH3A-wX8IhpWiVXl18xxe_7az-eZ4Pq7xHaoxOE";

export const supabase = createClient(supabaseUrl, supabaseKey);
