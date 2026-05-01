import { handleCadastro, btnCadastro } from '/pages/cadastro/main.js';
import { handleLogin, btnLogin } from '/pages/login/main.js';
import '/src/style.css'
import { supabase } from '/src/supabaseClient.js'
/*
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'
*/
console.log("URL do Supabase:", import.meta.env.VITE_SUPABASE_URL)

async function testarConexao() {
  const { data, error } = await supabase.from('perfis').select('count', { count: 'exact', head: true })
  
  if (error) {
    console.error("Erro de conexão com Supabase:", error.message)
  } else {
    console.log("Conexão com Supabase: OK! (Tabela perfis acessível)")
  }
}

testarConexao()
// função de logout
function fazerLogout() {
    const linkLogout = document.getElementById('link-logout');
    
    if (linkLogout) {
        linkLogout.addEventListener('click', (event) => {
            event.preventDefault(); /* não deixa a página se mexer com o link # */
            
            localStorage.removeItem('id_usuario');
            sessionStorage.clear();
            
            /* redireciona pra página de login */
            window.location.href = "/pages/login";
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
            })
            .then(html => {
                idElemento.innerHTML = html;
                if (id === 'navbar') {
                    configurarMenuHamburguer();
                    fazerLogout();
                }
            })
            .catch(error => console.error(error));
    }
};

// função para lidar com os botões de cadastro e login
function handleForm(form) {
    form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    if (form.id === 'form-cadastro') {
        handleCadastro();
    }else if (form.id === 'form-login') {
        handleLogin();
    }
})};
document.addEventListener('DOMContentLoaded', () => {
    inserirHtml('navbar', '/components/navbar.html');
    inserirHtml('footer', '/components/footer.html');
});

btnCadastro?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-cadastro'));
});

btnLogin?.addEventListener('click', () => {
    handleForm(document.querySelector('#form-login'));
});
