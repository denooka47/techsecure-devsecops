#!/usr/bin/env python3
"""
Gera imagens em estilo de terminal WSL a partir das saidas reais da esteira
(arquivos em evidencias/). Usado para ilustrar o trabalho escrito.
"""
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVID = os.path.join(PROJ, "evidencias")
OUT = os.path.join(EVID, "img")
os.makedirs(OUT, exist_ok=True)

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FS = 15
PAD = 16
BAR = 34
LINE_H = FS + 6
MAXCOLS = 150

BG = (13, 17, 23)        # fundo terminal
BARBG = (32, 37, 46)     # barra de titulo
FG = (210, 218, 228)     # texto
PROMPT = (88, 214, 141)  # verde (prompt)
CMDC = (240, 240, 240)   # comando
CYAN = (86, 196, 220)
RED = (240, 110, 110)
YEL = (235, 200, 90)

ANSI = re.compile(r"\x1b\[[0-9;]*m")

font = ImageFont.truetype(FONT_PATH, FS)
fontb = ImageFont.truetype(FONT_BOLD, FS)
CHARW = font.getbbox("M")[2]


def clean(s):
    s = ANSI.sub("", s)
    s = s.replace("\t", "    ").rstrip("\n")
    return s


def colorize(line):
    """Escolhe uma cor conforme o conteudo (destaque de PASSED/HIGH/etc.)."""
    l = line
    if re.search(r"PASSED|passed|success| OK|healthy|Status: Downloaded|DONE", l):
        return PROMPT
    if re.search(r"HIGH|CRITICAL|failure|ERROR|Issue:|CVE-", l):
        return RED
    if re.search(r"Severity|Total:|WARNING|Medium", l):
        return YEL
    if l.startswith("==="):
        return CYAN
    return FG


def render(infile, outfile, command, title, max_lines=48, header_lines=None):
    path = os.path.join(EVID, infile)
    with open(path, encoding="utf-8", errors="replace") as f:
        raw = [clean(x) for x in f.readlines()]
    # remove linhas vazias repetidas e ruido de pip
    body = [x for x in raw if "Running pip as the" not in x and "notice] " not in x]
    body = [x for x in body if x.strip() != "" or True]
    if header_lines:
        body = header_lines + body
    if len(body) > max_lines:
        body = body[:max_lines] + ["", "... (saida completa em evidencias/%s)" % infile]

    # largura
    maxlen = max([len(command) + 2] + [min(len(x), MAXCOLS) for x in body] + [len(title) + 8])
    W = PAD * 2 + CHARW * min(maxlen, MAXCOLS)
    W = max(W, 680)
    nlines = len(body) + 2  # prompt + comando + output
    H = BAR + PAD * 2 + LINE_H * nlines

    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # barra de titulo
    d.rectangle([0, 0, W, BAR], fill=BARBG)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([PAD + i * 20, 11, PAD + i * 20 + 12, 23], fill=c)
    d.text((PAD + 74, 8), title, font=font, fill=(170, 180, 192))

    y = BAR + PAD
    # linha de prompt + comando
    prompt = "denergomes@LTdnk47:~/projetos/techsecure-devsecops$ "
    d.text((PAD, y), prompt, font=fontb, fill=PROMPT)
    d.text((PAD + CHARW * len(prompt), y), command, font=fontb, fill=CMDC)
    y += LINE_H * 2
    for line in body:
        line = line[:MAXCOLS]
        d.text((PAD, y), line, font=font, fill=colorize(line))
        y += LINE_H

    img.save(os.path.join(OUT, outfile))
    print("gerado:", outfile, img.size)


def main():
    render("02-testes-pytest.txt", "fig-01-testes.png",
           "python -m pytest", "WSL: Ubuntu — Testes (pytest)", 40)
    render("03a-bandit.txt", "fig-02-bandit.png",
           "bandit -r app", "WSL: Ubuntu — Security Scan (Bandit / SAST)", 40)
    render("03b-pip-audit.txt", "fig-03-pip-audit.png",
           "pip-audit -r requirements.txt", "WSL: Ubuntu — Security Scan (pip-audit)", 40)
    render("03c-trivy-fs.txt", "fig-04-trivy-fs.png",
           "trivy fs --severity HIGH,CRITICAL .", "WSL: Ubuntu — Security Scan (Trivy filesystem)", 40)
    render("04-docker-build.txt", "fig-05-docker-build.png",
           "docker build -t techsecure-app:latest .", "WSL: Ubuntu — Build da Imagem Docker", 20)
    render("04b-trivy-image.txt", "fig-06-trivy-image.png",
           "trivy image techsecure-app:latest", "WSL: Ubuntu — Scan da Imagem (Trivy image)", 30)
    render("05-docker-ps.txt", "fig-07-container.png",
           "docker ps", "WSL: Ubuntu — Container em Execucao", 12)
    # app endpoints: junta os tres arquivos
    app = []
    for label, fn in [("GET /health", "06-app-health.txt"),
                      ("GET /api/version", "06-app-version.txt"),
                      ("GET /api/soma?a=2&b=3", "06-app-soma.txt")]:
        p = os.path.join(EVID, fn)
        val = open(p).read().strip() if os.path.exists(p) else ""
        app.append("$ curl http://localhost:8080/%s" % label.split()[1])
        app.append(val)
        app.append("")
    with open(os.path.join(EVID, "_app.txt"), "w") as f:
        f.write("\n".join(app))
    render("_app.txt", "fig-08-app-endpoints.png",
           "curl http://localhost:8080/...", "WSL: Ubuntu — Aplicacao respondendo", 14)


if __name__ == "__main__":
    main()
