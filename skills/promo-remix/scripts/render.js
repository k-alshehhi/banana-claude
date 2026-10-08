// Usage:
//   node render.js <page.html> stills <outdir> <t1> <t2> ...     -> outdir/s_<t>.jpg
//   node render.js <page.html> video  <out.mp4> <durationSec> [fps]
// The page must define window.render(t) that fully sets the frame for time t (seconds).
const path = require('path');
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
const { spawn } = require('child_process');
(async () => {
  const [page, mode, out, ...rest] = process.argv.slice(2);
  const W = +(process.env.W || 1920), H = +(process.env.H || 1080);
  const b = await pw.chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(page));
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; }))));
  if (mode === 'stills') {
    for (const t of rest) { await p.evaluate(t => render(+t), t); await p.screenshot({ path: `${out}/s_${t}.jpg`, type: 'jpeg', quality: 80 }); }
  } else {
    const fps = +(rest[1] || 30), N = Math.round(+rest[0] * fps);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < N; i++) {
      await p.evaluate(t => render(t), i / fps);
      const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 100 === 0) console.log('frame', i, '/', N);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
