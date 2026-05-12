import { handleCadastro, btnCadastro, iniciarValidacao, isUsernameValid } from '/pages/cadastro/main.js';
import { handleLogin, btnLogin } from '/pages/login/main.js';
import { renderizarPerfil } from '/pages/perfil/main.js';
import { dadosPerfil, handleEdit } from '/pages/perfil/editar/main.js';
import '/src/style.css'
import { supabase } from '/src/supabaseClient.js'
import { setStorage } from './lib/storage.js'
/*
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'
*/

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
            mostrarErro('Por favor, corrija o seu username antes de enviar o formulário de cadastro.')
            return null
        } else {
            handleCadastro();
        }
    } else if (form.id === 'form-login') {
        handleLogin();
    }
})};

export function mostrarErro(msgErro){
    // cria o container de alerta

    const container = document.createElement('div');
    container.id = 'alert-container';
    // Estiliza para ficar fixo no topo ou em algum lugar padrão
    container.className = "fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-3 pointer-events-none"; 
    document.body.appendChild(container);



    const alertDiv = document.createElement('div');
    alertDiv.className = "flex items-center justify-center gap-x-2 p-2 mb-2 text-red-800 border border-red-300 rounded-lg bg-red-50 animate-bounce-short"; // Adicionei uma animação curta
    alertDiv.role = "alert";

    // HTML interno (Ícone + Mensagem)
    alertDiv.innerHTML = `
    <span class="material-symbols-outlined !text-2xl text-red">
        error
    </span>
    <div>
        <span class="font-medium"> Erro: ${msgErro}</span>
    </div>
    `;

    // limpa alertas anteriores antes de mostrar o novo
    container.innerHTML = '';
    container.appendChild(alertDiv);

    // remove o alerta após 3 segundos
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
        mostrarErro('Faça login para enviar seu feedback!');
        window.location.href = '/pages/login/';
        return null;
    }
}

// função para lidar com o feedback dos usuários
async function handleFeedback(email) {
    const formFeedback = document.getElementById('feedback');
    const camposFeedback = document.getElementById('hidden-feedback');
    const btnFeedback = document.getElementById('btn-feedback');
    const msgFeedback = document.getElementById('msg-feedback');
    const submitFeedback = document.getElementById('submit-feedback');

    if (camposFeedback.style.display === 'none' || camposFeedback.style.display === '') {
        camposFeedback.style.display = 'block';
    } else {
        camposFeedback.style.display = 'none';
    } if (btnFeedback && msgFeedback && submitFeedback && formFeedback) {
        formFeedback.addEventListener('submit', (e) => {
            e.preventDefault();
            if (msgFeedback.value.trim() === '' &&  (msgFeedback.value.length < 10 || msgFeedback.value.length > 500)) {
                return;
            } else {
                const confirmar = confirm('Tem certeza que deseja enviar seu feedback?');
                if (confirmar) {
                    setStorage(email, msgFeedback.value);
                    mostrarErro('Feedback enviado com sucesso! Agradecemos por compartilhar sua opinião conosco.');
                    msgFeedback.value = '';
                    camposFeedback.style.display = 'none';
                }
            } 
        });
    }
};
function visibilidadeSenha() {
    // verifica se existe algum dos formulários na página
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
    .select('*');

    if (error || !posts) {
        console.error(error);
    }
    
    

    const htmlGerado = posts.map(post => {
        const imagemPostHtml = post.imagem_url 
                ? `<div class="mt-3 overflow-hidden rounded-lg border border-gray-100">
                    <img src="${post.imagem_url}" alt="Imagem do post" class="w-full object-cover max-h-96">
                </div>` 
                : ``;

        const temGithub = post.autor_github;
        const avatarUrl = temGithub 
        ? `<img src="https://avatars.githubusercontent.com/${post.autor_github}" alt="Foto de ${post.autor_nome}" class="w-10 h-10 object-cover rounded-full">` 
        : `<svg class="w-10 h-10">
            <use href="/src/assets/icons.svg#profile"></use>
            </svg>`;
        const dataFormatada = new Date(post.post_data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        });

        return `
            <div id="post-${post.post_id}" class="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        ${avatarUrl}
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 leading-none">${post.autor_nome}</h3>
                            <span class="text-[11px] text-gray-400">${dataFormatada}</span>
                        </div>
                    </div>
                    
                    <span class="px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-wider"
                        style="background-color: color-mix(in srgb, ${post.tag_cor}, transparent 80%); color: ${post.tag_cor}">
                        ${post.tag_nome}
                    </span>
                </div>

                <div class="post-content">
                    <p class="text-gray-700 leading-relaxed">${post.post_conteudo}</p>
                </div>
                ${imagemPostHtml}

                <div class="flex items-center gap-6 mt-5 pt-4 border-t border-gray-50">
                    
                    <button class="btn-curtir flex items-center gap-1.5 group transition" data-id="${post.post_id}">
                        <span class="material-symbols-outlined text-[22px] text-gray-400 group-hover:text-red-500 transition">
                            favorite
                        </span>
                        <span class="text-sm font-semibold text-gray-500">${post.quantidade_curtidas}</span>
                    </button>

                    <button class="btn-comentarios flex items-center gap-1.5 group transition" data-id="${post.post_id}">
                        <span class="material-symbols-outlined text-[22px] text-gray-400 group-hover:text-blue-500 transition">
                            comment
                        </span>
                        <span class="text-sm font-semibold text-gray-500">${post.quantidade_comentarios}</span>
                    </button>

                </div>
            </div>`;
    }).join('');
    
    container.innerHTML = htmlGerado;

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
});

btnCadastro?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-cadastro'));
});

btnLogin?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-login'));
});


document.getElementById('btn-feedback')?.addEventListener('click', async () => {
    const email = await getEmail();
    if (email !== null) {
        handleFeedback(email);
    }
});