import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wthrxtouwlhjwcfnhkgo.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2eIlSzO0Q4ld-AODEo31bA_JpwTiTEZ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testEdgeFunction() {
  console.log('Logging in...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'demo@gfs.com',
    password: 'password123'
  })

  if (authError) {
    console.error('Login failed:', authError.message)
    return
  }

  console.log('Logged in successfully. Token:', authData.session.access_token.substring(0, 20) + '...')

  console.log('Invoking edge function...')
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: {
      email: 'test_edge_' + Date.now() + '@gfs.com',
      password: 'password123',
      full_name: 'Test Edge User',
      phone: '9876543210',
      role: 'loan_admin'
    }
  })

  console.log('Response Error:', error)
  console.log('Response Data:', data)
}

testEdgeFunction()
