
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://edbkjwmueiibbkgtookk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYmtqd211ZWlpYmJrZ3Rvb2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDg5NDAsImV4cCI6MjA3NDY4NDk0MH0.B-hCqExkfM7knqVM1Ed12ff6scfjiuJVCSHZYTVOaYM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
