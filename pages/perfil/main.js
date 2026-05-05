import { mostrarErro } from '../../src/main';
import { supabase } from '/src/supabaseClient.js'

export async function renderizarPerfil() {
    const profileContainer = document.getElementById('profile-container');
    
    // Verifica se o elemento existe no DOM
    if (!profileContainer) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('perfis')
        .select('nome, email, github_user, formacao(curso, termino)')
        .eq('id', user.id)
        .single();

    if (error || !data) return null;
    const temGithub = data && data.github_user;
    const avatarUrl = temGithub 
    ? `<img src="https://avatars.githubusercontent.com/${data.github_user}" alt="Foto de Perfil" class="w-full h-full object-cover rounded-full">` 
    : `<svg class="w-60 h-60 text-[#087487]" fill="currentColor">
            <use href="/src/assets/icons.svg#profile"></use>
        </svg>`;
    
    profileContainer.innerHTML = `
        <!-- container foto -->
        <div class="w-48 h-48 rounded-full bg-slate-200 mb-8 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        ${avatarUrl}
        </div>

        <div class="text-center w-full">
            <span class="block text-[26px] font-bold text-slate-900 leading-tight">
                ${data.nome || 'Nome não informado'}
            </span>
            <span class="block text-slate-500 text-[16px] mt-2">
                ${data.email || 'Email não informado'}
            </span>
            
            <div class="mt-10 space-y-8 text-left border-t border-slate-200 pt-10 px-4">
                <div>
                    <span class="block text-[12px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        Curso
                    </span>
                    <span class="flex items-center gap-2 text-1xl font-semibold text-slate-800 mt-1 leading-none">
                        <span class="material-symbols-outlined">menu_book</span>
                        ${data.formacao?.curso || 'Curso não informado'}
                    </span>
                </div>

                <div>
                    <span class="block text-[12px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        Formado em
                    </span>
                    <span class="flex items-center gap-2 text-1xl font-semibold text-slate-800 mt-1 leading-none">
                        <span class="material-symbols-outlined">calendar_month</span>
                        ${data.formacao?.termino || 'Data não informada'}
                    </span>
                </div>
            </div>
        </div>`;
    return renderizarGithub(data.github_user);
}

export function renderizarBotãoGithub() {
    const container = document.getElementById('github-container');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 p-10 text-center">
            <p class="text-sm text-slate-500 mb-4">Conecte seu GitHub para exibir suas contribuições recentes.</p>
            <button id="btn-github" class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer">
                <svg class="w-6 h-6 text-black" fill="white">
                    <use href="/src/assets/icons.svg#github"></use>
                </svg>
                Conectar GitHub
            </button>
        </div>
    `;

    const btnGithub = container.querySelector('#btn-github');
    if (btnGithub) {
        btnGithub.addEventListener('click', conectarGithub);
    }
}
export async function conectarGithub() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin + '/pages/perfil/',
                scopes: 'read:user'
            }
        });

        if (error) throw error;

    } catch (error) {
        console.error('Erro ao iniciar autenticação GitHub:', error.message);
        mostrarErro('Não foi possível conectar ao GitHub. Tente novamente.');
    }
}
export async function salvarUsuarioLogado() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        const user = session.user;
    
        const githubUsername = user.user_metadata.user_name || user.user_metadata.preferred_username;

        // salvando o usuário na tabela perfis do supabase caso seja primeiro login github
        const { error } = await supabase.from('perfis')
            .update({ 
                github_user: githubUsername,
                atualizado_em: new Date(),
            }).eq('id', user.id)

        if (error) console.error('Erro ao salvar perfil:', error.message);
        return githubUsername;
    }
}
export async function renderizarGithub(github_user) {

    // verifica se existe o container para o github e se o usuário já está autenticado com o GitHub
    const githubContainer = document.getElementById('github-container');
    if (!githubContainer) return null;
    if (!github_user) {
        github_user = await salvarUsuarioLogado();
        if (!github_user) return renderizarBotãoGithub();
    };

    const { data: { session } } = await supabase.auth.getSession()
  
    if (!session || !session.provider_token) {
        console.log("Token do GitHub não encontrado")
        return renderizarBotãoGithub();
    }

    const token = session.provider_token;
    let userData;
    try {
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/vnd.github+json"
            }
        });

        // caso o usuário dê revoke no github
        if (userRes.status === 401) {
            console.error("Token inválido ou revogado");
            return renderizarBotãoGithub();
        }
        userData = await userRes.json();
    } catch (error) {
        console.error("Erro ao verificar token do GitHub:", error);
        return renderizarBotãoGithub();
    }

    

    // pega os 2 repositórios com pushs mais recentes
    const reposRes = await fetch(
        `https://api.github.com/users/${github_user}/repos?sort=pushed&direction=desc&per_page=2`,
        { headers: { Authorization: `Bearer ${token}`, "Accept": "application/vnd.github+json" } }
    );
    const repositorios = await reposRes.json()

    // Mapa de cores das linguagens (baseado no GitHub)
    const languageColors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#ed8c33',
        'C++': '#f34b7d',
        'C': '#555555',
        'C#': '#239120',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'Dart': '#00B4AB',
        'HTML': '#e34c26',
        'CSS': '#1572B6',
        'Shell': '#89e051',
        'Vue': '#4FC08D',
        'React': '#61DAFB',
        'Svelte': '#ff3e00',
        'Other': '#586069'
    };

    

githubContainer.innerHTML = `
<div class="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 hover:bg-slate-50/50 group"> 
    <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
            <div class="bg-black p-1 rounded-lg">
                <svg class="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="white">
                    <use href="/src/assets/icons.svg#github"></use>
                </svg>
            </div>
            <div>
                <span class="block text-[16px] font-bold">Contribuições Recentes - GitHub</span>
                <span class="block text-[12px] text-slate-400">Últimos repositórios atualizados</span>
            </div>
        </div>
        <a href="https://github.com/${github_user}" target="_blank" rel="noopener noreferrer" class="text-[14px] font-bold text-[#0b8aa0] transition-transform duration-300 group-hover:scale-110 hover:underline hover:text-[#087487]">Ver perfil</a>
    </div>
    <div class="space-y-4 mb-8">
        ${
            repositorios && Array.isArray(repositorios) && repositorios.length > 0 
            ? repositorios.map(repo => `
                <div class="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-[#0b8aa0]/30 group/item">
                    <div class="flex justify-between items-start">
                        <span class="block text-[12px] uppercase tracking-widest font-bold text-slate-400 transition-colors duration-300 group-hover/item:text-[#0b8aa0]">Repositório</span>
                        
                        <div class="flex items-center gap-1.5 text-slate-400">
                            <svg class="w-4 h-4 transition-all duration-300 group-hover/item:scale-110 group-hover/item:text-yellow-500"
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="1.5">
                            <use href="/src/assets/icons.svg#star"></use>
                            </svg>
                            <span class="text-[12px] font-bold transition-all duration-300 group-hover/item:scale-110">${repo.stargazers_count}</span>
                        </div>
                    </div>

                    <span class="block mt-2 text-[15px] font-bold text-slate-900 leading-tight">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="hover:text-[#0b8aa0] transition-colors">${repo.name}</a>
                    </span>
                    
                    <span class="block mt-1 text-[13px] text-slate-500 line-clamp-1">
                        ${repo.description || 'Sem descrição cadastrada'}
                    </span>

                    <div class="mt-4 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${languageColors[repo.language] || '#cbd5e1'}"></span>
                        <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">${repo.language || 'Code'}</span>
                    </div>
                </div>
            `).join('')
            : `<div class="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">Nenhum repositório público encontrado.</div>`
        }
    </div>

    <!-- Estatísticas na Base (Igual ao LinkedIn) -->
    <div class="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/50 p-6 transition-colors duration-300 group-hover:bg-white/50">
        <div class="flex flex-col items-center flex-1">
            <span class="text-[12px] uppercase tracking-wider font-bold">Seguindo</span>
            <strong class="text-xl font-black text-[#0b8aa0]">${userData.following}</strong>
        </div>
        <div class="h-8 w-px bg-slate-200"></div>
        <div class="flex flex-col items-center flex-1">
            <span class="text-[12px] uppercase tracking-wider font-bold">Seguidores</span>
            <strong class="text-xl font-black text-[#0b8aa0]">${userData.followers}</strong>
        </div>
        <div class="h-8 w-px bg-slate-200"></div>
        <div class="flex flex-col items-center flex-1">
            <span class="text-[12px] uppercase tracking-wider font-bold">Repos</span>
            <strong class="text-xl font-black text-[#0b8aa0]">${userData.public_repos}</strong>
        </div>
    </div>
</div>`;         
}
