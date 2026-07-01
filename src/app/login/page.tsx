"use client";
import { loginUsuario } from '@/services/auth';
import { useAlerta } from '@/context/AlertContext';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/LoginSchema';
import { useTogglePassword } from '@/hooks/useTogglePassword';
import type { z } from 'zod';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { mostrarAlerta } = useAlerta();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { mostrarSenha, toggleSenha } = useTogglePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      if (!formRef.current) {
        throw new Error('Referência do formulário não está pronta ou é inválida.');
      }

      const dados = await loginUsuario(data.email, data.senha);
      if (dados) {
        mostrarAlerta('ok', 'Bem-vindo(a)!');
        router.push('/mural');
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        mostrarAlerta('error', 'Credenciais inválidas');
      } else if (error.message.includes('Email not confirmed')) {
        mostrarAlerta('error', 'Confirme seu email antes de logar no site');
      } else {
        mostrarAlerta('error', error.message);
      }
      setIsLoading(false);
    }
  };

    return (
        <main className="bg-slate-50 p-8 shadow-2xl w-full max-w-2xl sm:rounded-2xl sm:mt-15 sm:px-18 lg:mx-auto">
        <div>
            <div className="text-right mt-2 mb-6">
              <Link className="text-sm font-bold text-[#0b8aa0] py-2 px-4 border-2 shadow-xl rounded-3xl hover:bg-[#0b8aa0] hover:text-white hover:border-[#0b8aa0]"
              href="/cadastro/">Criar Perfil
              </Link>
            </div>
            <div className="flex justify-center pb-8">
              <Image width={160} height={160} className="shadow-xl rounded-full h-20 w-20 sm:h-40 sm:w-40" src="/logo.png" alt="Logo SCE" />
            </div>
            <h1 className="text-2xl font-bold text-[#0b8aa0] m-2 pb-4">Acessar Perfil</h1>
            <form ref={formRef} onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-bold m-2" htmlFor="input-email">Email</label>
                <input
                  id="input-email"
                  className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  type="email"
                  placeholder="Digite seu email"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                  required
                />
                {errors.email && <p className="text-sm text-red-500 mt-1 ml-2">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold m-2" htmlFor="input-senha">Senha</label>
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
                    onClick={toggleSenha}
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
                  className={`w-full font-bold bg-[#0b8aa0] cursor-pointer text-white py-2.5 rounded-3xl shadow-lg transition duration-300 flex items-center justify-center gap-2 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#087487] active:scale-95 active:shadow-2xl'}`}
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