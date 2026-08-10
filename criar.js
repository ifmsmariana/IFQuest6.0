let perguntas = [];
let editando = -1;

const $ = id => document.getElementById(id);

function limparCampos() {
    ["pergunta", "alt1", "alt2", "alt3", "alt4"].forEach(id => $(id).value = "");
    $("tempo").value = "0";
    document.querySelectorAll('input[name="correta"]').forEach(r => r.checked = false);
}

function atualizarLista() {
    const lista = $("listaPerguntas");
    $("contadorPerguntas").textContent = perguntas.length;

    if (!perguntas.length) {
        lista.innerHTML = '<div class="empty-state">Nenhuma pergunta adicionada ainda.</div>';
        return;
    }

    const letras = ["A", "B", "C", "D"];
    lista.innerHTML = perguntas.map((p, i) => `
        <article class="perguntaCard">
            <div class="pergunta-topo">
                <strong>${i + 1}. ${escapeHtml(p.texto)}</strong>
                <span class="badge">${p.tempo > 0 ? `⏱ ${p.tempo}s` : "⏱ Sem limite"}</span>
            </div>
            <p>A) ${escapeHtml(p.alternativas[0])}</p>
            <p>B) ${escapeHtml(p.alternativas[1])}</p>
            <p>C) ${escapeHtml(p.alternativas[2])}</p>
            <p>D) ${escapeHtml(p.alternativas[3])}</p>
            <div class="pergunta-footer">
                <span class="correta">✓ Correta: ${letras[p.correta]}</span>
                <div>
                    <button class="botao pequeno" onclick="editarPergunta(${i})">✏ Editar</button>
                    <button class="botao pequeno perigo" onclick="excluirPergunta(${i})">🗑 Excluir</button>
                </div>
            </div>
        </article>
    `).join("");
}

function editarPergunta(indice) {
    const p = perguntas[indice];
    $("pergunta").value = p.texto;
    $("alt1").value = p.alternativas[0];
    $("alt2").value = p.alternativas[1];
    $("alt3").value = p.alternativas[2];
    $("alt4").value = p.alternativas[3];
    $("tempo").value = p.tempo || 0;
    const radio = document.querySelector(`input[name="correta"][value="${p.correta}"]`);
    if (radio) radio.checked = true;
    editando = indice;
    $("adicionarPergunta").textContent = "💾 Atualizar pergunta";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluirPergunta(indice) {
    if (!confirm("Deseja excluir esta pergunta?")) return;
    perguntas.splice(indice, 1);
    atualizarLista();
}

$("adicionarPergunta").onclick = () => {
    const texto = $("pergunta").value.trim();
    const alternativas = [$("alt1").value.trim(), $("alt2").value.trim(), $("alt3").value.trim(), $("alt4").value.trim()];
    const radio = document.querySelector('input[name="correta"]:checked');
    const tempo = Number($("tempo").value);

    if (!texto || alternativas.some(a => !a)) {
        alert("Preencha a pergunta e as quatro alternativas.");
        return;
    }
    if (!radio) {
        alert("Escolha qual alternativa é a correta.");
        return;
    }
    if (!Number.isFinite(tempo) || tempo < 0) {
        alert("O tempo deve ser 0 ou um número positivo.");
        return;
    }

    const pergunta = { texto, alternativas, correta: Number(radio.value), tempo };

    if (editando === -1) perguntas.push(pergunta);
    else {
        perguntas[editando] = pergunta;
        editando = -1;
        $("adicionarPergunta").textContent = "➕ Adicionar pergunta";
    }

    limparCampos();
    atualizarLista();
};

$("salvarSala").onclick = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) return location.href = "login.html";

    const nome = $("nomeSala").value.trim();
    if (!nome) {
        alert("Digite um nome para a sala antes de continuar.");
        $("nomeSala").focus();
        return;
    }
    if (!perguntas.length) {
        alert("Adicione pelo menos uma pergunta.");
        return;
    }

    const resposta = await fetch("/api/salas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            usuarioId: usuario.id,
            nome,
            categoria: $("categoria").value,
            dificuldade: $("dificuldade").value,
            perguntas
        })
    });

    const dados = await resposta.json();
    if (!resposta.ok) {
        alert(dados.erro || "Erro ao criar sala.");
        return;
    }

    location.href = "minhasSalas.html";
};

function escapeHtml(text) {
    return String(text).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

atualizarLista();
