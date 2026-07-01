"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { verificarUsernameDisponivel, obterUsuarioAtual } from "@/services/auth";
import { useAlerta } from "@/context/AlertContext";
import { buscarPerfilCompleto } from "@/services/profile";
import { formatarFormacao, formatarCPF, formatarTelefone } from "@/utils/formatters";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { processarCanvasAvatarParaWebp } from "@/services/images";
import { fazerUploadAvatarPerfil } from "@/services/storage";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editarSchema, type EditarSchema } from "@/schemas/EditarSchema";

export type FormValues = EditarSchema;

interface EdicaoContainerProps {
  isLoading?: boolean;
  usuarioId?: string;
  onSubmit?: (values: FormValues) => Promise<void> | void;
  onProfileLoaded?: (values: FormValues) => void;
}

const initialValues: FormValues = {
  nome: "",
  username: "",
  email: "",
  cpf: "",
  senha: null,
  matricula: "",
  formacao: "",
  curso: "",
  telefone: "",
};

export default function EdicaoContainer({ isLoading = false, usuarioId, onSubmit, onProfileLoaded }: EdicaoContainerProps) {
  const { mostrarAlerta } = useAlerta();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditarSchema>({
    resolver: zodResolver(editarSchema),
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  const [currentUsername, setCurrentUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const imageCropperRef = useRef<HTMLImageElement | null>(null);
  const cropperInstanceRef = useRef<Cropper | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const carregarPerfil = async () => {
      try {
        const idParaBuscar = usuarioId ?? (await obterUsuarioAtual()).user?.id;

        if (!idParaBuscar) {
          return;
        }

        const resultado = await buscarPerfilCompleto(idParaBuscar);

        if (!resultado.data || !isActive) {
          return;
        }

        const dadosCarregados: EditarSchema = {
          nome: resultado.data.nome ?? "",
          username: resultado.data.username ?? "",
          email: resultado.data.email ?? "",
          cpf: formatarCPF(resultado.data.cpf_descriptografado ?? ""),
          senha: null,
          matricula: resultado.data.matricula_institucional ?? "",
          formacao: resultado.data.termino ?? "",
          curso: resultado.data.curso ?? "",
          telefone: resultado.data.telefone ?? "",
        };

        setCurrentUsername(resultado.data.username ?? "");
        reset(dadosCarregados);
        onProfileLoaded?.(dadosCarregados);
      } catch (error) {
        console.error("Erro ao carregar perfil para edição:", error);
      }
    };

    carregarPerfil();

    return () => {
      isActive = false;
    };
  }, [usuarioId, onProfileLoaded, reset]);

  useEffect(() => {
    if (!showCropperModal || !selectedAvatarUrl || !imageCropperRef.current) {
      return;
    }

    cropperInstanceRef.current?.destroy();
    cropperInstanceRef.current = new Cropper(imageCropperRef.current, {
      aspectRatio: 1,
      viewMode: 1,
      minCanvasWidth: 0,
      minCanvasHeight: 0,
      minCropBoxWidth: 100,
      dragMode: 'move',
      autoCropArea: 1,
      background: false,
      responsive: true,
    });

    return () => {
      cropperInstanceRef.current?.destroy();
      cropperInstanceRef.current = null;
    };
  }, [showCropperModal, selectedAvatarUrl]);

  const watchedUsername = watch('username');

  useEffect(() => {
    if (!watchedUsername) {
      setUsernameStatus('idle');
      return;
    }

    if (watchedUsername.length < 4) {
      setUsernameStatus('error');
      return;
    }

    if (watchedUsername === currentUsername) {
      setUsernameStatus('success');
      return;
    }

    setUsernameStatus('loading');

    const timer = window.setTimeout(async () => {
      try {
        const disponivel = await verificarUsernameDisponivel(watchedUsername);
        setUsernameStatus(disponivel ? 'success' : 'error');
      } catch {
        setUsernameStatus('error');
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [currentUsername, watchedUsername]);

  const handleFormacaoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue('formacao', formatarFormacao(event.target.value), { shouldValidate: true, shouldDirty: true });
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue('username', event.target.value.trim(), { shouldValidate: true, shouldDirty: true });
  };

  const handleCpfChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue('cpf', formatarCPF(event.target.value), { shouldValidate: true, shouldDirty: true });
  };

  const handleTelefoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue('telefone', formatarTelefone(event.target.value), { shouldValidate: true, shouldDirty: true });
  };

  const handleAvatarSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];
    if (!tiposPermitidos.includes(file.type)) {
      mostrarAlerta("error", "Por favor, selecione apenas imagens JPG ou PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      mostrarAlerta("error", "A imagem original é muito grande. O limite máximo é de 5MB.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedAvatarUrl(previewUrl);
    setShowCropperModal(true);
  };

  const closeCropperModal = () => {
    cropperInstanceRef.current?.destroy();
    cropperInstanceRef.current = null;
    if (selectedAvatarUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedAvatarUrl);
    }
    setSelectedAvatarUrl(null);
    setShowCropperModal(false);
  };

  const handleSaveCroppedAvatar = async () => {
    if (!cropperInstanceRef.current) return;

    try {
      setIsUploadingAvatar(true);

      const webpFile = await processarCanvasAvatarParaWebp(cropperInstanceRef.current, "avatar.webp");
      if (!webpFile) {
        mostrarAlerta("error", "Não foi possível processar o recorte da imagem.");
        return;
      }

      const resultado = await fazerUploadAvatarPerfil(webpFile);
      if (!resultado.success || !resultado.caminhoPublico) {
        throw new Error(resultado.error);
      }
      setAvatarPreviewUrl(resultado.caminhoPublico);

      mostrarAlerta("ok", "Foto de perfil atualizada com sucesso!");
      closeCropperModal();
      
    } catch (error: any) {
      mostrarAlerta("error", error?.message || "Erro inesperado ao salvar o avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmitForm = async (data: EditarSchema) => {
    if (usernameStatus === 'loading') {
      mostrarAlerta('error', 'Aguarde a validação do username antes de salvar.');
      return;
    }
    if (usernameStatus === 'error') {
      mostrarAlerta('error', 'Escolha um username válido antes de salvar.');
      return;
    }

    await onSubmit?.({
      ...data,
      senha: data.senha?.trim() || null,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitForm)} id="form-edit" className="w-full max-w-4xl p-4 lg:grid lg:grid-cols-2 lg:gap-10">
      <input type="hidden" {...register('senha')} />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold m-2" htmlFor="nome-completo">Nome Completo *</label>
          <input
            id="nome-completo"
            type="text"
            placeholder="Digite seu nome completo"
            className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.nome}
            {...register('nome')}
            required
          />
          {errors.nome && <p className="text-sm text-red-500 mt-1 ml-2">{errors.nome.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold m-2" htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            title="Por favor, insira o seu email pessoal"
            placeholder="Ex.: nome@exemplo.com"
            className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.email}
            {...register('email')}
            required
          />
          {errors.email && <p className="text-sm text-red-500 mt-1 ml-2">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold m-2" htmlFor="cpf">CPF *</label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            placeholder="Ex.: 123.456.789-00"
            className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.cpf}
            {...register('cpf', {
              onChange: (event) => {
                setValue('cpf', formatarCPF(event.target.value), { shouldValidate: true, shouldDirty: true });
              },
            })}
            required
          />
          {errors.cpf && <p className="text-sm text-red-500 mt-1 ml-2">{errors.cpf.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold m-2" htmlFor="telefone">Telefone (opcional)</label>
          <input
            id="telefone"
            type="tel"
            inputMode="tel"
            placeholder="Ex.: (83) 98765-4321"
            className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition ${errors.telefone ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.telefone}
            {...register('telefone', {
              onChange: (event) => {
                setValue('telefone', formatarTelefone(event.target.value), { shouldValidate: true, shouldDirty: true });
              },
            })}
          />
          {errors.telefone && <p className="text-sm text-red-500 mt-1 ml-2">{errors.telefone.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold m-2" htmlFor="matricula-institucional">Matrícula Institucional *</label>
          <input
            id="matricula-institucional"
            type="text"
            placeholder="Ex.: 20261230012"
            className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition ${errors.matricula ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.matricula}
            {...register('matricula')}
            required
          />
          {errors.matricula && <p className="text-sm text-red-500 mt-1 ml-2">{errors.matricula.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold m-2" htmlFor="opcoes">Egressos/Docentes *</label>
          <div className="relative">
            <select
              id="opcoes"
              className={`px-4 py-2.5 w-full cursor-pointer border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition appearance-none bg-white ${errors.curso ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={!!errors.curso}
              {...register('curso')}
              required
            >
              <option value="" disabled>Selecione uma opção</option>
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
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold m-2" htmlFor="data-formacao">Data de Formação *</label>
          <input
            id="data-formacao"
            type="text"
            placeholder="Ex.: 2026.1"
            className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition ${errors.formacao ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.formacao}
            {...register('formacao', {
              onChange: (event) => handleFormacaoChange(event),
            })}
            required
          />
          {errors.formacao && <p className="text-sm text-red-500 mt-1 ml-2">{errors.formacao.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold m-2" htmlFor="input-username">Username *</label>
          <div className="relative">
            <input
              type="text"
              id="input-username"
              className={`px-4 py-2.5 w-full border rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Digite seu nome de usuário"
              aria-invalid={!!errors.username}
              {...register('username', {
                onChange: (event) => handleUsernameChange(event),
              })}
              required
            />
            <span className="absolute right-4 bottom-1/2 translate-y-1/2 flex items-center justify-center">
              {usernameStatus === 'loading' && (
                <div className="w-[18px] h-[18px] border-2 border-zinc-300 border-t-[#0b8aa0] rounded-full animate-spin" />
              )}
              {usernameStatus === 'success' && (
                <span className="material-symbols-outlined text-green-500 !text-lg">check_circle</span>
              )}
              {usernameStatus === 'error' && (
                <span className="material-symbols-outlined text-red-500 !text-lg">cancel</span>
              )}
            </span>
          </div>
          {errors.username && <p className="text-sm text-red-500 mt-1 ml-2">{errors.username.message}</p>}
        </div>
      </div>

      <div className="bg-slate-100 max-w-150 border mx-auto mt-10 lg:mt-4 border-gray-300 rounded-2xl flex justify-center items-center gap-4 p-4 shadow col-span-2">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#0b8aa0] flex items-center justify-center text-white shrink-0">
          {avatarPreviewUrl ? (
            <img src={avatarPreviewUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
            </svg>
          )}
        </div>
        <div>
          <p className="text-md font-bold">Foto de Perfil</p>
          <p className="text-xs text-gray-400 mb-2">Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.</p>

          <label htmlFor="avatar-input" className="text-white ml-auto cursor-pointer bg-[#0b8aa0] rounded-3xl px-4 py-1 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#087487] transition duration-300 w-fit">
            <span className="material-symbols-outlined !text-lg text-white">upload</span>
            Alterar foto
          </label>

          <input
            id="avatar-input"
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleAvatarSelection}
          />
        </div>
      </div>

      {showCropperModal && selectedAvatarUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Ajustar Foto de Perfil</h3>
              <button type="button" onClick={closeCropperModal} className="text-sm font-semibold text-slate-400 hover:text-white">
                Fechar
              </button>
            </div>

            <div className="mb-4 flex max-h-[60vh] items-center justify-center overflow-hidden rounded-xl bg-black w-full [&_.cropper-view-box]:rounded-full [&_.cropper-face]:rounded-full [&_.cropper-view-box]:outline-2 [&_.cropper-view-box]:outline-[#0b8aa0]">
              <img ref={imageCropperRef}
              src={selectedAvatarUrl}
              alt="Imagem para recorte"
              className="block max-h-[60vh] w-full object-contain" />
            </div>

            <div className="mb-4 flex justify-center gap-3 text-white">
              <button type="button" onClick={() => cropperInstanceRef.current?.zoom(0.1)} className="rounded-lg bg-slate-800 px-3 py-1 text-lg font-bold hover:bg-slate-700">
                +
              </button>
              <button type="button" onClick={() => cropperInstanceRef.current?.zoom(-0.1)} className="rounded-lg bg-slate-800 px-3 py-1 text-lg font-bold hover:bg-slate-700">
                -
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeCropperModal} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCroppedAvatar}
                disabled={isUploadingAvatar}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0b8aa0] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#087487] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isUploadingAvatar ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Salvando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:col-span-2 flex justify-end gap-4 mt-12 lg:mt-8">
        <button
      id="btn-cancel"
      type="button"
      onClick={() => router.push(`/perfil/${currentUsername}`)}
          className="px-8 py-2 border border-gray-300 rounded-3xl text-sm font-bold text-[#0b8aa0] hover:bg-gray-100 cursor-pointer shadow-lg transition duration-300 active:scale-95 active:shadow-2xl flex items-center justify-center">
          <span id="cancel-text">Cancelar</span>
          <svg id="cancel-spinner" className="hidden animate-spin h-6 w-6 text-[#e0e0e0]" fill="none">
            <use href="/icons.svg#carregando"></use>
          </svg>
        </button>
        <button
          disabled={isLoading}
          className={`px-6 py-2 bg-[#0b8aa0] text-white rounded-3xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition ${
            isLoading ? "opacity-80 cursor-not-allowed" : "hover:bg-[#087487] active:scale-95 active:shadow-2xl"
          }`}
          type="submit"
        >
          {!isLoading ? (
          <>
            <span className="material-symbols-outlined !text-lg">person_edit</span>
            <span>Salvar Alterações</span>
          </>
          ) : (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
              <span>Carregando...</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
