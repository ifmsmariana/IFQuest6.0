const id = new URLSearchParams(location.search).get("id");
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
let sala;
let perguntas = [];
let editando = -1;
const $ = id => document.getElementById(id);

if (!usuario) location.href = "login.html";
if (!id) location.href = "minhasSalas.html";

async function carregar() {
    const resposta = await fetch(`/api/salas/${id}`);
    if (!resposta.ok) return location.href = "minhasSalas.html";
    sala = await resposta.json();

    if (Number(sala.usuarioId) !== Number(usuario.id)) {
        alert("Você só pode editar salas que criou.");
        return location.href = "minhasSalas.html";
    }

    $("nomeSala").value = sala.nome;
    $("categoria").value = sala.categoria;
    $("dificuldade").value = sala.dificuldade;
    perguntas = (sala.perguntas || []).map(p => ({ ...p, tempo: Number(p.tempo) || 0 }));
    atualizarLista();
}

function limpar() {
    ["pergunta", "alt1", "alt2", "alt3", "alt4"].forEach(id => $(id).value = "");
    $("tempo").value = "0";
    document.querySelectorAll('input[name="correta"]').forEach(r => r.checked = false);
}

function atualizarLista() {
    $("contadorPerguntas").textContent = perguntas.length;
    const letras = ["A", "B", "C", "D"];
    $("listaPerguntas").innerHTML = perguntas.length ? perguntas.map((p, i) => `
        <article class="perguntaCard">
            <div class="pergunta-topo"><strong>${i + 1}. ${escapeHtml(p.texto)}</strong><span class="badge">${p.tempo > 0 ? `⏱ ${p.tempo}s` : "⏱ Sem limite"}</span></div>
            <p>A) ${escapeHtml(p.alternativas[0])}</p><p>B) ${escapeHtml(p.alternativas[1])}</p><p>C) ${escapeHtml(p.alternativas[2])}</p><p>D) ${escapeHtml(p.alternativas[3])}</p>
            <div class="pergunta-footer"><span class="correta">✓ Correta: ${letras[p.correta]}</span><div><button class="botao pequeno" onclick="editarPergunta(${i})">✏ Editar</button><button class="botao pequeno perigo" onclick="excluirPergunta(${i})">🗑 Excluir</button></div></div>
        </article>`).join("") : '<div class="empty-state">Nenhuma pergunta adicionada.</div>';
}

$("adicionarPergunta").onclick = () => {
    const texto = $("pergunta").value.trim();
    const alternativas = [$("alt1").value.trim(), $("alt2").value.trim(), $("alt3").value.trim(), $("alt4").value.trim()];
    const radio = document.querySelector('input[name="correta"]:checked');
    const tempo = Number($("tempo").value);
    if (!texto || alternativas.some(a => !a)) return alert("Preencha a pergunta e as quatro alternativas.");
    if (!radio) return alert("Escolha a resposta correta.");
    if (!Number.isFinite(tempo) || tempo < 0) return alert("O tempo deve ser 0 ou positivo.");
    const p = { texto, alternativas, correta: Number(radio.value), tempo };
    if (editando === -1) perguntas.push(p); else { perguntas[editando] = p; editando = -1; $("adicionarPergunta").textContent = "➕ Adicionar pergunta"; }
    limpar(); atualizarLista();
};

function editarPergunta(i) {
    const p = perguntas[i];
    $("pergunta").value = p.texto; $("alt1").value = p.alternativas[0]; $("alt2").value = p.alternativas[1]; $("alt3").value = p.alternativas[2]; $("alt4").value = p.alternativas[3]; $("tempo").value = p.tempo || 0;
    document.querySelector(`input[name="correta"][value="${p.correta}"]`).checked = true;
    editando = i; $("adicionarPergunta").textContent = "💾 Atualizar pergunta";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluirPergunta(i) { if (confirm("Deseja excluir esta pergunta?")) { perguntas.splice(i, 1); atualizarLista(); } }

$("salvarSala").onclick = async () => {
    const nome = $("nomeSala").value.trim();
    if (!nome) return alert("O nome da sala é obrigatório.");
    if (!perguntas.length) return alert("A sala precisa ter pelo menos uma pergunta.");

    const resposta = await fetch(`/api/salas/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, nome, categoria: $("categoria").value, dificuldade: $("dificuldade").value, perguntas })
    });
    const dados = await resposta.json();
    if (!resposta.ok) return alert(dados.erro || "Não foi possível salvar as alterações.");
    location.href = "minhasSalas.html";
};

function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
carregar();
