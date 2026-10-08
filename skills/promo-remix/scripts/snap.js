// Usage: node snap.js <page.html> <out.png> [size=1000]
// Screenshots a page with a transparent background (for CSS-built products), then trim with:
//   python3 -c "from PIL import Image;im=Image.open('out.png');im.crop(im.getbbox()).save('out.png')"
const path = require('path');
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
(async () => {
  const [page, out, size = 1000] = process.argv.slice(2);
  const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: +size, height: +size } });
  await p.goto('file://' + path.resolve(page)); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out, omitBackground: true }); await b.close();
})();
