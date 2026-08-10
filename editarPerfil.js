let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) location.href = "login.html";
const $ = id => document.getElementById(id);

$("usuario").value = usuario.usuario || "";
$("email").value = usuario.email || "";
$("campus").value = usuario.campus || "";
$("curso").value = usuario.curso || "";

$("salvar").onclick = async () => {
    const resposta = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: $("usuario").value, email: $("email").value, campus: $("campus").value, curso: $("curso").value })
    });
    const dados = await resposta.json();
    if (!resposta.ok) return alert(dados.erro || "Não foi possível atualizar o perfil.");
    localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));
    location.href = "perfil.html";
};
