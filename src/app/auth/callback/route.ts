import { NextResponse } from 'next/server';
import { getSupabase } from '@/services/supabaseServer';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await getSupabase();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const usuarioLogado = data.user;
      const tokenGithub = data.session?.provider_token;

      const githubIdentity = usuarioLogado.identities?.find(
        (id) => id.provider === 'github'
      );

      if (githubIdentity) {
        const githubUser = githubIdentity.identity_data?.user_name;

        if (githubUser) {
          await supabase
            .from('perfis')
            .update({ github_user: githubUser })
            .eq('id', usuarioLogado.id);
        }
      }

      if (tokenGithub) {
        await supabase
          .from('tokens')
          .upsert({
            user_id: usuarioLogado.id,
            provider: 'github',
            access_token: tokenGithub,
            updated_at: new Date().toISOString()
          });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
