import { supabase } from '/src/supabaseClient.js'
import { mostrarErro } from '/src/main.js'

export const btnCadastro = document.getElementById('btn-cadastro');
export async function handleCadastro() {
    
    const form = document.querySelector('#form-cadastro')
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner')

      // Desativa e altera visual
    btnCadastro.disabled = true;
    btnCadastro.classList.add('opacity-80');

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
    const nome = dados.get('nome');
    const email = dados.get('email');
    const cpf = dados.get('cpf');
    const senha = dados.get('senha');
    
    try {
         // verificando se o cpf já está cadastrado
        const { data: cpfExistente, error: erroCpf } = await supabase
        .from('perfis')
        .select('cpf')
        .eq('cpf', cpf)
        .single()

        if (cpfExistente) {
        mostrarErro("Erro: Este CPF já está cadastrado em nosso sistema.")
        voltarBotao();
        return
        }

    
        // cadastrando usuário no auth do supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
        })

        // verificando se o email já está sendo usado ou outro erro
        if (authError) {
            if (authError.message.includes("already registered")) {
                mostrarErro("Erro: Este e-mail já está em uso.")
                voltarBotao();
            } else {
                mostrarErro("Erro no cadastro: " + authError.message)
                voltarBotao();
            }
            return
        }
        // adicionando perfil do usuário na tabela 'perfis' do supabase
        if (authData.user) {
        const { error: dbError } = await supabase
            .from('perfis')
            .insert([{ id: authData.user.id, nome, email, cpf }])

        if (dbError) throw dbError
        
        window.location.href = '/pages/login/';
        }

    } catch (error) {
        console.error(error)
        mostrarErro("Ocorreu um erro inesperado.")
    }
}

