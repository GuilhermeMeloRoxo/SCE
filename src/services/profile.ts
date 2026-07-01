'use server';
import { getSupabase } from "./supabaseServer";

export interface PerfilCompleto {
  id: string;
  nome: string;
  github_user: string | null;
  username: string;
  avatar_url: string | null;
  matricula_institucional: string;
  telefone: string;
  email: string;
  curso: string;
  termino: string;
  cpf_descriptografado: string;
}

interface AtualizarPerfil {
  userId: string;
  username: string;
  nome: string;
  curso: string;
  termino: string;
  telefone: string;
  matricula: string;
  cpf: string;
}

export async function buscarPerfilPublico(nomeOuId: string) {
  const supabase = await getSupabase();
  let query = supabase
    .from("perfis_publicos")
    .select("*");

  if (nomeOuId.length <= 20) {
    query = query.ilike("username", nomeOuId);
  } else {
    query = query.eq("id", nomeOuId);
  }

  const { data, error } = await query.single();

    if (error || !data) {
        console.error("Erro ao buscar perfil público:", error?.message);
      throw new Error('PROFILE_NOT_FOUND');
    }
    return { data };
}

export async function buscarPerfilCompleto(usuarioId: string) {
  try {
    const supabase = await getSupabase();

    const { data, error } = await supabase
      .rpc('buscar_perfil_completo', { usuario_id: usuarioId })
      .single();

    if (error) {
      console.error('Erro RPC Supabase:', error.message);
      throw new Error('Erro ao buscar dados do perfil.');
    }

    return { data: data as PerfilCompleto };
  } catch (err) {
    return { error: 'FALHA_AO_CARREGAR_PERFIL' };
  }
}

export async function buscarListaUsernames(parteUsername: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
  .from('perfis_publicos')
  .select('username, avatar')
  .ilike('username', `%${parteUsername}%`)
  .limit(5);
  if (error) throw error;
  const resultados = data.map((perfil: any) => ({ username: perfil.username, avatar: perfil.avatar }));
  return resultados;
}

export async function atualizarPerfil(dados: AtualizarPerfil) {
  const supabase = await getSupabase();

  const { error } = await supabase.rpc('edicao_perfil_usuario', {
    p_user_id: dados.userId,
    p_username: dados.username,
    p_nome: dados.nome,
    p_cpf: dados.cpf,
    p_telefone: dados.telefone,
    p_matricula_institucional: dados.matricula,
    p_curso: dados.curso,
    p_termino: dados.termino,
  });

  if (error) {
    console.error('Erro ao executar RPC de salvamento:', error.message);
    return { success: false, error: 'Falha ao atualizar os dados do perfil.' };
  }

  return { success: true };
}

export async function atualizarEmailUsuario(email: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.updateUser({
    email: email
  });
}