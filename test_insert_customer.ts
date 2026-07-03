import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wthrxtouwlhjwcfnhkgo.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2eIlSzO0Q4ld-AODEo31bA_JpwTiTEZ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testInsertCustomer() {
  console.log('Logging in as superadmin...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'demo@gfs.com', // Replace with the actual superadmin email if different
    password: 'password123'
  })

  if (authError) {
    console.error('Login failed:', authError.message)
    return
  }

  const userId = authData.session.user.id
  console.log('Logged in successfully. User ID:', userId)

  console.log('Attempting to insert a customer...')
  const { data, error } = await supabase
    .from('customers')
    .insert({
      full_name: 'Test Customer',
      phone: '9999999999',
      agent_id: userId
    })
    .select()
    .single()

  if (error) {
    console.error('Insert Error:', error)
  } else {
    console.log('Insert Success:', data)
  }
}

testInsertCustomer()
