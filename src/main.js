import { handleCadastro, btnCadastro, iniciarValidacao, isUsernameValid } from '../pages/cadastro/main.js';
import { handleLogin, btnLogin } from '../pages/login/main.js';
import { renderizarPerfil } from '../pages/perfil/main.js';
import { dadosPerfil } from '../pages/perfil/editar/main.js';
import './style.css'
import { supabase } from './supabaseClient.js'
import { setStorage } from './lib/storage.js'


// função de logout
function fazerLogout() {
    const linkLogout = document.getElementById('link-logout');

    if (linkLogout) {
        linkLogout.addEventListener('click', async (e) => {
            e.preventDefault();

            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Erro ao sair:", error.message);
            } else {
                window.location.href = '/pages/login/';
            }
        });
    }
}
async function verificarUsuarioLogado() {
    const { data: { user }, error } = await supabase.auth.getUser()

    const paginaAtual = window.location.pathname
    const ehPaginaPublica = paginaAtual.includes('login') || paginaAtual.includes('cadastro')

    if (!user && !ehPaginaPublica) {
        // Se não houver usuário logado, manda de volta para o login
        window.location.href = '/pages/login/';
    } else if (user && ehPaginaPublica) {
        window.location.href = '/';
    }
}

// função para ativar o menu hamburguer
function configurarMenuHamburguer() {
    const btnHamburger = document.getElementById('btn-hamburguer');
    const navMenu = document.getElementById('nav-menu');

    if (btnHamburger && navMenu) {
        btnHamburger.addEventListener('click', () => {
            btnHamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    
        document.addEventListener('click', (e) => {
        const isClickInside = navMenu.contains(e.target) || btnHamburger.contains(e.target);
        if (!isClickInside && navMenu.classList.contains('active')) {
            btnHamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
        });
    }
}

// função para ativar o input de pesquisa
function configurarPesquisa() {
    const btnPesquisar = document.getElementById('btn-search');
    const btnEnviar = document.getElementById('btn-send');
    const inputPesquisar = document.getElementById('search-input')

    if (btnPesquisar && btnEnviar && inputPesquisar) {
        btnPesquisar.addEventListener('click', () => {
            inputPesquisar.focus();
        });
        inputPesquisar.addEventListener('focusin', () => {
            btnPesquisar.style.display = 'none';
            btnEnviar.style.display = 'block';
        });
        inputPesquisar.addEventListener('focusout', (event) => {
            if (event.relatedTarget !== btnEnviar) {
                btnPesquisar.style.display = 'block';
                btnEnviar.style.display = 'none';
            }
        });
    }
}

// função para adicionar os componentes html (barra de navegação, footer, etc)
function inserirHtml(id, caminho) {
    const idElemento = document.getElementById(id);
    
    if (idElemento) {
        fetch(caminho)
            .then(response => {
                if (!response.ok) throw new Error("Erro ao carregar o componente");
                return response.text();
            }).then(html => {
                idElemento.innerHTML = html;
                if (id === 'navbar') {
                    configurarMenuHamburguer();
                    fazerLogout();
                } else if (id === 'search') {
                    configurarPesquisa();
                }
            }).catch(error => console.error(error));
    }
};

// função para lidar com os botões de cadastro e login
function handleForm(form) {
    form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    if (form.id === 'form-cadastro') {
        if (!isUsernameValid()) {
            document.getElementById('input-username').focus()
            mostrarAlerta('error', 'Por favor, corrija o seu username antes de enviar o formulário de cadastro.')
            return null
        } else {
            handleCadastro();
        }
    } else if (form.id === 'form-login') {
        handleLogin();
    }
})};

export function mostrarAlerta(codigo, msg){

    const alertDiv = document.createElement('div');
    if (codigo === 'error') {
        alertDiv.className = "flex items-center justify-center gap-x-2 p-2 mb-2 text-red-800 border border-red-300 rounded-lg bg-red-50 animate-bounce-short";
        alertDiv.role = "alert";

        alertDiv.innerHTML = `
        <span class="material-symbols-outlined !text-2xl text-red">
            error
        </span>
        <div>
            <span class="font-medium"> Erro: ${msg}</span>
        </div>
        `;
    } else if (codigo === 'ok') {
        alertDiv.className = "flex items-center justify-center gap-x-2 p-2 mb-2 text-green-800 border border-green-300 rounded-lg bg-green-50 animate-bounce-short";
        alertDiv.role = "alert";

        alertDiv.innerHTML = `
        <span class="material-symbols-outlined !text-2xl text-green">
            check
        </span>
        <div>
            <span class="font-medium"> Ok: ${msg}</span>
        </div>
        `;
    } else {
        console.error('Código inválido para mostrarAlerta');
        return null
    }
    const container = document.createElement('div');
    container.id = 'alert-container';

    container.className = "fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-3 pointer-events-none"; 
    document.body.appendChild(container);

    container.innerHTML = '';
    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

async function getEmail() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from('dados_privados')
        .select('email')
        .eq('id', user.id)
        .single();
    if (error || !data) return null;
    if (data.email) {
        return data.email;
    } if (error) {
        mostrarAlerta('error', 'Faça login para enviar seu feedback!');
        window.location.href = '/pages/login/';
        return null;
    }
}

// função para lidar com o feedback dos usuários
function configurarEventosFeedback() {
    const camposFeedback = document.getElementById('hidden-feedback');
    const formFeedback = document.getElementById('feedback');

    if (!camposFeedback || !formFeedback) return;

    camposFeedback.addEventListener('click', (e) => {
        const clicouFechar = e.target.closest('[data-fechar="true"]');
        const clicouForaDoCard = e.target === camposFeedback;

        if (clicouFechar || clicouForaDoCard) {
            formFeedback.reset();
            formFeedback.removeAttribute('data-user-email');
            camposFeedback.classList.add('hidden');
        }
    });

    formFeedback.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = formFeedback.getAttribute('data-user-email');
        if (!email) return;

        const tipoFeedback = formFeedback.querySelector('select')?.value;
        const assuntoFeedback = formFeedback.querySelector('input[type="text"]')?.value || "Sem assunto";
        const msgFeedback = document.getElementById('msg-feedback');
        const mensagemLimpa = msgFeedback?.value.trim() || "";

        if (mensagemLimpa.length < 10 || mensagemLimpa.length > 500 || tipoFeedback === "") {
            mostrarAlerta('error', 'Selecione um tipo de feedback e digite entre 10 e 500 caracteres.');
            return;
        }

        if (confirm('Tem certeza que deseja enviar seu feedback?')) {
            const dadosFeedback = {
                tipo: tipoFeedback,
                assunto: assuntoFeedback,
                mensagem: mensagemLimpa,
                data: new Date().toISOString()
            };

            setStorage(email, dadosFeedback);
            mostrarAlerta('ok', 'Feedback enviado com sucesso!');
            
            formFeedback.reset();
            formFeedback.removeAttribute('data-user-email');
            camposFeedback.classList.add('hidden');
        }
    });
}

function handleFeedback(email, btnFeedback, feedbackText, feedbackSpinner) {
    const camposFeedback = document.getElementById('hidden-feedback');
    const formFeedback = document.getElementById('feedback');

    if (formFeedback) {
        formFeedback.setAttribute('data-user-email', email);
    } camposFeedback?.classList.remove('hidden');
    btnFeedback.disabled = false;
    feedbackText.classList.remove('hidden');
    feedbackSpinner.classList.add('hidden');
}

function visibilidadeSenha() {
    const formLogin = document.getElementById('form-login')
    const formCadastro = document.getElementById('form-cadastro')
    if (!formCadastro && !formLogin) return null;

    const inputSenha = document.getElementById('input-senha');
    const btnOlho = document.getElementById('btn-olho');
    
    const iconeOlho = document.getElementById('icone-olho');

    btnOlho.addEventListener('click', () => {
        if (inputSenha.type === 'password') {
            inputSenha.type = 'text';
            iconeOlho.textContent = 'visibility_off';
        } else {
            inputSenha.type = 'password';
            iconeOlho.textContent = 'visibility';
        }
    });
}

async function renderizarMural() {
    const container = document.getElementById('mural-posts');
    if (!container) return null;

    const { data: posts, error } = await supabase
    .from('mural_completo')
    .select('*')
    .order('post_data', { ascending: false });

    if (error || !posts) {
        console.error(error);
    }
    
    const htmlGerado = posts.map(post => {
    const imagemPostHtml = post.imagem_url 
            ? `<div class="mt-4 overflow-hidden rounded-lg border border-gray-100 bg-slate-50 flex items-center justify-center w-full max-w-[600px] mx-auto">
                <img src="${post.imagem_url}" alt="Imagem do post" class="w-full h-full object-contain">
            </div>` 
            : ``;

        const avatarUrl = post.autor_avatar
        ? `<img src="${post.autor_avatar}?t=${new Date().getTime()}" alt="Foto de ${post.autor_nome}" class="w-10 h-10 object-cover rounded-full">` 
        : `<svg class="w-10 h-10"><use href="/icons.svg#profile"></use></svg>`;
        
        const dataFormatada = new Date(post.post_data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        });

        return `
            <div id="post-${post.post_id}" class="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto flex flex-col items-center">
            <div class="w-full max-w-[600px] text-left">
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        ${avatarUrl}
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 leading-none">${post.autor_nome}</h3>
                            <span class="text-[11px] text-gray-400">${dataFormatada}</span>
                        </div>
                    </div>
                    
                    <span class="px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider"
                        style="background-color: color-mix(in srgb, ${post.tag_cor}, transparent 90%); color: ${post.tag_cor}">
                        ${post.tag_nome}
                    </span>
                </div>

                <div class="post-content mb-4">
                    <p class="text-gray-700 text-sm leading-relaxed">${post.post_conteudo}</p>
                </div>
                
            </div>
            ${imagemPostHtml}
            <div class="w-full max-w-[600px] flex items-center gap-6 mt-5 pt-4 border-t border-gray-100">
                <button class="btn-curtir cursor-pointer flex items-center gap-1.5 group transition" data-id="${post.post_id}">
                    <span class="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-red-500 transition">
                        favorite
                    </span>
                    <span class="text-xs font-semibold text-gray-500">${post.quantidade_curtidas}</span>
                </button>

                <button class="btn-comentarios cursor-pointer flex items-center gap-1.5 group transition" data-id="${post.post_id}">
                    <span class="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-blue-500 transition">
                        comment
                    </span>
                    <span class="text-xs font-semibold text-gray-500">${post.quantidade_comentarios}</span>
                </button>
            </div>

        </div>`;
    }).join('');
    
    container.innerHTML = htmlGerado;
    container.addEventListener('click', async function (e) {
        const button = e.target.closest('.btn-curtir');
        if (!button) return;

        if (button.disabled) return;
        button.disabled = true;

        const postId = button.dataset.id;
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            mostrarAlerta('error', 'Você precisa estar logado para curtir.');
            button.disabled = false;
            return;
        }

        const icon = button.querySelector('.material-symbols-outlined');
        const countSpan = button.querySelector('.text-xs');
        let count = parseInt(countSpan.innerText);
        
        const jaCurtiu = icon.classList.contains('text-red-500');

        if (jaCurtiu) {
            const { error } = await supabase
                .from('curtidas')
                .delete()
                .eq('post_id', postId)
                .eq('id', user.id);

            if (!error) {
                icon.classList.remove('text-red-500', 'fill-red-500');
                icon.classList.add('text-gray-400');
                countSpan.innerText = count - 1;
            } else {
                console.error('Erro ao descurtir:', error.message);
            }
        } else {
            const { error } = await supabase
                .from('curtidas')
                .insert([
                    { post_id: postId, id: user.id }
                ]);

            if (!error) {
                icon.classList.remove('text-gray-400');
                icon.classList.add('text-red-500', 'fill-red-500');
                countSpan.innerText = count + 1;
            } else {
                if (error.code !== '23505') { 
                    console.error('Erro ao curtir:', error.message);
                }
            }
        }
        button.disabled = false;
    });
}

// carregando funções a partir daqui
document.addEventListener('DOMContentLoaded', () => {
    verificarUsuarioLogado();
    inserirHtml('navbar', '/components/navbar.html');
    inserirHtml('footer', '/components/footer.html');
    inserirHtml('search', '/components/search.html');
    renderizarPerfil();
    visibilidadeSenha();
    iniciarValidacao();
    dadosPerfil();
    renderizarMural();
    configurarEventosFeedback();
});

btnCadastro?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-cadastro'));
});

btnLogin?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-login'));
});

document.getElementById('btn-feedback')?.addEventListener('click', async () => {
    const btnFeedback = document.getElementById('btn-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackSpinner = document.getElementById('feedback-spinner');
    btnFeedback.disabled = true;
    feedbackText.classList.add('hidden');
    feedbackSpinner.classList.remove('hidden');
    const email = await getEmail();
    if (email !== null) {
        handleFeedback(email, btnFeedback, feedbackText, feedbackSpinner);
    }
});