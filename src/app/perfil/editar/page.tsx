"use client";
import { verificarUsernameDisponivel, obterUsuarioAtual } from '@/services/auth';
import { supabase } from "@/services/supabase"
import { useAlerta } from '@/context/AlertContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";

export default function Editar() {
    const router = useRouter();
    const { mostrarAlerta } = useAlerta();

    const [nome, setNome] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [matricula, setMatricula] = useState("");
    const [formacao, setFormacao] = useState("");
    const [curso, setCurso] = useState("");
    const [telefone, setTelefone] = useState("")
    const [perfil, setPerfil] = useState<PerfilData | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const cpfInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    const usernameInputRef = useRef(true);

    useEffect(() => {
        if (usernameInputRef.current) {
            usernameInputRef.current = false;
            return;
        } if (!username) {
            setUsernameStatus("idle");
            return;
        } if (username.length < 4) {
            setUsernameStatus("error");
            mostrarAlerta("error", "Por favor, escolha um username válido antes de prosseguir.")
            return;
        } setUsernameStatus("loading");
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
    const handleEditSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await obterUsuarioAtual();
            if (!user) throw new Error("Usuário não logado");
            const { data, error: erroBusca } = await supabase
                .rpc('buscar_perfil_usuario', { usuario_id: user.id })
                .single();

            if (erroBusca) {
                console.error('Erro ao buscar dados:', erroBusca);
                throw erroBusca;
            }
            if (email !== data) {
                const { error: authError } = await supabase.auth.updateUser({
                    email: email,
                });
                if (authError) {
                    console.error('Erro ao atualizar email:', authError);
                    throw new Error(`Não foi possível atualizar o email: ${authError.message}`);
                }
                mostrarAlerta('ok', 'Te enviamos um email confirmando a mudança de endereço de email!');
            }

            // 5. Atualiza os dados cadastrais via RPC (Troquei 'opcoes' por 'curso')
            const { data: dadosAtualizados, error: erroAtualizacao } = await supabase.rpc('edicao_perfil_usuario', {
                p_user_id: user.id,
                p_username: username,
                p_nome: nome,
                p_cpf: cpf,
                p_telefone: telefone,
                p_matricula_institucional: matricula,
                p_curso: curso, // Usando a variável de estado 'curso' vinculada ao seu select
                p_termino: formacao,
            });
            if (erroAtualizacao) throw erroAtualizacao;
            if (dadosAtualizados) {
                const perfilFormatado = dadosAtualizados;
                setPerfil(perfilFormatado);
            }
            mostrarAlerta('ok', "Dados atualizados com sucesso!");
            router.push("/perfil");
            setIsLoading(false);

        } catch (erro: any) {
            console.error("Erro ao atualizar:", erro);
            mostrarAlerta('error', erro.message || "Falha ao salvar dados.");
        }
    }
    return (
        <>
        <Navbar />
        <div className="sm:mx-12">
            <nav className="m-6 inline-flex text-sm font-medium sm:text-base sm:ml-0">
                <Link href="/pages/perfil/" className="text-gray-500 hover:text-[#008b8b] transition-colors">Seu Perfil</Link>
                <p className="text-gray-500 cursor-default">{" "}&gt;{" "}</p>
                <Link href="/pages/perfil/editar/" className="font-semibold text-[#008b8b] hover:text-gray-500">Editar Perfil</Link>
            </nav>
            <div id="edit-profile" className="w-full flex flex-col md:flex-row gap-6">
                { isLoading ? (
                <aside className="w-full md:w-1/3 bg-slate-50 rounded-xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center animate-pulse">
                    <div className="relative mb-6 mt-4">
                        <div className="w-48 h-48 rounded-full bg-slate-200 mb-8 border-4 border-white shadow-lg"></div>
                    </div>
                    <h2 className="h-8 w-3/4 bg-slate-200 rounded-lg text-[26px] font-bold"></h2>
                    <span className="h-4 w-2/3 bg-slate-200 rounded-md text-[16px] px-2 mt-4 mb-8"></span>
                    <div className="w-full space-y-8 text-left border-t mt-4 border-slate-200 pt-6">
                        <div>
                            <span className="flex flex-col gap-2 mt-2 leading-none">
                                <div className="h-6 w-1/3 bg-slate-200 rounded-md"></div>
                                <div className="h-6 w-2/3 bg-slate-200 rounded-md"></div>
                            </span>
                        </div>
                    </div>
                    <div className="w-full mt-6 text-left">
                        <div>
                            <span className="flex flex-col gap-2 mt-2 leading-none">
                                <div className="h-6 w-1/3 bg-slate-200 rounded-md"></div>
                                <div className="h-6 w-2/3 bg-slate-200 rounded-md"></div>
                            </span>
                        </div>
                    </div>
                    <div className="mt-12 p-4 bg-blue-50/50 border-2 border-[#008b8b]/20 rounded-lg flex gap-3 text-left w-full">
                        <div className="w-6 h-6 bg-[#008b8b]/20 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-[#008b8b]/20 rounded w-6/8"></div>
                            <div className="h-3 bg-[#008b8b]/20 rounded w-6/7"></div>
                            <div className="h-3 bg-[#008b8b]/20 rounded w-4/6"></div>
                            <div className="h-3 bg-[#008b8b]/20 rounded w-full"></div>
                        </div>
                    </div>
                </aside>
                ) : (
                    <aside className="w-full md:w-1/3 bg-slate-50 rounded-xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6 mt-4">
                        <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg rounded-full bg-slate-200 shadow-lg">
                            {perfil.avatar_public_url ? (
                                <Image 
                                    src={perfil.avatar_public_url} 
                                    alt={`Foto de ${perfil.nome}`} 
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover rounded-full" 
                                />
                            ) : (
                                <svg className="w-48 h-48">
                                <use href="/icons.svg#profile"></use>
                                </svg>
                            )}
                        </div>
                    </div>
                    <h2 className="text-[26px] font-bold text-gray-900">{perfil.nome || 'Nome não informado'}</h2>
                    <span className="text-[16px] text-[#087487] px-2 mt-2 mb-8">{perfil.email || 'Email não informado'}</span>
                    <div className="w-full space-y-8 text-left border-t mt-4 border-slate-200 pt-6">
                        <div className="mt-8">
                            <span className="block text-[14px] uppercase tracking-[0.2em] text-slate-400 font-bold">Curso</span>
                            <span className="flex items-center gap-2 text-xl font-semibold text-slate-800 mt-1 leading-none">
                                <span className="material-symbols-outlined !text-2xl text-[#008b8b]">school</span>
                                {perfil.formacao?.curso || 'Curso não informado'}
                            </span>
                        </div>
                    </div>
                    <div className="w-full mt-6 text-left">
                        <div>
                            <span className="block text-[14px] uppercase tracking-[0.2em] text-slate-400 font-bold">Formado em</span>
                            <span className="flex items-center gap-2 text-xl font-semibold text-slate-800 mt-1 leading-none">
                                <span className="material-symbols-outlined !text-2xl text-[#008b8b]">calendar_month</span>
                                {perfil.formacao?.termino || 'Data não informada'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-12 p-4 bg-blue-50 border-2 border-[#008b8b] rounded-lg flex gap-3 text-left">
                        <span className="material-symbols-outlined !text-2xl text-[#008b8b]">verified_user</span>
                        <p className="text-sm text-[#008b8b] leading-tight">Mantenha seus dados sempre atualizados para aproveitar todas as funcionalidades do sistema.</p>
                    </div>
            </aside>
                )}
                <main className="w-full md:w-2/3 bg-white rounded-xl shadow-md border border-gray-100 p-10">
                    <div className="mb-6 ml-4">
                        <div className="inline-flex">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Editar Perfil</h1>
                        <button><span className="material-symbols-outlined !text-2xl pl-4 pt-1 text-slate-800 hover:text-[#087487] transition-colors">delete</span></button></div>
                        <div className="h-1.5 w-20 bg-[#0b8aa0] mt-4 rounded-full"></div>
                        <p className="text-sm text-gray-500 my-6">Atualize suas informações pessoais e acadêmicas.</p>
                    </div>
                    <form onSubmit={handleEditSubmit} id="form-edit" className="w-full max-w-4xl p-4 lg:grid lg:grid-cols-2 lg:gap-10">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="nome-completo">Nome Completo *</label>
                                <input 
                                id="nome-completo" 
                                type="text"
                                placeholder="Digite seu nome completo" 
                                pattern="[A-Za-zÀ-ÖØ-öø-ÿ\s]+ [A-Za-zÀ-ÖØ-öø-ÿ\s]+$"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" 
                                required
                            />
                            </div>
                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="email">Email *</label>
                                <input
                                ref={emailInputRef}
                                id="email" 
                                type="email"
                                title="Por favor, insira o seu email pessoal"
                                placeholder="Ex.: nome@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" 
                                required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="cpf">CPF *</label>
                                <input id="cpf" 
                                ref={cpfInputRef}
                                type="text" 
                                placeholder="Ex.: 123.456.789-00"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                pattern="[0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}" 
                                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" 
                                required
                                />
                            </div>
                            <div>
                            <label className="block text-sm font-bold m-2" htmlFor="input-senha">Senha</label>
                            <div className="relative">
                                <input 
                                id="input-senha" 
                                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition"
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

                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="telefone">Telefone (opcional)</label>
                                <input id="telefone" 
                                type="tel" 
                                placeholder="Ex.: 83987654321" 
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                pattern="[0-9]{2}9[0-9]{8}" 
                                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="matricula-institucional">Matrícula Institucional *</label>
                                <input id="matricula-institucional" 
                                type="text" 
                                placeholder="Ex.: 20261230012" 
                                pattern="[0-9]{9}[0-9]*|[0-9]{7}"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" 
                                required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="opcoes">Egressos/Docentes *</label>
                                <div className="relative">
                                    <select id="opcoes" 
                                    value={curso}
                                    onChange={(e) => setCurso(e.target.value)}
                                    required 
                                    className="px-4 py-2.5 w-full cursor-pointer border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition appearance-none bg-white">
                                        <option value="" disabled selected>Selecione uma opção</option>
                                        <optgroup label="Cursos Superiores">
                                            <option value="Engenharia Elétrica">Engenharia Elétrica</option>
                                            <option value="Engenharia de Software">Engenharia de Software</option>
                                            <option value="Redes de Computadores">Redes de Computadores</option>
                                            <option value="Sistemas para Internet">Sistemas para Internet</option>
                                        </optgroup>
                                        <optgroup label="Mestrado">
                                            <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                                        </optgroup>
                                        <optgroup label="Corpo Docente">
                                            <option value="Coordenador">Coordenador</option>
                                            <option value="Professor">Professor</option>
                                        </optgroup>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://w3.org" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="data-formacao">Data de Formação *</label>
                                <input id="data-formacao" 
                                type="text" 
                                pattern="[0-9]{4}\.[0-9]{1}" 
                                placeholder="Ex.: 2026.1" 
                                value={formacao}
                                onChange={(e) => setFormacao(e.target.value)}
                                className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" 
                                required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold m-2" htmlFor="input-username">Username *</label>
                                <div className="relative">
                                    <input type="text" 
                                    id="input-username"
                                    className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" 
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
                        </div>
                        <div className="bg-slate-100 max-w-150 border mx-auto mt-10 lg:mt-4 border-gray-300 rounded-2xl flex justify-center items-center gap-4 p-4 shadow col-span-2">
                        <div className="w-16 h-16 bg-[#0b8aa0] rounded-full flex items-center justify-center text-white shrink-0">
                            <svg className="w-8 mr-0.6 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                        </div>
                            <div>
                                <p className="text-md font-bold">Foto de Perfil</p>
                                <p className="text-xs text-gray-400 mb-2">Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.</p>
                                
                                <label htmlFor="avatar-input" className="text-white ml-auto cursor-pointer bg-[#0b8aa0] rounded-3xl px-4 py-1 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#087487] transition duration-300 w-fit">
                                    <span className="material-symbols-outlined !text-lg text-white">upload</span>
                                    Alterar foto
                                </label>

                                <input id="avatar-input" type="file" accept="image/png, image/jpeg, image/jpg" className="hidden"/>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-4 mt-12 lg:mt-8">
                            <button id="btn-cancel" type="button" className="px-8 py-2 border border-gray-300 rounded-3xl text-sm font-bold text-[#0b8aa0] hover:bg-gray-100 cursor-pointer shadow-lg transition duration-300 active:scale-95 active:shadow-2xl">
                            <span id="cancel-text">Cancelar</span>
                                <svg id="cancel-spinner" className="hidden animate-spin h-6 w-6 text-[#e0e0e0]" fill="none">
                                    <use href="/icons.svg#carregando"></use>
                                </svg>
                            </button>
                            <button 
                                disabled={isLoading}
                                className={`className="px-6 py-2 bg-[#0b8aa0] text-white rounded-3xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition
                                ${isLoading ? "opacity-80 cursor-not-allowed" : "hover:bg-[#087487] active:scale-95 active:shadow-2xl"}`}
                                type="submit"
                            >
                                {!isLoading ? (
                                <span>Salvar Alterações</span>
                                ) : (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                    <span>Carregando...</span>
                                </>
                                )}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    </>
    );
}