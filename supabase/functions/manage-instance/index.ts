import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManageInstanceRequest {
  action: 'start' | 'stop' | 'extend';
  machine_id?: string;
  instance_id?: string;
}

const MAX_EXTENSION_HOURS = 6;
const DEFAULT_INSTANCE_HOURS = 2;

// Simulated Docker operations (replace with actual Docker API calls)
async function startDockerContainer(machineId: string, userId: string): Promise<{ containerId: string; ipAddress: string }> {
  // TODO: Implement actual Docker container creation
  // For now, simulate with random values
  const containerId = `container_${machineId}_${userId}_${Date.now()}`;
  const ipAddress = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  
  console.log(`[manage-instance] Simulated Docker start: ${containerId} at ${ipAddress}`);
  return { containerId, ipAddress };
}

async function stopDockerContainer(containerId: string): Promise<void> {
  // TODO: Implement actual Docker container stop
  console.log(`[manage-instance] Simulated Docker stop: ${containerId}`);
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
      console.error('[manage-instance] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, machine_id, instance_id }: ManageInstanceRequest = await req.json();

    console.log(`[manage-instance] Action: ${action}, User: ${user.id}`);

    // START INSTANCE
    if (action === 'start') {
      if (!machine_id) {
        return new Response(
          JSON.stringify({ error: 'machine_id is required for start action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user already has a running instance for this machine
      const { data: existingInstance } = await supabase
        .from('machine_instances')
        .select('id, status')
        .eq('machine_id', machine_id)
        .eq('user_id', user.id)
        .eq('status', 'running')
        .maybeSingle();

      if (existingInstance) {
        console.warn(`[manage-instance] User ${user.id} already has a running instance`);
        return new Response(
          JSON.stringify({ error: 'You already have a running instance for this machine' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check machine exists and is approved
      const { data: machine, error: machineError } = await supabase
        .from('machines')
        .select('id, name, status')
        .eq('id', machine_id)
        .single();

      if (machineError || !machine || machine.status !== 'approved') {
        console.error('[manage-instance] Machine not available:', machineError);
        return new Response(
          JSON.stringify({ error: 'Machine not available' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Start Docker container
      const { containerId, ipAddress } = await startDockerContainer(machine_id, user.id);

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + DEFAULT_INSTANCE_HOURS);

      // Create instance record
      const { data: newInstance, error: createError } = await supabase
        .from('machine_instances')
        .insert({
          user_id: user.id,
          machine_id: machine_id,
          container_id: containerId,
          ip_address: ipAddress,
          status: 'running',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('[manage-instance] Error creating instance:', createError);
        await stopDockerContainer(containerId);
        return new Response(
          JSON.stringify({ error: 'Failed to create instance' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[manage-instance] Instance created: ${newInstance.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          instance: newInstance,
          message: `Instance started successfully. Expires at ${expiresAt.toLocaleString()}`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STOP INSTANCE
    if (action === 'stop') {
      if (!instance_id) {
        return new Response(
          JSON.stringify({ error: 'instance_id is required for stop action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: instance, error: fetchError } = await supabase
        .from('machine_instances')
        .select('id, user_id, container_id, status')
        .eq('id', instance_id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !instance) {
        console.error('[manage-instance] Instance not found:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Instance not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (instance.status !== 'running') {
        return new Response(
          JSON.stringify({ error: 'Instance is not running' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Stop Docker container
      await stopDockerContainer(instance.container_id);

      // Update instance status
      const { error: updateError } = await supabase
        .from('machine_instances')
        .update({ status: 'stopped', stopped_at: new Date().toISOString() })
        .eq('id', instance_id);

      if (updateError) {
        console.error('[manage-instance] Error updating instance:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to stop instance' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[manage-instance] Instance stopped: ${instance_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Instance stopped successfully',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // EXTEND INSTANCE
    if (action === 'extend') {
      if (!instance_id) {
        return new Response(
          JSON.stringify({ error: 'instance_id is required for extend action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: instance, error: fetchError } = await supabase
        .from('machine_instances')
        .select('id, user_id, status, created_at, expires_at')
        .eq('id', instance_id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !instance) {
        console.error('[manage-instance] Instance not found:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Instance not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (instance.status !== 'running') {
        return new Response(
          JSON.stringify({ error: 'Can only extend running instances' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check total lifetime limit
      const createdAt = new Date(instance.created_at);
      const currentExpiration = new Date(instance.expires_at);
      const totalHours = (currentExpiration.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (totalHours >= MAX_EXTENSION_HOURS) {
        console.warn(`[manage-instance] Extension limit reached for instance ${instance_id}`);
        return new Response(
          JSON.stringify({ error: `Maximum instance lifetime of ${MAX_EXTENSION_HOURS} hours reached` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extend by 1 hour
      const newExpiration = new Date(currentExpiration);
      newExpiration.setHours(newExpiration.getHours() + 1);

      const { error: updateError } = await supabase
        .from('machine_instances')
        .update({ expires_at: newExpiration.toISOString() })
        .eq('id', instance_id);

      if (updateError) {
        console.error('[manage-instance] Error extending instance:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to extend instance' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[manage-instance] Instance extended: ${instance_id}, new expiration: ${newExpiration}`);

      return new Response(
        JSON.stringify({
          success: true,
          expires_at: newExpiration.toISOString(),
          message: `Instance extended by 1 hour. New expiration: ${newExpiration.toLocaleString()}`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Must be start, stop, or extend' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[manage-instance] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
