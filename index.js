const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) location.href = "login.html";

document.getElementById("usuario").innerHTML = `👤 ${usuario.usuario} ▼`;
let salas = [];

function abrirQuiz(id) { location.href = `quiz.html?id=${id}`; }

async function carregarSalas() {
    const resposta = await fetch("/api/salas");
    salas = await resposta.json();
    mostrarSalas(salas);
}

function mostrarSalas(listaSalas) {
    const lista = document.getElementById("listaSalas");
    if (!listaSalas.length) {
        lista.innerHTML = '<div class="empty-state">Nenhuma sala encontrada.</div>';
        return;
    }

    lista.innerHTML = listaSalas.map(sala => `
        <article class="sala">
            <div class="sala-meta">
                <span class="badge">${sala.categoria || "Geral"}</span>
                <span class="badge dificuldade-${String(sala.dificuldade || "").toLowerCase()}">${sala.dificuldade || "Não definida"}</span>
            </div>
            <h3>${escapeHtml(sala.nome)}</h3>
            <p class="sala-info">❓ ${sala.perguntas.length} perguntas</p>
            <button onclick="abrirQuiz(${sala.id})">Entrar na sala →</button>
        </article>
    `).join("");
}

document.getElementById("pesquisa").addEventListener("input", e => {
    const texto = e.target.value.toLowerCase().trim();
    mostrarSalas(salas.filter(s => `${s.nome} ${s.categoria} ${s.dificuldade}`.toLowerCase().includes(texto)));
});

document.getElementById("criar").onclick = () => location.href = "criar.html";
document.getElementById("ranking").onclick = () => location.href = "ranking.html";

document.getElementById("usuario").onclick = e => {
    e.stopPropagation();
    const menu = document.getElementById("menuUsuario");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", () => document.getElementById("menuUsuario").style.display = "none");
document.getElementById("menuUsuario").onclick = e => e.stopPropagation();
document.getElementById("btnSair").onclick = () => {
    localStorage.removeItem("usuarioLogado");
    location.href = "login.html";
};

function escapeHtml(text) {
    return String(text).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

carregarSalas();
