import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 rounded-[40px] bg-white px-5 py-8 shadow-[0_45px_100px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-[#e6f7f9] px-6 py-3 text-m font-semibold text-[#0b8aa0] shadow-sm shadow-slate-200/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Image src="/logo.png" alt="SCE" width={50} height={50} className="object-contain rounded-full" />
              </div>
              Sistema de Controle de Egressos
            </div>
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Conectando histórias, <span className="text-[#0b8aa0]">construindo o futuro.</span>
              </h1>
              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                O Sistema de Controle de Egressos do IFPB JP tem como objetivo fortalecer os laços entre a instituição e seus ex-alunos.
                Aqui você pode manter seus dados atualizados, acompanhar notícias, oportunidades e contribuir para o crescimento da nossa comunidade.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-8 top-6 h-28 w-28 rounded-full bg-[#d8f2f6]/80 blur-3xl" />
            <div className="absolute -right-10 bottom-8 h-24 w-24 rounded-full bg-[#0b8aa0]/10 blur-3xl" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/login" className="group rounded-[30px] border border-[#d7eef3] bg-[#f4fbfc] px-6 py-7 shadow-sm transition hover:-translate-y-1 hover:border-[#0b8aa0] hover:bg-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[#0b8aa0] shadow-sm">
              <span className="material-symbols-outlined !text-2xl">login</span>
            </div>
            <div className="mt-5">
              <h2 className="text-xl font-semibold text-slate-900">Fazer autenticação</h2>
              <p className="mt-2 text-sm text-slate-500">Acesse sua conta e aproveite todos os recursos.</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0b8aa0]">
              Ir para login <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </Link>

          <Link href="/cadastro" className="group rounded-[30px] border border-[#d7eef3] bg-[#f4fbfc] px-6 py-7 shadow-sm transition hover:-translate-y-1 hover:border-[#0b8aa0] hover:bg-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[#0b8aa0] shadow-sm">
              <span className="material-symbols-outlined !text-2xl">person_add</span>
            </div>
            <div className="mt-5">
              <h2 className="text-xl font-semibold text-slate-900">Fazer Cadastro</h2>
              <p className="mt-2 text-sm text-slate-500">Ainda não tem conta? Cadastre-se agora mesmo.</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0b8aa0]">
              Criar conta <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </Link>

          <Link href="/mural" className="group rounded-[30px] border border-[#d7eef3] bg-[#f4fbfc] px-6 py-7 shadow-sm transition hover:-translate-y-1 hover:border-[#0b8aa0] hover:bg-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[#0b8aa0] shadow-sm">
              <span className="material-symbols-outlined !text-2xl">article</span>
            </div>
            <div className="mt-5">
              <h2 className="text-xl font-semibold text-slate-900">Ver Mural</h2>
              <p className="mt-2 text-sm text-slate-500">Já está autenticado? Venha ver as postagens do mural e mais!</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0b8aa0]">
              Ver mural <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
