'use client';
import { useEffect, useState } from 'react';
import { buscarRepositoriosGithub, conectarGithub, obterUsuarioGithub } from '@/services/github';
import { GithubIcon } from './Icons';
import GithubButton from './GithubButton';
import { obterUsuarioAtual, buscarPerfilPublico } from '@/services/auth';

interface GithubContainerProps {
  username: string;
  pathname: string;
}
export function GithubContainer({ username, pathname }: GithubContainerProps) {
  const [repos, setRepos] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [carregandoConfig, setCarregandoConfig] = useState(true);

  useEffect(() => {
    async function carregarTudo() {
      try {
        setCarregando(true);

        const [perfilRes, usuarioLogadoRes] = await Promise.all([
          buscarPerfilPublico(username),
          obterUsuarioAtual()
        ]);

        const dadosPerfil = perfilRes?.data;
        const userIdLogado = usuarioLogadoRes?.user?.id;
        
        const gUser = dadosPerfil?.github_user;
        const donoDoPerfil = userIdLogado === dadosPerfil?.id;

        setGithubUser(gUser);
        setIsOwner(donoDoPerfil);
        setCarregandoConfig(false);

        if (!gUser) {
          setCarregando(false);
          return;
        }

        const resultadoRepos = await buscarRepositoriosGithub(gUser);
        const { resultadoUserGithub }  = await obterUsuarioGithub();

        if (resultadoRepos?.error === 'TOKEN_EXPIRADO_OU_AUSENTE' || resultadoUserGithub?.error === 'TOKEN_EXPIRADO_OU_AUSENTE') {
          const urlRenovacao = await conectarGithub(pathname);
          if (urlRenovacao) {
            window.location.href = urlRenovacao;
          }
          return;
        }

        if (resultadoRepos?.data && resultadoUserGithub) {
          setRepos(resultadoRepos.data);
          setUserData(resultadoUserGithub);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do GitHub:', err);
      } finally {
        setCarregando(false);
      }
    }

    if (username) {
      carregarTudo();
    }
  }, [username, pathname]);

  if (carregandoConfig || carregando) {
    return <p className="text-gray-500">Sincronizando repositórios do GitHub...</p>;
  }

  if (!githubUser && !isOwner) {
    return <p className="text-gray-500">Usuário não vinculou o GitHub</p>;
  }

  if (!githubUser && isOwner) {
    return <GithubButton />;
  }
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
    return (
        <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 hover:bg-slate-50/50 group"> 
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-black p-1 rounded-lg">
                        <GithubIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="white" />
                    </div>
                    <div>
                        <span className="block text-[16px] font-bold">Contribuições Recentes - GitHub</span>
                        <span className="block text-[12px] text-slate-400">Últimos repositórios atualizados</span>
                    </div>
                </div>
                <a href="https://github.com/{github_user}" target="_blank" rel="noopener noreferrer" className="text-[14px] font-bold text-[#0b8aa0] transition-transform duration-300 group-hover:scale-110 hover:underline hover:text-[#087487]">Ver perfil</a>
            </div>
            <div className="space-y-4 mb-8">
                ${
                    repos && Array.isArray(repos) && repos.length > 0 
                    ? repos.map(repo => `
                        <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-[#0b8aa0]/30 group/item">
                            <div className="flex justify-between items-start">
                                <span className="block text-[12px] uppercase tracking-widest font-bold text-slate-400 transition-colors duration-300 group-hover/item:text-[#0b8aa0]">Repositório</span>
                                
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <svg className="w-4 h-4 transition-all duration-300 group-hover/item:scale-110 group-hover/item:text-yellow-500"
                                    fill="none" 
                                    stroke="currentColor" 
                                    stroke-width="1.5">
                                    <use href="/icons.svg#star"></use>
                                    </svg>
                                    <span className="text-[12px] font-bold transition-all duration-300 group-hover/item:scale-110">${repo.stargazers_count}</span>
                                </div>
                            </div>

                            <span className="block mt-2 text-[15px] font-bold text-slate-900 leading-tight">
                                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" className="hover:text-[#0b8aa0] transition-colors">${repo.name}</a>
                            </span>
                            
                            <span className="block mt-1 text-[13px] text-slate-500 line-clamp-1">
                                ${repo.description || 'Sem descrição cadastrada'}
                            </span>

                            <div className="mt-4 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${languageColors[repo.language] || '#cbd5e1'}"></span>
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">${repo.language || 'Code'}</span>
                            </div>
                        </div>
                    `).join('')
                    : `<div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">Nenhum repositório público encontrado.</div>`
                }
            </div>
            <div className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/50 p-6 transition-colors duration-300 group-hover:bg-white/50">
                <div className="flex flex-col items-center flex-1">
                    <span className="text-[12px] uppercase tracking-wider font-bold">Seguindo</span>
                    <strong className="text-xl font-black text-[#0b8aa0]">${userData.following}</strong>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-[12px] uppercase tracking-wider font-bold">Seguidores</span>
                    <strong className="text-xl font-black text-[#0b8aa0]">${userData.followers}</strong>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-[12px] uppercase tracking-wider font-bold">Repos</span>
                    <strong className="text-xl font-black text-[#0b8aa0]">${userData.public_repos}</strong>
                </div>
            </div>
        </div>
    );
}