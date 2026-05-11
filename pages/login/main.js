import { mostrarErro } from '../../src/main';
import { supabase } from '/src/supabaseClient.js'

export const btnLogin = document.getElementById('btn-login');
export async function handleLogin() {

    const form = document.querySelector('#form-login')
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner')

        // Desativa e altera visual
    btnLogin.disabled = true;
    btnLogin.classList.add('opacity-80');

    // Troca texto por ícone
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');


    function voltarBotao() {
        btnLogin.disabled = false;
        btnLogin.classList.remove('opacity-80');
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
    }
    const dados = new FormData(form);
    const email = dados.get('email');
    const senha = dados.get('senha');   

    // fazendo login do usuário
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
    })

    // verificando se errou o login ou outro erro
    if (error) {
        if (error.message.includes("Invalid login credentials")) {
            mostrarErro("Credenciais inválidas");
            voltarBotao();
        } else {
            mostrarErro("Erro ao entrar: " + error.message);
            voltarBotao();
        }
        return
    }

    if (data.user) {
        window.location.href = '/';
    }
}
/*
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancel-password');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const passwordForm = document.getElementById('passwordForm');

const openModal = () => {
    modalOverlay.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
};

const closeModal = () => {
    modalOverlay.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    passwordForm.reset();
};

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModal();
});

passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
}); */