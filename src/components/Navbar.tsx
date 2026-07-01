"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlerta } from "@/context/AlertContext";
import { fazerLogout, obterUsuarioAtual } from "@/services/auth";
import { buscarPerfilPublico } from "@/services/profile";

interface NavbarProps {
  username?: string;
}
export function Navbar({ username }: NavbarProps) {
  const router = useRouter();
  const { mostrarAlerta } = useAlerta();
  const [caminho, setCaminho] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      setCaminho('/perfil/' + username);
      return;
    }
    if (caminho) return;

    async function carregarDadosUsuario() {
      try {
        const { user } = await obterUsuarioAtual();
        const { data } = await buscarPerfilPublico(user.id);
        if (data?.username) {
          setCaminho('/perfil/' + data.username);
        }
      } catch (e: any) {
        if (e.message?.includes('NOT AUTHENTICATED')) {
          mostrarAlerta('error', 'Você precisa estar autenticado para acessar essa página');
          router.push('/login');
        } else {
          mostrarAlerta('error', 'Ocorreu um erro inesperado');
          router.push('/login');
        }
      }
    } carregarDadosUsuario();
    }, [username, router, mostrarAlerta]);

    const [menuAtivo, setMenuAtivo] = useState(false);
    
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);

    const handleLogoutClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        const resultado = await fazerLogout();

        if (resultado.success) {
            mostrarAlerta('ok', 'Sua sessão foi encerrada com sucesso!');
            router.push('/login');
            return;
        } else {
            mostrarAlerta("error", "Erro ao encerrar a sessão. Tente novamente.");
        }
    };

    useEffect(() => {
        function fecharMenuNoCliqueFora(e: MouseEvent) {
            if (
                menuAtivo &&
                menuRef.current && 
                btnRef.current && 
                !menuRef.current.contains(e.target as Node) && 
                !btnRef.current.contains(e.target as Node)
            ) {
                setMenuAtivo(false);
            }
        }

        document.addEventListener("click", fecharMenuNoCliqueFora);
        return () => document.removeEventListener("click", fecharMenuNoCliqueFora);
    }, [menuAtivo]);

    return (
        <header>
            <div className="logo">
                <Image src="/logo.png" alt="Logo SCE" width={60} height={60} className="logo" />
            </div>
                
            <div className="sce-title" id="sce-title-mobile">SCE</div>
            <div className="sce-title" id="sce-title-pc">Sistema de Controle de Egressos</div>

            <button 
                id="btn-hamburguer"
                ref={btnRef}
                className={`menu-hamburger ${menuAtivo ? 'active' : ''}`} 
                onClick={() => setMenuAtivo(!menuAtivo)}
            >
                <span className="linha"></span>
                <span className="linha"></span>
                <span className="linha"></span>
            </button>


            <ul ref={menuRef} className={`nav-menu ${menuAtivo ? 'active' : ''}`} id="nav-menu">
                <li className="border-b border-gray-200 last:border-b-0">
                    <div>
                        <Link href="/" onClick={() => setMenuAtivo(false)}>
                            <span className="material-symbols-outlined">home</span>
                            <p>Home</p>
                        </Link>
                    </div>
                </li>
                <li className="border-b border-gray-200 last:border-b-0">
                    <div>
                        <Link href="/mural" onClick={() => setMenuAtivo(false)}>
                            <span className="material-symbols-outlined">view_timeline</span>
                            <p>Mural</p>
                        </Link>
                    </div>
                </li>
                <li className="border-b border-gray-200 last:border-b-0">
                    <div>
                        <Link href={caminho || "#"} onClick={() => setMenuAtivo(false)}>
                            <span className="material-symbols-outlined">account_circle</span> 
                            <p>Seu Perfil</p>
                        </Link>
                    </div>
                </li>
                <li className="border-b border-gray-200 last:border-b-0">
                    <div>
                        <Link href="#" onClick={handleLogoutClick} id="logout">
                            <span className="material-symbols-outlined">logout</span>
                            <p>Logout</p>
                        </Link>
                    </div>
                </li>
            </ul>
        </header>
    );
}
