"use client";
import { cadastrarUsuario, verificarCPF, verificarUsernameDisponivel } from '@/services/auth';
import { useAlerta } from '@/context/AlertContext';
import { useRouter } from 'next/navigation';
import { formatarCPF } from '@/utils/formatters';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastroSchema } from '@/schemas/CadastroSchema';
import type { z } from 'zod';

type CadastroFormValues = z.infer<typeof cadastroSchema>;

export default function Cadastro() {
  const router = useRouter();
  const { mostrarAlerta } = useAlerta();

  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const cpfInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    mode: 'onTouched',
    defaultValues: {
      nome: '',
      username: '',
      email: '',
      cpf: '',
      senha: '',
    },
  });

  const watchedUsername = watch('username');
  const watchedCpf = watch('cpf');

  useEffect(() => {
    if (!watchedUsername) {
      setUsernameStatus('idle');
      return;
    }

    if (watchedUsername.length < 4) {
      setUsernameStatus('error');
      return;
    }

    setUsernameStatus('loading');

    const timer = setTimeout(async () => {
      try {
        const disponivel = await verificarUsernameDisponivel(watchedUsername);
        setUsernameStatus(disponivel ? 'success' : 'error');
      } catch (error) {
        setUsernameStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedUsername]);

  useEffect(() => {
    if (!watchedCpf) return;

    const formatted = formatarCPF(watchedCpf);
    if (formatted !== watchedCpf) {
      setValue('cpf', formatted, { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedCpf, setValue]);

  const handleCadastroSubmit = async (data: CadastroFormValues) => {
    setIsLoading(true);

    try {
      if (usernameStatus !== 'success') {
        mostrarAlerta('error', 'Por favor, escolha um nome de usuário válido e disponível.');
        setIsLoading(false);
        return;
      }

      const existe = await verificarCPF(data.cpf);
      if (existe) {
        mostrarAlerta('error', 'Erro: Este CPF já está cadastrado em nosso sistema.');
        cpfInputRef.current?.focus();
        setIsLoading(false);
        return;
      }

      const dados = await cadastrarUsuario(data.nome, data.username, data.email, data.cpf, data.senha);
      if (dados.session) {
        router.push('/mural');
      } else {
        mostrarAlerta('ok', 'Cadastro realizado! Confira seu email para ativar sua conta.');
      }
    } catch (error: any) {
      if (error.message?.includes('Already registered')) {
        mostrarAlerta('error', 'Esse email já está registrado no sistema!');
        emailInputRef.current?.focus();
      } else {
        mostrarAlerta('error', error.message ?? 'Erro ao cadastrar.');
      }
      setIsLoading(false);
    }
  };
    return (
      <main className="bg-slate-50 p-8 shadow-2xl w-full max-w-2xl sm:rounded-2xl sm:mt-15 sm:px-18 lg:mx-auto">
        <div>
          <div className="flex justify-center pb-8">
            <Image src="/logo.png" alt="Logo SCE" width={160} height={160} className='shadow-xl rounded-full h-20 w-20 sm:h-40 sm:w-40' />
          </div>
          <h1 className="text-2xl font-bold text-[#0b8aa0] m-2 pb-4">Criar Perfil</h1>
          
          <form onSubmit={handleSubmit(handleCadastroSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-nome">
                Nome Completo
              </label>
              <input
                id="input-nome"
                className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                type="text"
                placeholder="Digite seu nome completo"
                aria-invalid={!!errors.nome}
                {...register('nome')}
                required
              />
              {errors.nome && <p className="text-sm text-red-500 mt-1 ml-2">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-username">
                Nome de Usuário
              </label>
              <div className="relative w-full">
                <input
                  id="input-username"
                  className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  aria-invalid={!!errors.username}
                  {...register('username', {
                    onChange: (e) => {
                      setValue('username', e.target.value.trim(), { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                  required
                />
                <span className="absolute right-4 bottom-1/2 translate-y-1/2 flex items-center justify-center">
                  {usernameStatus === 'loading' && <div className="w-[18px] h-[18px] border-2 border-zinc-300 border-t-[#0b8aa0] rounded-full animate-spin" />}
                  {usernameStatus === 'success' && <span className="material-symbols-outlined text-green-500 !text-lg">check_circle</span>}
                  {usernameStatus === 'error' && <span className="material-symbols-outlined text-red-500 !text-lg">cancel</span>}
                </span>
              </div>
              {errors.username ? (
                <p className="text-sm text-red-500 mt-1 ml-2">{errors.username.message}</p>
              ) : usernameStatus === 'error' && watchedUsername.length >= 4 ? (
                <p className="text-sm text-red-500 mt-1 ml-2">Nome de usuário não disponível.</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-email">
                Email
              </label>
              <input
                ref={emailInputRef}
                id="input-email"
                className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                type="email"
                placeholder="Ex.: nome@exemplo.com"
                aria-invalid={!!errors.email}
                {...register('email')}
                required
              />
              {errors.email && <p className="text-sm text-red-500 mt-1 ml-2">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-cpf">
                CPF
              </label>
              <input
                ref={cpfInputRef}
                id="input-cpf"
                className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`}
                type="text"
                placeholder="Ex.: 123.456.789-00"
                aria-invalid={!!errors.cpf}
                {...register('cpf', {
                  onChange: (e) => {
                    setValue('cpf', formatarCPF(e.target.value), { shouldValidate: true, shouldDirty: true });
                  },
                })}
                required
              />
              {errors.cpf && <p className="text-sm text-red-500 mt-1 ml-2">{errors.cpf.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold m-2" htmlFor="input-senha">
                Senha
              </label>
              <div className="relative w-full">
                <input
                  id="input-senha"
                  className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 ${errors.senha ? 'border-red-500' : 'border-gray-300'}`}
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="No mínimo 8 dígitos"
                  aria-invalid={!!errors.senha}
                  {...register('senha')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 bottom-1/2 translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none flex items-center justify-center"
                >
                  <span className="material-symbols-outlined !text-lg">
                    {mostrarSenha ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.senha && <p className="text-sm text-red-500 mt-1 ml-2">{errors.senha.message}</p>}
            </div>

            <div className="my-8.5 text-center text-gray-600">
              <button
                disabled={isLoading}
                className={`w-full font-bold bg-[#0b8aa0] text-white cursor-pointer py-2.5 rounded-3xl shadow-lg transition duration-300 flex items-center justify-center gap-2 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#087487] active:scale-95 active:shadow-2xl'}`}
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
              <Link href="/login" className="text-[#087487] hover:underline">
                Entrar
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
