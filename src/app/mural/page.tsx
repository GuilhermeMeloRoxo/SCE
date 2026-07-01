"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAlerta } from "@/context/AlertContext";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { LoadingIcon } from "@/components/Icons";
import { formatarDataMural } from "@/utils/formatters";
import {
  atualizarPost,
  gerenciarCurtida,
  deletarPost,
} from "@/services/mural";
import { SendFeedbackModal } from "@/components/SendFeedbackModal";
import CreatePostModal from "@/components/CreatePostModal";
import { buscarPerfilPublico } from "@/services/profile";
import EditPostModal from "@/components/EditPostModal";
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';


export default function Mural() {
    const { mostrarAlerta } = useAlerta();
    const { usuario, carregando } = useAuth();
    const { postsQuery, curtidasQuery, refreshPosts } = usePosts();
    const posts = postsQuery.data ?? [];
    const postsCurtidos = curtidasQuery.data ?? new Set<string>();
    const [botoesBloqueados, setBotoesBloqueados] = useState<{ [key: string]: boolean }>({});
    const [isOpen, setIsOpen] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
    const isLoading = carregando || postsQuery.isLoading || curtidasQuery.isLoading;

    interface PostTipo {
        post_id: string;
        autor_nome: string;
        autor_avatar?: string;
        post_data: string;
        tag_nome: 'Evento' | 'Aviso' | 'Pesquisa' | 'Conquista' | 'Palestra' | 'Material' | 'Oportunidade' | 'Projeto';
        tag_cor: string;
        post_conteudo: string;
        imagem_url?: string;
        quantidade_curtidas: number;
    }

    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [postParaEditar, setPostParaEditar] = useState<PostTipo | null>(null);

    const handleAbrirEdicao = (post: PostTipo) => {
    setPostParaEditar(post);
    setIsEditOpen(true);
    };

    useEffect(() => {
      async function loadTipoUsuario() {
        if (!usuario) {
          setTipoUsuario(null);
          return;
        }

        try {
          const { data } = await buscarPerfilPublico(usuario.id);
          setTipoUsuario(data?.curso || null);
        } catch (error) {
          console.error('Erro ao buscar tipo de usuário:', error);
          setTipoUsuario(null);
        }
      }

      loadTipoUsuario();
    }, [usuario]);

    const handleCurtir = async (postId: string, jaCurtiu: boolean) => {
      if (!usuario) return mostrarAlerta("error", "Você precisa estar autenticado para curtir.");

      setBotoesBloqueados((prev) => ({ ...prev, [postId]: true }));

      try {
        const resultado = await gerenciarCurtida(postId, usuario.id, jaCurtiu);

        if (resultado.success) {
          await refreshPosts();
        }
      } catch (err) {
        mostrarAlerta("error", "Erro ao processar curtida.");
      } finally {
        setBotoesBloqueados((prev) => ({ ...prev, [postId]: false }));
      }
    };

    const handleDeletar = async (postId: string) => {
      if (confirm("Tem certeza que deseja excluir essa postagem?")) {
        setBotoesBloqueados((prev) => ({ ...prev, [postId]: true }));

        try {
          const resultado = await deletarPost(postId);

          if (resultado.success) {
            mostrarAlerta("ok", "Post excluído com sucesso.");
            await refreshPosts();
          } else {
            mostrarAlerta("error", resultado.error || "Erro ao excluir o post.");
          }
        } catch (err) {
          mostrarAlerta("error", "Erro ao excluir o post.");
        } finally {
          setBotoesBloqueados((prev) => ({ ...prev, [postId]: false }));
        }
      }
    };

    const podeCriarPost = tipoUsuario === 'Coordenador' || tipoUsuario === 'Professor';

    return (
    <>
        <Navbar />
        
        <main className="container mx-auto px-4">
        <div className="search my-4 absolute right-10">
            <SearchBar />
        </div>

        <h1 className="text-3xl font-bold text-center my-6 text-[#0b8aa0]">
            Mural de Notícias - IFPB JP
        </h1>

        <div id="mural-posts" className="mural-grid">
            {isLoading ? (
            <div className="flex w-full items-center justify-center">
                <LoadingIcon className="animate-spin h-20 w-20 mt-30 text-gray-500" />
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
                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-100 bg-slate-50 flex items-center justify-center w-full max-w-[600px] mx-auto aspect-[16/9]">
                        <Image
                        src={post.imagem_url}
                        alt="Imagem do post"
                        width={600}
                        height={338}
                        className="w-full h-full object-cover"
                        />
                    </div>
                    )}

                    <div className="w-full max-w-[600px] flex items-center gap-6 mt-5 pt-4 border-t border-gray-100">
                    <button
                        disabled={botoesBloqueados[post.post_id]}
                        onClick={() => handleCurtir(post.post_id, curtidoPeloUsuario)}
                        className={`flex items-center gap-1.5 group transition ${botoesBloqueados[post.post_id] ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                    >
                        {botoesBloqueados[post.post_id] ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                        ) : (
                        <span
                            className={`material-symbols-outlined !text-[24px] transition group-hover:text-red-500
                            ${curtidoPeloUsuario ? "text-red-500 fill-red-500" : "text-gray-400 fill-none"}`}
                        >
                            favorite
                        </span>
                        )}
                        <span className="text-xs font-semibold text-gray-500">{post.quantidade_curtidas}</span>
                    </button>
                {podeCriarPost && (
                    <>
                    <button type="button" onClick={() => handleAbrirEdicao(post)} className="cursor-pointer flex ml-auto items-center gap-1.5 group transition">
                        <span className="material-symbols-outlined !text-[24px] text-gray-400 group-hover:text-[#0b8aa0] active:scale-95 active:shadow-2xl transition">
                        edit_square
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeletar(post.post_id)}
                        className="cursor-pointer flex items-center gap-1.5 ml-2 text-red-500 group transition"
                    >
                        <span className="material-symbols-outlined !text-[24px] text-gray-400 group-hover:text-red-500 active:scale-95 transition">
                            delete
                        </span>
                    </button>
                    </>
                )}
                </div>
            </div>
            );
        }))}
        </div>
            <EditPostModal 
                isOpen={isEditOpen} 
                setIsOpen={setIsEditOpen} 
                post={postParaEditar}
                onPostAtualizado={() => {atualizarPost}}
            />
        </main>

        <div className="relative">
        {podeCriarPost ? (
            <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#0b8aa0] text-white rounded-full hover:bg-[#087487] cursor-pointer transition duration-300 active:scale-95 fixed bottom-5 right-5 z-40 shadow-xl"
            >
                <span className="material-symbols-outlined text-xl">post_add</span>
                <span className="font-bold">Criar Post</span>
            </button>

            {isOpen && usuario && (
                <CreatePostModal 
                userId={usuario.id} 
                isOpen={isOpen} 
                setIsOpen={setIsOpen} 
                />
            )}
            </>
        ) : (
            <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#0b8aa0] text-white rounded-full hover:bg-[#087487] cursor-pointer transition duration-300 active:scale-95 fixed bottom-5 right-5 z-40 shadow-xl"
            >
                <span id="chat" className="material-symbols-outlined text-xl">chat</span>
                <span id="feedback-text" className="font-bold">Enviar Feedback</span>
            </button>

            {isOpen && (
                <SendFeedbackModal 
                isOpen={isOpen} 
                setIsOpen={setIsOpen} 
                />
            )}
            </>
        )}
        </div>
    </>
)}