const parametros = new URLSearchParams(location.search);
const id = parametros.get("id");
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
let sala;
let indice = 0;
let pontos = 0;
let resultados = [];
let timerId = null;
let finalizado = false;
let modoTeste = false;

if (!usuario) location.href = "login.html";

async function carregarQuiz() {
    const resposta = await fetch(`/api/salas/${id}`);
    if (!resposta.ok) return location.href = "index.html";
    sala = await resposta.json();
    modoTeste = Number(sala.usuarioId) === Number(usuario.id);

    document.getElementById("tituloSala").innerText = sala.nome;
    document.getElementById("materiaQuiz").innerText = sala.categoria || "Geral";
    if (modoTeste) document.getElementById("tituloSala").insertAdjacentHTML("afterend", '<span class="modo-teste">Modo teste — não gera pontos</span>');
    mostrarPergunta();
}

function mostrarPergunta() {
    limparTimer();
    if (indice >= sala.perguntas.length) return finalizar();

    const pergunta = sala.perguntas[indice];
    document.getElementById("numeroPergunta").innerText = `Pergunta ${indice + 1}`;
    document.getElementById("contadorQuiz").innerText = `${indice + 1} / ${sala.perguntas.length}`;
    document.getElementById("progressBar").style.width = `${((indice + 1) / sala.perguntas.length) * 100}%`;
    document.getElementById("pergunta").innerText = pergunta.texto;

    const alternativas = document.getElementById("alternativas");
    const letras = ["A", "B", "C", "D"];
    alternativas.innerHTML = pergunta.alternativas.map((alt, i) => `
        <button class="quiz-alternativa" onclick="responder(${i})"><span>${letras[i]}</span>${escapeHtml(alt)}</button>
    `).join("");

    iniciarTimer(pergunta.tempo || 0);
}

function iniciarTimer(segundos) {
    const timer = document.getElementById("timer");
    if (!segundos) {
        timer.innerText = "Sem limite de tempo";
        timer.className = "timer sem-limite";
        return;
    }

    let restante = segundos;
    atualizarTimer(restante);
    timerId = setInterval(() => {
        restante--;
        atualizarTimer(restante);
        if (restante <= 0) {
            limparTimer();
            responder(null, true);
        }
    }, 1000);
}

function atualizarTimer(segundos) {
    const timer = document.getElementById("timer");
    timer.innerText = `⏱ ${segundos}s`;
    timer.className = `timer ${segundos <= 5 ? "timer-alerta" : ""}`;
}

function limparTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
}

function responder(resposta, expirou = false) {
    if (finalizado) return;
    limparTimer();

    const pergunta = sala.perguntas[indice];
    const correta = Number(pergunta.correta);
    const acertou = resposta !== null && Number(resposta) === correta;
    if (acertou) pontos++;

    resultados.push({
        pergunta: pergunta.texto,
        alternativas: pergunta.alternativas,
        resposta: resposta,
        correta,
        acertou,
        expirou
    });

    indice++;
    mostrarPergunta();
}

async function finalizar() {
    if (finalizado) return;
    finalizado = true;
    limparTimer();

    let pontuacaoTotal = usuario.pontos || 0;
    let dadosPontuacao = null;

    if (!modoTeste) {
        const resposta = await fetch("/api/pontuar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuarioId: usuario.id,
                salaId: sala.id,
                acertos: pontos,
                perguntas: sala.perguntas.length,
                categoria: sala.categoria
            })
        });
        dadosPontuacao = await resposta.json();
        if (resposta.ok) {
            pontuacaoTotal = dadosPontuacao.pontos;
            if (dadosPontuacao.usuario) localStorage.setItem("usuarioLogado", JSON.stringify(dadosPontuacao.usuario));
        }
    }

    const erradas = resultados.filter(r => !r.acertou);
    document.querySelector(".quiz-page").innerHTML = `
        <section class="resultado-card">
            <div class="resultado-icon">${pontos === sala.perguntas.length ? "🎉" : "📚"}</div>
            <span class="eyebrow">Quiz finalizado</span>
            <h1>${pontos} de ${sala.perguntas.length} acertos</h1>
            <div class="resultado-percentual">${Math.round((pontos / sala.perguntas.length) * 100)}%</div>
            ${modoTeste ? '<p class="modo-teste">Modo teste: sua pontuação e suas estatísticas não foram alteradas.</p>' : `<p>⭐ Pontuação total: <strong>${pontuacaoTotal}</strong></p>`}
            ${erradas.length ? `
                <div class="revisao-erros">
                    <h2>Questões que você errou</h2>
                    ${erradas.map((r, i) => `
                        <article class="erro-card">
                            <strong>${i + 1}. ${escapeHtml(r.pergunta)}</strong>
                            <p>Sua resposta: <span class="resposta-errada">${r.resposta === null ? "Não respondeu (tempo esgotado)" : escapeHtml(r.alternativas[r.resposta])}</span></p>
                            <p>Resposta correta: <span class="resposta-correta">${escapeHtml(r.alternativas[r.correta])}</span></p>
                        </article>
                    `).join("")}
                </div>
            ` : '<div class="acerto-total">✓ Você acertou todas as perguntas!</div>'}
            <button class="botao" onclick="location.href='index.html'">Voltar para Home</button>
        </section>
    `;
}

function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }

carregarQuiz();
