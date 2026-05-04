import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2.95.0/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate JWT
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Admin client (service role)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1. Read profile for audit
    const { data: profile } = await admin
      .from('profiles')
      .select('name, email, hermandad, total_points, games_played')
      .eq('id', userId)
      .maybeSingle();

    // 2. Insert audit row
    const { error: auditError } = await admin.from('account_deletions').insert({
      deleted_user_id: userId,
      name: profile?.name ?? null,
      email: profile?.email ?? null,
      hermandad: profile?.hermandad ?? null,
      total_points: profile?.total_points ?? 0,
      games_played: profile?.games_played ?? 0,
    });
    if (auditError) {
      console.error('Audit insert error:', auditError);
      return new Response(JSON.stringify({ error: 'Failed to record deletion' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Delete user-related rows
    const tables = [
      'tournament_answers',
      'tournament_participants',
      'games',
      'feedback',
      'user_roles',
    ];
    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq('user_id', userId);
      if (error) console.error(`Delete error on ${table}:`, error);
    }

    const { error: profileDelError } = await admin.from('profiles').delete().eq('id', userId);
    if (profileDelError) console.error('Profile delete error:', profileDelError);

    // 4. Delete auth user (prevents future login)
    const { error: authDelError } = await admin.auth.admin.deleteUser(userId);
    if (authDelError) {
      console.error('Auth user delete error:', authDelError);
      return new Response(JSON.stringify({ error: 'Failed to delete auth user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Unexpected error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
