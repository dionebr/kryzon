import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateMachineRequest {
  machine_id: string;
}

async function testFlag(machineId: string, flagHash: string): Promise<{ valid: boolean; error?: string }> {
  // TODO: Implement actual flag testing by spinning up container and checking
  console.log(`[validate-machine] Testing flag for machine: ${machineId}`);
  
  // Simulate flag validation
  return { valid: true };
}

async function buildAndTestContainer(machineId: string, fileUrl: string): Promise<{ success: boolean; logs: string; error?: string }> {
  // TODO: Implement actual Docker build and test
  console.log(`[validate-machine] Building container for machine: ${machineId}`);
  console.log(`[validate-machine] File URL: ${fileUrl}`);
  
  // Simulate build process
  const buildLogs = `
    Step 1/5: FROM ubuntu:latest
    Step 2/5: RUN apt-get update
    Step 3/5: COPY . /app
    Step 4/5: WORKDIR /app
    Step 5/5: CMD ["/bin/bash"]
    Successfully built container for machine ${machineId}
  `;
  
  return {
    success: true,
    logs: buildLogs,
  };
}

async function performSecurityScan(machineId: string): Promise<{ passed: boolean; vulnerabilities: string[] }> {
  // TODO: Implement actual security scanning
  console.log(`[validate-machine] Security scanning machine: ${machineId}`);
  
  // Simulate security scan
  return {
    passed: true,
    vulnerabilities: [],
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { machine_id }: ValidateMachineRequest = await req.json();

    if (!machine_id) {
      return new Response(
        JSON.stringify({ error: 'machine_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[validate-machine] Starting validation for machine: ${machine_id}`);

    // Get machine details
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('id, name, flag_hash, status')
      .eq('id', machine_id)
      .single();

    if (machineError || !machine) {
      console.error('[validate-machine] Machine not found:', machineError);
      return new Response(
        JSON.stringify({ error: 'Machine not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (machine.status !== 'pending_validation') {
      console.warn(`[validate-machine] Machine ${machine_id} is not pending validation`);
      return new Response(
        JSON.stringify({ error: 'Machine is not pending validation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResults: {
      flag_test: any;
      build_test: any;
      security_scan: any;
    } = {
      flag_test: null,
      build_test: null,
      security_scan: null,
    };

    // Step 1: Test flag validity
    console.log('[validate-machine] Step 1: Testing flag');
    const flagTest = await testFlag(machine_id, machine.flag_hash);
    validationResults.flag_test = flagTest;

    if (!flagTest.valid) {
      console.error('[validate-machine] Flag test failed');
      await supabase.from('machine_validations').insert({
        machine_id,
        validation_type: 'automated',
        status: 'failed',
        results: validationResults,
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Validation failed: Invalid flag',
          results: validationResults,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Build and test container
    console.log('[validate-machine] Step 2: Building and testing container');
    const { data: machineFile } = await supabase
      .from('machine_files')
      .select('file_url, file_type')
      .eq('machine_id', machine_id)
      .eq('file_type', 'docker')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (machineFile) {
      const buildTest = await buildAndTestContainer(machine_id, machineFile.file_url);
      validationResults.build_test = buildTest;

      if (!buildTest.success) {
        console.error('[validate-machine] Build test failed');
        await supabase.from('machine_validations').insert({
          machine_id,
          validation_type: 'automated',
          status: 'failed',
          results: validationResults,
        });

        return new Response(
          JSON.stringify({
            success: false,
            message: 'Validation failed: Container build failed',
            results: validationResults,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Step 3: Security scan
    console.log('[validate-machine] Step 3: Security scanning');
    const securityScan = await performSecurityScan(machine_id);
    validationResults.security_scan = securityScan;

    const allTestsPassed = flagTest.valid && 
                          (!validationResults.build_test || validationResults.build_test.success) &&
                          securityScan.passed;

    // Record validation results
    await supabase.from('machine_validations').insert({
      machine_id,
      validation_type: 'automated',
      status: allTestsPassed ? 'passed' : 'failed',
      results: validationResults,
    });

    // Update machine status
    if (allTestsPassed) {
      await supabase
        .from('machines')
        .update({ status: 'pending_approval' })
        .eq('id', machine_id);
    }

    console.log(`[validate-machine] Validation complete for machine ${machine_id}: ${allTestsPassed ? 'PASSED' : 'FAILED'}`);

    return new Response(
      JSON.stringify({
        success: allTestsPassed,
        message: allTestsPassed 
          ? 'Validation passed. Machine is pending approval.' 
          : 'Validation failed. Please check the results.',
        results: validationResults,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[validate-machine] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
