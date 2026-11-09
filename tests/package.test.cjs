const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
test('PWA manifest assets exist and icons are real correctly sized PNGs',()=>{
  const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  assert.equal(m.start_url,'./');assert.equal(m.scope,'./');assert.equal(m.display,'standalone');
  for(const icon of m.icons){const data=fs.readFileSync(path.join(root,icon.src));assert.equal(data.subarray(1,4).toString(),'PNG');const size=Number(icon.sizes.split('x')[0]);assert.equal(data.readUInt32BE(16),size);assert.equal(data.readUInt32BE(20),size);}
});
test('offline precache is complete and external requests are not intercepted',async()=>{
  const handlers={};const scope='https://example.github.io/kotoba/';let added;
  const context={URL,self:{registration:{scope},location:{origin:'https://example.github.io'},addEventListener:(name,cb)=>handlers[name]=cb},caches:{open:async()=>({addAll:async files=>{added=files;}})}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
  let install;handlers.install({waitUntil:p=>install=p});await install;
  for(const file of added){assert.ok(fs.existsSync(path.join(root,file==='./'?'index.html':file)),file);assert.ok(new URL(file,scope).href.startsWith(scope));}
  assert.ok(added.includes('./phrases.js'));assert.ok(added.includes('./app.js'));assert.ok(added.includes('./strokes.js'));
  handlers.fetch({request:{method:'GET',url:'https://translate.google.com/'},respondWith:()=>assert.fail('External site intercepted')});
  handlers.fetch({request:{method:'GET',url:scope+'unrelated.html'},respondWith:()=>assert.fail('Unrelated request intercepted')});
});
test('single-file edition has no required companion assets or service-worker registration',()=>{
  const html=fs.readFileSync(path.join(root,'standalone.html'),'utf8');
  assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+href="\.\//.test(html));assert.ok(!html.includes('serviceWorker.register'));
  assert.ok(html.includes('function check('));assert.ok(html.includes('function startQuiz('));
});
