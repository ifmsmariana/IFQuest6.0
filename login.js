async function login() {
    const usuario = document.getElementById("loginUser").value.trim();
    const senha = document.getElementById("loginPass").value;

    if (!usuario || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, senha })
        });
        const dados = await resposta.json();
        if (!resposta.ok) {
            alert(dados.erro || "Usuário ou senha inválidos.");
            return;
        }
        localStorage.setItem("usuarioLogado", JSON.stringify(dados));
        // Login correto entra direto, sem mensagem de sucesso.
        window.location.href = "index.html";
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor.");
    }
}

function irCadastro() { window.location.href = "cadastro.html"; }

document.getElementById("loginPass").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
});
