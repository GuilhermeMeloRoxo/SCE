'use client';
import { useAlerta } from '@/context/AlertContext';
import { atualizarPost } from '@/services/mural'; 
import { useState, useEffect, SubmitEvent, Dispatch, SetStateAction } from 'react';

type TagType = 'Evento' | 'Aviso' | 'Pesquisa' | 'Conquista' | 'Palestra' | 'Material' | 'Oportunidade' | 'Projeto';

const OPCOES_TAGS: TagType[] = ['Evento', 'Aviso', 'Oportunidade', 'Conquista', 'Pesquisa', 'Material', 'Projeto', 'Palestra'];

interface PostDados {
  post_id: string;
  post_conteudo: string;
  tag_nome: TagType;
}

interface EditPostModalProps {
  post: PostDados | null; 
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onPostAtualizado?: () => void; 
}

export default function EditPostModal({ post, isOpen, setIsOpen, onPostAtualizado }: EditPostModalProps) {
  const [conteudo, setConteudo] = useState<string>('');
  const [tagSelecionada, setTagSelecionada] = useState<TagType>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { mostrarAlerta } = useAlerta();

  
  useEffect(() => {
    if (post && isOpen) {
      setConteudo(post.post_conteudo);
      setTagSelecionada(post.tag_nome);
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  async function handleSalvarEdicao(e: SubmitEvent) {
    e.preventDefault();

    if (!conteudo.trim()) {
      mostrarAlerta('error', 'O conteúdo do post não pode ficar vazio.');
      return;
    }

    if (!tagSelecionada) {
      mostrarAlerta('error', 'Por favor, selecione uma tag.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await atualizarPost(post.post_id, {
        conteudo: conteudo.trim(),
        tag: tagSelecionada
      });

      mostrarAlerta('ok', 'Post atualizado com sucesso!');
      if (onPostAtualizado) onPostAtualizado();
      setIsOpen(false);
      location.reload();
    } catch (error) {
      console.error(error);
      mostrarAlerta('error', 'Erro ao atualizar o post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3 text-[#0b8aa0]">
                <span className="material-symbols-outlined !text-2xl">edit_note</span>
                <h3 className="text-xl font-bold text-gray-900">Editar Publicação</h3>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="material-symbols-outlined text-gray-400 cursor-pointer !text-2xl hover:text-gray-600 transition-colors">
                close
            </button>
        </div>

        <form onSubmit={handleSalvarEdicao} className="space-y-4">

          <div>
            <label className="block text-sm font-semibold pl-1 text-zinc-700 mb-2">Tag do Post *</label>
            <div className="flex flex-wrap gap-2">
              {OPCOES_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagSelecionada(tag)}
                  className={`px-4 py-2.5 rounded-full border-gray-300 cursor-pointer text-xs font-bold uppercase transition tracking-wider border
                    ${tagSelecionada === tag 
                      ? 'bg-[#0b8aa0] hover:bg-[#087487] text-white border-cyan-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm pl-1 font-semibold text-zinc-700 mb-1">Conteúdo do Post *</label>
            <div className="relative">
            <textarea
            id="conteudo-post"
            required
            value={conteudo}
            onChange={(event) => setConteudo(event.target.value)}
            maxLength={500}
            placeholder="Digite o conteúdo do seu post..."
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-2xl h-30 resize-none text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 pb-8"
            />
            <span className="absolute right-4 bottom-3 text-xs font-medium text-gray-400">
            {conteudo.length}/500
            </span>
            </div>
        </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-8 py-2 border border-gray-300 rounded-3xl text-sm font-bold text-[#0b8aa0] hover:bg-gray-100 cursor-pointer shadow-lg transition duration-300 active:scale-95 active:shadow-2xl"
            >
              Cancelar
            </button>
           <button
            type="submit"
            disabled={isSubmitting || conteudo.trim().length === 0 || !tagSelecionada}
            className="px-6 py-2 bg-[#0b8aa0] border-gray-300 text-white rounded-3xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition duration-200 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? (
                <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Carregando...</span>
                </>
            ) : (
                <>
                <span className="material-symbols-outlined !text-lg">edit</span>
                <span>Salvar Alterações</span>
                </>
            )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
