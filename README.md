# 🌈 Mundo Mágico de Aprender

Jogo educativo e **lúdico** para crianças de **3 a 6 anos**. Funciona direto no
navegador (celular, tablet ou computador), sem instalação e sem internet depois
de aberto.

## ✨ O que a criança aprende

| Jogo | O que ensina |
|------|--------------|
| 🔤 **Letras**  | Reconhecer as vogais (A, E, I, O, U) |
| 🔢 **Números** | Identificar os números de 1 a 10 |
| 🍎 **Contar**  | Contar quantidades de 1 a 5 |
| 🎨 **Cores**   | Reconhecer e nomear cores |
| 🔺 **Formas**  | Identificar formas geométricas |
| 🐶 **Animais** | Associar animais aos seus sons |

## 🧒 Pensado para os pequenos

- **Narração por voz em português** — lê tudo em voz alta para quem ainda não
  sabe ler (botão 🔁 "Ouvir de novo").
- **Botões grandes e coloridos**, fáceis para dedinhos.
- **Recompensa com estrelas ⭐ e festa de confete** 🎉 a cada 5 acertos.
- **Sem punição:** ao errar, a criança ouve uma dica carinhosa e tenta de novo.
- **Sons alegres** de acerto e erro.
- Botão de **ligar/desligar o som** 🔊.

## ▶️ Como jogar

Basta abrir o arquivo **`index.html`** no navegador.

Ou, para rodar como um servidor local:

```bash
# Python 3
python3 -m http.server 8000
# depois abra http://localhost:8000 no navegador
```

> Dica: para a narração funcionar bem, use Chrome, Edge ou Safari com som ligado.
> O primeiro toque na tela libera o áudio (exigência dos navegadores).

## 🛠️ Tecnologia

HTML + CSS + JavaScript puro (sem dependências). A voz usa a *Web Speech API* e
os sons de feedback usam a *Web Audio API* — tudo nativo do navegador.

## 📁 Estrutura

```
index.html   → estrutura das telas (menu + jogo)
style.css    → visual lúdico e colorido
game.js      → lógica dos 6 jogos, voz e recompensas
```
