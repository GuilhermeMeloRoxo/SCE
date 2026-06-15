import { supabase } from "./supabase";

export async function buscarPostsMural() {
  const { data: posts, error } = await supabase
    .from("mural_completo")
    .select("*")
    .order("post_data", { ascending: false });

  if (error) {
    console.error("Erro ao carregar o mural:", error.message);
    throw error;
  }

  return posts || [];
}

export async function gerenciarCurtida(postId: string, userId: string, jaCurtiu: boolean) {
  try {
    if (jaCurtiu) {
      const { error } = await supabase
        .from("curtidas")
        .delete()
        .eq("post_id", postId)
        .eq("id", userId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("curtidas")
        .insert([{ post_id: postId, id: userId }]);

      // erro 23505 significa chave duplicada
      if (error && error.code !== "23505") throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao gerenciar curtida no banco:", error.message);
    return { success: false, error };
  }
}

export async function enviarFeedback(tipo: string, assunto: string, mensagem: string) {
  const { error } = await supabase
    .from("feedbacks")
    .insert([{ tipo, assunto, mensagem }]);

  if (error) throw error;
  return { success: true };
}

export async function buscarPostsCurtidos(userId: string, postIds: string[]) {
  if (!userId || postIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("curtidas")
    .select("post_id")
    .eq("id", userId)
    .in("post_id", postIds);

  if (error) {
    console.error("Erro ao buscar curtidas do usuário:", error.message);
    return new Set();
  }

  // Transformamos em um Set para buscas ultra-rápidas no JavaScript (.has)
  return new Set(data.map((item) => item.post_id));
}