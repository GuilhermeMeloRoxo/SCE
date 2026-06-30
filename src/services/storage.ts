'use server'
import { obterUsuarioAtual } from "./auth";
import { getSupabaseBrowserClient } from "./supabaseBrowser";
import { getSupabase } from "./supabaseServer";

export async function fazerUploadImagemPost(
  arquivoWebp: File,
  userId: string,
  postId: string
): Promise<{ success: boolean; error?: string; filePath?: string; publicUrl?: string }> {
  try {
    const supabase = await getSupabase();

    const filePath = `${userId}/${postId}.webp`;

    const { error: uploadError } = await supabase.storage
      .from("posts_imagens")
      .upload(filePath, arquivoWebp, { upsert: true });

    if (uploadError) throw uploadError;


    const { error: databaseUpdateError } = await supabase
      .from("posts")
      .update({ caminho_imagem: filePath })
      .eq("post_id", postId);

    if (databaseUpdateError) {
      throw databaseUpdateError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("posts_imagens")
      .getPublicUrl(filePath);

    return { 
      success: true, 
      filePath,
      publicUrl: `${publicUrl}?t=${Date.now()}`
    };

  } catch (err: any) {
    console.error("Erro no serviço de upload de imagem do post:", err);
    return { success: false, error: err.message || "Falha ao salvar a imagem do post." };
  }
}

export async function fazerUploadAvatarPerfil(arquivoWebp: File): Promise<{ success: boolean; error?: string; caminhoPublico?: string }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { user } = await obterUsuarioAtual();
    const userId = user?.id;

    const filePath = `${userId}/avatar_pic.webp`;

    const { error: uploadError } = await supabase.storage
      .from("avatares")
      .upload(filePath, arquivoWebp, { upsert: true });

    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
      .from("avatares")
      .getPublicUrl(filePath);

    return { 
      success: true, 
      caminhoPublico: `${publicUrl}?t=${Date.now()}` 
    };

  } catch (err: any) {
    console.error("Erro no serviço de upload de avatar:", err);
    return { success: false, error: err.message || "Falha ao salvar a imagem." };
  }
}

export async function deletarPostPorErroDeUpload(postId: string) {
  const supabase = await getSupabase();
  
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("post_id", postId);

  if (error) {
    throw new Error(`Falha no banco ao remover post órfão: ${error.message}`);
  }
  
  return { success: true };
}