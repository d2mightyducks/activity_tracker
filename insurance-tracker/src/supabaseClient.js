import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Carrier list
export const CARRIERS = [
  'Aflac',
  'Aetna',
  'American Amicable',
  'Americo',
  'Baltimore Life',
  'Corebridge AIG',
  'Ethos',
  'Foresters',
  'Gerber',
  'Mutual of Omaha',
  'National Life Group',
  'Royal Neighbors',
  'SBLI',
  'Transamerica'
];
