async function cadastrar() {

    let email = document.getElementById("email").value;
    let usuario = document.getElementById("novoUser").value;
    let senha = document.getElementById("senha").value;
    let campus = document.getElementById("campus").value;
    let curso = document.getElementById("curso").value;

    if (email == "" || usuario == "" || senha == "" || campus == "" || curso == "") {
        alert("Preencha todos os campos!");
        return;
    }

    if (!email.toLowerCase().includes("ifms")) {
        alert("O e-mail deve conter IFMS.");
        return;
    }

    if (senha.length < 4) {
        alert("A senha deve ter pelo menos 4 caracteres.");
        return;
    }

    try {

        const resposta = await fetch("/api/cadastro", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                usuario: usuario,
                email: email,
                senha: senha,
                campus: campus,
                curso: curso

            })

        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return;
        }

        alert(dados.mensagem);

        window.location.href = "login.html";

    } catch (erro) {

        alert("Erro ao conectar com o servidor.");

        console.error(erro);

    }

}

/* voltar pro login */
function voltar() {
    window.location.href = "login.html";
}