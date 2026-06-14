import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

export function getSupabaseAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log({
        url: !!supabaseUrl,
        serviceRole: !!supabaseServiceRoleKey,
        prefix: supabaseServiceRoleKey?.slice(0, 20),
    });
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    }

    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}