"use client";
import { cadastrarUsuario, verificarCPF, verificarUsernameDisponivel } from '@/services/auth'
import { useAlerta } from '@/context/AlertContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Cadastro() {

    const router = useRouter();
    const { mostrarAlerta } = useAlerta();

    const [nome, setNome] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const cpfInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!username) {
        setUsernameStatus("idle");
        return;
      }

      if (username.length < 4) {
        setUsernameStatus("error");
        return;
      }

      setUsernameStatus("loading");

      const timer = setTimeout(async () => {
        try {
          const disponivel = await verificarUsernameDisponivel(username);
          setUsernameStatus(disponivel ? "success" : "error");
        } catch (error) {
          setUsernameStatus("error");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }, [username]);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value.trim());
    };
    const handleCadastroSubmit = async (e: React.SubmitEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (usernameStatus !== "success") {
        mostrarAlerta("error", "Por favor, escolha um nome de usuário válido e disponível.");
        setIsLoading(false);
        return;
      }
        const existe = await verificarCPF(cpf);
        if (existe) {
          mostrarAlerta('error', "Erro: Este CPF já está cadastrado em nosso sistema.");
          cpfInputRef.current?.focus();
          setIsLoading(false);
          return;
        }

        const dados = await cadastrarUsuario(nome, username, email, cpf, senha);
        if (dados.session){
          router.push('/mural');
        } else {
          mostrarAlerta("ok", "Cadastro realizado! Confira seu email para ativar sua conta.")
        }

      } catch (error: any) {
        if (error.message.includes("already registered")) {
          mostrarAlerta("error", "Esse email já está registrado no sistema!")
          emailInputRef.current?.focus();
        } else {
          mostrarAlerta("error", error.message);
        }
        setIsLoading(false);
      }
    }
    return (
      <main className="bg-slate-50 p-8 shadow-2xl w-full max-w-2xl sm:rounded-2xl sm:mt-15 sm:px-18 lg:mx-auto">
        <div>
          <div className="flex justify-center pb-8">
            <Image src="/logo.png" alt="Logo SCE" width={24} height={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#0b8aa0] m-2 pb-4">Criar Perfil</h1>
          
          <form onSubmit={handleCadastroSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-nome">Nome Completo</label>
              <input 
                id="input-nome"
                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900"
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                pattern="[A-Za-zÀ-ÖØ-öø-ÿ\s]+ [A-Za-zÀ-ÖØ-öø-ÿ\s]+$"
                placeholder="Digite seu nome completo" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-username">Nome de Usuário</label>
              <div className="relative w-full">
                <input 
                  id="input-username" 
                  className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900"
                  type="text" 
                  value={username}
                  onChange={handleUsernameChange}
                  minLength={3} 
                  pattern="[A-Za-z0-9\-]+"
                  title="Permitido apenas letras, números e hífen." 
                  placeholder="Digite seu nome de usuário" 
                  required 
                />
                <span className="absolute right-4 bottom-1/2 translate-y-1/2 flex items-center justify-center">
                  {usernameStatus === "loading" && (
                    <div className="w-[18px] h-[18px] border-2 border-zinc-300 border-t-[#0b8aa0] rounded-full animate-spin" />
                  )}
                  {usernameStatus === "success" && (
                    <span className="material-symbols-outlined text-green-500 !text-lg">check_circle</span>
                  )}
                  {usernameStatus === "error" && (
                    <span className="material-symbols-outlined text-red-500 !text-lg">cancel</span>
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-email">Email</label>
              <input 
                ref={emailInputRef}
                id="input-email"
                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                title="Por favor, insira o seu email pessoal" 
                placeholder="Ex.: nome@exemplo.com" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-cpf">CPF</label>
              <input 
                ref={cpfInputRef}
                id="input-cpf"
                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900"
                type="text" 
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                pattern="[0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}"
                placeholder="Ex.: 123.456.789-00" 
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
                  <span>Cadastrar</span>
                ) : (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Carregando...</span>
                  </>
                )}
              </button>
              
              <div className="inline-flex mt-2">
                <p className="pr-1 text-gray-900">Já tem um perfil?</p>
                <Link href="/login" className="text-blue-900 hover:underline">
                  Entrar
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    );
  }
