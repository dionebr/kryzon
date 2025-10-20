import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VpnConfigRequest {
  download?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[VPN Config] Iniciando geração de configuração VPN');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('[VPN Config] Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[VPN Config] Usuário autenticado: ${user.id}`);

    const body: VpnConfigRequest = await req.json().catch(() => ({}));
    
    // Gerar IP único na subnet 10.8.0.0/24
    // Em produção, isso seria verificado contra o banco de dados
    const generateVpnIp = (): string => {
      // IPs reservados: 10.8.0.1 (gateway), 10.8.0.2-10.8.0.9 (sistema)
      // IPs disponíveis: 10.8.0.10-10.8.0.254
      const randomOctet = Math.floor(Math.random() * 245) + 10; // 10-254
      const vpnIp = `10.8.0.${randomOctet}`;
      console.log(`[VPN Config] IP VPN gerado: ${vpnIp}`);
      return vpnIp;
    };

    const vpnIp = generateVpnIp();
    
    // Criar conteúdo do arquivo .ovpn
    const ovpnContent = `client
dev tun
proto udp
remote vpn.kryzon.local 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
auth SHA256
key-direction 1
verb 3

# Certificados e chaves
# Em produção, estes seriam certificados reais gerados pelo servidor OpenVPN
<ca>
-----BEGIN CERTIFICATE-----
# CA Certificate aqui (exemplo)
MIIDSzCCAjOgAwIBAgIUXKr8F8Qn0Z1234567890abcdefghijklmnopqrs
# ... certificado CA completo ...
-----END CERTIFICATE-----
</ca>

<cert>
-----BEGIN CERTIFICATE-----
# Client Certificate aqui (exemplo)
MIIDSzCCAjOgAwIBAgIUXKr8F8Qn0Z1234567890abcdefghijklmnopqrs
# ... certificado cliente completo ...
-----END CERTIFICATE-----
</cert>

<key>
-----BEGIN PRIVATE KEY-----
# Client Private Key aqui (exemplo)
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1234567890
# ... chave privada cliente completa ...
-----END PRIVATE KEY-----
</key>

<tls-auth>
-----BEGIN OpenVPN Static key V1-----
# TLS Auth Key aqui (exemplo)
1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop
# ... chave TLS completa ...
-----END OpenVPN Static key V1-----
</tls-auth>
`;

    console.log('[VPN Config] Arquivo .ovpn gerado com sucesso');

    // Em produção, registrar no banco de dados
    console.log('[VPN Config] Registro no banco de dados (mockado):', {
      user_id: user.id,
      vpn_ip: vpnIp,
      status: 'active',
      created_at: new Date().toISOString()
    });

    // Se for requisição de download, retornar o conteúdo do arquivo
    if (body.download) {
      console.log('[VPN Config] Retornando arquivo para download');
      return new Response(
        JSON.stringify({ 
          success: true,
          config_content: ovpnContent,
          vpn_ip: vpnIp
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    // Caso contrário, apenas retornar confirmação
    console.log('[VPN Config] Configuração criada com sucesso');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Configuração VPN gerada com sucesso',
        vpn_ip: vpnIp
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('[VPN Config] Erro ao gerar configuração:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao gerar configuração VPN',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
