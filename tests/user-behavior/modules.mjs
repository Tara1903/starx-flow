import assert from 'node:assert/strict';
import { db, tables, failures, requests, email, password } from './fixture.mjs';

export async function exerciseModules({run,page,context,base,nav,visit,button}) {
  const work = page.getByRole('region',{name:'Dashboard workspace'});
  for (const [module,action,placeholder] of [
    ['Customers','Add Customer','e.g. Klaus Schneider'],['Tasks','New Task','e.g. Follow up with VIP lead regarding contract'],
    ['Team','Invite Member','e.g. Elena Weber'],['Knowledge','Add Document / FAQ','E.g. Services, Pricing & Cancellation Terms'],
    ['Orders','Create Order','E.g. Charlotte Müller']
  ]) {
    await run(module+' cancels and reopens an incomplete form',async()=>{
      await nav(module);
      const size = requests.filter(x=>x.startsWith('POST ')).length;
      for(const input of ['    ','A💬 नमस्ते '.repeat(120)]) {
        await button(action).click();
        const field=page.getByPlaceholder(placeholder,{exact:true});
        await field.fill(input);
        await button('Cancel').click();
        await field.waitFor({state:'hidden'});
      }
      assert.equal(requests.filter(x=>x.startsWith('POST ')).length,size);
    });
  }
  await run('five integration setup dialogs close with Escape',async()=>{
    await nav('Channels');
    const connect = work.getByRole('button',{name:'Connect',exact:true});
    await connect.first().waitFor();
    assert.equal(await connect.count(),5);
    for(let i=0;i<5;i++) {
      await connect.nth(i).click();
      await page.locator('form').filter({hasText:/connect|embedded|Meta/i}).first().waitFor();
      await page.keyboard.press('Escape');
      await page.locator('form').filter({hasText:/connect|embedded|Meta/i}).first().waitFor({state:'hidden'});
    }
  });
  await run('settings erase confirmation cancels without a request',async()=>{
    await nav('Settings');
    const before=requests.filter(x=>x.startsWith('DELETE')).length;
    await button('Erase All Data (Art. 17)').click();await button('Cancel').click();
    assert.equal(requests.filter(x=>x.startsWith('DELETE')).length,before);
  });
  await run('billing checkout and customer portal recover from provider outage',async()=>{
    await nav('Settings');
    const paths=[];
    const deny = route => {paths.push(new URL(route.request().url()).pathname);return route.fulfill({status:503,json:{error:'Billing is temporarily unavailable'}});};
    await page.route('**/api/billing/{checkout,portal}',deny);
    try {
      for(const label of ['Upgrade to Growth ($59/mo)','Manage Invoices & Billing']) {
        const btn=button(label);await btn.click();
        await page.getByText('Billing is temporarily unavailable',{exact:false}).first().waitFor();
        await page.waitForFunction(() => !document.querySelector('button[aria-busy=true]'));assert(await btn.isEnabled());
      }
      assert.deepEqual(paths,['/api/billing/checkout','/api/billing/portal']);
    } finally {await page.unroute('**/api/billing/{checkout,portal}',deny);}
  });
  await run('dismiss an overview notification',async()=>{
    await nav('Home');const dismiss=page.getByRole('button',{name:/Dismiss .*notification|Dismiss onboarding alert/}).first();
    await dismiss.waitFor();const label=await dismiss.getAttribute('aria-label');await dismiss.click();
    await button(label).waitFor({state:'hidden'});
  });
  await run('five tabs edit the same workflow; four stale drafts remain recoverable',async()=>{
    const workflow=tables.get('workflows')?.[0];assert(workflow);
    const tabs=await Promise.all(Array.from({length:5},()=>context.newPage()));
    try {
      await Promise.all(tabs.map(async(p,i)=>{
        await p.goto(base+'/dashboard?section=workflow_editor&workflow='+workflow.id,{waitUntil:'domcontentloaded'});
        const input=p.getByPlaceholder('e.g. Off-Hours SMS Triage');
        await p.waitForFunction(name=>[...document.querySelectorAll('input')].some(el=>el.value===name),workflow.name);
        await input.fill('Concurrent draft '+i);
      }));
      await Promise.all(tabs.map(p=>p.getByRole('button',{name:'Save Workflow',exact:true}).click()));
      const outcomes=await Promise.all(tabs.map(async(p,i)=>{
        await p.waitForFunction(()=>document.querySelector('[role=alert]')?.textContent?.includes('another tab') || new URL(location.href).searchParams.get('section')==='workflows');
        if(new URL(p.url()).searchParams.get('section')==='workflows')return 'saved';
        assert.equal(await p.getByPlaceholder('e.g. Off-Hours SMS Triage').inputValue(),'Concurrent draft '+i);
        return 'conflict';
      }));
      assert.equal(outcomes.filter(x=>x==='saved').length,1);
      assert.equal(workflow.edit_version,1);
      return outcomes;
    } finally {await Promise.all(tabs.map(p=>p.close()));}
  });
  await run('toggle workflow then save in editor, and deep-link to a non-first workflow',async()=>{
    const workflows=tables.get('workflows') ?? [];
    const first=workflows[0];assert(first);
    const second={
      id:'11111111-2222-4333-8444-555555555555',
      user_id:tables.get('profiles')[0].id,
      name:'Second Workflow QA',
      description:'Deep-link verification workflow',
      trigger:'Website Chat Initiated',
      action:'Generate AI Response',
      is_active:true,
      channel:'Web',
      ai_tone:'Friendly',
      custom_prompt:'Assist visitors.',
      config:{steps:[]},
      edit_version:0,
      created_at:new Date().toISOString(),
    };
    workflows.push(second);
    try {
      await visit('/dashboard?section=workflows');
      const expectedVersion = first.edit_version + 1;
      await page.getByRole('switch',{name:/^(Activate|Deactivate) workflow$/}).first().click();
      for(let i=0;i<60 && first.edit_version<expectedVersion;i++) await new Promise(r=>setTimeout(r,50));
      assert.equal(first.edit_version,expectedVersion);
      await page.getByRole('button',{name:'Configure',exact:true}).first().click();
      const input=page.getByPlaceholder('e.g. Off-Hours SMS Triage');
      await input.waitFor();
      await input.fill('Toggled and Edited');
      await button('Save Workflow').click();
      await page.waitForFunction(()=>new URL(location.href).searchParams.get('section')==='workflows');
      assert.equal(first.name,'Toggled and Edited');

      await page.goto(base+'/dashboard?section=workflow_editor&workflow='+second.id,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(name=>[...document.querySelectorAll('input')].some(el=>el.value===name),second.name);
      assert.equal(await page.getByPlaceholder('e.g. Off-Hours SMS Triage').inputValue(),second.name);
    } finally {
      const idx=workflows.indexOf(second);if(idx!==-1)workflows.splice(idx,1);
    }
  });
  await run('fresh profile cannot finish onboarding by visiting dashboard or launch directly',async()=>{
    const profile=tables.get('profiles')[0];profile.onboarding_complete=false;
    try {
      await visit('/dashboard');await page.waitForURL('**/setup/welcome');
      await visit('/setup/launch');await page.waitForURL('**/setup/account');
      assert.equal(profile.onboarding_complete,false);
      await page.getByPlaceholder('e.g. Alex Johnson').fill('   ');
      await button('Save and Continue').click();await page.getByText('Please fill in all required fields.').waitFor();
      await visit('/setup/welcome');
      page.once('dialog',d=>d.dismiss());await button('Skip to Dashboard').click();assert.equal(profile.onboarding_complete,false);
      failures.add('PATCH profiles');page.once('dialog',d=>d.accept());
      await button('Skip to Dashboard').click();await page.getByRole('alert').filter({hasText:'Could not save setup'}).waitFor();
      assert.equal(profile.onboarding_complete,false);failures.delete('PATCH profiles');
      page.once('dialog',d=>d.accept());await button('Skip to Dashboard').click();await page.waitForURL('**/dashboard');
      assert.equal(profile.onboarding_complete,true);
    } finally {profile.onboarding_complete=true;failures.delete('PATCH profiles');}
  });
  await run('mobile API rejects invalid device values, deduplicates repeated registrations and reports a write outage',async()=>{
    const login=await fetch('http://127.0.0.1:3242/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
    const headers={authorization:'Bearer '+(await login.json()).access_token,'content-type':'application/json'};
    const register=(token,platform)=>fetch(base+'/api/mobile/v1/notifications/register',{method:'POST',headers,body:JSON.stringify({token,platform})});
    for(const [token,platform] of [['  ','android'],['fixture',7],['device_token_placeholder','android'],['x'.repeat(2049),'ios']]){
      assert.equal((await register(token,platform)).status,400);
    }
    const token='fixture-device-9';
    assert.equal((await register(token,'iOS')).status,200);assert.equal((await register(token,'iOS')).status,200);
    assert.equal((await db.query('select count(*)::integer as count from mobile_push_devices')).rows[0].count,1);
    failures.add('POST mobile_push_devices');
    try {assert.equal((await register('second-fixture-device','android')).status,503);}
    finally {failures.delete('POST mobile_push_devices');}
    const summary=await fetch(base+'/api/mobile/v1/dashboard/summary',{headers});
    assert.equal(summary.status,200);assert.equal((await summary.json()).summary.upcomingBookingsCount,2);
    failures.add('GET orders');try {assert.equal((await fetch(base+'/api/mobile/v1/dashboard/summary',{headers})).status,503);}finally {failures.delete('GET orders');}
  });
}

