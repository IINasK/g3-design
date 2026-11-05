#!/usr/bin/env python3
"""Confere o pacote portátil, recursos locais e pares básicos de cor; não a UI."""

import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


CAMINHO_LOCAL = re.compile(
    r"(?<![\w])(?:[A-Za-z]:[\\/]|/Users/|/home/[^/]+/)"
    r"|localhost:\d+|127\.0\.0\.1|Documentos/|site/src/|site/recursos/"
)
LINK = re.compile(r"\[[^\]\n]*\]\(([^)\n]+)\)")
REFERENCIA = re.compile(r"^\s{0,3}\[[^\]\n]+\]:\s*(?:<([^>]+)>|(\S+))", re.MULTILINE)
HEX = re.compile(r"#[0-9a-fA-F]{6}\Z")


def luminancia(cor):
    canais = [int(cor[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lineares = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in canais]
    return sum(c * peso for c, peso in zip(lineares, (0.2126, 0.7152, 0.0722)))


def contraste(a, b):
    claro, escuro = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (claro + 0.05) / (escuro + 0.05)


def validar(raiz):
    raiz = Path(raiz).resolve()
    erros = []
    arquivos = []
    for pasta, diretorios, nomes in os.walk(raiz, followlinks=False, onerror=lambda _: erros.append("LEITURA: diretório inacessível")):
        for nome in list(diretorios):
            caminho = Path(pasta) / nome
            if caminho.is_symlink() or getattr(caminho, "is_junction", lambda: False)() or not caminho.resolve().is_relative_to(raiz):
                erros.append(f"LINK_DE_PASTA: {caminho.relative_to(raiz)}")
                diretorios.remove(nome)
        for nome in nomes:
            caminho = Path(pasta) / nome
            if caminho.is_symlink() or not caminho.resolve().is_relative_to(raiz):
                erros.append(f"LINK_DE_ARQUIVO: {caminho.relative_to(raiz)}")
                continue
            arquivos.append(caminho)

    obrigatorios = ("SKILL.md", "agents/openai.yaml", "assets/papeis-de-cor.json", "scripts/validar_pacote.py")
    presentes = {str(p.relative_to(raiz)).replace("\\", "/") for p in arquivos}
    for nome in obrigatorios:
        if nome not in presentes:
            erros.append(f"RECURSO_AUSENTE: {nome}")

    for arquivo in arquivos:
        if arquivo.suffix not in {".md", ".yaml", ".yml", ".json"}:
            continue
        nome = arquivo.relative_to(raiz)
        try:
            texto = arquivo.read_text(encoding="utf-8")
        except (OSError, UnicodeError):
            erros.append(f"LEITURA: texto inacessível ou UTF-8 inválido em {nome}")
            continue
        if CAMINHO_LOCAL.search(texto):
            erros.append(f"ACOPLAMENTO_LOCAL: {nome}")
        if arquivo.suffix != ".md":
            continue
        alvos = LINK.findall(texto) + [a or b for a, b in REFERENCIA.findall(texto)]
        for alvo in alvos:
            alvo = alvo.strip().strip("<>")
            try:
                url = urlsplit(alvo)
            except ValueError:
                erros.append(f"LINK_INVALIDO: {nome}")
                continue
            if url.scheme or url.netloc:
                if url.scheme not in {"http", "https", "mailto"}:
                    erros.append(f"LINK_ESQUEMA_INVALIDO: {nome}")
                continue
            if not url.path:
                continue
            destino = (arquivo.parent / unquote(url.path)).resolve()
            if not destino.is_relative_to(raiz):
                erros.append(f"LINK_FORA_DO_PACOTE: {nome}")
            elif not destino.is_file():
                erros.append(f"LINK_QUEBRADO: {nome}")

    paleta = raiz / "assets/papeis-de-cor.json"
    if "assets/papeis-de-cor.json" in presentes:
        try:
            dados = json.loads(paleta.read_text(encoding="utf-8"))
            if not isinstance(dados, dict) or not isinstance(dados.get("temas"), dict):
                raise ValueError("estrutura de temas inválida")
            temas = dados["temas"]
            if set(temas) != {"claro", "escuro"}:
                erros.append("PALETA: modos claro e escuro necessários")
            for modo, cores in temas.items():
                papeis = ("fundo", "superficie", "texto", "textoSecundario", "borda", "foco", "acao", "textoSobreAcao")
                if not isinstance(cores, dict) or any(not isinstance(cores.get(p), str) or not HEX.fullmatch(cores[p]) for p in papeis):
                    erros.append(f"PALETA: cores inválidas em {modo}")
                    continue
                pares = (("texto", "superficie", 4.5), ("texto", "fundo", 4.5),
                         ("textoSecundario", "superficie", 4.5), ("textoSobreAcao", "acao", 4.5),
                         ("borda", "superficie", 3), ("foco", "superficie", 3))
                for tinta, fundo, minimo in pares:
                    if contraste(cores[tinta], cores[fundo]) < minimo:
                        erros.append(f"CONTRASTE: {modo}/{tinta}/{fundo}")
        except (ValueError, KeyError, TypeError, OSError, UnicodeError):
            erros.append("PALETA: estrutura inválida")
    return erros


if __name__ == "__main__":
    pasta = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
    falhas = validar(pasta)
    print(json.dumps({"valido": not falhas, "erros": falhas, "escopo": "recursos, referências Markdown, heurísticas de caminhos e pares sólidos de cor"}, ensure_ascii=False))
    sys.exit(1 if falhas else 0)
