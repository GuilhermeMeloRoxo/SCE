"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buscarPostsCurtidos, buscarPostsMural } from '@/services/mural';
import { obterUsuarioAtual } from '@/services/auth';

export type PostTipo = {
  post_id: string;
  autor_nome: string;
  autor_avatar?: string;
  post_data: string;
  tag_nome: 'Evento' | 'Aviso' | 'Pesquisa' | 'Conquista' | 'Palestra' | 'Material' | 'Oportunidade' | 'Projeto';
  tag_cor: string;
  post_conteudo: string;
  imagem_url?: string;
  quantidade_curtidas: number;
};

export function usePosts() {
  const queryClient = useQueryClient();

  const postsQuery = useQuery<PostTipo[], Error>({
    queryKey: ['posts'],
    queryFn: async () => {
      const posts = await buscarPostsMural();
      return posts as PostTipo[];
    },
    staleTime: 1000 * 60 * 2,
  });

  const postIds = postsQuery.data?.map((post) => post.post_id) ?? [];

  const curtidasQuery = useQuery<Set<string>, Error>({
    queryKey: ['postsCurtidos', postIds],
    queryFn: async () => {
      const { user } = await obterUsuarioAtual();
      if (!user || postIds.length === 0) return new Set<string>();
      return await buscarPostsCurtidos(user.id, postIds);
    },
    enabled: postIds.length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const refreshPosts = async () => {
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    await queryClient.invalidateQueries({ queryKey: ['postsCurtidos'] });
  };

  return {
    postsQuery,
    curtidasQuery,
    refreshPosts,
  };
}
