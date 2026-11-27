import { exerciseModules } from './modules.mjs';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { startFixture, email, password, failures, delays, tables, requests } from './fixture.mjs';

const base = 'http://127.0.0.1:3243';
const output = 'test-results/user-behavior';
await mkdir(output, {recursive:true});
const server = await startFixture();
const browser = await chromium.launch();
const context = await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce',serviceWorkers:'block'});
await context.route('**/*', route => [base,'http://127.0.0.1:3242'].includes(new URL(route.request().url()).origin) ? route.continue() : route.abort());
const page = await context.newPage();
page.setDefaultTimeout(10000);
page.setDefaultNavigationTimeout(100000);
const rows = [];
const failuresInPage = [];
page.on('pageerror', e => failuresInPage.push(e.message));
const visit = async path => {
  await page.goto(base + path, {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.__starx_auth_store && !window.__starx_auth_store.getState().isLoading, undefined, {timeout:60000});
  const consent = page.locator('#consent-essential-only');
  if(await consent.isVisible()) await consent.click();
};
const button = (name,p=page) => p.getByRole('button',{name,exact:true}).first();
const nav = async (name,p=page) => {
  const item = p.locator('button[data-nav-item]').filter({has:p.getByText(name,{exact:true})}).first();
  await item.click();
  await p.waitForFunction(() => document.querySelector('[aria-label="Dashboard workspace"]')?.innerText.trim().length > 10);
};
async function run(name, fn) {
  try { const detail = await fn(); rows.push({name,pass:true,detail}); }
  catch(e) { rows.push({name,pass:false,error:String(e.message).slice(0,800)}); }
  console.log(rows.at(-1).pass?'PASS':'FAIL',name,rows.at(-1).error ?? '');
  await writeFile(output+'/interactions.json',JSON.stringify(rows,null,2));
}
const fillDemo = async () => {
  await page.locator('[name=fullName]').fill('QA 👩🏽‍💻 Singh');
  await page.locator('[name=businessName]').fill('Étoile & मित्र');
  await page.locator('[name=workEmail]').fill(email);
};
const submitDemo = () => page.locator('form button[type=submit]').click();
const awaitChange = async predicate => {
  for(let i=0;i<120;i++){if(predicate())return; await sleep(50);}
  assert.fail('Expected disposable storage change');
};
const workflowName = 'QA ✨ Workflow';
const startWizard = async () => {
  await nav('Home'); await button('Build Flow').click();
  await page.getByPlaceholder('E.g. Weekend Promotion Bot').fill(workflowName);
};
const next = () => button('Continue').click();
const bookForm = async () => {
  await nav('Calendar'); await button('New Appointment').click();
  await page.getByPlaceholder('e.g. Maria Rossi').fill('QA booking 👩🏽‍💻');
};
try {
  await run('anonymous dashboard resolves to login with a return path',async()=>{
    await visit('/dashboard'); await page.waitForURL('**/login?returnUrl=/dashboard',{timeout:60000});
    await page.getByPlaceholder('Email or Username').first().waitFor();
  });
  await run('demo empty then corrected; no empty writes',async()=>{
    await visit('/demo'); await submitDemo();
    await page.getByText('Name must be at least 2 characters',{exact:true}).waitFor();
    await fillDemo(); assert.equal(tables.get('demo_requests')?.length ?? 0,0);
  });
  await run('phone contact with empty phone stays on demo form',async()=>{
    await page.locator('[name=preferredContact]').selectOption('phone'); await submitDemo();
    await page.getByText(/enter.*phone number|phone number.*required/i).first().waitFor();
    assert.equal(tables.get('demo_requests')?.length ?? 0,0);
  });
  await run('demo rejected write retains draft and shows a retry',async()=>{
    failures.add('POST demo_requests');
    try {await visit('/demo');await fillDemo();await submitDemo();
      await page.getByText(/could not save|couldn.t save|unable to save/i).first().waitFor();
      assert.equal(await page.locator('[name=fullName]').inputValue(),'QA 👩🏽‍💻 Singh');
    } finally { failures.delete('POST demo_requests'); }
  });
  await run('20 rapid demo submit clicks during a two-second write create one record',async()=>{
    await visit('/demo'); await fillDemo(); delays.set('POST demo_requests',2000);
    const before = tables.get('demo_requests')?.length ?? 0;
    try {await page.locator('form button[type=submit]').evaluate(el=>{for(let i=0;i<20;i++)el.click();});
      await page.getByText('Demonstration Request Confirmed').waitFor({timeout:20000});
      assert.equal(tables.get('demo_requests').length-before,1);
    } finally {delays.delete('POST demo_requests');}
  });
  await run('password form rejects bad password, then signs into disposable account',async()=>{
    await visit('/login');
    await page.getByPlaceholder('Email or Username').first().fill(email);
    await page.getByPlaceholder('Password',{exact:true}).first().fill('wrong-value');
    await page.getByTestId('login-submit-btn').click();
    await page.getByText(/invalid login credentials|invalid_grant/i).first().waitFor();
    await page.getByPlaceholder('Password',{exact:true}).first().fill(password);
    await page.getByTestId('login-submit-btn').click();
    await page.waitForURL('**/dashboard',{timeout:60000});
    await button('Build Flow').waitFor({timeout:60000});
  });
  if (!page.url().endsWith('/dashboard')) throw Error('Fixture login failed; dependent checks not run');
  const modules = ['Home','Calendar','AI Playground','Knowledge','Orders','AI Receptionist','Voice AI','Business OS','Team','Tasks','Customers','Workflows','Channels','Analytics','Settings','Inbox'];
  for (const label of modules) await run('switch to '+label+' and read its workspace',async()=>{
    const before = await page.locator('[aria-label="Dashboard workspace"]').innerText();
    await nav(label);
    if(label!=='Home') await page.waitForFunction(prev => {const s=document.querySelector('[aria-label="Dashboard workspace"]')?.innerText.trim();return s && s.length>12 && s!==prev;},before);
    const text = await page.locator('[aria-label="Dashboard workspace"]').innerText(); return text.slice(0,100);
  });
  await run('empty inbox has no fictitious unread badge',async()=>{
    const text=await page.locator('[data-nav-item]').filter({hasText:/^Inbox/}).innerText();
    assert.doesNotMatch(text,/\d/);
  });
  await run('whitespace workflow name cannot advance',async()=>{
    await startWizard();await page.getByPlaceholder('E.g. Weekend Promotion Bot').fill('   ');
    assert(await button('Continue').isDisabled());
  });
  await page.keyboard.press('Escape');
  await run('no trigger selected cannot advance',async()=>{
    await startWizard();await next(); assert(await button('Continue').isDisabled());
  });
  await page.keyboard.press('Escape');
  await run('failed workflow deploy keeps draft; retry stores one workflow',async()=>{
    await startWizard();await next();await button('Website Chat Initiated').click();await next();
    await button('Generate AI Response').click();await next();
    failures.add('POST workflows');
    try {await button('Deploy Workflow').click();await page.getByRole('alert').filter({hasText:/workflow/i}).waitFor();}
    finally {failures.delete('POST workflows');}
    await button('Deploy Workflow').click();await page.getByText('Workflow Deployed!',{exact:true}).waitFor();
    assert.equal(tables.get('workflows').filter(r=>r.name===workflowName).length,1);
  });
  await page.keyboard.press('Escape');
  await run('end before start gives actionable appointment feedback',async()=>{
    await bookForm();await page.locator('input[type=time]').last().fill('08:00');await button('Confirm Slot').click();
    await page.getByText(/end time must be after start time/i).waitFor();
  });
  await page.keyboard.press('Escape');
  await run('appointment reject preserves draft and permits retry',async()=>{
    await bookForm(); await page.locator('input[type=time]').last().fill('11:00');
    failures.add('POST appointments');
    try {await button('Confirm Slot').click();await page.getByText(/could not save|couldn.t save|unable to save/i).first().waitFor();}
    finally {failures.delete('POST appointments');}
    assert.equal(await page.getByPlaceholder('e.g. Maria Rossi').inputValue(),'QA booking 👩🏽‍💻');
    await button('Confirm Slot').click();await awaitChange(() => tables.get('appointments')?.length===1);
  });
  await page.keyboard.press('Escape');
  await run('refresh during pending booking leaves one durable appointment',async()=>{
    await bookForm();await page.locator('input[type=time]').first().fill('15:00');await page.locator('input[type=time]').last().fill('15:30');
    const count=requests.filter(r=>r==='POST appointments').length;
    delays.set('POST appointments',1400);
    try {await button('Confirm Slot').click(); await awaitChange(()=>requests.filter(r=>r==='POST appointments').length>count);
      await page.reload({waitUntil:'domcontentloaded'}); await nav('Calendar');await awaitChange(()=>tables.get('appointments')?.some(r=>r.customer_name==='QA booking 👩🏽‍💻' && tables.get('appointments').length===2));
      await page.reload({waitUntil:'domcontentloaded'});await nav('Calendar');await page.getByText('QA booking 👩🏽‍💻',{exact:true}).first().waitFor();assert.equal(await page.getByText('QA booking 👩🏽‍💻',{exact:true}).count(),2);
    } finally {delays.delete('POST appointments');}
  });
  await run('dashboard section survives refresh',async()=>{
    await nav('Tasks');await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Tasks',exact:true}).first().waitFor();
  });
  await run('dashboard Back returns to previous module',async()=>{
    await nav('Calendar');await nav('Workflows');await page.goBack({waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Bookings',exact:true}).waitFor();
  });
  await run('offline and reconnect indicator',async()=>{
    await visit('/dashboard');await button('Build Flow').waitFor();await context.setOffline(true);
    try {await page.getByRole('alert').filter({hasText:/offline/i}).waitFor();} finally {await context.setOffline(false);}
    await page.getByRole('alert').filter({hasText:/offline/i}).waitFor({state:'hidden'});
  });
  await exerciseModules({run,page,context,base,nav,visit,button});
  await run('independent admin sections on disposable admin session',async()=>{
    await visit('/admin');await page.locator('button[data-nav-item]').first().waitFor();
    const items=page.locator('button[data-nav-item]');const count=await items.count();
    for(let i=0;i<count;i++){await items.nth(i).click();await page.waitForTimeout(150);}
    assert(count>=5);return count+' sections';
  });
  await run('five tabs see logout without manual refresh',async()=>{
    const tabs=[page,...await Promise.all(Array.from({length:4},()=>context.newPage()))];
    try {
      await Promise.all(tabs.map(p=>p.goto(base+'/dashboard',{waitUntil:'domcontentloaded'})));
      await Promise.all(tabs.map(p=>p.getByRole('button',{name:'Log out',exact:true}).waitFor()));
      await button('Log out').click();
      await Promise.all(tabs.slice(1).map(p=>p.waitForURL('**/login**',{timeout:12500})));
    } finally {await Promise.all(tabs.slice(1).map(p=>p.close()));}
  });
} finally {
  await writeFile(output+'/page-errors.json',JSON.stringify(failuresInPage,null,2));
  await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));
}
console.log(rows.length,'journeys;',rows.filter(r=>!r.pass).length,'failed');
process.exitCode=rows.every(r=>r.pass)?0:1;
