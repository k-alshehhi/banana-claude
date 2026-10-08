"""Usage: python3 sheet.py out.jpg s_1.jpg s_2.jpg ...  -> 3-column labelled contact sheet for review."""
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
w, h, cols = 640, 360, 3
rows = (len(files) + cols - 1) // cols
S = Image.new('RGB', (w * cols, h * rows), 'gray')
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h)); d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 90, 22), fill='yellow'); d.text((4, 4), f.split('_')[-1].rsplit('.', 1)[0], fill='black')
    S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(out, quality=85)
