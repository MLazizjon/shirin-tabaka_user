import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nysrqiamcvmnenwvrote.supabase.co';

                    //  https://nysrqiamcvmnenwvrote.supabase.co/rest/v1/
const supabaseKey = 'sb_publishable_srp45e1YO8g1jQ2K7IR4Ww_l908Cjej'; // copy tugmasidan olgan to'liq key

export const supabase = createClient(supabaseUrl, supabaseKey);

