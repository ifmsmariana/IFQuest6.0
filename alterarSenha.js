const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) location.href = "login.html";

document.getElementById("salvar").onclick = async () => {
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    if (!senhaAtual || !novaSenha || !confirmarSenha) return alert("Preencha todos os campos.");
    if (novaSenha !== confirmarSenha) return alert("A confirmação da nova senha não confere.");

    const resposta = await fetch(`/api/usuarios/${usuario.id}/senha`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha })
    });
    const dados = await resposta.json();
    if (!resposta.ok) return alert(dados.erro || "Não foi possível alterar a senha.");
    location.href = "perfil.html";
};
