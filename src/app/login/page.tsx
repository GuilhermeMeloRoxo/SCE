"use client";
import { loginUsuario } from '@/services/auth';
import { useAlerta } from '@/context/AlertContext';
import { useRouter } from 'next/navigation';
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
    const router = useRouter();
    const { mostrarAlerta } = useAlerta();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const handleLoginSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!formRef.current) {
                throw new Error("Referência do formulário não está pronta ou é inválida.");
            }
            const formDados = new FormData(formRef.current);
            const email = formDados.get('email')?.toString() || '';
            const senha = formDados.get('senha')?.toString() || '';
            const dados = await loginUsuario(email, senha);
            if (dados) {
                mostrarAlerta('ok', 'Bem-vindo(a)!');
                router.push('/mural');
            }
        } catch (error: any) {
            if (error.message.includes("Invalid login credentials")) {
                mostrarAlerta('error', "Credenciais inválidas");
                emailInputRef.current?.focus();
            } else if (error.message.includes("Email not confirmed")){
                mostrarAlerta('error', "Confirme seu email antes de logar no site");
                emailInputRef.current?.focus();
            } else {
                mostrarAlerta('error', error.message);
                emailInputRef.current?.focus();
            }
        } setIsLoading(false);
    }

    return (
        <main className="bg-slate-50 p-8 shadow-2xl w-full max-w-2xl sm:rounded-2xl sm:mt-15 sm:px-18 lg:mx-auto">
        <div>
            <div className="text-right mt-2 mb-6"><Link className="text-sm font-bold text-[#0b8aa0] py-2 px-4 border-2 shadow-xl rounded-3xl hover:bg-[#0b8aa0] hover:text-white hover:border-[#0b8aa0]" href="/pages/cadastro/">Criar Perfil</Link></div>
            <div className="flex justify-center pb-8"><Image className="h-30 shadow-xl rounded-full sm:h-35" src="/logo.png" alt="Logo SCE" /></div>
            <h1 className="text-2xl font-bold text-[#0b8aa0] m-2 pb-4">Acessar Perfil</h1>
            <form ref={formRef} onSubmit={handleLoginSubmit} className="space-y-5" method="post">
                <div>
                    <label className="block text-sm font-bold m-2" htmlFor="input-email">Email</label>
                    <input 
                        ref={emailInputRef}
                        id="input-email"
                        className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        title="Por favor, insira seu email pessoal" 
                        placeholder="Digite seu email" 
                        required 
                    />
                </div>
                <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-senha">Senha</label>
              <div className="relative w-full">
                <input 
                  id="input-senha" 
                  className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  minLength={8}
                  title="Por favor, insira no mínimo 8 dígitos" 
                  placeholder="No mínimo 8 dígitos" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 bottom-1/2 translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none flex items-center justify-center"
                >
                  <span className="material-symbols-outlined !text-lg">
                    {mostrarSenha ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="my-8.5 text-center text-gray-600">
              <button 
                disabled={isLoading}
                className={`w-full font-bold bg-[#0b8aa0] text-white py-2.5 rounded-3xl shadow-lg transition duration-300 flex items-center justify-center gap-2
                  ${isLoading ? "opacity-80 cursor-not-allowed" : "hover:bg-[#087487] active:scale-95 active:shadow-2xl"}`}
                type="submit"
              >
                {!isLoading ? (
                  <span>Acessar</span>
                ) : (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Carregando...</span>
                  </>
                )}
              </button>
            </div>
            </form>
        </div>
    </main>
    );
}