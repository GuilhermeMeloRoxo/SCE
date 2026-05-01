import { supabase } from '/supabaseClient.js'


export function handleCadastro() {
    
    const form = document.querySelector('#form-cadastro')
    
    const nome = form.querySelector('#nome').value
    const email = form.querySelector('#email').value
    const cpf = form.querySelector('#cpf').value
    const senha = form.querySelector('#senha').value
    
    try {
         // verificando se o cpf já está cadastrado
        const { data: cpfExistente, error: erroCpf } = await supabase
        .from('perfis')
        .select('cpf')
        .eq('cpf', cpf)
        .single()

        if (cpfExistente) {
        alert("Erro: Este CPF já está cadastrado em nosso sistema.")
        return
        }

    
        // cadastrando usuário no auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
        })

        if (authError) {
            if (authError.message.includes("already registered")) {
                alert("Erro: Este e-mail já está em uso.")
            } else {
                alert("Erro no cadastro: " + authError.message)
            }
            return
        }
        if (authData.user) {
        const { error: dbError } = await supabase
            .from('perfis')
            .insert([{ id: authData.user.id, nome, email, cpf }])

        if (dbError) throw dbError
        
        alert("Cadastro realizado com sucesso!")
        }

    } catch (error) {
        console.error(error)
        alert("Ocorreu um erro inesperado.")
    }
}

