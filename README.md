# 🌈 Mundo Mágico de Aprender

Jogo educativo e **lúdico** para crianças dos **3 aos 6 anos**, em **português de
Portugal**. Funciona diretamente no navegador (telemóvel, tablet ou computador),
sem instalação e sem internet depois de aberto.

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

- **Narração por voz em português de Portugal (pt-PT)** — lê tudo em voz alta
  para quem ainda não sabe ler (botão 🔁 "Ouvir outra vez"). Pode usar **vozes
  neurais de alta qualidade** gravadas em ficheiro (ver secção abaixo) ou, em
  alternativa, a voz do próprio navegador.
- **Botões grandes e coloridos**, fáceis para dedinhos.
- **Recompensa com estrelas ⭐ e festa de confete** 🎉 a cada 5 acertos.
- **Sem punição:** ao errar, a criança ouve uma dica carinhosa e tenta outra vez.
- **Sons alegres** de acerto e erro.
- Botão de **ligar/desligar o som** 🔊.

## ▶️ Como jogar

Basta abrir o ficheiro **`index.html`** no navegador.

Ou, para correr como servidor local:

```bash
# Python 3
python3 -m http.server 8000
# depois abre http://localhost:8000 no navegador
```

> Dica: para a narração funcionar bem, usa o Chrome, Edge ou Safari com o som
> ligado e com uma voz portuguesa (pt-PT) instalada no sistema. O primeiro toque
> no ecrã liberta o áudio (exigência dos navegadores).

## 🎙️ Voz neural meiga (opcional, recomendado)

Por omissão o jogo usa a voz do navegador, que varia de aparelho para aparelho.
Para uma **voz portuguesa meiga e bem articulada, igual em todos os dispositivos**,
podes gerar ficheiros de áudio com o [ElevenLabs](https://elevenlabs.io) (tem
plano gratuito):

1. Cria conta em elevenlabs.io e escolhe uma voz portuguesa na *Voice Library*.
2. Copia o teu **API key** (Perfil → API Keys) e o **ID da voz**.
3. Corre, dentro da pasta do projeto:

   ```bash
   export ELEVENLABS_API_KEY="o_teu_api_key"
   export ELEVENLABS_VOICE_ID="o_id_da_voz"
   python3 ferramentas/gerar_vozes.py
   ```

4. Faz commit da pasta **`audio/`** que foi criada.

O jogo deteta automaticamente a pasta `audio/` e passa a usar essas vozes. Se a
pasta não existir, usa a voz do navegador como reserva — o jogo funciona sempre.

> Os 49 áudios usam muito poucos caracteres, cabendo folgadamente no plano
> gratuito do ElevenLabs.

## 🛠️ Tecnologia

HTML + CSS + JavaScript puro (sem dependências). A voz usa a *Web Speech API* e
os sons de feedback usam a *Web Audio API* — tudo nativo do navegador.

## 📁 Estrutura

```
index.html              → estrutura dos ecrãs (menu + jogo)
style.css               → visual lúdico e colorido
game.js                 → lógica dos 6 jogos, voz e recompensas
ferramentas/
  gerar_vozes.py        → gera os áudios neurais (ElevenLabs)
audio/                  → áudios .mp3 + clips.json (criado pelo script)
```
