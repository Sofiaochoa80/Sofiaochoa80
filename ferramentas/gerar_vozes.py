#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera todos os áudios de narração do jogo "Mundo Mágico de Aprender"
usando a API do ElevenLabs (voz neural meiga em português).

Os ficheiros são gravados em ../audio/<id>.mp3 e é criado um
../audio/clips.json com a lista de ids. O jogo deteta esta pasta
automaticamente e passa a usar estes áudios em vez da voz do navegador.

────────────────────────────────────────────────────────────────────
COMO USAR (uma só vez):

1. Cria uma conta gratuita em  https://elevenlabs.io
2. Vai a  https://elevenlabs.io/app/voice-library  e escolhe uma voz
   portuguesa que gostes (carrega em "Add" para a guardares).
3. Copia o teu API key em  Perfil → "API Keys".
4. Copia o ID da voz: na página da voz, botão "ID" (ou em "My Voices").
5. No Terminal, dentro da pasta do projeto, corre:

       export ELEVENLABS_API_KEY="o_teu_api_key"
       export ELEVENLABS_VOICE_ID="o_id_da_voz"      # opcional
       python3 ferramentas/gerar_vozes.py

6. Faz commit da pasta  audio/  (o jogo já a usa automaticamente).
────────────────────────────────────────────────────────────────────
"""

import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request

# ---- Configuração -------------------------------------------------
API_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
# Voz padrão: "Sarah", uma voz OFICIAL do ElevenLabs (suave e meiga),
# que o plano gratuito PODE usar pela API. As vozes da "Voice Library"
# (comunidade) só funcionam pela API em planos pagos.
# Outras vozes oficiais meigas para experimentar (troca o ELEVENLABS_VOICE_ID):
#   Sarah   = EXAVITQu4vr4xnSDxMaL   (suave, jovem)   ← padrão
#   Matilda = XrExE9yKIg1WjnnlVkGX   (calorosa, narração)
#   Lily    = pFZP5JQG7iQjIQuC4Bku   (doce)
#   Alice   = Xb7hH8MSUJpSbSDYk0k2   (clara)
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL").strip()
MODEL_ID = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2").strip()

PASTA_AUDIO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "audio"))


# ---- mesma função "slug" do game.js (têm de coincidir!) ----------
def slug(texto):
    t = unicodedata.normalize("NFD", texto)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")  # tira acentos
    t = t.lower()
    t = re.sub(r"[^a-z0-9]+", "_", t)
    return t.strip("_")


# ---- Todas as frases que o jogo pode dizer -----------------------
def todas_as_frases():
    frases = []

    # Fixas
    frases.append("Bem-vindo ao Mundo Mágico de Aprender! Escolhe um jogo.")
    frases.append("Som ligado!")
    frases.append("Quantos vês? Conta comigo!")
    frases.append("Tenta outra vez!")

    # Elogios
    frases += [
        "Muito bem!",
        "É isso mesmo!",
        "Acertaste!",
        "Parabéns!",
        "Fantástico!",
        "Boa!",
    ]

    # Letras (vogais)
    for letra in ["A", "E", "I", "O", "U"]:
        frases.append(f"Onde está a letra {letra}?")

    # Números 1 a 10
    for n in range(1, 11):
        frases.append(f"Qual é o número {n}?")

    # Cores
    for cor in ["Vermelho", "Azul", "Amarelo", "Verde",
                "Laranja", "Roxo", "Rosa", "Castanho"]:
        frases.append(f"Qual é a cor {cor}?")

    # Formas (com artigo correto)
    for artigo, nome in [("o", "Círculo"), ("o", "Quadrado"), ("o", "Triângulo"),
                         ("a", "Estrela"), ("o", "Coração"), ("o", "Losango")]:
        frases.append(f"Onde está {artigo} {nome}?")

    # Animais (sons)
    for som in ["Ão ão!", "Miau!", "Muuu!", "Quá quá!", "Cocoricó!",
                "Rárr!", "Croac!", "Zzzz!", "Relincho!", "Méé!"]:
        frases.append(f"Quem faz {som}")

    # remove duplicados mantendo a ordem
    vistos = set()
    unicas = []
    for f in frases:
        if f not in vistos:
            vistos.add(f)
            unicas.append(f)
    return unicas


# ---- Chamada à API do ElevenLabs ---------------------------------
def gerar_audio(texto, destino):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    corpo = json.dumps({
        "text": texto,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.45,
            "similarity_boost": 0.85,
            "style": 0.35,          # um toque expressivo/meigo
            "use_speaker_boost": True,
        },
    }).encode("utf-8")

    req = urllib.request.Request(url, data=corpo, method="POST")
    req.add_header("xi-api-key", API_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "audio/mpeg")

    with urllib.request.urlopen(req, timeout=60) as resp:
        dados = resp.read()
    with open(destino, "wb") as fh:
        fh.write(dados)


def main():
    if not API_KEY:
        print("❌ Falta o API key. Faz:\n"
              '   export ELEVENLABS_API_KEY="o_teu_api_key"\n'
              "e corre o script outra vez.")
        sys.exit(1)

    os.makedirs(PASTA_AUDIO, exist_ok=True)
    frases = todas_as_frases()
    ids = [slug(f) for f in frases]

    print(f"🎙️  A gerar {len(frases)} áudios com a voz {VOICE_ID}")
    print(f"📁  Pasta de destino: {PASTA_AUDIO}\n")
    erros = 0
    for i, (frase, ident) in enumerate(zip(frases, ids), 1):
        destino = os.path.join(PASTA_AUDIO, f"{ident}.mp3")
        if os.path.exists(destino) and os.path.getsize(destino) > 0:
            print(f"  [{i:2}/{len(frases)}] (já existe) {ident}")
            continue
        try:
            gerar_audio(frase, destino)
            print(f"  [{i:2}/{len(frases)}] ✅ {ident}  «{frase}»")
            time.sleep(0.4)  # pausa simpática para não sobrecarregar a API
        except urllib.error.HTTPError as e:
            erros += 1
            print(f"  [{i:2}/{len(frases)}] ❌ {ident}  (HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:120]})")
        except Exception as e:  # noqa
            erros += 1
            print(f"  [{i:2}/{len(frases)}] ❌ {ident}  ({e})")

    # Lista de ids para o jogo saber quais áudios existem
    with open(os.path.join(PASTA_AUDIO, "clips.json"), "w", encoding="utf-8") as fh:
        json.dump(sorted(set(ids)), fh, ensure_ascii=False, indent=2)

    print("\n✨ Concluído!")
    if erros:
        print(f"   ⚠️  {erros} áudio(s) falharam — corre o script outra vez para os repetir.")
    print("   👉 Agora faz commit da pasta  audio/  e o jogo passa a usar estas vozes.")


if __name__ == "__main__":
    main()
