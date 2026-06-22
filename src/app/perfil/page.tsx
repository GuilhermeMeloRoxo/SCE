"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase"
import { useAlerta } from "@/context/AlertContext";
import { Navbar } from "@/components/Navbar";
import { obterUsuarioAtual } from "@/services/auth";

export default function Perfil() {
    const router = useRouter();
    const { mostrarAlerta } = useAlerta();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [perfil, setPerfil] = useState<PerfilData | null>(null);
    const [botoesBloqueados, setBotoesBloqueados] = useState<{ [key: string]: boolean }>({});

    interface Formacao {
        curso: string | null;
        termino: string | null;
    }
    interface PerfilData {
        nome: string | null;
        github_user: string | null;
        avatar_url: string | null;
        formacao: Formacao | null;
        avatar_public_url: string | null; 
    }

    useEffect(() => {
        document.title = "Seu Perfil - SCE"; 
        async function carregarDados() {
            try {
                const currentUser = await obterUsuarioAtual();
                setUser(currentUser);
                if (!currentUser) {
                    router.push('/');
                    throw new Error();
                }
                const { data, error } = await supabase
                    .from('perfis')
                    .select('nome, github_user, avatar_url, formacao(curso, termino)')
                    .eq('id', currentUser.id)
                    .single();
                if (error || !data) {
                    throw new Error();
                } const perfilBanco = data as unknown as Omit<PerfilData, 'avatar_public_url'>;
                let urlPublica: string | null = null;
                if (perfilBanco.avatar_url) {
                    const { data: storageData } = supabase
                        .storage
                        .from('avatares')
                        .getPublicUrl(perfilBanco.avatar_url);

                    if (storageData?.publicUrl) {
                        urlPublica = `${storageData.publicUrl}?t=${new Date().getTime()}`;
                    }
                }
                const dadosCompletos: PerfilData = {
                    nome: perfilBanco.nome,
                    github_user: perfilBanco.github_user,
                    avatar_url: perfilBanco.avatar_url,
                    formacao: perfilBanco.formacao,
                    avatar_public_url: urlPublica
                };
                setPerfil(dadosCompletos);
                setLoading(false);
                if (dadosCompletos.github_user) {
                    // await renderizarGithub(dadosCompletos.github_user);
                }
            } catch (err) {
                mostrarAlerta("error", "Não foi possível carregar os seus dados.");
            }
        }
        carregarDados();
    }, []);

    return (
        <>
        <Navbar />
        <main className="min-h-[calc(100vh-65px-150px)] bg-white flex">
        <div className="flex w-full flex-col lg:flex-row"> 
            <div className="w-full flex-shrink-0 lg:w-[350px] bg-slate-50 p-10 flex flex-col items-center justify-center border-r border-slate-200" id="profile-container">
                {loading ? (
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
                </div>
                ) : (
                <>
                <div className="w-48 h-48 rounded-full bg-slate-200 mb-8 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {perfil.avatar_public_url ? (
                        <Image 
                            src={perfil.avatar_public_url} 
                            alt={`Foto de ${perfil.nome}`} 
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-full" 
                        />
                    ) : (
                        <svg className="w-48 h-48">
                        <use href="/icons.svg#profile"></use>
                        </svg>
                    )}
                </div>
                
                <div className="text-center w-full">
                    <span className="block text-[26px] font-bold text-slate-900 leading-tight">
                        {perfil.nome || 'Nome não informado'}
                    </span>
                    <div className="mt-10 space-y-8 text-left border-t border-slate-200 pt-10 px-4">
                        <div>
                            <span className="block text-[12px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                                Curso
                            </span>
                            <span className="flex items-center gap-2 text-1xl font-semibold text-slate-800 mt-1 leading-none">
                                <span className="material-symbols-outlined text-[#008b8b]">school</span>
                                {perfil.formacao?.curso || 'Curso não informado'}
                            </span>
                        </div>

                        <div>
                            <span className="block text-[12px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                                Formado em
                            </span>
                            <span className="flex items-center gap-2 text-1xl font-semibold text-slate-800 mt-1 leading-none">
                                <span className="material-symbols-outlined text-[#008b8b]">calendar_month</span>
                                {perfil.formacao?.termino || 'Data não informada'}
                            </span>
                        </div>
                    </div>
                </div>
                </>
                )}
            </div>
            <div className="flex-1 bg-white px-8 py-2 sm:py-8 overflow-y-auto">
                <div className="max-w-[1400px]">
                    <div>
                        <div className="mb-12 mt-6">
                            <div className="inline-flex"><h1 className="text-4xl font-black text-slate-900 tracking-tight">Seu Perfil</h1>
                            <Link href="/perfil/editar"><span className="material-symbols-outlined !text-2xl pl-4 pt-1 text-slate-800 hover:text-[#087487] transition-colors">edit</span></Link></div>
                            <div className="h-1.5 w-20 bg-[#0b8aa0] flex flex-col mt-4 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-12 xl:flex-row">
                        <div id="github-container" className="w-full xl:w-[60%]">
                            <div className="animate-pulse">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                                        <div className="h-3 w-48 bg-slate-200 rounded"></div>
                                        <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                    </div>
                                    <div className="flex flex-col gap-8 xl:flex-row">
                                        <div className="flex-grow space-y-6">
                                            <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6">
                                                <div className="h-2 w-20 bg-slate-200 rounded mb-4"></div>
                                                <div className="h-5 w-3/4 bg-slate-200 rounded mb-2"></div>
                                                <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                                            </div>
                                            <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6">
                                                <div className="h-2 w-20 bg-slate-200 rounded mb-4"></div>
                                                <div className="h-5 w-2/3 bg-slate-200 rounded mb-2"></div>
                                                <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col justify-between w-full xl:w-56 rounded-[28px] border border-slate-100 bg-slate-50/50 p-8 h-[280px]">
                                            <div className="flex items-center justify-between">
                                                <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                                <div className="h-6 w-10 bg-slate-200 rounded"></div>
                                            </div>
                                            <div className="py-6 my-6 border-y border-slate-200 flex items-center justify-between">
                                                <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                                <div className="h-6 w-10 bg-slate-200 rounded"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="h-4 w-16 bg-slate-200 rounded"></div>
                                                <div className="h-6 w-8 bg-slate-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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