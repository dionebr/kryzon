import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApproveMachineRequest {
  machine_id: string;
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[approve-machine] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is moderator or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['moderator', 'admin'].includes(profile.role)) {
      console.warn(`[approve-machine] User ${user.id} is not authorized (role: ${profile?.role})`);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only moderators and admins can approve machines.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { machine_id, action, rejection_reason }: ApproveMachineRequest = await req.json();

    if (!machine_id || !action) {
      return new Response(
        JSON.stringify({ error: 'machine_id and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject' && !rejection_reason) {
      return new Response(
        JSON.stringify({ error: 'rejection_reason is required when rejecting' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[approve-machine] ${action.toUpperCase()} machine ${machine_id} by user ${user.id}`);

    // Get machine details
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('id, name, creator_id, status')
      .eq('id', machine_id)
      .single();

    if (machineError || !machine) {
      console.error('[approve-machine] Machine not found:', machineError);
      return new Response(
        JSON.stringify({ error: 'Machine not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (machine.status !== 'pending_approval') {
      console.warn(`[approve-machine] Machine ${machine_id} is not pending approval (status: ${machine.status})`);
      return new Response(
        JSON.stringify({ error: 'Machine is not pending approval' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update machine status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { error: updateError } = await supabase
      .from('machines')
      .update({
        status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? rejection_reason : null,
      })
      .eq('id', machine_id);

    if (updateError) {
      console.error('[approve-machine] Error updating machine:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update machine status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification for machine creator
    await supabase.from('notifications').insert({
      user_id: machine.creator_id,
      type: action === 'approve' ? 'machine_approved' : 'machine_rejected',
      title: action === 'approve' ? 'Machine Approved!' : 'Machine Rejected',
      message: action === 'approve'
        ? `Your machine "${machine.name}" has been approved and is now live!`
        : `Your machine "${machine.name}" was rejected. Reason: ${rejection_reason}`,
      data: {
        machine_id,
        machine_name: machine.name,
        action,
        rejection_reason: action === 'reject' ? rejection_reason : undefined,
      },
    });

    console.log(`[approve-machine] Machine ${machine_id} ${action}d successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Machine ${action}d successfully`,
        machine_id,
        status: newStatus,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[approve-machine] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
