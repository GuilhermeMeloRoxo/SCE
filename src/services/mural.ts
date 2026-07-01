'use server';
import { obterUsuarioAtual } from "./auth";
import { apagarImagemPost } from "./storage";
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

export async function criarPost(
  userId: string, 
  conteudo: string, 
  tag: string, 
  temImagem: boolean
) {
  const supabase = await getSupabase();
  const tagId = await buscarTagId(tag);

  const insertData: any = { 
    id: userId,
    conteudo: conteudo, 
    tag_id: tagId 
  };

  const { data: postGerado, error: insertError } = await supabase
    .from("posts")
    .insert([insertData])
    .select("post_id")
    .single();

  if (insertError || !postGerado) {
    console.error("Erro ao criar post:", insertError?.message);
    return { success: false, error: insertError?.message || "Erro ao salvar post." };
  }

  const idDoPostNovo = postGerado.post_id;

  if (temImagem) {
    const { error: updateError } = await supabase
      .from("posts")
      .update({ caminho_imagem: `${idDoPostNovo}.webp` })
      .eq("post_id", idDoPostNovo);

    if (updateError) {
      console.error("Erro ao atualizar o nome da imagem:", updateError.message);
      return { success: false, error: "Post criado, mas falhou ao mapear a imagem." };
    }
  }

  return { success: true, postId: idDoPostNovo };
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

  return new Set(data.map((item) => item.post_id));
}

export async function buscarTagId(tagNome) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
  .from('tags')
  .select('tag_id')
  .eq('nome', tagNome)
  .single()

  if (error) {
    console.error("Erro ao buscar nome de tag:", error.message);
    return {error: "tag inválida"};
  }

  return data.tag_id;
}

export interface DadosAtualizacaoPost {
  conteudo?: string;
  tag?: string;
  temImagem?: boolean;
}

export async function atualizarPost(
  postId: string, 
  dados: DadosAtualizacaoPost): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabase();
  const updateData: any = {};
  if (dados.conteudo !== undefined) {
    updateData.conteudo = dados.conteudo;
  }
  if (dados.tag !== undefined) {
    const tagId = await buscarTagId(dados.tag);
    updateData.tag_id = tagId;
  }
  if (dados.temImagem === true) {
    updateData.caminho_imagem = `${postId}.webp`;
  } else if (dados.temImagem === false) {
    updateData.caminho_imagem = null;
  }
  if (Object.keys(updateData).length === 0) {
    return { success: true };
  }
  const { error: updateError } = await supabase
    .from("posts")
    .update(updateData)
    .eq("post_id", postId);

  if (updateError) {
    console.error("Erro ao atualizar post:", updateError.message);
    return { success: false, error: updateError.message || "Erro ao salvar alterações." };
  }
  return { success: true };
}

export async function deletarPost(postId: string) {
  const supabase = await getSupabase();
  const data = await obterUsuarioAtual();
  const userId = data.user.id;
  const caminhoImagem = `${userId}/${postId}.webp`;
  try {
    const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('post_id', postId)

    if (deleteError) throw deleteError;

    await apagarImagemPost(caminhoImagem);
    
  } catch (error: any) {
    console.error('Erro ao apagar postagem: ', error);
    return { success: false, error: error.message || 'Erro inesperado' };
  }
  return { success: true }
}