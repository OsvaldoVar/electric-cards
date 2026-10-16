const { chromium } = require('@playwright/test');
(async () => {
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1487,height:1058},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/puzzle/1');
 await page.getByRole('button',{name:'Añadir AND. 1 disponibles'}).click();
 const wire=async(source,target)=>{await page.getByRole('combobox',{name:'Origen del cable'}).selectOption({label:source});await page.getByRole('combobox',{name:'Destino del cable'}).selectOption({label:target});await page.getByRole('button',{name:'Conectar',exact:true}).click();};
 await wire('Sensor A','AND 1 · entrada A'); await wire('Sensor B','AND 1 · entrada B'); await wire('AND 1','Puerta · entrada única');
 await page.evaluate(()=>document.fonts.ready);
 await page.getByRole('button',{name:'Ajustar tablero'}).click();
 await page.waitForTimeout(250);
 await page.screenshot({path:'.impeccable/review/hero-repro.png'});
 require('fs').writeFileSync('.impeccable/review/demo-progress.json', await page.evaluate(()=>localStorage.getItem('electric-cards:v1')));
 console.log(JSON.stringify({width:await page.evaluate(()=>document.documentElement.scrollWidth),viewport:1487}));
 await browser.close();
})();
