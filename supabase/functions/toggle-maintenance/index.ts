import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ToggleMaintenanceBody {
  is_active: boolean
  title?: string
  message?: string
  scheduled_start?: string | null
  scheduled_end?: string | null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé : token manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé : utilisateur invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // 2. Vérifier le rôle super_admin côté serveur (obligatoire)
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role, is_validated')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .eq('is_validated', true)
      .maybeSingle()

    if (!roleData) {
      // Enregistrer la tentative d'accès non autorisée
      await supabaseAdmin.rpc('insert_audit_log', {
        p_user_id: user.id,
        p_action: 'maintenance.unauthorized_attempt',
        p_resource_type: 'maintenance',
        p_details: { attempted_by_role: 'non-super_admin' },
        p_ip_address: req.headers.get('x-forwarded-for') ?? null,
      })

      return new Response(
        JSON.stringify({ error: 'Accès refusé : action réservée au Super-Admin' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // 3. Lire le body de la requête
    const body: ToggleMaintenanceBody = await req.json()
    const { is_active, title, message, scheduled_start, scheduled_end } = body

    if (typeof is_active !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Paramètre is_active manquant ou invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 4. Lire la configuration actuelle pour l'audit
    const { data: current } = await supabaseAdmin
      .from('maintenance_config')
      .select('id, is_active')
      .limit(1)
      .maybeSingle()

    // 5. Mettre à jour la configuration de maintenance
    const updatePayload: Record<string, unknown> = {
      is_active,
      activated_by: is_active ? user.id : null,
      activated_at: is_active ? new Date().toISOString() : null,
    }

    if (title !== undefined) updatePayload.title = title
    if (message !== undefined) updatePayload.message = message
    if (scheduled_start !== undefined) updatePayload.scheduled_start = scheduled_start
    if (scheduled_end !== undefined) updatePayload.scheduled_end = scheduled_end

    let updateResult
    if (current?.id) {
      updateResult = await supabaseAdmin
        .from('maintenance_config')
        .update(updatePayload)
        .eq('id', current.id)
        .select()
        .single()
    } else {
      // Créer la ligne si elle n'existe pas encore
      updateResult = await supabaseAdmin
        .from('maintenance_config')
        .insert({ ...updatePayload })
        .select()
        .single()
    }

    if (updateResult.error) throw updateResult.error

    // 6. Enregistrer dans le journal d'audit
    const action = is_active ? 'maintenance.activate' : 'maintenance.deactivate'
    await supabaseAdmin.rpc('insert_audit_log', {
      p_user_id: user.id,
      p_action: action,
      p_resource_type: 'maintenance',
      p_resource_id: updateResult.data?.id ?? current?.id ?? null,
      p_details: {
        previous_state: current?.is_active ?? null,
        new_state: is_active,
        title: title ?? null,
        scheduled_start: scheduled_start ?? null,
        scheduled_end: scheduled_end ?? null,
      },
      p_ip_address: req.headers.get('x-forwarded-for') ?? null,
    })

    return new Response(
      JSON.stringify({
        success: true,
        maintenance: updateResult.data,
        message: is_active
          ? 'Mode maintenance activé avec succès'
          : 'Mode maintenance désactivé avec succès',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    // Ne jamais exposer les détails techniques au client
    console.error('[toggle-maintenance] Erreur interne:', error)
    return new Response(
      JSON.stringify({ error: 'Une erreur interne est survenue' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
