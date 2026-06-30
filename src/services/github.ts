'use server'
import { obterUsuarioAtual } from "./auth";
import { getSupabase } from "./supabaseServer";

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
  const tokenGithub = await buscarTokenGithub();
  if (!tokenGithub) {
    return { error: 'TOKEN_AUSENTE' };
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
    return { error: 'TOKEN_EXPIRADO' };
  } else if (!reposRes.ok) {
    return { error: 'ERRO_API_GITHUB', status: reposRes.status };
  }
  const dados = await reposRes.json();
  return { data: dados };
}


export async function obterUsuarioGithub(username: string) {
  const tokenGithub = await buscarTokenGithub();
  if (!tokenGithub) {
    return { error: 'TOKEN_AUSENTE' };
  }

  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Authorization: `Bearer ${tokenGithub}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (userRes.status === 401) {
    return { error: 'TOKEN_EXPIRADO' };
  }

  if (!userRes.ok) {
    return { error: 'ERRO_API_GITHUB', status: userRes.status };
  }
  
  return await userRes.json();
}

export async function desvincularGithub() {
  const supabase = await getSupabase();
  const { user } = await obterUsuarioAtual();

  const identidadeGithub = user.identities?.find(
    (identidade) => identidade.provider === 'github'
  );
  await supabase.auth.unlinkIdentity(identidadeGithub);
}

async function buscarTokenGithub() {
  const supabase = await getSupabase();
  const { user } = await obterUsuarioAtual();
  const { data: tokenData } = await supabase
    .from('tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single();

  const tokenGithub = tokenData?.access_token;

  if (!tokenGithub) {
    return { error: 'TOKEN_AUSENTE' };
  }
  return tokenGithub
}