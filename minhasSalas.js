const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) location.href = "login.html";

async function carregarMinhasSalas() {
    const resposta = await fetch(`/api/minhasSalas/${usuario.id}`);
    const salas = await resposta.json();
    mostrarSalas(salas);
}

function mostrarSalas(lista) {
    const div = document.getElementById("listaSalas");
    if (!lista.length) {
        div.innerHTML = '<div class="empty-state">Você ainda não criou nenhuma sala.</div>';
        return;
    }

    div.innerHTML = lista.map(sala => `
        <article class="sala">
            <div class="sala-meta"><span class="badge">${escapeHtml(sala.categoria)}</span><span class="badge">${escapeHtml(sala.dificuldade)}</span></div>
            <h3>${escapeHtml(sala.nome)}</h3>
            <p class="sala-info">❓ ${sala.perguntas.length} perguntas</p>
            <div class="button-group">
                <button onclick="editarSala(${sala.id})">✏ Editar</button>
                <button onclick="abrirQuiz(${sala.id})">▶ Testar</button>
                <button class="danger-action" onclick="excluirSala(${sala.id})">🗑 Excluir</button>
            </div>
        </article>
    `).join("");
}

function abrirQuiz(id) { location.href = `quiz.html?id=${id}`; }
function editarSala(id) { location.href = `editarSala.html?id=${id}`; }

async function excluirSala(id) {
    if (!confirm("Deseja excluir esta sala?")) return;
    const resposta = await fetch(`/api/salas/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuarioId: usuario.id }) });
    const dados = await resposta.json();
    if (!resposta.ok) return alert(dados.erro || "Não foi possível excluir a sala.");
    carregarMinhasSalas();
}

function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
carregarMinhasSalas();
