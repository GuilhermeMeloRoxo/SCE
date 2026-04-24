/* função de logout */
function fazerLogout() {
    const linkLogout = document.getElementById('link-logout');
    
    if (linkLogout) {
        linkLogout.addEventListener('click', (event) => {
            event.preventDefault(); /* não deixa a página se mexer com o link # */
            
            localStorage.removeItem('id_usuario');
            sessionStorage.clear();
            
            /* redireciona pra página de login */
            window.location.href = "/login.html";
        });
    }
}

/* função para ativar o menu hamburguer */
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

/* função para adicionar os componentes html (barra de navegação, footer, etc) */
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
}

document.addEventListener('DOMContentLoaded', () => {
    inserirHtml('navbar', '/components/navbar.html');
    inserirHtml('footer', '/components/footer.html');
});