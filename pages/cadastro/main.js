import { supabase } from '/src/supabaseClient.js'
import { mostrarErro } from '/src/main.js'

export const btnCadastro = document.getElementById('btn-cadastro');

// icones para o campo dinâmico username
const SPINNER_HTML = `
    <svg class="animate-spin h-[18px] w-[18px] text-[#a0a0a0]" fill="none">
        <use href="/src/assets/icons.svg#carregando"></use>
    </svg>
`;
const SUCCESS_HTML = `<span class="material-symbols-outlined hidden text-emerald-500 font-bold text-xl">check_circle</span>`;
const ERROR_HTML = `<span class="hidden material-symbols-outlined text-red-500 font-bold text-xl">cancel</span>`;

let debounceTimer
let usernameValido = false

export function iniciarValidacao() {
  const usernameInput = document.getElementById('input-username');
  const iconsContainer = document.getElementById('icons-username');

  if (!usernameInput || !iconsContainer) return

  // injetar o ícone passado como parâmetro
  function exibirIcone(htmlConteudo) {
    iconsContainer.innerHTML = htmlConteudo
    iconsContainer.classList.remove('hidden')
  }

  // esconder o container de ícones
  function ocultarContainer() {
    iconsContainer.innerHTML = ''
    iconsContainer.classList.add('hidden')
  }

  // verificar se tem o número de caracteres mínimos
  async function verificarUsername(username) {
    if (!username || username.length < 3) {
      exibirIcone(ERROR_HTML)
      usernameValido = false
      return
    }

    exibirIcone(SPINNER_HTML)

    try {
      const { error, count } = await supabase
        .from('perfis')
        .select('username', { count: 'exact', head: true })
        .ilike('username', username) //compara ambos usernames com ambos em minúsculas

      if (error) throw error
      if (count > 0) {
        exibirIcone(ERROR_HTML)
        usernameValido = false
      } else {
        exibirIcone(SUCCESS_HTML)
        usernameValido = true
      }
    } catch (error) {
      console.error('Erro ao validar username:', error.message)
      exibirIcone(ERROR_HTML)
      usernameValido = false
    }
  }

  usernameInput.addEventListener('input', (event) => {
    let usernameMinusculo = event.target.value.toLowerCase();
    event.target.value = usernameMinusculo

    clearTimeout(debounceTimer)
    usernameValido = false

    if (!usernameMinusculo) {
      ocultarContainer()
      return
    }

    exibirIcone(SPINNER_HTML)

    debounceTimer = setTimeout(() => {
      verificarUsername(usernameMinusculo)
    }, 500)
  })
}

// retoran true ou false para saber se o formulário pode ser enviado ou nao
export function isUsernameValid() {
  return usernameValido
}

export async function handleCadastro() {
    
    const form = document.querySelector('#form-cadastro')
    const btnText = document.getElementById('btn-text')
    const btnSpinner = document.getElementById('btn-spinner')

    // 1. Bloqueia o envio imediatamente se o validador dinâmico estiver falso
    if (!isUsernameValid()) {
        const usernameInput = document.getElementById('input-username')
        if (usernameInput) usernameInput.focus()
        mostrarErro("Por favor, escolha um username válido e disponível antes de prosseguir.")
        return
    }

    // Altera o estado visual do botão para carregamento
    if (btnCadastro) {
        btnCadastro.disabled = true
        btnCadastro.classList.add('opacity-80')
    }
    if (btnText) btnText.classList.add('hidden')
    if (btnSpinner) btnSpinner.classList.remove('hidden')

    function voltarBotao() {
        if (btnCadastro) {
            btnCadastro.disabled = false
            btnCadastro.classList.remove('opacity-80')
        }
        if (btnText) btnText.classList.remove('hidden')
        if (btnSpinner) btnSpinner.classList.add('hidden')
    }

    const dados = new FormData(form)
    const nome = dados.get('nome')
    const username = dados.get('username')
    const email = dados.get('email')
    const cpf = dados.get('cpf')
    const senha = dados.get('senha')

    const { data: cpfExiste, error: erroCpf } = await supabase
    .rpc('verificar_cpf_existente', { cpf_teste: cpf });

    if (erroCpf) {
        console.error(erroCpf);
        mostrarErro("Erro ao validar dados do formulário.");
        return;
    }

    if (cpfExiste) {
        mostrarErro("Erro: Este CPF já está cadastrado em nosso sistema.");
        const cpfInput = document.getElementById('input-cpf');
        if (cpfInput) cpfInput.focus();
        return;
    }
    
    try {
        // cadastra a conta de autenticação no auth.users do Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
        })

        if (authError) {
            if (authError.message.includes("already registered")) {
                mostrarErro("Erro: Este e-mail já está em uso.")
            } else {
                mostrarErro("Erro no cadastro: " + authError.message)
            }
            voltarBotao()
            return
        }

        if (authData.user) {
            const usuarioId = authData.user.id

            // inserindo dados públicos na tabela 'perfis'
            const { error: dbPerfilError } = await supabase
                .from('perfis')
                .insert([{ 
                    id: usuarioId, 
                    username, 
                    nome 
                }])

            if (dbPerfilError) {
                if (dbPerfilError.message.includes("duplicate key")) {
                    mostrarErro("Erro: Este username acabou de ser escolhido por outro usuário!")
                } else {
                    mostrarErro("Erro ao salvar perfil público: " + dbPerfilError.message)
                }
                voltarBotao()
                return
            }

            // inserindo dados sensíveis na tabela restrita 'dados_privados'
            // função no supabase vai criptografar o cpf
            const { error: dbPrivadoError } = await supabase
                .from('dados_privados')
                .insert([{ 
                    id: usuarioId, 
                    email, 
                    cpf 
                }])

            if (dbPrivadoError) {
                // Caso ocorra um erro incomum aqui, tentamos alertar o desenvolvedor
                console.error("Erro na tabela privada:", dbPrivadoError)
                mostrarErro("Erro ao salvar dados privados de segurança.")
                voltarBotao()
                return
            }
            
            // Sucesso absoluto nas duas tabelas encaminha para o login
            window.location.href = '/pages/login/'
        }

    } catch (error) {
        console.error(error)
        mostrarErro("Ocorreu um erro inesperado ao processar o formulário.")
        voltarBotao()
    }
}

