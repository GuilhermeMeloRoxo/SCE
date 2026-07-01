"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GithubContainer } from '@/app/perfil/[username]/GithubContainer';
import { ProfileContainer } from '@/components/ProfileContainer';
import { use, useEffect, useState } from 'react';
import { obterUsuarioAtual } from '@/services/auth';
import { buscarPerfilPublico } from '@/services/profile';

interface PerfilProps {
  params: Promise<{ username: string }>;
}


export default function PerfilClient({ params }: PerfilProps) {
    const pathname = usePathname();
    const { username } = use(params);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
      async function checkOwner() {
        try {
          const [perfilRes, usuarioRes] = await Promise.all([
            buscarPerfilPublico(username),
            obterUsuarioAtual(),
          ]);
          const perfil = perfilRes?.data;
          if (!usuarioRes) {
            window.location.href = '/login';
            return;
          }
          const usuarioAtualId = usuarioRes?.user?.id;
          setIsOwner(Boolean(usuarioAtualId && perfil?.id && usuarioAtualId === perfil.id));
        } catch (err) {
          console.error('Erro ao verificar dono do perfil', err);
          setIsOwner(false);
        }
      }
      if (username) checkOwner();
    }, [username]);

    return (
        <>
        <Navbar />
        <main className="min-h-[calc(100vh-65px-150px)] bg-slate-300 flex">
        <div className="flex w-full flex-col lg:flex-row"> 
                <ProfileContainer 
                    username={username}
                />
            <div className="flex-1 bg-slate-200 px-8 py-2 sm:py-8 overflow-y-auto">
                <div className="max-w-[1400px]">
                    <div>
                        <div className="mb-12 mt-6">
                            <div className="inline-flex"><h1 className="text-4xl font-black text-slate-900 tracking-tight">Seu Perfil</h1>
                            {isOwner && (<Link href={'/perfil/editar-perfil'}><span className="material-symbols-outlined !text-2xl pl-4 pt-1 text-slate-800 hover:text-[#087487] transition-colors">edit</span></Link>)}
                            </div>
                            <div className="h-1.5 w-20 bg-[#0b8aa0] flex flex-col mt-4 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-12 xl:flex-row">
                        <div id="github-container" className="w-full xl:w-[60%]">
                            
                            <GithubContainer
                            username={username}
                            pathname={pathname}
                            />

                        </div>
                        <div className="w-full xl:w-[40%]" id="linkedin-container">
                            <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 hover:bg-slate-50/50 group">                     
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-1 rounded-lg">
                                            <svg className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" fill="#0b8aa0">
                                                <use href="/icons.svg#linkedin"></use>
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-[16px] font-bold">Trajeto no LinkedIn</span>
                                            <span className="block text-[12px] text-slate-400">Resumo da sua atividade profissional</span>
                                        </div>
                                    </div>
                                    <a href="#" className="text-[14px] font-bold text-[#0b8aa0] transition-transform duration-300 group-hover:scale-110 hover:underline hover:text-[#087487]">Ver perfil</a>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="rounded-[24px] border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-[#0b8aa0]/30 sub-group cursor-default group/item">
                                        <span className="block text-[16px] uppercase tracking-widest font-bold transition-colors duration-300 group-hover/item:text-[#0b8aa0]">Cargo atual</span>
                                        <span className="block mt-2 text-[14px] text-slate-900 font-medium">Desenvolvedor Full Stack</span>
                                        <span className="block mt-2 text-sm text-slate-500">Tech Solutions</span>
                                        <span className="block mt-2 text-xs text-slate-400">desde jan. 2025</span>
                                    </div>
                                    <div className="rounded-[24px] border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-[#0b8aa0]/30 group/item cursor-default">
                                        <span className="block text-[16px] uppercase tracking-widest font-bold transition-colors duration-300 group-hover/item:text-[#0b8aa0]">Experiência anterior</span>
                                        <span className="block mt-2 text-[14px] text-slate-900 font-medium">Estágio em Desenvolvimento Web</span>
                                        <span className="block mt-2 text-sm text-slate-500">IFPB - João Pessoa</span>
                                        <span className="block mt-2 text-xs text-slate-400">jan. 2024 - dez. 2024</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/50 p-6 transition-colors duration-300 group-hover:bg-white/50">
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[12px] uppercase tracking-wider font-bold">Conexões</span>
                                        <strong className="text-xl font-black text-[#0b8aa0]">152</strong>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200"></div>
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[12px] uppercase tracking-wider font-bold">Seguidores</span>
                                        <strong className="text-xl font-black text-[#0b8aa0]">98</strong>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200"></div>
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[12px] uppercase tracking-wider font-bold">Publicações</span>
                                        <strong className="text-xl font-black text-[#0b8aa0]">12</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>    
    </main>
    </>
    );
}