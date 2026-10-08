---
name: promo-remix
description: "Remake a reference promo/ad/motion-graphics video with a different product, text, colors or brand, by rebuilding it as a frame-accurate HTML animation and rendering it to MP4. Use when the user shares a video and asks for 'the same thing but with my product', 'same style for X', a launch/promo video in the style of another, or a kinetic-typography product video. Also works without a reference: build a launch video from a brief."
argument-hint: "<reference video path> <what to change: product, text, colors, brand>"
---

# Promo Remix -- rebuild a promo video with a new product

The approach: never edit the source pixels. Study the reference, then rebuild every
scene as HTML/CSS driven by one deterministic `window.render(t)` function, screenshot
it frame by frame with headless Chromium, and encode with ffmpeg. The result is fully
editable: swapping a product, a word or a color is a one-line change and a re-render.

Requirements: `ffmpeg`, Node + `playwright` with Chromium, Python 3 + Pillow.
Optional: `opencv-python-headless` (for removing text from reused photos).
Scripts live in `scripts/` next to this file; a full worked example (a 28s launch
video where a sneaker was replaced with a book, 14 scenes) is in `examples/book-launch/`.
Read `examples/book-launch/index.html` before writing a new page: reuse its helpers,
scene structure and patterns instead of starting from scratch.

## 1. Analyze the reference

```bash
bash scripts/analyze.sh <video> <work>/ref
```

Read every `sheet_NN.jpg` (each is 4 seconds at 4fps with timestamps). Write down a
scene table before coding: start/end time, background, text, elements, how each
element enters/exits (slide, blur-in, mask reveal, wipe, zoom, glitch), and where the
thing being replaced appears (hero shot, thumbnails, code, labels). Open a few
`full/f_SS.png` frames at full size to read small text, fonts and exact colors.

## 2. Confirm the plan (only what you can't decide)

Ask in the user's language, in one AskUserQuestion call, only what changes the work:
- Do they have an image of the new product/logo, or should you design a generic one?
- Anything else to change (brand name, tagline, colors, aspect ratio 16:9 vs 9:16)?

If the reference carries another company's logo/brand and the user will publish the
result, say so and offer to replace it with theirs.

## 3. Prepare assets (`<work>/build/assets/`)

- **User's product image:** remove/keep background as needed; transparent PNG is best.
- **No image: build the product in CSS** (3D box with `transform-style:preserve-3d`
  for books/boxes/packaging, or SVG for flat objects), then snapshot it:
  `node scripts/snap.js product.html assets/product.png` and trim with Pillow
  (`im.crop(im.getbbox())`). See `examples/book-launch/book.html`. Make sure it
  contrasts with the background it will sit on.
- **Photos from the reference** (scenery, textures) can be cropped from `full/` frames;
  remove baked-in text first: `python3 scripts/inpaint.py in.png out.png x0,y0,x1,y1,170 ...`
- Fonts: check `fc-list` for local fonts first (Inter / Inter Display cover most
  modern promos); use a monospace for UI/code labels.

## 4. Build the page (`<work>/build/index.html`)

Rules that keep the render deterministic:
- Fixed stage `1920x1080` (or `1080x1920` for vertical; pass `W`/`H` env to render.js).
- One `<div class="sc">` per scene; `render(t)` shows exactly one scene by time
  range and sets every animated style from `t`. No CSS animations, transitions,
  `setTimeout` or `Date.now()` -- frames are rendered out of real time.
- Helpers: `p(t,a,b)` progress 0..1, `lerp`, easings (`eo` ease-out, `eio`
  ease-in-out, `ex` expo, `eb` back), `blurIn(el,t,t0,dur)`; typing effects slice a
  string by `floor(progress*len)`; floating products use `sin(t)`; motion blur =
  CSS `filter:blur()` proportional to speed.
- Match the reference's timing to within ~0.1s per scene so the original music
  still lands on the cuts.
- Put the replaced product everywhere the original appeared (hero, thumbnails,
  code strings like `src="book.png"`, grid cards, timeline clips).

## 5. Preview, fix, render

```bash
node scripts/render.js build/index.html stills stills 0.2 1.5 3.0 ...   # one time per scene
python3 scripts/sheet.py review.jpg stills/s_*.jpg
```
Look at the sheet, compare with the reference sheets, fix layout/timing, repeat.
Check for: text leaking from masks, baked-in text in reused photos, elements
that blend into the background, scenes that are empty at their start.

```bash
node scripts/render.js build/index.html video silent.mp4 <duration>
ffmpeg -i silent.mp4 -i <reference> -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out.mp4
```
(Reuse the reference audio only if the user wants the same music; otherwise omit `-i <reference>` / `-map 1:a`.)
A 28s 1080p30 video renders in about 1-2 minutes.

## 6. Deliver

Make a final 1fps contact sheet of `out.mp4` and check it, send the MP4 to the user,
and summarize in their language: what was replaced where, what was approximated, and
what they can ask to change next (cover design, text, colors, vertical version).
