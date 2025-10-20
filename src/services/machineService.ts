import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MachineCreateData {
  name: string;
  description: string;
  difficulty: string;
  category: string;
  xp: number;
  flags: Array<{
    name: string;
    value: string;
    points: number;
    description?: string;
  }>;
  hints?: string;
}

interface MachineFile {
  file: File;
  type: 'vm' | 'attachment';
  description?: string;
}

export class MachineService {
  static async createMachine(data: MachineCreateData): Promise<{ success: boolean; machineId?: string; error?: string }> {
    try {
      console.log('Creating machine with data:', data);
      
      // Validar dados obrigatórios
      if (!data.name || !data.description || !data.difficulty || !data.category) {
        return { success: false, error: 'Campos obrigatórios não preenchidos' };
      }

      if (!data.flags || data.flags.length === 0) {
        return { success: false, error: 'Pelo menos uma flag é obrigatória' };
      }

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Criar a máquina
      const { data: machine, error: machineError } = await (supabase as any)
        .from('machines')
        .insert({
          name: data.name,
          description: data.description,
          creator_id: user.id,
          difficulty: data.difficulty.toLowerCase(),
          category: data.category.toLowerCase(),
          xp_reward: data.xp,
          status: 'pending'
        })
        .select()
        .single();

      if (machineError) {
        console.error('Error creating machine:', machineError);
        return { success: false, error: 'Erro ao criar máquina no banco' };
      }

      if (!machine) {
        return { success: false, error: 'Erro ao criar máquina - retorno vazio' };
      }

      // Criar as flags
      const flagsToInsert = data.flags.map(flag => ({
        machine_id: (machine as any).id,
        name: flag.name || `Flag ${Math.random()}`,
        flag_value: flag.value,
        description: flag.description || '',
        xp_value: flag.points || 10,
        flag_type: 'static'
      }));

      const { error: flagsError } = await (supabase as any)
        .from('flags')
        .insert(flagsToInsert);

      if (flagsError) {
        console.error('Error creating flags:', flagsError);
        // Rollback: deletar a máquina se houver erro nas flags
        await (supabase as any).from('machines').delete().eq('id', (machine as any).id);
        return { success: false, error: 'Erro ao criar flags' };
      }

      console.log('Machine created successfully:', (machine as any).id);
      return { success: true, machineId: (machine as any).id };

    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  static async uploadMachineFile(machineId: string, file: MachineFile): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se a máquina existe e pertence ao usuário
      const { data: machine, error: machineError } = await (supabase as any)
        .from('machines')
        .select('id, creator_id')
        .eq('id', machineId)
        .single();

      if (machineError || !machine || (machine as any).creator_id !== user.id) {
        return { success: false, error: 'Máquina não encontrada ou sem permissão' };
      }

      // Gerar nome único para o arquivo
      const fileExtension = file.file.name.split('.').pop();
      const fileName = `${machineId}/${file.type}/${Date.now()}_${file.file.name}`;

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('machine-files')
        .upload(fileName, file.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: 'Erro no upload do arquivo' };
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('machine-files')
        .getPublicUrl(fileName);

      // Registrar arquivo na tabela machine_files
      const { error: recordError } = await (supabase as any)
        .from('machine_files')
        .insert({
          machine_id: machineId,
          filename: file.file.name,
          file_url: publicUrl,
          file_size: file.file.size,
          file_type: file.file.type,
          description: file.description || ''
        });

      if (recordError) {
        console.error('Error recording file:', recordError);
        // Tentar deletar o arquivo do storage em caso de erro
        await supabase.storage.from('machine-files').remove([fileName]);
        return { success: false, error: 'Erro ao registrar arquivo' };
      }

      return { success: true, fileUrl: publicUrl };

    } catch (error) {
      console.error('Unexpected error in file upload:', error);
      return { success: false, error: 'Erro interno no upload' };
    }
  }

  static async getUserMachines(): Promise<{ success: boolean; machines?: any[]; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data: machines, error: machinesError } = await (supabase as any)
        .from('machines')
        .select(`
          *,
          flags(count),
          machine_files(filename, file_size)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (machinesError) {
        console.error('Error fetching machines:', machinesError);
        return { success: false, error: 'Erro ao buscar máquinas' };
      }

      return { success: true, machines: machines || [] };

    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Erro interno' };
    }
  }
}