const {chromium} = require('@playwright/test');
const fs=require('fs');
async function captureFull(page,path) {
 const viewport=page.viewportSize();
 const height=await page.evaluate(()=>Math.max(document.documentElement.scrollHeight,innerHeight));
 await page.setViewportSize({width:viewport.width,height});
 await page.waitForTimeout(250);
 await page.screenshot({path,fullPage:false});
 await page.setViewportSize(viewport);
 await page.waitForTimeout(250);
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const errors=[]; const checks=[]; const context=await browser.newContext({reducedMotion:'reduce'});
 let page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
 const routes=[['home','/'],['levels','/levels'],['learn','/learn'],['gate','/learn/xnor'],['puzzle','/puzzle/1'],['not-found','/missing']];
 for(const [width,height] of [[360,800],[768,1024],[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});
  for(const [name,url] of routes){
   await page.goto('http://127.0.0.1:4173'+url); await page.locator('main h1').waitFor(); await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(200);
   const dimension=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
   checks.push({name,width,height,...dimension,passed:dimension.doc<=width&&dimension.body<=width});
   if(width===360||width===1366) await captureFull(page,'.impeccable/review/'+name+'-'+width+'.png');
  }
 }
 const demo=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await demo.addInitScript(state=>localStorage.setItem('electric-cards:v1',state),fs.readFileSync('.impeccable/review/demo-progress.json','utf8'));
 page=await demo.newPage(); page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/puzzle/1'); await page.getByRole('button',{name:'Eliminar AND 1'}).waitFor(); await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(200);
 await page.waitForFunction(() => {
  const edges = JSON.parse(localStorage.getItem('electric-cards:v1'))?.drafts?.[1]?.circuit.edges ?? [];
  if (edges.length !== 3) return false;
  return edges.every(edge => {
   const path = document.querySelector(`[data-id="${edge.id}"] .react-flow__edge-path`);
   if (!path) return false;
   return ['source','target'].every(side => {
    const port = document.querySelector(`[data-testid="port-${edge[side]}-${edge[side+'Handle']}"]`);
    if (!port) return false;
    const box=port.getBoundingClientRect(), p=path.getPointAtLength(side==='source'?0:path.getTotalLength());
    const point=new DOMPoint(p.x,p.y).matrixTransform(path.getScreenCTM());
    return Math.hypot(point.x-(side==='source'?box.right:box.left),point.y-(box.y+box.height/2))<2;
   });
  });
 });
 await captureFull(page,'.impeccable/review/desktop.png');
 await page.setViewportSize({width:390,height:844}); await page.getByRole('button',{name:'Organizar tablero'}).click(); await page.waitForTimeout(200);
 await captureFull(page,'.impeccable/review/mobile.png');
 await page.getByRole('button',{name:'Probar circuito'}).click();
 await page.getByRole('heading',{name:'¡Circuito resuelto!'}).waitFor();
 await captureFull(page,'.impeccable/review/puzzle-success-mobile.png');
 fs.writeFileSync('.impeccable/review/responsive-checks.json',JSON.stringify({checks,errors},null,2));
 console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.passed),errors}));
 await browser.close();
 if(checks.some(c=>!c.passed)||errors.length) process.exitCode=1;
})();

