const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.from('pelanggan').select('*').limit(1)
  console.log('Columns:', Object.keys(data?.[0] || {}))
}
test()
