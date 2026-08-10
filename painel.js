const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {

    location.href = "login.html";

}

document.getElementById("bemVindo").innerText =
    `Bem-vindo, ${usuario.usuario}!`;

function sair() {

    localStorage.removeItem("usuarioLogado");

    location.href = "login.html";

}