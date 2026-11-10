"""Gera os ícones do app a partir do logo simplificado (docs/marca/agnus-logo-simplificado.png).

Uso (precisa do Pillow: `python3 -m venv .venv && .venv/bin/pip install pillow`):
    .venv/bin/python scripts/gerar-icones.py ../docs/marca/agnus-logo-simplificado.png assets
"""
import sys
from PIL import Image

INK = (0x1D, 0x1C, 0x1A, 255)  # --ink do DESIGN.md: mesmo fundo do favicon e do logo512 do site

logo_path, out = sys.argv[1], sys.argv[2].rstrip("/")
logo = Image.open(logo_path).convert("RGBA")
lamb = logo.crop(logo.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())


def fit(img, box):
    """Redimensiona mantendo a proporção para caber num quadrado de `box` px."""
    scale = box / max(img.size)
    return img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)


def canvas(size, bg, art, frac):
    base = Image.new("RGBA", (size, size), bg)
    a = fit(art, round(size * frac))
    base.alpha_composite(a, ((size - a.width) // 2, (size - a.height) // 2))
    return base


def silhouette(img):
    """Monocromático do Android: corpo branco, traços vazados (como o simbolo-claro do site)."""
    px = img.load()
    res = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rpx = res.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a > 8 and (r + g + b) / 3 > 128:
                rpx[x, y] = (255, 255, 255, a)
    return res


# iOS e ícone geral: sem transparência (a App Store recusa alpha).
canvas(1024, INK, lamb, 0.72).convert("RGB").save(f"{out}/icon.png", optimize=True)
# Android adaptativo: o desenho fica na zona segura central (~66%) do primeiro plano.
canvas(512, (0, 0, 0, 0), lamb, 0.58).save(f"{out}/android-icon-foreground.png", optimize=True)
Image.new("RGBA", (512, 512), INK).save(f"{out}/android-icon-background.png", optimize=True)
canvas(432, (0, 0, 0, 0), silhouette(lamb), 0.58).save(f"{out}/android-icon-monochrome.png", optimize=True)
# Splash: o Cordeiro com contorno lê bem tanto na pedra clara quanto no fundo escuro.
canvas(1024, (0, 0, 0, 0), lamb, 0.9).save(f"{out}/splash-icon.png", optimize=True)
canvas(48, INK, lamb, 0.8).save(f"{out}/favicon.png", optimize=True)
print("ok")
