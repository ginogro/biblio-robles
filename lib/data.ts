import { createClient } from '@/lib/supabase/server'

export async function getSetting(key: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single()

  return data?.value || '7' // Default fallback
}