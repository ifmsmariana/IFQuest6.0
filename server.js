const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const arquivoSalas = path.join(__dirname, "database", "salas.json");
const arquivoUsuarios = path.join(__dirname, "database", "usuarios.json");

function lerJson(arquivo) {
    return JSON.parse(fs.readFileSync(arquivo, "utf8"));
}

function salvarJson(arquivo, dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

function garantirEstatisticas(usuario) {
    if (!usuario.estatisticas || typeof usuario.estatisticas !== "object") {
        usuario.estatisticas = {};
    }
    return usuario.estatisticas;
}

function normalizarPerguntas(perguntas) {
    return (Array.isArray(perguntas) ? perguntas : []).map(p => ({
        texto: String(p.texto || "").trim(),
        alternativas: Array.isArray(p.alternativas) ? p.alternativas.map(a => String(a || "").trim()) : [],
        correta: Number(p.correta),
        tempo: Number.isFinite(Number(p.tempo)) && Number(p.tempo) > 0 ? Number(p.tempo) : 0
    }));
}

// ===============================
// SALAS
// ===============================

app.get("/api/salas", (req, res) => {
    const salas = lerJson(arquivoSalas).map(sala => ({
        ...sala,
        perguntas: normalizarPerguntas(sala.perguntas),
        descricao: undefined
    }));

    res.json(salas.map(({ descricao, ...sala }) => sala));
});

app.get("/api/salas/:id", (req, res) => {
    const salas = lerJson(arquivoSalas);
    const sala = salas.find(s => s.id == req.params.id);

    if (!sala) {
        return res.status(404).json({ erro: "Sala não encontrada." });
    }

    const { descricao, ...salaSemDescricao } = sala;
    salaSemDescricao.perguntas = normalizarPerguntas(salaSemDescricao.perguntas);
    res.json(salaSemDescricao);
});

app.post("/api/salas", (req, res) => {
    const nome = String(req.body.nome || "").trim();
    const categoria = String(req.body.categoria || "Geral").trim();
    const dificuldade = String(req.body.dificuldade || "Fácil").trim();
    const perguntas = normalizarPerguntas(req.body.perguntas);

    if (!nome) {
        return res.status(400).json({ erro: "O nome da sala é obrigatório." });
    }

    if (!req.body.usuarioId) {
        return res.status(400).json({ erro: "Usuário responsável pela sala é obrigatório." });
    }

    if (!perguntas.length) {
        return res.status(400).json({ erro: "Adicione pelo menos uma pergunta." });
    }

    for (const pergunta of perguntas) {
        if (!pergunta.texto || pergunta.alternativas.length !== 4 || pergunta.alternativas.some(a => !a) || ![0, 1, 2, 3].includes(pergunta.correta)) {
            return res.status(400).json({ erro: "Todas as perguntas precisam ter texto, quatro alternativas e uma resposta correta." });
        }
        if (pergunta.tempo < 0) {
            return res.status(400).json({ erro: "O tempo da pergunta não pode ser negativo." });
        }
    }

    const salas = lerJson(arquivoSalas);
    const novoId = salas.length ? Math.max(...salas.map(s => Number(s.id) || 0)) + 1 : 1;

    const novaSala = {
        id: novoId,
        usuarioId: Number(req.body.usuarioId),
        nome,
        categoria,
        dificuldade,
        privada: Boolean(req.body.privada),
        codigo: req.body.codigo || "",
        perguntas
    };

    salas.push(novaSala);
    salvarJson(arquivoSalas, salas);

    res.status(201).json({ mensagem: "Sala criada com sucesso!", sala: novaSala });
});

app.put("/api/salas/:id", (req, res) => {
    const salas = lerJson(arquivoSalas);
    const indice = salas.findIndex(s => s.id == req.params.id);

    if (indice === -1) {
        return res.status(404).json({ erro: "Sala não encontrada." });
    }

    if (Number(salas[indice].usuarioId) !== Number(req.body.usuarioId)) {
        return res.status(403).json({ erro: "Você não pode editar esta sala." });
    }

    const nome = String(req.body.nome || "").trim();
    const perguntas = normalizarPerguntas(req.body.perguntas);

    if (!nome) {
        return res.status(400).json({ erro: "O nome da sala é obrigatório." });
    }
    if (!perguntas.length) {
        return res.status(400).json({ erro: "Adicione pelo menos uma pergunta." });
    }

    salas[indice] = {
        ...salas[indice],
        nome,
        categoria: String(req.body.categoria || "Geral").trim(),
        dificuldade: String(req.body.dificuldade || "Fácil").trim(),
        perguntas
    };

    salvarJson(arquivoSalas, salas);
    res.json({ mensagem: "Sala atualizada com sucesso!", sala: salas[indice] });
});

app.delete("/api/salas/:id", (req, res) => {
    const salas = lerJson(arquivoSalas);
    const sala = salas.find(s => s.id == req.params.id);

    if (!sala) {
        return res.status(404).json({ erro: "Sala não encontrada." });
    }

    if (Number(sala.usuarioId) !== Number(req.body.usuarioId)) {
        return res.status(403).json({ erro: "Você não pode excluir esta sala." });
    }

    salvarJson(arquivoSalas, salas.filter(s => s.id != req.params.id));
    res.json({ mensagem: "Sala excluída." });
});

app.get("/api/minhasSalas/:usuarioId", (req, res) => {
    const salas = lerJson(arquivoSalas);
    res.json(salas.filter(s => Number(s.usuarioId) === Number(req.params.usuarioId)));
});

// ===============================
// USUÁRIOS
// ===============================

app.get("/api/usuarios", (req, res) => {
    const usuarios = lerJson(arquivoUsuarios);
    res.json(usuarios.map(({ senha, ...usuario }) => usuario));
});

app.get("/api/usuarios/:id", (req, res) => {
    const usuarios = lerJson(arquivoUsuarios);
    const usuario = usuarios.find(u => u.id == req.params.id);

    if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const { senha, ...seguro } = usuario;
    res.json(seguro);
});

app.post("/api/cadastro", (req, res) => {
    const usuarios = lerJson(arquivoUsuarios);
    const usuarioNome = String(req.body.usuario || "").trim();
    const senha = String(req.body.senha || "");

    if (!usuarioNome || !senha) {
        return res.status(400).json({ erro: "Usuário e senha são obrigatórios." });
    }

    if (usuarios.some(u => u.usuario.toLowerCase() === usuarioNome.toLowerCase())) {
        return res.status(400).json({ erro: "Este usuário já existe." });
    }

    const novoId = usuarios.length ? Math.max(...usuarios.map(u => Number(u.id) || 0)) + 1 : 1;
    const novoUsuario = {
        id: novoId,
        usuario: usuarioNome,
        email: req.body.email || "",
        senha,
        campus: req.body.campus || "",
        curso: req.body.curso || "",
        pontos: 0,
        quizzesRespondidos: 0,
        perguntasRespondidas: 0,
        acertos: 0,
        estatisticas: {}
    };

    usuarios.push(novoUsuario);
    salvarJson(arquivoUsuarios, usuarios);
    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
});

app.post("/api/login", (req, res) => {
    const usuarios = lerJson(arquivoUsuarios);
    const usuario = usuarios.find(u => u.usuario === req.body.usuario && u.senha === req.body.senha);

    if (!usuario) {
        return res.status(401).json({ erro: "Usuário ou senha inválidos." });
    }

    garantirEstatisticas(usuario);
    salvarJson(arquivoUsuarios, usuarios);

    const { senha, ...seguro } = usuario;
    res.json(seguro);
});

app.put("/api/usuarios/:id", (req, res) => {
    const usuarios = lerJson(arquivoUsuarios);
    const indice = usuarios.findIndex(u => u.id == req.params.id);

    if (indice === -1) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuario = usuarios[indice];
    const novoNome = String(req.body.usuario || "").trim();

    if (!novoNome) {
        return res.status(400).json({ erro: "O nome de usuário é obrigatório." });
    }

    const duplicado = usuarios.some(u => u.id !== usuario.id && u.usuario.toLowerCase() === novoNome.toLowerCase());
    if (duplicado) {
        return res.status(400).json({ erro: "Este nome de usuário já está em uso." });
    }

    usuario.usuario = novoNome;
    usuario.email = String(req.body.email || "").trim();
    usuario.campus = String(req.body.campus || "").trim();
    usuario.curso = String(req.body.curso || "").trim();

    salvarJson(arquivoUsuarios, usuarios);

    const { senha, ...seguro } = usuario;
    res.json({ mensagem: "Perfil atualizado com sucesso!", usuario: seguro });
});

app.put("/api/usuarios/:id/senha", (req, res) => {
    const usuarios = lerJson(arquivoUsuarios);
    const usuario = usuarios.find(u => u.id == req.params.id);

    if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    if (usuario.senha !== String(req.body.senhaAtual || "")) {
        return res.status(400).json({ erro: "A senha atual está incorreta." });
    }

    const novaSenha = String(req.body.novaSenha || "");
    if (novaSenha.length < 4) {
        return res.status(400).json({ erro: "A nova senha deve ter pelo menos 4 caracteres." });
    }

    usuario.senha = novaSenha;
    salvarJson(arquivoUsuarios, usuarios);
    res.json({ mensagem: "Senha alterada com sucesso!" });
});

// ===============================
// PONTUAÇÃO E ESTATÍSTICAS
// ===============================

app.post("/api/pontuar", (req, res) => {
    const { usuarioId, salaId, acertos, perguntas, categoria } = req.body;
    const usuarios = lerJson(arquivoUsuarios);
    const salas = lerJson(arquivoSalas);
    const usuario = usuarios.find(u => u.id == usuarioId);
    const sala = salas.find(s => s.id == salaId);

    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
    if (!sala) return res.status(404).json({ erro: "Sala não encontrada." });

    // O criador pode testar a própria sala, mas essa tentativa não gera pontos nem estatísticas.
    if (Number(sala.usuarioId) === Number(usuarioId)) {
        return res.json({
            teste: true,
            mensagem: "Modo teste: esta tentativa não altera sua pontuação.",
            pontos: usuario.pontos || 0,
            estatisticas: garantirEstatisticas(usuario)
        });
    }

    const totalPerguntas = Number(perguntas) || 0;
    const totalAcertos = Math.max(0, Math.min(Number(acertos) || 0, totalPerguntas));
    const materia = String(categoria || sala.categoria || "Geral").trim();

    usuario.pontos = (usuario.pontos || 0) + totalAcertos;
    usuario.quizzesRespondidos = (usuario.quizzesRespondidos || 0) + 1;
    usuario.perguntasRespondidas = (usuario.perguntasRespondidas || 0) + totalPerguntas;
    usuario.acertos = (usuario.acertos || 0) + totalAcertos;

    const estatisticas = garantirEstatisticas(usuario);
    if (!estatisticas[materia]) {
        estatisticas[materia] = { perguntas: 0, acertos: 0, quizzes: 0 };
    }
    estatisticas[materia].perguntas += totalPerguntas;
    estatisticas[materia].acertos += totalAcertos;
    estatisticas[materia].quizzes += 1;

    salvarJson(arquivoUsuarios, usuarios);

    const { senha, ...seguro } = usuario;
    res.json({
        mensagem: "Pontuação atualizada.",
        pontos: usuario.pontos,
        usuario: seguro,
        estatisticas
    });
});

app.get("/api/estatisticas/:usuarioId", (req, res) => {
    const usuarios = lerJson(arquivoUsuarios);
    const usuario = usuarios.find(u => u.id == req.params.usuarioId);

    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    const estatisticas = garantirEstatisticas(usuario);
    const materias = Object.entries(estatisticas).map(([materia, dados]) => ({
        materia,
        perguntas: dados.perguntas || 0,
        acertos: dados.acertos || 0,
        quizzes: dados.quizzes || 0,
        aproveitamento: dados.perguntas ? Math.round((dados.acertos / dados.perguntas) * 100) : 0
    }));

    res.json({
        total: {
            perguntas: usuario.perguntasRespondidas || 0,
            acertos: usuario.acertos || 0,
            quizzes: usuario.quizzesRespondidos || 0,
            aproveitamento: usuario.perguntasRespondidas ? Math.round(((usuario.acertos || 0) / usuario.perguntasRespondidas) * 100) : 0
        },
        materias
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
