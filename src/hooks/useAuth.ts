"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { obterUsuarioAtual } from "@/services/auth";

export function useAuth() {
  const [usuario, setUsuario] = useState<any | null>(null);
  const [carregando, setCarregando] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function verificarAutenticacao() {
      try {
        const { user } = await obterUsuarioAtual();

        if (!user) {
          if (pathname !== '/login' && pathname !== '/cadastro') {
            router.push('/login');
          }
          setUsuario(null);
        } else {
          setUsuario(user);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (pathname !== '/login' && pathname !== '/cadastro') {
          router.push('/login');
        }
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    }

    verificarAutenticacao();
  }, [pathname, router]);

  return { usuario, carregando };
}
