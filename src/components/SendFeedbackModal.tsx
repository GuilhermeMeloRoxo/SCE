"use client";

import { Dispatch, SetStateAction, SubmitEvent, useState } from "react";
import { useAlerta } from "@/context/AlertContext";
import { LoadingIcon } from "@/components/Icons";
import { enviarFeedback } from "@/services/mural";

interface SendFeedbackModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function SendFeedbackModal({ isOpen, setIsOpen }: SendFeedbackModalProps) {
  const { mostrarAlerta } = useAlerta();
  const [tipo, setTipo] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetForm = () => {
    setTipo("");
    setAssunto("");
    setMensagem("");
    setIsOpen(false);
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const resultado = await enviarFeedback(tipo, assunto, mensagem);

      if (!resultado.success) {
        throw new Error("Erro ao enviar feedback.");
      }
      mostrarAlerta("ok", "Feedback enviado com sucesso!");
      
      setTipo("");
      setAssunto("");
      setMensagem("");
      setIsOpen(false);
      
    } catch (error: any) {
      mostrarAlerta("error", error?.message || "Erro inesperado ao enviar feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#0b8aa0] text-white rounded-full hover:bg-[#087487] transition duration-300 active:scale-95 fixed bottom-5 right-5 z-40 shadow-xl cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">chat</span>
          <span className="font-bold">Enviar Feedback</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative p-8 text-zinc-900">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[#0b8aa0]">
                <span className="material-symbols-outlined !text-2xl">chat</span>
                <span className="text-2xl font-bold text-[#0b8aa0]">Enviar Feedback</span>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="material-symbols-outlined text-gray-800 cursor-pointer !text-3xl hover:text-gray-600 transition-colors"
              >
                close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-500 text-sm mb-4 text-center italic">
                Sua opinião é muito importante para nós!
              </p>

              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-800" htmlFor="select-tipo-feedback">
                  Tipo de Feedback *
                </label>
                <div className="relative">
                  <select
                    id="select-tipo-feedback"
                    required
                    value={tipo}
                    onChange={(event) => setTipo(event.target.value)}
                    className="px-4 py-2.5 w-full cursor-pointer border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition appearance-none bg-white text-zinc-900"
                  >
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    <option value="Sugestão">Sugestão</option>
                    <option value="Problema">Problema</option>
                    <option value="Elogio">Elogio</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-800" htmlFor="input-assunto-feedback">
                  Assunto (opcional)
                </label>
                <input
                  id="input-assunto-feedback"
                  type="text"
                  value={assunto}
                  onChange={(event) => setAssunto(event.target.value)}
                  placeholder="Digite um assunto"
                  className="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-800" htmlFor="textarea-mensagem-feedback">
                  Mensagem *
                </label>
                <div className="relative">
                  <textarea
                    id="textarea-mensagem-feedback"
                    required
                    value={mensagem}
                    onChange={(event) => setMensagem(event.target.value)}
                    maxLength={500}
                    minLength={10}
                    placeholder="Conte-nos o que você pensa, sugestões, problemas ou elogios."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-3xl h-36 resize-none text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition text-zinc-900 pb-8"
                  />
                  <span className="absolute right-4 bottom-3 text-xs font-medium text-gray-400">
                    {mensagem.length}/500
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-2 border border-gray-300 rounded-3xl text-sm font-bold text-[#0b8aa0] hover:bg-gray-100 transition duration-300 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || mensagem.trim().length === 0 || !tipo}
                  className="px-8 py-2 bg-[#0b8aa0] hover:bg-[#087487] text-white rounded-3xl text-sm font-bold flex items-center gap-2 transition duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting && <LoadingIcon className="animate-spin h-5 w-5 text-[#e0e0e0]" />}
                  <span>Enviar</span>
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-gray-400 font-bold">
                <span className="material-symbols-outlined !text-sm">lock</span>
                Suas informações são sigilosas e utilizadas apenas para melhorias.
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}