let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) location.href = "login.html";

async function carregarPerfil() {
    const resposta = await fetch(`/api/usuarios/${usuario.id}`);
    if (!resposta.ok) return;
    usuario = await resposta.json();
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    document.getElementById("nome").innerText = usuario.usuario;
    document.getElementById("email").innerText = usuario.email ? `Email: ${usuario.email}` : "Email não informado";
    document.getElementById("campus").innerText = `Campus: ${usuario.campus || "Não informado"}`;
    document.getElementById("curso").innerText = `Curso: ${usuario.curso || "Não informado"}`;
    document.getElementById("pontos").innerText = usuario.pontos || 0;
    document.getElementById("acertos").innerText = usuario.acertos || 0;
    document.getElementById("perguntas").innerText = usuario.perguntasRespondidas || 0;
    document.getElementById("quizzes").innerText = usuario.quizzesRespondidos || 0;
}

function editarPerfil() { location.href = "editarPerfil.html"; }
function alterarSenha() { location.href = "alterarSenha.html"; }
function sair() { localStorage.removeItem("usuarioLogado"); location.href = "login.html"; }
carregarPerfil();
