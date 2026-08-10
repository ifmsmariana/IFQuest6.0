let usuarios = [];

async function carregarUsuarios() {

    const resposta = await fetch("/api/usuarios");

    usuarios = await resposta.json();

    mostrarUsuarios();

}

// ======================
// RANKING USUÁRIOS
// ======================

function mostrarUsuarios() {

    const div = document.getElementById("ranking");

    div.innerHTML = "";

    usuarios.sort((a, b) => b.pontos - a.pontos);

    usuarios.forEach((u, i) => {

        div.innerHTML += `

        <div class="sala">

            <h2>${i + 1}º ${u.usuario}</h2>

            <p>⭐ ${u.pontos} pontos</p>

        </div>

        `;

    });

}

// ======================
// RANKING CAMPUS
// ======================

function mostrarCampus() {

    const ranking = {};

    usuarios.forEach((u) => {

        if (!ranking[u.campus]) {

            ranking[u.campus] = 0;

        }

        ranking[u.campus] += u.pontos;

    });

    const lista = Object.entries(ranking);

    lista.sort((a, b) => b[1] - a[1]);

    const div = document.getElementById("ranking");

    div.innerHTML = "";

    lista.forEach((campus, i) => {

        div.innerHTML += `

        <div class="sala">

            <h2>${i + 1}º ${campus[0]}</h2>

            <p>⭐ ${campus[1]} pontos</p>

        </div>

        `;

    });

}

// ======================
// RANKING CURSOS
// ======================

function mostrarCursos() {

    const ranking = {};

    usuarios.forEach((u) => {

        if (!ranking[u.curso]) {

            ranking[u.curso] = 0;

        }

        ranking[u.curso] += u.pontos;

    });

    const lista = Object.entries(ranking);

    lista.sort((a, b) => b[1] - a[1]);

    const div = document.getElementById("ranking");

    div.innerHTML = "";

    lista.forEach((curso, i) => {

        div.innerHTML += `

        <div class="sala">

            <h2>${i + 1}º ${curso[0]}</h2>

            <p>⭐ ${curso[1]} pontos</p>

        </div>

        `;

    });

}

// ======================

document
.getElementById("usuarios")
.onclick = mostrarUsuarios;

document
.getElementById("campus")
.onclick = mostrarCampus;

document
.getElementById("cursos")
.onclick = mostrarCursos;

carregarUsuarios();