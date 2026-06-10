/* =====================================================
   🌈 Mundo Mágico de Aprender
   Jogo educativo e lúdico para crianças de 3 a 6 anos.
   Tudo em português, com narração por voz para quem
   ainda não sabe ler. Sem dependências externas.
   ===================================================== */

(function () {
  "use strict";

  // ---------- Elementos da tela ----------
  const telaMenu = document.getElementById("menu");
  const telaJogo = document.getElementById("jogo");
  const elTituloJogo = document.getElementById("tituloJogo");
  const elPergunta = document.getElementById("pergunta");
  const elOpcoes = document.getElementById("opcoes");
  const elContaEstrelas = document.getElementById("contaEstrelas");
  const elFesta = document.getElementById("festa");
  const botaoSom = document.getElementById("botaoSom");

  // ---------- Estado ----------
  let estrelas = 0;
  let somLigado = true;
  let jogoAtual = null;
  let perguntaAtual = null;
  let travado = false; // evita cliques durante a animação de acerto

  // ===================================================
  //  NARRAÇÃO POR VOZ (Web Speech API, pt-BR)
  // ===================================================
  let vozPt = null;
  function escolherVoz() {
    const vozes = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    vozPt =
      vozes.find((v) => /pt[-_]BR/i.test(v.lang)) ||
      vozes.find((v) => /^pt/i.test(v.lang)) ||
      null;
  }
  if (window.speechSynthesis) {
    escolherVoz();
    speechSynthesis.onvoiceschanged = escolherVoz;
  }

  function falar(texto) {
    if (!somLigado || !window.speechSynthesis || !texto) return;
    try {
      speechSynthesis.cancel();
      const f = new SpeechSynthesisUtterance(texto);
      f.lang = "pt-BR";
      if (vozPt) f.voice = vozPt;
      f.rate = 0.9; // um pouquinho mais devagar para as crianças
      f.pitch = 1.15; // voz mais alegre
      speechSynthesis.speak(f);
    } catch (e) {
      /* navegador sem suporte: silencioso */
    }
  }

  // Sons curtos de acerto/erro com Web Audio (sem arquivos)
  let audioCtx = null;
  function bip(freqs, dur) {
    if (!somLigado) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      let t = audioCtx.currentTime;
      freqs.forEach((fr) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = fr;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur);
        t += dur;
      });
    } catch (e) {}
  }
  const somAcerto = () => bip([523, 659, 784], 0.12); // dó-mi-sol subindo
  const somErro = () => bip([300, 220], 0.18);

  // ===================================================
  //  DADOS DOS JOGOS
  // ===================================================
  const VOGAIS = ["A", "E", "I", "O", "U"];

  const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const CORES = [
    { nome: "Vermelho", hex: "#ff5b5b" },
    { nome: "Azul", hex: "#4d8bff" },
    { nome: "Amarelo", hex: "#ffd23f" },
    { nome: "Verde", hex: "#48d86a" },
    { nome: "Laranja", hex: "#ff9a3f" },
    { nome: "Roxo", hex: "#a86bff" },
    { nome: "Rosa", hex: "#ff79c6" },
    { nome: "Marrom", hex: "#a9744f" },
  ];

  const FORMAS = [
    { nome: "Círculo", emoji: "⚪" },
    { nome: "Quadrado", emoji: "🟥" },
    { nome: "Triângulo", emoji: "🔺" },
    { nome: "Estrela", emoji: "⭐" },
    { nome: "Coração", emoji: "💛" },
    { nome: "Losango", emoji: "🔶" },
  ];

  const ANIMAIS = [
    { nome: "Cachorro", emoji: "🐶", som: "Au au!" },
    { nome: "Gato", emoji: "🐱", som: "Miau!" },
    { nome: "Vaca", emoji: "🐮", som: "Muuu!" },
    { nome: "Pato", emoji: "🦆", som: "Quá quá!" },
    { nome: "Galo", emoji: "🐔", som: "Cocoricó!" },
    { nome: "Leão", emoji: "🦁", som: "Rárr!" },
    { nome: "Sapo", emoji: "🐸", som: "Croac!" },
    { nome: "Abelha", emoji: "🐝", som: "Zzzz!" },
    { nome: "Cavalo", emoji: "🐴", som: "Relincho!" },
    { nome: "Ovelha", emoji: "🐑", som: "Méé!" },
  ];

  const FRUTAS = ["🍎", "🍌", "🍓", "🍊", "🍇", "🍉", "🍐", "🍒"];

  // ---------- Utilitários ----------
  const aleatorio = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Sorteia "qtd" itens distintos, garantindo que "correto" esteja incluso
  function montarOpcoes(lista, correto, qtd, chave) {
    const igual = (a, b) => (chave ? a[chave] === b[chave] : a === b);
    const outros = embaralhar(lista.filter((x) => !igual(x, correto)));
    const escolhidas = outros.slice(0, Math.max(0, qtd - 1));
    escolhidas.push(correto);
    return embaralhar(escolhidas);
  }

  // ===================================================
  //  DEFINIÇÃO DE CADA JOGO
  //  Cada jogo retorna uma "rodada" com:
  //    enunciado (texto falado), html da pergunta,
  //    lista de opções e o índice/comparação do certo.
  // ===================================================
  const JOGOS = {
    letras: {
      titulo: "🔤 Letras",
      cor: "#ff7eb9",
      novaRodada() {
        const certo = aleatorio(VOGAIS);
        const opcoes = montarOpcoes(VOGAIS, certo, 3);
        return {
          enunciado: `Onde está a letra ${certo}?`,
          perguntaHTML: `<div class="frase">Cadê a letra<br><span class="alvo">${certo}</span></div>`,
          opcoes: opcoes.map((l) => ({ rotulo: l, valor: l, fala: l })),
          ehCerto: (o) => o.valor === certo,
        };
      },
    },

    numeros: {
      titulo: "🔢 Números",
      cor: "#7afcff",
      novaRodada() {
        const certo = aleatorio(NUMEROS);
        const opcoes = montarOpcoes(NUMEROS, certo, 3);
        return {
          enunciado: `Qual é o número ${certo}?`,
          perguntaHTML: `<div class="frase">Ache o número<br><span class="alvo">${certo}</span></div>`,
          opcoes: opcoes.map((n) => ({ rotulo: String(n), valor: n, fala: String(n) })),
          ehCerto: (o) => o.valor === certo,
        };
      },
    },

    contar: {
      titulo: "🍎 Contar",
      cor: "#d4a0ff",
      novaRodada() {
        const qtd = 1 + Math.floor(Math.random() * 5); // conta de 1 a 5
        const fruta = aleatorio(FRUTAS);
        const opcoes = montarOpcoes(NUMEROS.slice(0, 5), qtd, 3);
        return {
          enunciado: "Quantos você vê? Conta comigo!",
          perguntaHTML: `<div class="frase">Quantos têm aqui?<br><span class="alvo">${fruta.repeat(qtd)}</span></div>`,
          opcoes: opcoes.map((n) => ({ rotulo: String(n), valor: n, fala: String(n) })),
          ehCerto: (o) => o.valor === qtd,
        };
      },
    },

    cores: {
      titulo: "🎨 Cores",
      cor: "#feff9c",
      novaRodada() {
        const certo = aleatorio(CORES);
        const opcoes = montarOpcoes(CORES, certo, 3, "nome");
        return {
          enunciado: `Qual é a cor ${certo.nome}?`,
          perguntaHTML: `<div class="frase">Toque na cor<br><span class="alvo" style="color:${certo.hex}">${certo.nome}</span></div>`,
          opcoes: opcoes.map((c) => ({
            // bolinha grande colorida como opção
            rotulo: `<span style="display:inline-block;width:1em;height:1em;border-radius:50%;background:${c.hex};box-shadow:0 3px 6px rgba(0,0,0,.25)"></span>`,
            valor: c.nome,
            fala: c.nome,
          })),
          ehCerto: (o) => o.valor === certo.nome,
        };
      },
    },

    formas: {
      titulo: "🔺 Formas",
      cor: "#a0ffa0",
      novaRodada() {
        const certo = aleatorio(FORMAS);
        const opcoes = montarOpcoes(FORMAS, certo, 3, "nome");
        return {
          enunciado: `Cadê o ${certo.nome}?`,
          perguntaHTML: `<div class="frase">Ache o<br><span class="alvo">${certo.nome}</span></div>`,
          opcoes: opcoes.map((f) => ({ rotulo: f.emoji, valor: f.nome, fala: f.nome })),
          ehCerto: (o) => o.valor === certo.nome,
        };
      },
    },

    animais: {
      titulo: "🐶 Animais",
      cor: "#ffb37e",
      novaRodada() {
        const certo = aleatorio(ANIMAIS);
        const opcoes = montarOpcoes(ANIMAIS, certo, 3, "nome");
        return {
          enunciado: `Quem faz ${certo.som}`,
          perguntaHTML: `<div class="frase">Quem faz<br><span class="alvo">🔊 ${certo.som}</span></div>`,
          opcoes: opcoes.map((a) => ({ rotulo: a.emoji, valor: a.nome, fala: a.nome })),
          ehCerto: (o) => o.valor === certo.nome,
        };
      },
    },
  };

  // ===================================================
  //  FLUXO DO JOGO
  // ===================================================
  function abrirJogo(chave) {
    jogoAtual = JOGOS[chave];
    if (!jogoAtual) return;
    elTituloJogo.textContent = jogoAtual.titulo;
    telaMenu.classList.remove("ativa");
    telaJogo.classList.add("ativa");
    proximaRodada();
  }

  function voltarMenu() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    telaJogo.classList.remove("ativa");
    telaMenu.classList.add("ativa");
    jogoAtual = null;
  }

  function proximaRodada() {
    travado = false;
    perguntaAtual = jogoAtual.novaRodada();
    elPergunta.innerHTML = perguntaAtual.perguntaHTML;

    elOpcoes.innerHTML = "";
    perguntaAtual.opcoes.forEach((op) => {
      const b = document.createElement("button");
      b.className = "opcao";
      b.innerHTML = op.rotulo;
      b.addEventListener("click", () => responder(b, op));
      elOpcoes.appendChild(b);
    });

    // Lê o enunciado em voz alta depois de um respiro
    setTimeout(() => falar(perguntaAtual.enunciado), 350);
  }

  function responder(botao, opcao) {
    if (travado) return;

    if (perguntaAtual.ehCerto(opcao)) {
      travado = true;
      botao.classList.add("certo");
      somAcerto();
      estrelas++;
      elContaEstrelas.textContent = estrelas;
      const elogio = aleatorio([
        "Muito bem!",
        "Isso mesmo!",
        "Você acertou!",
        "Parabéns!",
        "Show de bola!",
        "Boa!",
      ]);
      falar(elogio);
      // a cada 5 estrelas, faz uma festa de confete
      if (estrelas % 5 === 0) {
        festejar(elogio);
        setTimeout(proximaRodada, 2200);
      } else {
        setTimeout(proximaRodada, 1300);
      }
    } else {
      // erro: balança, fala o nome e deixa tentar de novo
      botao.classList.add("errado");
      somErro();
      falar(opcao.fala ? `${opcao.fala}. Tenta de novo!` : "Tenta de novo!");
      setTimeout(() => botao.classList.remove("errado"), 500);
    }
  }

  // ---------- Festa de confete ----------
  function festejar(texto) {
    elFesta.innerHTML = `<div class="parabens">🎉 ${texto} 🎉</div>`;
    elFesta.classList.add("mostra");

    const emojis = ["🎈", "⭐", "🎊", "🌟", "🎉", "💖", "🍭"];
    for (let i = 0; i < 28; i++) {
      const c = document.createElement("div");
      c.className = "confete";
      c.textContent = aleatorio(emojis);
      c.style.left = Math.random() * 100 + "vw";
      c.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
      c.style.animationDelay = Math.random() * 0.5 + "s";
      c.style.fontSize = 22 + Math.random() * 22 + "px";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3600);
    }
    setTimeout(() => {
      elFesta.classList.remove("mostra");
      elFesta.innerHTML = "";
    }, 2100);
  }

  // ===================================================
  //  EVENTOS
  // ===================================================
  document.querySelectorAll(".cartao").forEach((c) => {
    c.addEventListener("click", () => {
      // primeiro toque "destrava" o áudio em navegadores móveis
      if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
      abrirJogo(c.dataset.jogo);
    });
  });

  document.getElementById("voltar").addEventListener("click", voltarMenu);

  document.getElementById("repetir").addEventListener("click", () => {
    if (perguntaAtual) falar(perguntaAtual.enunciado);
  });

  botaoSom.addEventListener("click", () => {
    somLigado = !somLigado;
    botaoSom.textContent = somLigado ? "🔊" : "🔇";
    if (!somLigado && window.speechSynthesis) speechSynthesis.cancel();
    else falar("Som ligado!");
  });

  // Mensagem de boas-vindas (só toca após interação por causa das regras dos navegadores)
  document.body.addEventListener(
    "pointerdown",
    () => falar("Bem-vindo ao Mundo Mágico de Aprender! Escolha um jogo."),
    { once: true }
  );
})();
