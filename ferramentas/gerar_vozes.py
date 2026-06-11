#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera todos os áudios de narração do jogo "Mundo Mágico de Aprender"
com uma VOZ NEURAL NATIVA DE PORTUGAL (português europeu), usando o
edge-tts (tecnologia de voz da Microsoft) — totalmente GRATUITO, sem
conta e sem chave de API.

Os ficheiros são gravados em ../audio/<id>.mp3 e é criado um
../audio/clips.json com a lista de ids. O jogo deteta esta pasta
automaticamente e passa a usar estes áudios.

────────────────────────────────────────────────────────────────────
COMO USAR (no teu Mac, uma só vez):

    cd ~/Desktop/Sofiaochoa80
    pip3 install edge-tts
    python3 ferramentas/gerar_vozes.py

Depois faz upload da pasta  audio/  para o GitHub.
────────────────────────────────────────────────────────────────────

VOZES PORTUGUESAS (pt-PT) disponíveis — troca com a variável VOZ:
    pt-PT-RaquelNeural    (feminina, suave e clara)   ← padrão
    pt-PT-FernandaNeural  (feminina)
    pt-PT-DuarteNeural    (masculina)

Exemplo para mudar de voz:
    VOZ="pt-PT-FernandaNeural" python3 ferramentas/gerar_vozes.py
"""

import asyncio
import json
import os
import re
import sys
import unicodedata

try:
    import edge_tts
except ImportError:
    print("❌ Falta o edge-tts. Corre primeiro:\n   pip3 install edge-tts")
    sys.exit(1)

# ---- Configuração -------------------------------------------------
VOZ = os.environ.get("VOZ", "pt-PT-RaquelNeural").strip()   # voz portuguesa
RITMO = os.environ.get("RITMO", "-6%").strip()              # um pouco mais devagar
TOM = os.environ.get("TOM", "+8Hz").strip()                 # um toque mais meigo

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


async def gerar_audio(texto, destino):
    fala = edge_tts.Communicate(texto, VOZ, rate=RITMO, pitch=TOM)
    await fala.save(destino)


async def main():
    os.makedirs(PASTA_AUDIO, exist_ok=True)
    frases = todas_as_frases()
    ids = [slug(f) for f in frases]

    print(f"🎙️  A gerar {len(frases)} áudios com a voz portuguesa {VOZ}")
    print(f"📁  Pasta de destino: {PASTA_AUDIO}\n")

    erros = 0
    for i, (frase, ident) in enumerate(zip(frases, ids), 1):
        destino = os.path.join(PASTA_AUDIO, f"{ident}.mp3")
        try:
            await gerar_audio(frase, destino)  # gera sempre (substitui o antigo)
            print(f"  [{i:2}/{len(frases)}] ✅ {ident}  «{frase}»")
        except Exception as e:  # noqa
            erros += 1
            print(f"  [{i:2}/{len(frases)}] ❌ {ident}  ({e})")

    # Lista de ids para o jogo saber quais áudios existem
    with open(os.path.join(PASTA_AUDIO, "clips.json"), "w", encoding="utf-8") as fh:
        json.dump(sorted(set(ids)), fh, ensure_ascii=False, indent=2)

    print("\n✨ Concluído!")
    if erros:
        print(f"   ⚠️  {erros} áudio(s) falharam — corre o script outra vez.")
    print("   👉 Agora faz upload da pasta  audio/  para o GitHub.")


if __name__ == "__main__":
    asyncio.run(main())
