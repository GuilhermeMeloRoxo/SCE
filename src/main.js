import { handleCadastro, btnCadastro } from '/pages/cadastro/main.js';
import { handleLogin, btnLogin } from '/pages/login/main.js';
import { renderizarPerfil, renderizarBotãoGithub, conectarGithub } from '/pages/perfil/main.js';
import '/src/style.css'
import 'material-symbols';
import { supabase } from '/src/supabaseClient.js'
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
    const icon = document.getElementById('icon-hamburguer');
    
    if (btnHamburger && navMenu) {
        btnHamburger.addEventListener('click', () => { 
            const isOpened = navMenu.classList.toggle('hidden');
            navMenu.classList.toggle('flex');

            // Se 'isOpened' for falso (menu visível), coloca o ícone de fechar
            if (!isOpened) {
                icon.textContent = 'close';
            } else {
                icon.textContent = 'menu';
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
            })
            .then(html => {
                idElemento.innerHTML = html;
                if (id === 'navbar') {
                    configurarMenuHamburguer();
                    fazerLogout();
                }
            })
            .catch(error => console.error(error));
    }
};

// função para lidar com os botões de cadastro e login
function handleForm(form) {
    form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    if (form.id === 'form-cadastro') {
        handleCadastro();
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

// função para lidar com o feedback dos usuários
async function handleFeedback() {
    const formFeedback = document.getElementById('feedback');
    const camposFeedback = document.getElementById('hidden-feedback');
    const btnFeedback = document.getElementById('btn-feedback');
    const msgFeedback = document.getElementById('msg-feedback');
    const submitFeedback = document.getElementById('submit-feedback');
    if (camposFeedback.style.display === 'none' || camposFeedback.style.display === '') {
        camposFeedback.style.display = 'block';
    } else {
        camposFeedback.style.display = 'none';
    }
    async function getEmail() {
        const { data, error } = await supabase.auth.getUser();
        if (data.user) {
            return data.user.email;
        } if (error) {
            mostrarErro('Faça login para enviar seu feedback!');
            window.location.href = '/pages/login/';
        }
    } const email = await getEmail();
    if (btnFeedback && msgFeedback && submitFeedback && formFeedback) {
        formFeedback.addEventListener('submit', (e) => {
            e.preventDefault();
            if (msgFeedback.value.length < 10 || msgFeedback.value.length > 500) {
                mostrarErro('Por favor, escreva uma mensagem com no mínimo 10 caracteres e no máximo 500.');
            } else {
                localStorage.setItem(email, JSON.stringify(msgFeedback.value));
                mostrarErro('Feedback enviado com sucesso! Agradecemos por compartilhar sua opinião conosco.');
                msgFeedback.value = '';
                camposFeedback.style.display = 'none';
            }
        });
    }
};

// carregando funções a partir daqui
document.addEventListener('DOMContentLoaded', () => {
    verificarUsuarioLogado();
    inserirHtml('navbar', '/components/navbar.html');
    inserirHtml('footer', '/components/footer.html');
    renderizarPerfil();
});

btnCadastro?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-cadastro'));
});

btnLogin?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-login'));
});

document.getElementById('btn-feedback')?.addEventListener('click', () => {
    handleFeedback();
});