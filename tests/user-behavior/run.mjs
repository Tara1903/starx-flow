// Build a clean copy so Next cannot load the developer's .env or reuse production bundles.
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, unlink } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const buildDir = await mkdtemp(path.join(tmpdir(),'starx-ux-build-'));
const systemKeys = /^(path|pathext|systemroot|windir|temp|tmp|tmpdir|home|userprofile|appdata|localappdata|programfiles.*|systemdrive|comspec|number_of_processors|processor_architecture|lang|ssl_cert_file|node_extra_ca_certs|https?_proxy|no_proxy)$/i;
const env = Object.fromEntries(Object.entries(process.env).filter(([k])=>systemKeys.test(k)));
Object.assign(env,{NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:3242',SUPABASE_URL:'http://127.0.0.1:3242',NEXT_PUBLIC_SUPABASE_ANON_KEY:'local-test-anon',SUPABASE_SERVICE_ROLE_KEY:'local-test-server'});
function launch(args,cwd) {
  const child=spawn(process.execPath,args,{cwd,env,stdio:'inherit',windowsHide:true});
  const done=new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',code=>resolve(code));});
  return {child,done};
}
async function ensureFree(port) {
  const check=createServer();
  await new Promise((resolve,reject)=>check.once('error',reject).listen(port,'127.0.0.1',resolve));
  await new Promise(resolve=>check.close(resolve));
}
const linked=[];
let app;
try {
  await Promise.all([ensureFree(3242),ensureFree(3243)]);
  for(const name of ['src','package.json','package-lock.json','next.config.js','tsconfig.json','next-env.d.ts','postcss.config.mjs']) {
    await cp(path.join(root,name),path.join(buildDir,name),{recursive:true});
  }
  for(const name of ['node_modules','public']) {
    const link=path.join(buildDir,name);
    await symlink(path.join(root,name),link,process.platform==='win32'?'junction':'dir');linked.push(link);
  }
  const next=path.join(buildDir,'node_modules/next/dist/bin/next');
  if(await launch([next,'build','--webpack'],buildDir).done!==0)throw Error('Local build failed');
  app=launch([next,'start','--hostname','127.0.0.1','--port','3243'],buildDir);
  let ready=false;
  for(let i=0;i<100 && app.child.exitCode===null;i++){
    try {ready=(await fetch('http://127.0.0.1:3243/robots.txt')).ok;} catch{}
    if(ready)break;
    await sleep(200);
  }
  if(!ready)throw Error('Isolated app did not start');
  const suite = name => launch([path.join(root,'tests/user-behavior',name+'.mjs')],root).done;
  const results=await Promise.all([suite('public'),suite('forms'),suite('interactions')]);
  process.exitCode=results.every(code=>code===0)?0:1;
} finally {
  if(app){app.child.kill();await app.done;}
  for(const link of linked) await unlink(link);
  if(path.dirname(buildDir)===tmpdir() && path.basename(buildDir).startsWith('starx-ux-build-')) {
    await rm(buildDir,{recursive:true,force:true,maxRetries:3,retryDelay:300});
  }
}
