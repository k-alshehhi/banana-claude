const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn } = require('child_process');
(async()=>{
  const [mode, out, ...rest] = process.argv.slice(2);
  const b = await chromium.launch({args:['--force-device-scale-factor=1']});
  const p = await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror', e=>console.error('PAGEERR', e.message));
  await p.goto('file://'+__dirname+'/build/index.html');
  await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(()=>Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r))));
  if(mode==='stills'){
    for(const t of rest){ await p.evaluate(t=>render(+t), t); await p.screenshot({path:`${out}/s_${t}.jpg`,type:'jpeg',quality:80}); }
  } else {
    const fps=30, dur=+rest[0]||28.1, N=Math.round(dur*fps);
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium',out],{stdio:['pipe','inherit','inherit']});
    for(let i=0;i<N;i++){ await p.evaluate(t=>render(t), i/fps); const buf=await p.screenshot({type:'jpeg',quality:95}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%100===0) console.log('frame',i,'/',N); }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
