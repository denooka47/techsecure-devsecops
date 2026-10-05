#!/usr/bin/env python3
"""
Gera imagens com a aparencia do terminal do Ubuntu (GNOME Terminal / tema Yaru)
a partir das saidas reais da esteira (arquivos em evidencias/).
Fundo aubergine #300A24, barra de titulo do GNOME com botoes a direita.
"""
import os
import re

from PIL import Image, ImageDraw, ImageFont

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVID = os.path.join(PROJ, "evidencias")
OUT = os.path.join(EVID, "img")
os.makedirs(OUT, exist_ok=True)

# Fontes: prefere Ubuntu Mono; cai para DejaVu Sans Mono
CAND = [
    ("/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf",
     "/usr/share/fonts/truetype/ubuntu/UbuntuMono-B.ttf"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
     "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"),
]
FONT_PATH = FONT_BOLD = None
for reg, bold in CAND:
    if os.path.exists(reg):
        FONT_PATH, FONT_BOLD = reg, bold
        break
UI_FONT = "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf"
if not os.path.exists(UI_FONT):
    UI_FONT = FONT_PATH

FS = 16
PAD = 18
BAR = 40
LINE_H = FS + 6
MAXCOLS = 150

# Paleta GNOME Terminal (tema Ubuntu / Yaru)
BG = (48, 10, 36)        # #300A24 aubergine
BARBG = (46, 46, 46)     # barra de titulo (Yaru dark)
BARTXT = (222, 221, 218)
FG = (238, 238, 236)     # #EEEEEC
GREEN = (138, 226, 52)   # #8AE234 user@host
BLUE = (114, 159, 207)   # #729FCF path
WHITE = (255, 255, 255)
RED = (239, 41, 41)       # #EF2929
YELLOW = (252, 233, 79)   # #FCE94F
CYAN = (52, 226, 226)     # #34E2E2

ANSI = re.compile(r"\x1b\[[0-9;]*m")

font = ImageFont.truetype(FONT_PATH, FS)
fontb = ImageFont.truetype(FONT_BOLD, FS)
try:
    uifont = ImageFont.truetype(UI_FONT, 15)
    uifontb = ImageFont.truetype(UI_FONT.replace("-R", "-B"), 15)
except Exception:
    uifont = uifontb = font
CHARW = font.getbbox("M")[2]


def clean(s):
    s = ANSI.sub("", s)
    s = s.replace("\t", "    ").rstrip("\n")
    return s


def base_color(line):
    l = line
    if re.search(r"PASSED|passed|success| OK| ok|healthy|Status: Downloaded|DONE|-> OK", l):
        return GREEN
    if re.search(r"HIGH|CRITICAL|failure|ERROR|Issue:|CVE-|>> Issue", l):
        return RED
    if re.search(r"Severity|Total:|WARNING|Medium", l):
        return YELLOW
    if l.startswith("===") or l.startswith("---"):
        return CYAN
    return FG


def draw_prompt(d, y):
    """Desenha a linha do prompt do Ubuntu com cores (user@host verde, path azul)."""
    user = "denergomes@LTdnk47"
    path = "~/projetos/techsecure-devsecops"
    x = PAD
    d.text((x, y), user, font=fontb, fill=GREEN); x += CHARW * len(user)
    d.text((x, y), ":", font=fontb, fill=FG); x += CHARW
    d.text((x, y), path, font=fontb, fill=BLUE); x += CHARW * len(path)
    d.text((x, y), "$ ", font=fontb, fill=FG); x += CHARW * 2
    return x


def window_buttons(d, W):
    """Botoes de janela do GNOME (Yaru) a DIREITA: minimizar, maximizar, fechar."""
    cy = BAR // 2
    r, g = 11, 5
    gray, gl = (63, 62, 60), (222, 221, 218)
    xmin, xmax, xclose = W - 26 - 68, W - 26 - 34, W - 26
    # minimizar (traco)
    d.ellipse([xmin - r, cy - r, xmin + r, cy + r], fill=gray)
    d.line([xmin - g, cy + 3, xmin + g, cy + 3], fill=gl, width=2)
    # maximizar (quadrado)
    d.ellipse([xmax - r, cy - r, xmax + r, cy + r], fill=gray)
    d.rectangle([xmax - g, cy - g, xmax + g, cy + g], outline=gl, width=2)
    # fechar (X)
    d.ellipse([xclose - r, cy - r, xclose + r, cy + r], fill=gray)
    d.line([xclose - g, cy - g, xclose + g, cy + g], fill=gl, width=2)
    d.line([xclose - g, cy + g, xclose + g, cy - g], fill=gl, width=2)


def render(infile, outfile, command, title, max_lines=48):
    path = os.path.join(EVID, infile)
    with open(path, encoding="utf-8", errors="replace") as f:
        raw = [clean(x) for x in f.readlines()]
    body = [x for x in raw if "Running pip as the" not in x and "notice] " not in x]
    if len(body) > max_lines:
        body = body[:max_lines] + ["", "... (saida completa em evidencias/%s)" % infile]

    maxlen = max([len(command) + 54] + [min(len(x), MAXCOLS) for x in body])
    W = PAD * 2 + CHARW * min(maxlen, MAXCOLS)
    W = max(W, 760)
    nlines = len(body) + 2
    H = BAR + PAD * 2 + LINE_H * nlines

    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # barra de titulo do GNOME
    d.rectangle([0, 0, W, BAR], fill=BARBG)
    tb = d.textbbox((0, 0), title, font=uifontb)
    d.text(((W - (tb[2] - tb[0])) / 2, (BAR - (tb[3] - tb[1])) / 2 - tb[1]),
           title, font=uifontb, fill=BARTXT)
    window_buttons(d, W)
    # linha separadora sutil
    d.line([0, BAR, W, BAR], fill=(30, 30, 30))

    y = BAR + PAD
    x = draw_prompt(d, y)
    d.text((x, y), command, font=fontb, fill=WHITE)
    y += LINE_H * 2
    for line in body:
        line = line[:MAXCOLS]
        d.text((PAD, y), line, font=font, fill=base_color(line))
        y += LINE_H

    img.save(os.path.join(OUT, outfile))
    print("gerado:", outfile, img.size)


def main():
    T = "denergomes@LTdnk47: ~/projetos/techsecure-devsecops"
    render("02-testes-pytest.txt", "fig-01-testes.png", "python -m pytest", T, 40)
    render("03a-bandit.txt", "fig-02-bandit.png", "bandit -r app", T, 40)
    render("03b-pip-audit.txt", "fig-03-pip-audit.png", "pip-audit -r requirements.txt", T, 40)
    render("03c-trivy-fs.txt", "fig-04-trivy-fs.png", "trivy fs --severity HIGH,CRITICAL .", T, 40)
    render("04-docker-build.txt", "fig-05-docker-build.png", "docker build -t techsecure-app:latest .", T, 20)
    render("04b-trivy-image.txt", "fig-06-trivy-image.png", "trivy image techsecure-app:latest", T, 30)
    render("05-docker-ps.txt", "fig-07-container.png", "docker ps", T, 12)
    app = []
    for fn, ep in [("06-app-health.txt", "health"),
                   ("06-app-version.txt", "api/version"),
                   ("06-app-soma.txt", "api/soma?a=2&b=3")]:
        pth = os.path.join(EVID, fn)
        val = open(pth).read().strip() if os.path.exists(pth) else ""
        app.append("$ curl http://localhost:8080/%s" % ep)
        app.append(val)
        app.append("")
    with open(os.path.join(EVID, "_app.txt"), "w") as f:
        f.write("\n".join(app))
    render("_app.txt", "fig-08-app-endpoints.png", "curl http://localhost:8080/...", T, 14)


if __name__ == "__main__":
    main()
