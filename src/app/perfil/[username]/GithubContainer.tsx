'use client';
import { useEffect, useState } from 'react';
import { buscarRepositoriosGithub, conectarGithub, desvincularGithub, obterUsuarioGithub } from '@/services/github';
import { GithubIcon, StarIcon } from '../../../components/Icons';
import GithubButton from './GithubButton';
import { obterUsuarioAtual} from '@/services/auth';
import { useAlerta } from '@/context/AlertContext';
import { buscarPerfilPublico } from '@/services/profile';

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
  const { mostrarAlerta } = useAlerta();

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
        const resultadoUserGithub  = await obterUsuarioGithub();

        if (resultadoRepos?.error === 'TOKEN_EXPIRADO' || resultadoUserGithub?.error == 'TOKEN_EXPIRADO') {
          mostrarAlerta('alert', 'Seu token github expirou, vamos renová-lo para você, aguarde.')
          await desvincularGithub();
          const urlRenovacao = await conectarGithub(pathname);
          if (urlRenovacao) {
            window.location.href = urlRenovacao;
          }
          return;
        } else if (resultadoUserGithub?.error == 'TOKEN_AUSENTE' || resultadoRepos?.error === 'TOKEN_AUSENTE') {
          mostrarAlerta('error', 'Você precisa conectar seu github na sua página de perfil para ver os repositórios de outros usuários.')
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
    return (
      <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm w-full min-w-[550px] max-w-[750px] min-h-[550px] animate-pulse">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-200 p-5 rounded-lg w-10 h-10"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-48"></div>
              <div className="h-3 bg-slate-200 rounded w-36"></div>
            </div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>

        <div className="space-y-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-slate-200 rounded w-20"></div>
                <div className="h-3 bg-slate-200 rounded w-8"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-12 mt-2"></div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/50 p-6">
          <div className="h-6 bg-slate-200 rounded w-12 mx-auto"></div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="h-6 bg-slate-200 rounded w-12 mx-auto"></div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="h-6 bg-slate-200 rounded w-12 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!githubUser && !isOwner) {
    return (
      <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4 text-slate-400">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1">GitHub não vinculado</h3>
        <p className="text-sm text-slate-400 max-w-xs mb-6">
          Este perfil ainda não possui uma conta do GitHub conectada para exibir as contribuições.
        </p>
      </div>
    );
  }

  if (!githubUser && isOwner) {
    return <GithubButton />;
  }

  const languageColors: Record<string, string> = {
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
  interface Repository {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
  }

  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 hover:bg-slate-50/50 group min-w-[550px] max-w-[750px] min-h-[550px]"> 
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
        <a href={`https://github.com{github_user}`} target="_blank" rel="noopener noreferrer" className="text-[14px] font-bold text-[#0b8aa0] transition-transform duration-300 group-hover:scale-110 hover:underline hover:text-[#087487]">Ver perfil</a>
      </div>

      <div className="space-y-4 mb-8">
        {repos && Array.isArray(repos) && repos.length > 0 ? (
          repos.map((repo: Repository) => (
            <div key={repo.id} className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-[#0b8aa0]/30 group/item">
              <div className="flex justify-between items-start">
                <span className="block text-[12px] uppercase tracking-widest font-bold text-slate-400 transition-colors duration-300 group-hover/item:text-[#0b8aa0]">Repositório</span>
                
                <div className="flex items-center gap-1.5 text-slate-400">
                  <StarIcon className='w-4 h-4 transition-all duration-300 group-hover/item:scale-110 group-hover/item:text-yellow-500' />
                  <span className="text-[12px] font-bold transition-all duration-300 group-hover/item:scale-110">{repo.stargazers_count}</span>
                </div>
              </div>

              <span className="block mt-2 text-[15px] font-bold text-slate-900 leading-tight">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0b8aa0] transition-colors">{repo.name}</a>
              </span>
              
              <span className="block mt-1 text-[13px] text-slate-500 line-clamp-1">
                {repo.description || 'Sem descrição cadastrada'}
              </span>

              <div className="mt-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: languageColors[repo.language || ''] || '#cbd5e1' }}></span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{repo.language || 'Code'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">Nenhum repositório público encontrado.</div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/50 p-6 transition-colors duration-300 group-hover:bg-white/50">
        <div className="flex flex-col items-center flex-1">
          <span className="text-[12px] uppercase tracking-wider font-bold">Seguindo</span>
          <strong className="text-xl font-black text-[#0b8aa0]">{userData?.following ?? 0}</strong>
        </div>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-[12px] uppercase tracking-wider font-bold">Seguidores</span>
          <strong className="text-xl font-black text-[#0b8aa0]">{userData?.followers ?? 0}</strong>
        </div>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-[12px] uppercase tracking-wider font-bold">Repos</span>
          <strong className="text-xl font-black text-[#0b8aa0]">{userData?.public_repos ?? 0}</strong>
        </div>
      </div>
    </div>
  );
}