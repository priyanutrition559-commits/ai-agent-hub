"""Generate brand derivatives with Pillow; the supplied original is never modified.

python3 -m venv /tmp/stack-atlas-brand-tools
/tmp/stack-atlas-brand-tools/bin/pip install Pillow
/tmp/stack-atlas-brand-tools/bin/python scripts/generate-brand-assets.py
"""
from pathlib import Path
from PIL import Image

public = Path(__file__).resolve().parents[1] / "public"
with Image.open(public / "brand" / "guidesoft-logo.png") as source:
    artwork = source.convert("RGBA")
    artwork.save(public / "favicon.ico", format="ICO",
                 sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    artwork.resize((180, 180), Image.Resampling.LANCZOS).save(public / "apple-touch-icon.png")
    artwork.resize((256, 256), Image.Resampling.LANCZOS).save(public / "brand" / "guidesoft-mark.png")
