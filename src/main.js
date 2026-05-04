import { handleCadastro, btnCadastro } from '/pages/cadastro/main.js';
import { handleLogin, btnLogin } from '/pages/login/main.js';
import { renderizarPerfil, renderizarBotãoGithub, conectarGithub } from '/pages/perfil/main.js';
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
                alert("Logout realizado com sucesso!");
                window.location.href = '/pages/login/';
            }
        });
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
                }
            }).catch(error => console.error(error));
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

// função para obter o email do usuário logado
async function getEmail() {
        const { data, error } = await supabase.auth.getUser();

        if (data.user) {
            return data.user.email;
        } if (error) {
            alert('Faça login para enviar seu feedback!');
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
            if (msgFeedback.value.trim() === '' ||  msgFeedback.value.length < 10 || msgFeedback.value.length > 500) {
                alert('Por favor, escreva uma mensagem com no mínimo 10 caracteres e no máximo 500.');
            } else {
                const confirmar = confirm('Tem certeza que deseja enviar seu feedback?');
                if (confirmar) {
                    setStorage(email, msgFeedback.value);
                    alert('Feedback enviado com sucesso! Agradecemos por compartilhar sua opinião conosco.');
                    msgFeedback.value = '';
                    camposFeedback.style.display = 'none';
                }
            } 
        });
    }
};

// carregando funções a partir daqui
document.addEventListener('DOMContentLoaded', () => {
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

document.getElementById('btn-feedback')?.addEventListener('click', async () => {
    const email = await getEmail();
    if (email !== null) {
        handleFeedback(email);
    }
});