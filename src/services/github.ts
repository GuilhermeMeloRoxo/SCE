'use server'
import { getSupabase } from "./supabase";

export async function conectarGithub(pathname: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const urlDeCallback = `${baseUrl}/auth/callback`;
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'github',
    options: {
      redirectTo: `${urlDeCallback}?next=${encodeURIComponent(pathname)}`,
      scopes: 'read:user'
    }
    });
  if (error) throw new Error(error.message);
  return data.url;
}

export async function buscarRepositoriosGithub(github_user: string) {
  const supabase = await getSupabase();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Erro ao obter usuário:", userError?.message);
    throw new Error("Usuário não autenticado no sistema.");
  }

  const identidadeGithub = user.identities?.find(
    (identidade) => identidade.provider === 'github'
  );

  const tokenGithub = (identidadeGithub?.identity_data as any)?.access_token || (identidadeGithub as any)?.provider_token;
  if (!tokenGithub) {
    return { error: 'TOKEN_EXPIRADO_OU_AUSENTE' };
  }
  const reposRes = await fetch(
    `https://api.github.com/users/${github_user}/repos?sort=pushed&direction=desc&per_page=2`,
    { 
      headers: { 
        "Authorization": `Bearer ${tokenGithub}`, 
        "Accept": "application/vnd.github+json" 
      } 
    }
  );

  if (reposRes.status === 401) {
    return { error: 'TOKEN_EXPIRADO_OU_AUSENTE' };
  } else if (!reposRes.ok) {
    throw new Error('Falha na API do GitHub');
  }
  const dados = await reposRes.json();
  return { data: dados };
}


export async function obterUsuarioGithub() {
  const supabase = await getSupabase();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Erro ao obter usuário:", userError?.message);
    throw new Error("Usuário não autenticado no sistema.");
  }

  const identidadeGithub = user.identities?.find(
    (identidade) => identidade.provider === 'github'
  );

  const tokenGithub = (identidadeGithub?.identity_data as any)?.access_token || (identidadeGithub as any)?.provider_token;
  if (!tokenGithub) {
    return { error: 'TOKEN_EXPIRADO_OU_AUSENTE' };
  }
  const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenGithub}`,
                "Accept": "application/vnd.github+json"
            }
        });

  return await userRes.json();
}
    