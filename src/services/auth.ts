'use server'
import { getSupabaseAdmin } from "./supabaseAdmin";
import { getSupabase } from "./supabaseServer";
import { limparStorageDoUsuario } from "./storage";

export async function fazerLogout(apenasLocal = false) {
  try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signOut({ 
      scope: apenasLocal ? 'local' : 'global' 
    });
      if (error) {
      console.error("Ocorreu um erro inesperado: ", error.message);
      return { success: false, error };
      } return { success: true };
  } catch (e) {
    console.error("Erro na comunicação com o servidor:", e);
    return { success: false, error: e };
  }
}

export async function cadastrarUsuario(
  nome: string,
  username: string,
  email: string, 
  cpf: string,
  senha: string) {
    const supabase = await getSupabase();
    const { data: userData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          username: username, 
          nome: nome,         
          cpf: cpf,          
        }
      }
    })
    if (authError) {
      throw authError;
    } return userData;
}

export async function verificarCPF(cpf: string) {
  const supabase = await getSupabase();
  const { data: cpfExiste, error: erroCpf } = await supabase
    .rpc('verificar_cpf_existente', { cpf_teste: cpf });

  if (erroCpf) {
    console.error("Erro na RPC de CPF:", erroCpf);
    throw new Error("Erro ao validar dados do formulário.");
  } return cpfExiste; 
}

export async function verificarUsernameDisponivel(username: string) {
  const supabase = await getSupabase();
  const { error, count } = await supabase
    .from('perfis')
    .select('username', { count: 'exact', head: true })
    .ilike('username', username);

  if (error) {
    console.error('Erro ao validar username:', error.message);
    throw error;
  }
  return count === 0;
}

export async function obterUsuarioAtual() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) {
    console.error("Erro ao obter usuário atual:", error.message);
    return { user: null }; 
  }
  return data;
}

export async function loginUsuario(email: string, senha: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
  });
  if (error) throw error;
  return data?.user;
}

export async function deletarUsuario() {
  const supabaseAdmin = await getSupabaseAdmin();
  const data = await obterUsuarioAtual();

  const userId = data.user.id;

  try {
    await limparStorageDoUsuario(userId, supabaseAdmin);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    await fazerLogout(true);

  } catch (error: any) {
    console.error('Erro ao deletar conta:', error);
    return { success: false, error: error.message || 'Erro inesperado' };
  }
  return { success: true}
}

