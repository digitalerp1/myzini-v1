
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fatch.digitalerp.shop/supabase';
const supabaseAnonKey = 'shidgGGFhhahsys15262416gsgGh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
