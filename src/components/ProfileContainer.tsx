'use client'
import { buscarPerfilPublico } from '@/services/profile';
import { ProfileIcon } from '@/components/Icons';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProfileContainerProps {
  username: string;
}

export function ProfileContainer({ username }: ProfileContainerProps) {
  const [carregando, setCarregando] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data } = await buscarPerfilPublico(username); 
        const dadosPerfil = data ;

        if (dadosPerfil) {
          setData(dadosPerfil);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setCarregando(false);
      }
    }

    if (username) {
      carregarDados();
    }
  }, [username]);

  if (carregando) {
    return (
      <div className="w-full flex-shrink-0 lg:w-[350px] bg-slate-50 p-10 flex flex-col items-center justify-center border-r border-slate-200" id="profile-container">
        <div className="animate-pulse flex flex-col items-center w-full">
            <div className="w-48 h-48 rounded-full bg-slate-200 mb-8 border-4 border-white shadow-lg"></div>
            <div className="space-y-3 flex flex-col items-center w-full">
                <div className="h-8 w-3/4 bg-slate-200 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded-md"></div>
            </div>
            <div className="mt-12 space-y-8 text-left w-full border-t border-slate-200 pt-10 px-4">
                <div className="space-y-2">
                    <div className="h-3 w-16 bg-slate-200 rounded uppercase"></div>
                    <div className="h-6 w-full bg-slate-200 rounded-md"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded uppercase"></div>
                    <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
                </div>
            </div>
            <div className="mt-10 h-10 w-full bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const avatar = data?.avatar ? (
    <Image
      src={`${data.avatar}?t=${Date.now()}`}
      alt="Foto de Perfil"
      width={400}
      height={400}
      className="w-full h-full object-contain object-cover rounded-full"
    />
  ) : (
    <ProfileIcon className="w-34 h-34" />
  );
    return (
      <div className="w-full flex-shrink-0 lg:w-[350px] bg-slate-50 p-10 flex flex-col items-center justify-center border-r border-slate-200" id="profile-container">
        <div className="w-48 h-48 rounded-full bg-slate-200 mb-8 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        {avatar}
        </div>
        
        <div className="text-center w-full">
            <span className="block text-[26px] font-bold text-slate-900 leading-tight">
                {data.nome || 'Nome não informado'}
            </span>
            <div className="mt-10 space-y-8 text-left border-t border-slate-200 pt-10 px-4">
                <div>
                    <span className="block text-[12px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        Curso
                    </span>
                    <span className="flex items-center gap-2 text-1xl font-semibold text-slate-800 mt-1 leading-none">
                        <span className="material-symbols-outlined text-[#008b8b]">school</span>
                        {data.curso || 'Curso não informado'}
                    </span>
                </div>

                <div>
                    <span className="block text-[12px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        Formado em
                    </span>
                    <span className="flex items-center gap-2 text-1xl font-semibold text-slate-800 mt-1 leading-none">
                        <span className="material-symbols-outlined text-[#008b8b]">calendar_month</span>
                        {data.termino || 'Data não informada'}
                    </span>
                </div>
            </div>
        </div>
      </div>
    );
}