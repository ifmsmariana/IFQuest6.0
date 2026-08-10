const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) location.href = "login.html";

async function carregar() {
    const resposta = await fetch(`/api/estatisticas/${usuario.id}`);
    const dados = await resposta.json();
    if (!resposta.ok) return alert(dados.erro || "Não foi possível carregar as estatísticas.");

    document.getElementById("resumo").innerHTML = `
        <div class="stat-card"><span>🎯</span><strong>${dados.total.acertos}</strong><small>Acertos</small></div>
        <div class="stat-card"><span>📚</span><strong>${dados.total.perguntas}</strong><small>Perguntas respondidas</small></div>
        <div class="stat-card"><span>📝</span><strong>${dados.total.quizzes}</strong><small>Quizzes</small></div>
        <div class="stat-card"><span>📈</span><strong>${dados.total.aproveitamento}%</strong><small>Aproveitamento geral</small></div>
    `;

    const lista = document.getElementById("listaEstatisticas");
    if (!dados.materias.length) {
        lista.innerHTML = '<div class="empty-state">Você ainda não respondeu quizzes suficientes para gerar estatísticas.</div>';
        return;
    }

    lista.innerHTML = dados.materias.sort((a,b) => b.aproveitamento - a.aproveitamento).map(m => `
        <article class="materia-stat">
            <div class="materia-stat-top"><strong>${escapeHtml(m.materia)}</strong><strong>${m.aproveitamento}%</strong></div>
            <div class="progress-track"><div class="progress-bar" style="width:${m.aproveitamento}%"></div></div>
            <div class="materia-stat-info"><span>${m.acertos} acertos de ${m.perguntas} perguntas</span><span>${m.quizzes} quiz${m.quizzes === 1 ? "" : "zes"}</span></div>
        </article>
    `).join("");
}
function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
carregar();
