import { supabase } from '../../src/supabaseClient.js'
import { mostrarAlerta } from '../../src/main.js'

export const btnCadastro = document.getElementById('btn-cadastro');

// icones para o campo dinâmico username
const SPINNER_HTML = `
    <svg class="animate-spin h-[18px] w-[18px] text-[#a0a0a0]" fill="none">
        <use href="/icons.svg#carregando"></use>
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
        mostrarAlerta('error', "Por favor, escolha um username válido e disponível antes de prosseguir.")
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
        mostrarAlerta('error', "Erro ao validar dados do formulário.");
        return;
    }

    if (cpfExiste) {
        mostrarAlerta('error', "Erro: Este CPF já está cadastrado em nosso sistema.");
        const cpfInput = document.getElementById('input-cpf');
        if (cpfInput) cpfInput.focus();
        return;
    }
    
    try {
      // 1. Cadastra a conta de autenticação enviando dados extras nos metadados
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, // Enviado para o Trigger para ler e salvar em 'dados_privados'
        password: senha,
        options: {
          data: {
            username: username, // Enviado para a Trigger ler e salvar em 'perfis'
            nome: nome,         // Enviado para a Trigger ler e salvar em 'perfis'
            cpf: cpf            // Enviado para a Trigger ler e salvar em 'dados_privados'
          }
        }
      })
    
      if (authError) {
        if (authError.message.includes("already registered")) {
          mostrarAlerta('error', "Erro: Este e-mail já está em uso.")
        } else {
          mostrarAlerta('error', "Erro no cadastro: " + authError.message)
        }
        voltarBotao()
        return
      }
    
      // 2. Se chegou aqui, as Triggers do banco já criaram o perfil e os dados privados de forma segura!
      if (authData.user) {
        window.location.href = "/pages/login/"
      }
    
    } catch (error) {
      console.error(error)
      mostrarAlerta('error', "Ocorreu um erro inesperado ao processar o formulário.")
      voltarBotao()
    }
  }
