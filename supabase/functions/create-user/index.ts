import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getModuleFromRole(role: string): string {
  if (role.includes('loan')) return 'loans'
  if (role.includes('insurance')) return 'insurance'
  if (role.includes('investment')) return 'investments'
  return 'all'
}

Deno.serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // 2. Initialize Admin client using the securely injected service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Server configuration error: Missing environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // 3. Verify the calling user is authenticated and is a superadmin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid or expired token')
    }

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || callerProfile?.role !== 'superadmin') {
      throw new Error('Unauthorized: Only superadmins can create users')
    }

    // 4. Parse request body
    const { email, password, full_name, role, phone } = await req.json()

    if (!email || !password || !full_name || !role) {
      throw new Error('Missing required fields')
    }

    const module = getModuleFromRole(role)

    // 5. Create user via admin API
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role, module },
    })

    if (createError) throw createError

    // 6. Update the auto-created profile with full details
    if (data?.user?.id) {
      await supabaseAdmin
        .from('profiles')
        .update({ role, phone: phone || null, module, full_name })
        .eq('user_id', data.user.id)
    }

    // 7. Return success response
    return new Response(
      JSON.stringify({ success: true, user: { id: data.user?.id, email: data.user?.email } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (err: any) {
    console.error('Edge Function Error:', err.message || err)
    
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
