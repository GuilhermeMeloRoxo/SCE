import { mostrarAlerta } from '../../src/main';
import { supabase } from '../../src/supabaseClient.js'

export const btnLogin = document.getElementById('btn-login');
export async function handleLogin() {

    const form = document.querySelector('#form-login')
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner')

    btnLogin.disabled = true;
    btnLogin.classList.add('opacity-80');


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

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
    })

    if (error) {
        if (error.message.includes("Invalid login credentials")) {
            mostrarAlerta('error', "Credenciais inválidas");
            voltarBotao();
        } else {
            mostrarAlerta('error', "Erro ao entrar: " + error.message);
            voltarBotao();
        } return;

    } if (data.user) {
        mostrarAlerta('ok', 'Bem vindo(a)!')
        window.location.href = '/';
    }
}