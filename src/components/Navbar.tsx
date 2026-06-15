"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fazerLogout } from "@/services/auth";
import { useAlerta } from "@/context/AlertContext";
import Image from "next/image";

export function Navbar() {
    const router = useRouter();
    const { mostrarAlerta } = useAlerta();
    const handleLogoutClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        const resultado = await fazerLogout();

        if (resultado.success) {
            router.push("/login");
        } else {
            mostrarAlerta("error", "Erro ao encerrar a sessão. Tente novamente.");
        }
    };
    return (
        <header>
            <div className="logo">
                <Image src="/logo.png" alt="Logo SCE" width={24} height={24} />
                </div>
                
            <div className="sce-title" id="sce-title-mobile">SCE</div>
            <div className="sce-title" id="sce-title-pc">Sistema de Controle de Egressos</div>

            <button className="menu-hamburger" id="btn-hamburguer">
                <span className="linha"></span>
                <span className="linha"></span>
                <span className="linha"></span>
            </button>

            <ul className="nav-menu" id="nav-menu">
                <li>
                    <div>
                        <Link href="/">
                        <span className="material-symbols-outlined">home</span>
                        <p>Home</p>
                        </Link>
                    </div>
                </li>
                <li>
                    <div>
                        <Link href="/perfil">
                            <span className="material-symbols-outlined">account_circle</span> 
                            <p>Seu Perfil</p>
                        </Link>
                    </div>
                </li>
                <li>
                    <div>
                        <Link href="#" onClick={handleLogoutClick}>
                            <span className="material-symbols-outlined">logout</span>
                            <p>Logout</p>
                        </Link>
                    </div>
                </li>
            </ul>
        </header>
    );
}