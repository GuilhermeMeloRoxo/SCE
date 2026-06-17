"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAlerta } from "@/context/AlertContext";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { LoadingIcon } from "@/components/Icons";
import { obterUsuarioAtual } from "@/services/auth";
import { formatarDataMural } from "@/utils/formatters";
import { 
  buscarPostsCurtidos,
  buscarPostsMural, 
  gerenciarCurtida, 
  enviarFeedback 
} from "@/services/mural";

export default function Mural() {
    const { mostrarAlerta } = useAlerta();
    
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [botoesBloqueados, setBotoesBloqueados] = useState<{ [key: string]: boolean }>({});
    const [postsCurtidos, setPostsCurtidos] = useState<Set<string>>(new Set());

    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

    const [tipoFeedback, setTipoFeedback] = useState("");
    const [assunto, setAssunto] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        async function carregarDadosIniciais() {
            try {
                const currentUser = await obterUsuarioAtual();
                setUser(currentUser);

                const listaPosts = await buscarPostsMural();
                setPosts(listaPosts);

                if (currentUser && listaPosts.length > 0) {
                    const idsDosPosts = listaPosts.map((p) => p.post_id);
                    const curtidasSet = await buscarPostsCurtidos(currentUser.id, idsDosPosts);
                    setPostsCurtidos(curtidasSet);
                }
            } catch (err) {
            mostrarAlerta("error", "Não foi possível carregar as publicações.");
            } finally {
            setLoading(false);
            }
        }
        carregarDadosIniciais();
    }, []);

    const handleCurtir = async (postId: string, jaCurtiu: boolean) => {
        if (!user) return mostrarAlerta("error", "Você precisa estar logado para curtir.");
        
        setBotoesBloqueados((prev) => ({ ...prev, [postId]: true }));

        try {
            const resultado = await gerenciarCurtida(postId, user.id, jaCurtiu);

            if (resultado.success) {
            setPosts((prev) => prev.map((post) => 
                post.post_id === postId 
                ? { ...post, quantidade_curtidas: post.quantidade_curtidas + (jaCurtiu ? -1 : 1) } 
                : post
            ));

            setPostsCurtidos((prevSet) => {
                const novoSet = new Set(prevSet);
                if (jaCurtiu) {
                novoSet.delete(postId);
                } else {
                novoSet.add(postId); 
                }
                return novoSet;
            });
            }
        } catch (err) {
            mostrarAlerta("error", "Erro ao processar curtida.");
        } finally {
            setBotoesBloqueados((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const handleFeedbackSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsFeedbackLoading(true);

        try {
            const resultado = await enviarFeedback(tipoFeedback, assunto, mensagem);

            if (resultado.success) {
            mostrarAlerta("ok", "Feedback enviado com sucesso!");
            setTipoFeedback("");
            setAssunto("");
            setMensagem("");
            setIsFeedbackOpen(false);
            }
        } catch (err: any) {
            mostrarAlerta("error", err.message);
        } finally {
            setIsFeedbackLoading(false);
        }
    };
    return (
        <>
            <Navbar />
            
            <main className="container mx-auto px-4">
            <div id="search" className="search my-4">
                <SearchBar />
            </div>

            <h1 className="text-3xl font-bold text-center my-6 text-[#0b8aa0]">
                Mural de Notícias - IFPB JP
            </h1>

            <div id="mural-posts" className="mural-grid">
                {loading ? (
                <div className="flex w-full items-center justify-center">
                    <LoadingIcon className="animate-spin h-20 w-20 mt-30 text-[#e0e0e0]" />
                </div>
                ) : (
                posts.map((post) => {
                    const curtidoPeloUsuario = postsCurtidos.has(post.post_id);

                    return (
                    <div 
                        key={post.post_id} 
                        className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto flex flex-col items-center text-zinc-900"
                    >
                        <div className="w-full max-w-[600px] text-left">
                        
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                            {post.autor_avatar ? (
                                <Image
                                src={`${post.autor_avatar}?t=${new Date().getTime()}`}
                                alt={`Foto de ${post.autor_nome}`}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded-full"
                                />
                            ) : (
                                <svg className="w-10 h-10 text-gray-400">
                                <use href="/icons.svg#profile" />
                                </svg>
                            )}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-none">{post.autor_nome}</h3>
                                <span className="text-[11px] text-gray-400">{formatarDataMural(post.post_data)}</span>
                            </div>
                            </div>

                            <span
                            className="px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${post.tag_cor}, transparent 90%)`,
                                color: post.tag_cor,
                            }}
                            >
                            {post.tag_nome}
                            </span>
                        </div>

                        <div className="post-content mb-4">
                            <p className="text-gray-700 text-sm leading-relaxed">{post.post_conteudo}</p>
                        </div>
                        </div>

                        {post.imagem_url && (
                        <div className="mt-4 overflow-hidden rounded-lg border border-gray-100 bg-slate-50 flex items-center justify-center w-full max-w-[600px] mx-auto">
                            <Image
                            src={post.imagem_url}
                            alt="Imagem do post"
                            width={600}
                            height={400}
                            className="w-full h-full object-contain"
                            />
                        </div>
                        )}

                        <div className="w-full max-w-[600px] flex items-center gap-6 mt-5 pt-4 border-t border-gray-100">
                        <button
                            disabled={botoesBloqueados[post.post_id]}
                            onClick={() => handleCurtir(post.post_id, curtidoPeloUsuario)}
                            className="cursor-pointer flex items-center gap-1.5 group transition"
                        >
                            <span
                            className={`material-symbols-outlined text-[20px] transition group-hover:text-red-500
                                ${curtidoPeloUsuario ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                            >
                            favorite
                            </span>
                            <span className="text-xs font-semibold text-gray-500">{post.quantidade_curtidas}</span>
                        </button>

                        <button className="cursor-pointer flex items-center gap-1.5 group transition">
                            <span className="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-blue-500 transition">
                            comment
                            </span>
                            <span className="text-xs font-semibold text-gray-500">{post.quantidade_comentarios}</span>
                        </button>
                        </div>
                    </div>
                    );
                })
                )}
            </div>
            </main>

            <form id="feedback" className="relative" onSubmit={handleFeedbackSubmit}>
            
            <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#0b8aa0] text-white rounded-full hover:bg-[#087487] cursor-pointer transition duration-300 active:scale-95 active:shadow-2xl fixed bottom-5 right-5 z-40 shadow-xl" 
                type="button"
            >
                <span id="chat" className="material-symbols-outlined text-xl">chat</span>
                <span id="feedback-text" className="font-bold">Enviar Feedback</span>
            </button>

            {isFeedbackOpen && (
                <div id="hidden-feedback" className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative p-8 text-zinc-900">
                    
                    <div className="flex items-center justify-between m-2">
                        <div className="flex items-center gap-3 text-[#0b8aa0]">
                        <span className="material-symbols-outlined !text-2xl">chat</span>
                        <span className="text-2xl font-bold text-[#0b8aa0]">Enviar Feedback</span>
                        </div>
                        <button 
                        type="button" 
                        onClick={() => setIsFeedbackOpen(false)}
                        className="material-symbols-outlined text-gray-800 cursor-pointer !text-3xl hover:text-gray-600"
                        >
                        close
                        </button>
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-4 mb-6 text-center italic">Sua opinião é muito importante para nós!</p>

                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm font-bold m-2 text-zinc-800">Tipo de Feedback *</label>
                        <div className="relative">
                            <select required className="px-4 py-2.5 w-full cursor-pointer border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition appearance-none bg-white text-zinc-900">
                            <option value="" disabled selected>Selecione uma opção</option>
                            <option value="Sugestão">Sugestão</option>
                            <option value="Problema">Problema</option>
                            <option value="Elogio">Elogio</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://w3.org" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                            </div>
                        </div>
                        </div>

                        <div>
                        <label className="block text-sm font-bold m-2 text-zinc-800">Assunto (opcional)</label>
                        <input type="text" placeholder="Digite um assunto" className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900" />
                        </div>

                        <div>
                        <label className="block text-sm font-bold m-2 text-zinc-800">Mensagem *</label>
                        <textarea required id="msg-feedback" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-3xl h-34 resize-none text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900" 
                            name="mensagem" minLength={10} maxLength={500}
                            placeholder="Conte-nos o que você pensa, sugestões, problemas ou elogios."></textarea>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 mt-8">
                        <button 
                        type="button" 
                        onClick={() => setIsFeedbackOpen(false)}
                        className="px-6 py-2 border border-gray-300 rounded-3xl text-sm font-bold text-[#0b8aa0] hover:bg-gray-100 cursor-pointer shadow-lg transition duration-300 active:scale-95 active:shadow-2xl"
                        >
                        <span>Cancelar</span>
                        </button>
                        <button 
                        type="submit" 
                        disabled={isFeedbackLoading}
                        className="px-8 py-2 bg-[#0b8aa0] hover:bg-[#087487] text-white rounded-3xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition duration-300 active:scale-95 active:shadow-2xl"
                        >
                        {isFeedbackLoading && <LoadingIcon className="animate-spin h-5 w-5 text-[#e0e0e0]" />}
                        <span>Enviar</span>
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-gray-400 font-bold">
                        <span className="material-symbols-outlined !text-sm">lock</span>
                        Suas informações são sigilosas e utilizadas apenas para melhorias.
                    </div>
                </div>
                </div>
            )}
            </form>
        </>
        );
}