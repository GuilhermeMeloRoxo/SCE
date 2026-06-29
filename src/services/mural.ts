'use server';
import { getSupabase } from "./supabaseServer";

export async function buscarPostsMural() {
  const supabase = await getSupabase();
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
  const supabase = await getSupabase();

  try {
    if (jaCurtiu) {
      const { error: deleteError, data: deletedData } = await supabase
        .from("curtidas")
        .delete()
        .eq("post_id", postId)
        .eq("id", userId)
        .select();

      if (deleteError) throw deleteError;
      if (!Array.isArray(deletedData) || deletedData.length === 0) {
        throw new Error("Nenhuma curtida encontrada para remover.");
      }
    } else {
      const { error: insertError, data: insertedData } = await supabase
        .from("curtidas")
        .insert([{ post_id: postId, id: userId }])
        .select();

      if (insertError) throw insertError;
      if (!Array.isArray(insertedData) || insertedData.length === 0) {
        throw new Error("Falha ao criar a curtida.");
      }
    }

    const { data: postAtual, error: postError } = await supabase
      .from("posts")
      .select("post_id, quantidade_curtidas")
      .eq("post_id", postId)
      .maybeSingle();

    if (postError) throw postError;
    if (!postAtual) {
      throw new Error("Post não encontrado após atualizar curtida.");
    }

    return {
      success: true,
      quantidade_curtidas: postAtual.quantidade_curtidas,
    };
  } catch (error: any) {
    console.error("Erro ao gerenciar curtida no banco:", error.message || error);
    return { success: false, error };
  }
}

export async function enviarFeedback(tipo: string, assunto: string, mensagem: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("feedbacks")
    .insert([{ tipo, assunto, mensagem }]);

  if (error) throw error;
  return { success: true };
}

export async function buscarPostsCurtidos(userId: string, postIds: string[]) {
  const supabase = await getSupabase();
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