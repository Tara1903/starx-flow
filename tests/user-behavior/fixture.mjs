// Disposable HTTP boundary used by the local Next server and browser. No upstream forwarding.
import http from 'node:http';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

export const email = 'owner@example.test';
export const password = 'Disposable-Test-136!';
const owner = { id: 'd2cc7bfe-89dc-445d-aac8-77bc221a5063', email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} };
const profile = { id: owner.id, email, owner_name: 'QA Owner', business_name: 'QA Studio', business_type: 'Beauty & Wellness', role: 'admin', onboarding_complete: true };
export const tables = new Map([['profiles', [profile]]]);
export const requests = [];
export const failures = new Set();
export const delays = new Map();
const tokenPart = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
const token = [tokenPart({alg:'HS256',typ:'JWT'}), tokenPart({sub:owner.id,role:'authenticated',exp:Math.floor(Date.now()/1000)+86400,iat:Math.floor(Date.now()/1000)}), 'bG9jYWw'].join('.');
export let db;
export async function startFixture() {
  db = new PGlite();
  await db.exec(`create schema auth; create role authenticated; create role anon; create role service_role;
    create table auth.users(id uuid primary key);
    create table public.workflows (id uuid primary key, user_id uuid, name text, description text,
      trigger text, action text, is_active boolean, channel text, ai_tone text, custom_prompt text, config jsonb);`);
  await db.query('insert into auth.users values ($1)',[owner.id]);
  for (const name of ['20261122214758_mobile_push_devices','20261122214915_workflow_edit_version']) {
    await db.exec(await readFile('supabase/migrations/'+name+'.sql','utf8'));
  }
  await db.query("insert into workflows(id, user_id, name) values($1,$2,'initial')",[randomUUID(),owner.id]);
  const first = await db.query("update workflows set name='first' where edit_version=0 returning edit_version");
  const stale = await db.query("update workflows set name='stale' where edit_version=0 returning edit_version");
  if(Number(first.rows[0]?.edit_version)!==1 || stale.rows.length) throw Error('Postgres workflow revision guard failed');

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1:3242');
    const path = url.pathname;
    res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:3243');
    res.setHeader('Access-Control-Allow-Headers',req.headers['access-control-request-headers'] || '*');
    res.setHeader('Access-Control-Allow-Methods','GET,HEAD,OPTIONS,POST,PATCH,DELETE,PUT');
    res.setHeader('Access-Control-Expose-Headers','Content-Range');
    const send = (status, body) => { res.writeHead(status,{'Content-Type':'application/json'}); res.end(body === undefined ? undefined : JSON.stringify(body)); };
    if (req.method === 'OPTIONS') return send(204);
    let raw = ''; for await (const chunk of req) raw += chunk;
    let body; try {body = raw ? JSON.parse(raw) : {};} catch {return send(400,{message:'Invalid JSON'});}
    if (path === '/auth/v1/token') {
      if (!(body.email === email && body.password === password) && body.refresh_token !== 'local-refresh') return send(400,{error:'invalid_grant',error_description:'Invalid login credentials',message:'Invalid login credentials'});
      return send(200,{access_token:token,refresh_token:'local-refresh',expires_in:86400,token_type:'bearer',user:owner});
    }
    if (path === '/auth/v1/user') return send(200,owner);
    if (path === '/auth/v1/logout') return send(204);
    if (!path.startsWith('/rest/v1/')) return send(404,{message:'Fixture endpoint unavailable'});
    const table = path.slice('/rest/v1/'.length);
    const operation = req.method + ' ' + table;
    requests.push(operation);
    if (delays.has(operation)) await sleep(delays.get(operation));
    if (failures.has(operation)) return send(400,{message:'Test storage unavailable',code:'QA_REJECTED'});
    if (table === 'mobile_push_devices' && req.method === 'POST') {
      try {
        await db.query('insert into mobile_push_devices(platform,token,user_id) values($1,$2,$3) on conflict(platform,token) do update set user_id=excluded.user_id,updated_at=now()', [body.platform,body.token,body.user_id]);
        return send(201);
      } catch { return send(400,{message:'Registration rejected'}); }
    }
    const rows = tables.get(table) ?? [];
    tables.set(table, rows);
    const selected = rows.filter(row => [...url.searchParams].every(([key,value]) => !value.startsWith('eq.') || String(row[key]) === value.slice(3)));
    if (req.method === 'HEAD') {res.setHeader('Content-Range','*/'+selected.length);return send(200);}
    let result = selected;
    if (req.method === 'POST') {result = (Array.isArray(body) ? body : [body]).map(row => ({id:randomUUID(),created_at:new Date().toISOString(),...(table==='workflows'?{edit_version:0}:{}),...row}));rows.push(...result);}
    if (req.method === 'PATCH') selected.forEach(row => { Object.assign(row,body); if(table==='workflows') row.edit_version++; });
    if (req.method === 'DELETE') tables.set(table,rows.filter(row => !selected.includes(row)));
    if (req.headers.accept?.includes('vnd.pgrst.object')) return result.length === 1 ? send(200,result[0]) : send(406,{code:'PGRST116',message:'Expected one row'});
    return send(req.method === 'POST' ? 201 : 200,result);
  });
  await new Promise((resolve,reject) => server.once('error',reject).listen(3242,'127.0.0.1',resolve));
  return server;
}
