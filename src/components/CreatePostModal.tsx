'use client';
import { useAlerta } from '@/context/AlertContext';
import { processarCanvasPostParaWebp} from '@/services/images';
import { criarPost } from '@/services/mural';
import { useState, useRef, ChangeEvent, SubmitEvent, useEffect } from 'react';
import { Dispatch, SetStateAction } from "react";
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { fazerUploadImagemPost, deletarPostPorErroDeUpload } from '@/services/storage';

type TagType = 'Evento' | 'Aviso' | 'Pesquisa' | 'Conquista' | 'Palestra' | 'Material' | 'Oportunidade' | 'Projeto';

const OPCOES_TAGS: TagType[] = ['Evento', 'Aviso', 'Oportunidade', 'Conquista', 'Pesquisa', 'Material', 'Projeto', 'Palestra'];

interface CreatePostModalProps {
  userId: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CreatePostModal({ userId, isOpen, setIsOpen }: CreatePostModalProps) {
  const [conteudo, setConteudo] = useState<string>('');
  const [tagSelecionada, setTagSelecionada] = useState<TagType>();
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showCropperModal, setShowCropperModal] = useState<boolean>(false);
  const [selectedPostImageUrl, setSelectedPostImageUrl] = useState<string | null>(null);
  const cropperInstanceRef = useRef<Cropper | null>(null);
  const imageCropperRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mostrarAlerta } = useAlerta();
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!showCropperModal || !imageCropperRef.current) return;

    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.destroy();
    }

    cropperInstanceRef.current = new Cropper(imageCropperRef.current, {
      aspectRatio: 16 / 9,
      viewMode: 1,
      minCanvasWidth: 0,
      minCanvasHeight: 0,
      minCropBoxWidth: 100,
      dragMode: 'move', 
      guides: true,
      background: false,
      responsive: true,
      autoCropArea: 1, 
    });

    return () => {
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
        cropperInstanceRef.current = null;
      }
    };
  }, [showCropperModal, selectedPostImageUrl]);
  const handleSelectTag = (event: ChangeEvent<HTMLSelectElement>) => {
    const tag = event.target.value as TagType;
    if (tag) {
      setTagSelecionada(tag);
    }
  };


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedPostImageUrl(previewUrl);
    setShowCropperModal(true);
  };

  const closeCropperModal = () => {
    cropperInstanceRef.current?.destroy();
    cropperInstanceRef.current = null;
    if (selectedPostImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedPostImageUrl);
    }
    setSelectedPostImageUrl(null);
    setShowCropperModal(false);
  };

  const handleConfirmarCortePost = async () => {
    if (!cropperInstanceRef.current) return;

    try {
      const arquivoCortado = await processarCanvasPostParaWebp(
        cropperInstanceRef.current, 
        "temp_post.webp"
      );

      if (!arquivoCortado) {
        mostrarAlerta("alert", "Aguarde a imagem carregar completamente antes de cortar.");
        return;
      }

      setArquivoImagem(arquivoCortado);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const urlRascunho = URL.createObjectURL(arquivoCortado);
      setPreviewUrl(urlRascunho);

      setShowCropperModal(false);

    } catch (err: any) {
      console.error("Erro detalhado no redimensionamento:", err);
      mostrarAlerta("error", err?.message || "Erro ao processar o redimensionamento.");
    }
  };

  const handleResetForm = () => {
    setConteudo('');
    setTagSelecionada(null);
    setArquivoImagem(null);
    setPreviewUrl(null);
    setIsOpen(false);
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (isSubmitting) return; 
    setIsSubmitting(true);

    let postIdCriado: string | null = null;

    try {
      const temImagem = arquivoImagem !== null;
      const resultadoPost = await criarPost(userId, conteudo, tagSelecionada, temImagem);

      if (!resultadoPost.success || !resultadoPost.postId) {
        throw new Error(resultadoPost.error || "Não foi possível registrar o texto do post.");
      }

      postIdCriado = resultadoPost.postId;

      if (temImagem && arquivoImagem) {
        const arquivoDefinitivo = new File([arquivoImagem], `${postIdCriado}.webp`, { type: "image/webp" });

        const resultadoUpload = await fazerUploadImagemPost(arquivoDefinitivo, userId, postIdCriado);

        if (!resultadoUpload.success) {
          await deletarPostPorErroDeUpload(postIdCriado);
          throw new Error("O texto do post foi salvo, mas ocorreu uma falha ao enviar a imagem anexa. Apagando post para não gerar incongruências");

        }
      }

      mostrarAlerta("ok", "Post publicado com sucesso no mural!");
      handleResetForm();

    } catch (error: any) {
      console.error("Erro no fluxo de publicação do post:", error);
      mostrarAlerta("error", error?.message || "Ocorreu um erro inesperado ao publicar o post.");

      if (postIdCriado) {
        try {
          await deletarPostPorErroDeUpload(postIdCriado);
          console.log(`Rollback executado: Linha órfã do post ${postIdCriado} removida por falha de mídia.`);
        } catch (rollbackError) {
          console.error("Falha crítica ao executar o rollback do post:", rollbackError);
        }
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };

 return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#0b8aa0] text-white rounded-full hover:bg-[#087487] transition duration-300 active:scale-95 fixed bottom-5 right-5 z-40 shadow-xl"
        >
          <span className="material-symbols-outlined text-xl">post_add</span>
          <span className="font-bold">Criar Post</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative p-8 text-zinc-900">
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-[#0b8aa0]">
                <span className="material-symbols-outlined !text-2xl">edit_square</span>
                <h3 className="text-xl font-bold">Criar Novo Post</h3>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="material-symbols-outlined text-gray-400 cursor-pointer !text-2xl hover:text-gray-600 transition-colors"
              >
                close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2 pl-2 scrollbar-thin">
              
              <div>
                <label className="block text-sm font-bold mb-1.5 text-zinc-700" htmlFor="select-tags">
                  Tag do Post *
                </label>
                <div className="relative">
                  <select
                    id="select-tags"
                    required
                    value={tagSelecionada || ""}
                    onChange={handleSelectTag}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Selecione uma tag para o post</option>
                    {OPCOES_TAGS.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 bottom-1/2 translate-y-1/2 pointer-events-none text-gray-500 !text-xl">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-zinc-700" htmlFor="conteudo-post">
                  Conteúdo do Post *
                </label>
                <div className="relative">
                  <textarea
                    id="conteudo-post"
                    required
                    value={conteudo}
                    onChange={(event) => setConteudo(event.target.value)}
                    maxLength={500}
                    placeholder="Digite o conteúdo do seu post..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl h-30 resize-none text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 pb-8"
                  />
                  <span className="absolute right-4 bottom-3 text-xs font-medium text-gray-400">
                    {conteudo.length}/500
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5 text-zinc-700">
                  Imagem (opcional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-gray-50 hover:border-[#0b8aa0]/50 transition duration-300 text-center"
                >
                  
                  {arquivoImagem && previewUrl ? (
                    <div className="relative w-full max-w-md mx-auto aspect-[16/9] overflow-hidden rounded-xl border border-gray-200 bg-slate-50 flex items-center justify-center group/preview">
                      <img
                        src={previewUrl}
                        alt="Prévia do corte do post"
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setArquivoImagem(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-600 transition duration-200 flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover/preview:opacity-100"
                      >
                        <span className="material-symbols-outlined !text-sm">delete</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined !text-4xl text-gray-400 mb-2">image</span>
                      <p className="text-sm text-gray-500 mb-3">Clique aqui para selecionar uma imagem</p>
                      <button
                        type="button"
                        className="px-4 py-1.5 bg-[#0b8aa0] hover:bg-[#087487] text-white text-xs font-bold rounded-lg transition"
                      >
                        Selecionar Imagem
                      </button>
                    </>
                  )}
                  <p className="text-[11px] text-gray-400 mt-3">Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || conteudo.trim().length === 0 || !tagSelecionada}
                  className="px-6 py-2 bg-[#0b8aa0] hover:bg-[#087487] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined !text-lg">send</span>
                      <span>Publicar Post</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {showCropperModal && selectedPostImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Ajustar Imagem do Post</h3>
              <button type="button" onClick={closeCropperModal} className="text-sm font-semibold text-slate-400 hover:text-white">
                Fechar
              </button>
            </div>
            <div className="mb-4 flex max-h-[60vh] items-center justify-center overflow-hidden rounded-xl bg-black w-full [&_.cropper-view-box]:rounded-none [&_.cropper-face]:rounded-none [&_.cropper-view-box]:outline-2 [&_.cropper-view-box]:outline-[#0b8aa0]">
              <img 
                ref={imageCropperRef} 
                src={selectedPostImageUrl} 
                alt="Imagem para recorte" 
                className="block max-h-[60vh] w-full object-contain" 
              />
            </div>

            <div className="mb-4 flex justify-center gap-3 text-white">
              <button type="button" onClick={() => cropperInstanceRef.current?.zoom(0.1)} className="rounded-lg bg-slate-800 px-3 py-1 text-lg font-bold hover:bg-slate-700">
                +
              </button>
              <button type="button" onClick={() => cropperInstanceRef.current?.zoom(-0.1)} className="rounded-lg bg-slate-800 px-3 py-1 text-lg font-bold hover:bg-slate-700">
                -
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeCropperModal} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCortePost}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0b8aa0] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#087487]"
              >
                Confirmar Corte
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}