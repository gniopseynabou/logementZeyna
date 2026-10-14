import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("En-tête d'autorisation manquant")
    const token = authHeader.replace('Bearer ', '')
    
    // 1. Vérifier l'identité de l'appelant
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Non autorisé')

    // 2. Vérifier le rôle de l'appelant (admin ou super_admin avec is_validated = true)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, is_validated')
      .eq('user_id', user.id)
      .single()

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role) || !roleData.is_validated) {
      throw new Error('Action réservée aux administrateurs autorisés')
    }

    const { email, role = 'bailleur', redirectTo } = await req.json()

    // 3. Validation stricte du rôle attribué
    if (!['bailleur', 'admin'].includes(role)) {
      throw new Error('Rôle demandé invalide')
    }

    // Seul un super_admin peut inviter un autre administrateur
    if (role === 'admin' && roleData.role !== 'super_admin') {
      throw new Error('Seul un Super-Administrateur peut inviter un administrateur')
    }

    // 4. Protection contre la redirection ouverte (Open Redirect - SEC-008)
    let safeRedirectTo = 'http://localhost:8080/reset-password'
    if (redirectTo && typeof redirectTo === 'string') {
      try {
        const parsed = new URL(redirectTo)
        const isAllowedHost = 
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname.endsWith('logements-zeyna.sn') ||
          parsed.hostname.endsWith('supabase.co') ||
          parsed.hostname.endsWith('vercel.app')

        if (isAllowedHost) {
          safeRedirectTo = redirectTo
        }
      } catch {
        // En cas d'URL malformée, safeRedirectTo par défaut est conservé
      }
    }

    // 5. Inviter l'utilisateur
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: safeRedirectTo
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
