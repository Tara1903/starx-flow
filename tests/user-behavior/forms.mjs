import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base='http://127.0.0.1:3243';
const output='test-results/user-behavior/forms.json';
const browser=await chromium.launch();
const rows=[];
try {
  const cold=await browser.newContext({javaScriptEnabled:false});
  const coldPage=await cold.newPage();await coldPage.goto(base+'/demo');
  const frozen=await coldPage.locator('form button[type=submit]').isDisabled();
  rows.push({scenario:'slow/no JavaScript prevents native demo submission',pass:frozen});
  await cold.close();
  const values=[
    ['fullName','',false],['fullName','   ',false],['fullName','A',false],['fullName','南李',true],
    ['fullName','A'.repeat(100),true],['fullName','A'.repeat(101),false],['fullName','A'.repeat(8192),false],
    ['businessName','  ',false],['businessName','A',false],['businessName','東京 ✨',true],
    ['businessName','B'.repeat(100),true],['businessName','B'.repeat(101),false],
    ['workEmail','nonsense',false],['workEmail','name@',false],['workEmail','owner+qa@example.test',true],
    ['phone','bananas',false],['phone','☎️',false],['phone','123456',false],['phone','1234567',true],
    ['phone','1'.repeat(15),true],['phone','1'.repeat(16),false],['phone','+44 (7700) 900-077',true],
    ['phone','',true],['phone','',false,'phone'],['phone','',false,'whatsapp'],['phone','+91 98765 12345',true,'whatsapp'],
  ];
  const context=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();
  await context.route('**/*',route=>new URL(route.request().url()).origin===base ? route.continue():route.abort());
  let submissions=[];
  await page.route('**/api/demo',async route=>{
    submissions.push(route.request().postDataJSON());
    await route.fulfill({status:503,json:{error:'Test boundary reached. Retry available.'}});
  });
  for(const width of [390,1440,320,768]) {
    await page.setViewportSize({width,height:900});
    await page.goto(base+'/demo');
    await page.locator('fieldset:not(:disabled)').waitFor();
    for(const [field,input,valid,contact='email'] of values) {
      for(const [key,value] of Object.entries({fullName:'QA Name',businessName:'QA Studio',workEmail:'qa@example.test',phone:''})) {
        await page.locator('[name='+key+']').fill(value);
      }
      await page.locator('[name=preferredContact]').selectOption(contact);
      const el=page.locator('[name='+field+']');
      await el.fill(input);await el.press('Tab');
      const consent=page.locator('#consent-essential-only');if(await consent.isVisible())await consent.click();
      const count=submissions.length;
      await page.locator('form button[type=submit]').click();
      let pass;
      try {
        if(valid) {
          await page.waitForFunction(()=>document.querySelector('form')?.textContent.includes('Test boundary reached'));
          assert.equal(submissions.length,count+1);
          assert.equal(submissions.at(-1)[field],input.trim());
        } else {
          await page.waitForFunction(()=>document.querySelector('form :invalid, form p.text-red-400'));
          assert.equal(submissions.length,count);
        }
        pass=true;
      } catch {pass=false;}
      rows.push({width,field,length:input.length,input:input.slice(0,32),contact,expected:valid?'request':'validation',pass});
    }
  }
  await context.close();
} finally {
  await browser.close();
  await mkdir('test-results/user-behavior',{recursive:true});
  await writeFile(output,JSON.stringify(rows,null,2));
}
console.log('Form cases:',rows.length,'failed:',rows.filter(r=>!r.pass).length);
process.exitCode=rows.every(r=>r.pass)?0:1;
