import { supabase } from '/src/supabaseClient.js'
import { mostrarErro } from '/src/main.js'

export async function dadosPerfil() {
    const editProfile = document.getElementById('edit-profile');
    if (!editProfile) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .rpc('buscar_perfil_usuario', { usuario_id:user.id })
        .single();
    if (error) {
        console.error('Erro ao buscar dados:', error)
    }
    const temGithub = data && data.github_user;
    const avatarUrl = temGithub 
    ? `<img src="https://avatars.githubusercontent.com/${data.github_user}" alt="Foto de Perfil" class="w-full h-full object-cover rounded-full">` 
    : `<svg class="w-34 h-34">
        <use href="/src/assets/icons.svg#profile"></use>
        </svg>`;
    editProfile.innerHTML = `
        <aside class="w-full md:w-1/3 bg-slate-50 rounded-xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center">
            <div class="relative mb-6 mt-4">
                <div class="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg rounded-full bg-slate-200 shadow-lg">
                    ${avatarUrl}
                </div>
            </div>
            <h2 class="text-[26px] font-bold text-gray-900">${data.nome || 'Nome não informado'}</h2>
            <span class="text-[16px] text-[#087487] mt-2 mb-8">${data.email}</span>
            <div class="w-full space-y-8 text-left border-t mt-4 border-slate-200 pt-6">
                <div class="mt-8">
                    <span class="block text-[14px] uppercase tracking-[0.2em] text-slate-400 font-bold">Curso</span>
                    <span class="flex items-center gap-2 text-xl font-semibold text-slate-800 mt-1 leading-none">
                        <span class="material-symbols-outlined !text-2xl text-[#008b8b]">school</span>
                        ${data.curso || 'Curso não informado'}
                    </span>
                </div>
            </div>
            <div class="w-full mt-6 text-left">
                <div>
                    <span class="block text-[14px] uppercase tracking-[0.2em] text-slate-400 font-bold">Formado em</span>
                    <span class="flex items-center gap-2 text-xl font-semibold text-slate-800 mt-1 leading-none">
                        <span class="material-symbols-outlined !text-2xl text-[#008b8b]">calendar_month</span>
                        ${data.termino || 'Data não informada'}
                    </span>
                </div>
            </div>
            <div class="mt-12 p-4 bg-blue-50 border-2 border-[#008b8b] rounded-lg flex gap-3 text-left">
                <span class="material-symbols-outlined !text-2xl text-[#008b8b]">verified_user</span>
                <p class="text-sm text-[#008b8b] leading-tight">Mantenha seus dados sempre atualizados para aproveitar todas as funcionalidades do sistema.</p>
            </div>
        </aside>
        <main class="w-full md:w-2/3 bg-white rounded-xl shadow-md border border-gray-100 p-10">
            <div class="mb-6 ml-4">
                <div class="inline-flex">
                <h1 class="text-4xl font-black text-slate-900 tracking-tight">Editar Perfil</h1>
                </div>
                <div class="h-1.5 w-20 bg-[#0b8aa0] mt-4 rounded-full"></div>
                <p class="text-sm text-gray-500 my-6">Atualize suas informações pessoais e acadêmicas.</p>
            </div>
            <form id="form-edit" method="post" class="w-full max-w-4xl p-4 lg:grid lg:grid-cols-2 lg:gap-10">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold m-2">Nome Completo *</label>
                        <input id="nome-completo" type="text" value="${data.nome}" placeholder="Digite seu nome completo" class="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition required">
                    </div>
                    <div>
                        <label class="block text-sm font-bold m-2">Email *</label>
                        <input id="email" type="email" value="${data.email}" placeholder="Ex.: nome@exemplo.com" class="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition required">
                    </div>
                    <div>
                        <label class="block text-sm font-bold m-2">CPF *</label>
                        <input id="cpf" type="text" value="${data.cpf_aberto}" placeholder="Ex.: 123.456.789-00" pattern="[0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}" class="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition required">
                    </div>
                    <div>
                        <label class="block text-sm font-bold m-2">Telefone</label>
                        <input id="telefone" value="${data.telefone || ''}" type="tel" placeholder="Ex.: 83987654321" pattern="[0-9]{2}9[0-9]{8}" class="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition">
                    </div>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold m-2">Matrícula Institucional *</label>
                        <input id="matricula-institucional" value="${data.matricula_institucional || ""}" type="text" placeholder="Ex.: 20261230012" pattern="[0-9]{9}[0-9]*|[0-9]{7}" class="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition required">
                    </div>
                    <div>
                        <label class="block text-sm font-bold m-2">Egressos/Docentes *</label>
                        <div class="relative">
                            <select id="opcoes" required class="px-4 py-2.5 w-full cursor-pointer border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition appearance-none bg-white">
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
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg class="fill-current h-4 w-4" xmlns="http://w3.org" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-bold m-2">Data de Formação *</label>
                        <input id="data-formacao" type="text" value="${data.termino || ''}" pattern="[0-9]{4}\.[0-9]{1}" placeholder="Ex.: 2026.1" class="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" required>
                    </div>
                    <div>
                        <label class="block text-sm font-bold m-2">Username *</label>
                        <input type="text" id="input-username" value="${data.username}" placeholder="Ex.: nome_sobrenome" title="Digite no mínimo 3 dígitos (letras, números, hífen e/ou underline) e no máximo 20" class="px-4 py-2.5 w-full border border-gray-300 rounded-3xl text-sm focus:ring-2 focus:ring-[#087487] focus:border-transparent outline-none transition" required>
                        <span id="icons-username" class="absolute right-4 bottom-1/2 translate-y-1/2 w-[18px] h-[18px]">
                            
                        </span>
                    </div>
                </div>
                <div class="bg-slate-100 max-w-150 border mx-auto mt-10 lg:mt-4 border-gray-300 rounded-xl flex justify-center items-center gap-4 p-4 shadow col-span-2">
                    <div class="w-16 h-16 bg-[#008b8b] rounded-full flex items-center justify-center text-white shrink-0">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                    </div>
                    <div>
                        <p class="text-md font-bold">Foto de Perfil</p>
                        <p class="text-xs text-gray-400 mb-2">Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB.</p>
                        <button type="button" class="text-white cursor-pointer bg-[#008b8b] rounded-3xl px-4 py-1 text-xs font-bold flex items-center gap-2 hover:bg-[#087487] transition duration-300">
                        <span class="material-symbols-outlined !text-lg text-white">upload</span>
                            Alterar Foto
                        </button>
                    </div>
                </div>
                <div class="md:col-span-2 flex justify-end gap-4 mt-12 lg:mt-8">
                    <button id="btn-cancel" type="button" class="px-8 py-2 border border-gray-300 rounded-3xl text-sm font-bold text-[#008b8b] hover:bg-gray-50 cursor-pointer shadow-lg transition duration-300 active:scale-95 active:shadow-2xl">
                    <span id="cancel-text">Cancelar</span>
                        <svg id="cancel-spinner" class="hidden animate-spin h-6 w-6 text-[#e0e0e0]" fill="none">
                            <use href="/src/assets/icons.svg#carregando"></use>
                        </svg>
                    </button>
                    <button id="btn-edit" type="submit" class="px-6 py-2 bg-[#008b8b] hover:bg-[#087487] text-white rounded-3xl text-sm font-bold flex items-center gap-2 hover:bg-teal-800 cursor-pointer shadow-lg transition duration-300 active:scale-95 active:shadow-2xl">
                    <span class="material-symbols-outlined !text-2xl text-white">check</span>
                    <span id="submit-text">Salvar Alterações</span>
                        <svg id="submit-spinner" class="hidden animate-spin h-6 w-6 text-[#e0e0e0]" fill="none">
                            <use href="/src/assets/icons.svg#carregando"></use>
                        </svg>
                    </button>
                </div>
            </form>
        </main>`;
    
    const btnEdit = document.getElementById('btn-edit');
    btnEdit?.addEventListener('click', () => {
    handleEdit(btnEdit);
    });

    function voltarCancelar(btnCancel) {
    if (btnCancel) {
        btnCancel.disabled = false
        btnCancel.classList.remove('opacity-80')
    }
    document.getElementById('cancel-text')?.classList.remove('hidden');
    document.getElementById('cancel-spinner')?.classList.add('hidden');
    }
    const btnCancel = document.getElementById('btn-cancel');
    btnCancel?.addEventListener('click', () => {
        const btnCancel = document.getElementById('btn-cancel')
        if (btnCancel) {
            btnCancel.disabled = true
            btnCancel.classList.add('opacity-80')
            document.getElementById('cancel-text').classList.add('hidden');
            document.getElementById('cancel-spinner').classList.remove('hidden');
        } setTimeout (() => {         
            voltarCancelar(btnCancel);
            window.location.href = 'pages/perfil/';    
        }, 500);
    });
}


export async function handleEdit(btnEdit) {
    const btnText = document.getElementById('submit-text')
    const btnSpinner = document.getElementById('submit-spinner')
    const form = document.querySelector('#form-login')
    if (btnEdit) {
            btnEdit.disabled = true
            btnEdit.classList.add('opacity-80')
        }
        if (btnText) btnText.classList.add('hidden')
        if (btnSpinner) btnSpinner.classList.remove('hidden')
    
    function voltarBotao() {
        if (btnEdit) {
            btnEdit.disabled = false
            btnEdit.classList.remove('opacity-80')
        }
        if (btnText) btnText.classList.remove('hidden')
        if (btnSpinner) btnSpinner.classList.add('hidden')
    }

    const nome = document.getElementById('nome-completo').value;
    const email =document.getElementById('email').value;
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value
    const matricula = document.getElementById('matricula-institucional').value;
    const opcoes = document.getElementById('opcoes').value;
    const formacao = document.getElementById('data-formacao').value;
    const username = document.getElementById('input-username').value;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado");
        const { data, error: erro } = await supabase
            .rpc('buscar_perfil_usuario', { usuario_id:user.id })
            .single();
        if (erro) {
            console.error('Erro ao buscar dados:', error)
        }
        if (data.email) {
            const { error: authError } = await supabase.auth.updateUser({
                email: email,
            });
            if (authError) throw authError;
        }
        const { error } = await supabase.rpc('edicao_perfil_usuario', {
            p_user_id: user.id,
            p_username: username,
            p_nome: nome,
            p_cpf: cpf,
            p_telefone: telefone,
            p_matricula_institucional: matricula,
            p_curso: opcoes,
            p_termino: formacao,});
        if (error) throw error;
        alert("Dados atualizados com sucesso!");
        voltarBotao();
        location.reload();
        } catch (erro) {
            console.error("Erro ao atualizar:", erro);
            mostrarErro("Falha ao salvar dados.");
            voltarBotao();
        }
}