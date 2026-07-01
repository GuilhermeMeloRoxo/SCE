'use client';
import { conectarGithub } from '@/services/github';
import { usePathname } from 'next/navigation';
import { useAlerta } from '@/context/AlertContext';


export default function GithubButton() {
  const pathname = usePathname();
  const { mostrarAlerta } = useAlerta();

  const handleVinculo = async () => {
    try {
      const urlRedirecionamento = await conectarGithub(pathname);

      if (urlRedirecionamento) {
        window.location.assign(urlRedirecionamento);
      }
    } catch (err) {
      mostrarAlerta('error', 'Erro ao conectar no GitHub, tente novamente.');
      console.error('Erro ao conectar GitHub:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-400 p-10 text-center">
      <p className="text-sm text-slate-500 mb-4">Conecte seu GitHub para exibir suas contribuições recentes.</p>
      <button onClick={handleVinculo} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer">
          <svg className="w-6 h-6 text-black" fill="white">
              <use href="/icons.svg#github"></use>
          </svg>
          Conectar GitHub
      </button>
    </div>
  );
}
