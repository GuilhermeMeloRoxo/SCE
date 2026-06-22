import { supabase } from "./supabase";

export async function fazerLogout() {
    try {
        const { error } = await supabase.auth.signOut();
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
    const { data: userData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          username: username, 
          nome: nome,         
          cpf: cpf            
        }
      }
    })
    if (authError) {
      throw authError;
    } return userData;
}

export async function verificarCPF(cpf: string) {
  const { data: cpfExiste, error: erroCpf } = await supabase
    .rpc('verificar_cpf_existente', { cpf_teste: cpf });

  if (erroCpf) {
    console.error("Erro na RPC de CPF:", erroCpf);
    throw new Error("Erro ao validar dados do formulário.");
  } return cpfExiste; 
}

export async function verificarUsernameDisponivel(username: string) {
  const { error, count } = await supabase
    .from('perfis')
    .select('username', { count: 'exact', head: true })
    .ilike('username', username);

  if (error) {
    console.error('Erro ao validar username:', error.message);
    throw error;
  } return count === 0;
}

export async function obterUsuarioAtual() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erro ao obter usuário atual:", error.message);
    return null;
  } return user;
}

export async function loginUsuario(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
  });
  if (error) throw error;
  return data?.user;
}