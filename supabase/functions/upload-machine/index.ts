import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

async function performSecurityScan(fileBuffer: ArrayBuffer): Promise<{ safe: boolean; issues: string[] }> {
  // TODO: Implement actual security scanning
  // For now, basic checks
  const issues: string[] = [];
  
  // Check file size
  if (fileBuffer.byteLength > MAX_FILE_SIZE) {
    issues.push('File exceeds maximum size of 500MB');
  }
  
  // Basic malware signature check (placeholder)
  // In production, integrate with actual antivirus/malware scanning service
  
  console.log(`[upload-machine] Security scan completed. Issues: ${issues.length}`);
  
  return {
    safe: issues.length === 0,
    issues,
  };
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
      console.error('[upload-machine] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[upload-machine] Upload request from user: ${user.id}`);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const machineId = formData.get('machine_id') as string;
    const fileType = formData.get('file_type') as string; // 'docker' or 'vm'

    if (!file || !machineId || !fileType) {
      return new Response(
        JSON.stringify({ error: 'file, machine_id, and file_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.warn(`[upload-machine] Invalid file type: ${file.type}`);
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only ZIP, TAR, and GZIP files are allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`[upload-machine] File too large: ${file.size} bytes`);
      return new Response(
        JSON.stringify({ error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify machine exists and user owns it
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('id, creator_id, name')
      .eq('id', machineId)
      .single();

    if (machineError || !machine) {
      console.error('[upload-machine] Machine not found:', machineError);
      return new Response(
        JSON.stringify({ error: 'Machine not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (machine.creator_id !== user.id) {
      console.warn(`[upload-machine] User ${user.id} does not own machine ${machineId}`);
      return new Response(
        JSON.stringify({ error: 'You do not have permission to upload files for this machine' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Perform security scan
    const fileBuffer = await file.arrayBuffer();
    const scanResult = await performSecurityScan(fileBuffer);

    if (!scanResult.safe) {
      console.error('[upload-machine] Security scan failed:', scanResult.issues);
      return new Response(
        JSON.stringify({
          error: 'Security scan failed',
          issues: scanResult.issues,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to storage
    const fileName = `${machineId}/${fileType}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('machine-files')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload-machine] Upload failed:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('machine-files')
      .getPublicUrl(fileName);

    // Record in database
    const { data: fileRecord, error: recordError } = await supabase
      .from('machine_files')
      .insert({
        machine_id: machineId,
        file_type: fileType,
        file_path: uploadData.path,
        file_url: publicUrl,
        file_size: file.size,
        file_name: file.name,
        mime_type: file.type,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (recordError) {
      console.error('[upload-machine] Error recording file:', recordError);
      return new Response(
        JSON.stringify({ error: 'Failed to record file metadata' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[upload-machine] File uploaded successfully: ${fileRecord.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        file: fileRecord,
        message: 'File uploaded successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[upload-machine] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
