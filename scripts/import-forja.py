"""Atualiza a aba Simuladores com uma versão nova da página "Forja de Raridades".

Uso: python3 scripts/import-forja.py caminho/da/forja.html
(o HTML é o da página do usuário: https://claude.ai/artifact/TijmdkYLer9wsUu6EhD2pV)

Copia as fontes do @fontsource para public/forja/fonts (o app funciona offline)
e grava public/forja/index.html trocando o link do Google Fonts pelo fonts.css local.
"""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "forja")
FAMILIES = [("Cinzel", "cinzel", [500, 700]), ("Cormorant SC", "cormorant-sc", [500, 700]), ("IBM Plex Mono", "ibm-plex-mono", [400, 600]), ("Noto Sans", "noto-sans", [400, 500, 700])]
RANGES = {
    "latin": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
}


def main(src: str) -> None:
    os.makedirs(os.path.join(OUT, "fonts"), exist_ok=True)
    css = ["/* Fontes locais da Forja (o app funciona offline). Arquivos do @fontsource. */"]
    for name, pkg, weights in FAMILIES:
        for w in weights:
            for sub in ("latin-ext", "latin"):
                fn = f"{pkg}-{sub}-{w}-normal.woff2"
                shutil.copy(os.path.join(ROOT, "node_modules", "@fontsource", pkg, "files", fn), os.path.join(OUT, "fonts", fn))
                css.append(f'@font-face {{ font-family: "{name}"; font-style: normal; font-weight: {w}; font-display: swap; src: url("./fonts/{fn}") format("woff2"); unicode-range: {RANGES[sub]}; }}')
    with open(os.path.join(OUT, "fonts.css"), "w", encoding="utf8") as f:
        f.write("\n".join(css) + "\n")

    with open(src, encoding="utf8") as f:
        html = f.read()
    html = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\n?', "", html)
    html, n = re.subn(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]*">', '<link rel="stylesheet" href="./fonts.css">', html)
    if n != 1 or "googleapis" in html:
        sys.exit("Não achei (ou sobrou) o link do Google Fonts: confira o HTML.")
    html = html.replace("<!doctype html><html><head>", '<!doctype html><html lang="pt-BR"><head>', 1)
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf8") as f:
        f.write(html)
    print("ok:", os.path.join(OUT, "index.html"))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
