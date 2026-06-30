'use server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;


export async function getSupabaseAdmin(){
    return createAdminClient(supabaseUrl, supabaseSecret,
    { auth: { persistSession: false } }
    )
}

