"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ProfileContainer } from "@/components/ProfileContainer";
import { useAlerta } from "@/context/AlertContext";
import EdicaoContainer, { type FormValues } from "./EdicaoContainer";
import { atualizarEmailUsuario, atualizarPerfil } from "@/services/profile";
import { obterUsuarioAtual, deletarUsuario } from "@/services/auth";


export default function EditarPerfilClient() {
  const router = useRouter();
  const { mostrarAlerta } = useAlerta();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEditSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const { user } = await obterUsuarioAtual();
      const userId = user?.id;

      if (!userId) {
        window.location.href = '/login';
        return;
      }
      if (user.email != values.email) {
        try{
          await atualizarEmailUsuario(values.email);
          mostrarAlerta('ok', 'Seu email foi alterado com sucesso, verifique sua caixa de mensagens para fazer a confirmação!');
        } catch(err) {
          throw new Error('Erro ao trocar email: ', err.message)
        }
      }
      const result = await atualizarPerfil({
        userId,
        username: values.username,
        nome: values.nome,
        curso: values.curso,
        termino: values.formacao,
        telefone: values.telefone,
        matricula: values.matricula,
        cpf: values.cpf.trim(),
      });

      if (!result.success) {
        throw new Error(result.error ?? "Falha ao salvar dados.");
      }
      mostrarAlerta("ok", "Dados atualizados com sucesso!");
      router.push('/perfil/'+username);
      return ;
    } catch (erro) {
      console.error("Erro ao atualizar:", erro);
      mostrarAlerta("error", erro instanceof Error ? erro.message : "Falha ao salvar dados.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir seu perfil permanentemente?")) {
      const result = await deletarUsuario();

      if (result?.success) {
        router.push('/login');
      } else {
        mostrarAlerta("error", result?.error || "Ocorreu um erro inesperado.");
      }
    }
  };
  return (
    <>
      <Navbar />
      <div className="sm:mx-12">

        <div id="edit-profile" className="w-full flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-1/3 bg-slate-50 rounded-xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center">
            <ProfileContainer username={username} />
            <div className="mt-12 p-4 bg-blue-50 border-2 border-[#008b8b] rounded-lg flex gap-3 text-left">
              <span className="material-symbols-outlined !text-2xl text-[#008b8b]">verified_user</span>
              <p className="text-sm text-[#008b8b] leading-tight">
                Mantenha seus dados sempre atualizados para aproveitar todas as funcionalidades do sistema.
              </p>
            </div>
          </aside>

          <main className="w-full md:w-2/3 bg-white rounded-xl shadow-md border border-gray-100 p-10">
            <div className="mb-6 ml-4">
              <div className="inline-flex">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Editar Perfil</h1>
                <button type="button" onClick={handleDelete}>
                  <span className="material-symbols-outlined cursor-pointer !text-2xl pl-4 pt-1 text-slate-800 hover:text-[red] transition-colors">
                    delete
                  </span>
                </button>
              </div>
              <div className="h-1.5 w-20 bg-[#0b8aa0] mt-4 rounded-full"></div>
              <p className="text-sm text-gray-500 my-6">Atualize suas informações pessoais e acadêmicas.</p>
            </div>

            <EdicaoContainer
              isLoading={isLoading}
              onSubmit={handleEditSubmit}
              onProfileLoaded={(values) => setUsername(values.username)}
            />
          </main>
        </div>
      </div>
    </>
  );
}
