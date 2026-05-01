import { supabase } from '/src/supabaseClient.js'

export const btnLogin = document.getElementById('btn-login');
export async function handleLogin() {

    const form = document.querySelector('#form-login')
    
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
        alert("E-mail ou senha incorretos.")
        } else {
        alert("Erro ao entrar: " + error.message)
        }
        return
    }

    if (data.user) {
        alert("Bem-vindo(a)")
        // redirecionando usuário para a página inicial
        window.location.href = '/';
    }
    }