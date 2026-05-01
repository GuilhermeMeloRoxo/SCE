import { supabase } from '/supabaseClient.js'

export function handleLogin() {

    const form = document.querySelector('#form-login')
    
    const email = form.querySelector('#email').value
    const senha = form.querySelector('#senha').value

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
        alert("Bem-vindo(a), " + data.user.nome)
        // redirecionando usuário para a página inicial
        window.location.href = '/';
    }
    }