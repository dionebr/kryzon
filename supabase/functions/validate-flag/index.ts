import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';
import { createHash } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateFlagRequest {
  machine_id: string;
  flag_value: string;
}

// Rate limiting cache (in-memory, resets on function restart)
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitCache.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitCache.set(userId, { count: 1, resetAt: now + 60000 }); // 1 minute
    return true;
  }

  if (userLimit.count >= 5) {
    return false;
  }

  userLimit.count++;
  return true;
}

function hashFlag(flag: string): string {
  return createHash('sha256').update(flag).digest('hex');
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
      console.error('[validate-flag] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[validate-flag] Request from user: ${user.id}`);

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.warn(`[validate-flag] Rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please wait 1 minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { machine_id, flag_value }: ValidateFlagRequest = await req.json();

    if (!machine_id || !flag_value) {
      console.error('[validate-flag] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'machine_id and flag_value are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has an active instance for this machine
    const { data: instance, error: instanceError } = await supabase
      .from('machine_instances')
      .select('id, status, expires_at')
      .eq('machine_id', machine_id)
      .eq('user_id', user.id)
      .eq('status', 'running')
      .maybeSingle();

    if (instanceError) {
      console.error('[validate-flag] Error checking instance:', instanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify instance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!instance) {
      console.warn(`[validate-flag] No active instance found for machine ${machine_id} and user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'No active instance found for this machine' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if instance has expired
    if (new Date(instance.expires_at) < new Date()) {
      console.warn(`[validate-flag] Instance expired for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Instance has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the machine and its correct flag
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('id, name, flag_hash, xp_reward')
      .eq('id', machine_id)
      .single();

    if (machineError || !machine) {
      console.error('[validate-flag] Error fetching machine:', machineError);
      return new Response(
        JSON.stringify({ error: 'Machine not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the submitted flag and compare
    const submittedHash = hashFlag(flag_value.trim());
    const isCorrect = submittedHash === machine.flag_hash;

    console.log(`[validate-flag] Flag validation for machine ${machine_id}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

    // Log the submission
    await supabase.from('flag_submissions').insert({
      user_id: user.id,
      machine_id: machine_id,
      instance_id: instance.id,
      submitted_flag_hash: submittedHash,
      is_correct: isCorrect,
    });

    if (isCorrect) {
      // Check if this is first blood
      const { data: existingSolves, error: solvesError } = await supabase
        .from('user_solves')
        .select('id')
        .eq('machine_id', machine_id)
        .limit(1);

      const isFirstBlood = !solvesError && (!existingSolves || existingSolves.length === 0);

      // Record the solve (trigger will handle XP update)
      const { error: solveError } = await supabase.from('user_solves').insert({
        user_id: user.id,
        machine_id: machine_id,
        instance_id: instance.id,
        is_first_blood: isFirstBlood,
      });

      if (solveError) {
        console.error('[validate-flag] Error recording solve:', solveError);
        return new Response(
          JSON.stringify({ error: 'Failed to record solve' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[validate-flag] Solve recorded for user ${user.id}, first_blood: ${isFirstBlood}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: isFirstBlood ? '🩸 First Blood! Flag correct!' : 'Flag correct!',
          xp_earned: isFirstBlood ? machine.xp_reward * 1.5 : machine.xp_reward,
          is_first_blood: isFirstBlood,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Flag incorrect. Try again!',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[validate-flag] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
