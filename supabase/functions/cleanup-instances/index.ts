import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function stopDockerContainer(containerId: string): Promise<void> {
  // TODO: Implement actual Docker container stop
  console.log(`[cleanup-instances] Stopping Docker container: ${containerId}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[cleanup-instances] Starting cleanup job');

    const now = new Date().toISOString();

    // Find all expired running instances
    const { data: expiredInstances, error: fetchError } = await supabase
      .from('machine_instances')
      .select('id, container_id, machine_id, user_id, expires_at')
      .eq('status', 'running')
      .lt('expires_at', now);

    if (fetchError) {
      console.error('[cleanup-instances] Error fetching expired instances:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch expired instances' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!expiredInstances || expiredInstances.length === 0) {
      console.log('[cleanup-instances] No expired instances found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired instances to clean up',
          cleaned: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cleanup-instances] Found ${expiredInstances.length} expired instances`);

    let cleanedCount = 0;
    const errors: string[] = [];

    // Process each expired instance
    for (const instance of expiredInstances) {
      try {
        console.log(`[cleanup-instances] Processing instance ${instance.id}`);

        // Stop the Docker container
        await stopDockerContainer(instance.container_id);

        // Update instance status
        const { error: updateError } = await supabase
          .from('machine_instances')
          .update({
            status: 'expired',
            stopped_at: new Date().toISOString(),
          })
          .eq('id', instance.id);

        if (updateError) {
          console.error(`[cleanup-instances] Error updating instance ${instance.id}:`, updateError);
          errors.push(`Failed to update instance ${instance.id}`);
          continue;
        }

        // Create notification for user
        await supabase.from('notifications').insert({
          user_id: instance.user_id,
          type: 'instance_expired',
          title: 'Instance Expired',
          message: 'Your machine instance has expired and been stopped.',
          data: {
            instance_id: instance.id,
            machine_id: instance.machine_id,
            expired_at: instance.expires_at,
          },
        });

        cleanedCount++;
        console.log(`[cleanup-instances] Successfully cleaned instance ${instance.id}`);

      } catch (error) {
        console.error(`[cleanup-instances] Error processing instance ${instance.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Error processing instance ${instance.id}: ${errorMessage}`);
      }
    }

    console.log(`[cleanup-instances] Cleanup complete. Cleaned ${cleanedCount}/${expiredInstances.length} instances`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${cleanedCount} expired instances`,
        cleaned: cleanedCount,
        total: expiredInstances.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[cleanup-instances] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
