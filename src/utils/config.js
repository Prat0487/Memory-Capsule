import { createClient } from '@supabase/supabase-js'

export async function getConfig(keyName) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    
    const { data, error } = await supabase
        .from('app_config')
        .select('key_value')
        .eq('key_name', keyName)
        .eq('is_active', true)
        .single()
        
    if (error) throw error
    return data.key_value
}
