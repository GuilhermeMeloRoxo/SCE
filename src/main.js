import { handleCadastro, btnCadastro, iniciarValidacao, isUsernameValid } from '../pages/cadastro/main.js';
import { handleLogin, btnLogin } from '../pages/login/main.js';
import { renderizarPerfil } from '../pages/perfil/main.js';
import { dadosPerfil } from '../pages/perfil/editar/main.js';
import './style.css'
import { supabase } from './supabaseClient.js'
import { setStorage } from './lib/storage.js'

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