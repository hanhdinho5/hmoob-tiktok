import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const vi = JSON.parse(read('public/locales/vi.json'));
const hmn = JSON.parse(read('public/locales/hmn.json'));
const contexts = JSON.parse(read('docs/translation-context.json'));
const vars = text => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
assert.deepEqual(Object.keys(vi).sort(), Object.keys(hmn).sort());
assert.deepEqual(Object.keys(vi).sort(), Object.keys(contexts).sort());
for (const [key, item] of Object.entries(hmn)) {
  assert.ok(['TODO','user-provided','approved'].includes(item.status), key);
  assert.equal(typeof vi[key], 'string', key);
  if (item.status !== 'TODO') {
    assert.ok(typeof item.text === 'string' && item.text.trim(), key);
    assert.ok(item.source, `Missing translation reviewer/source: ${key}`);
    assert.deepEqual(vars(item.text), vars(vi[key]), `Missing template variables: ${key}`);
  }
}

function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(item => item.isDirectory() ? walk(path.join(dir,item.name)) : path.join(dir,item.name)); }
const files = walk(path.join(root,'public')).filter(p => /\.(html|js)$/.test(p));
for (const file of files) {
  const source = fs.readFileSync(file,'utf8');
  for (const [,key] of source.matchAll(/data-i18n(?:-(?:placeholder|aria-label|content))?="([^"]+)"|\bt\("([^"]+)"/g)) {
    if (key) assert.ok(key in vi, `Unknown HTML key ${key} in ${file}`);
  }
  for (const [,key] of source.matchAll(/\bt\("([^"]+)"/g)) assert.ok(key in vi, `Unknown dynamic key ${key} in ${file}`);
  if (file.endsWith('.js')) {
    if(/^\s*(?:import|export)\s/m.test(source)) {
      const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
    } else new vm.Script(source,{filename:file});
  }
  else {
    assert.equal((source.match(/href="\/css\/hmong-theme.css"/g)||[]).length,1,file);
    for(const [,attributes,inline]of source.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
      if(attributes?.includes('importmap'))JSON.parse(inline);else new vm.Script(inline,{filename:file});
    }
    for(const [,asset]of source.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
      if(asset.startsWith('http')||asset.startsWith('#')||asset.startsWith('/api/')||asset==='/socket.io/socket.io.js')continue;
      const target=asset.startsWith('/')?path.join(root,'public',asset):path.resolve(path.dirname(file),asset);
      assert.ok(fs.existsSync(target),`Missing HTML asset: ${file}: ${asset}`);
    }
  }
}

function i18nContext({failHmong=false}={}) {
 const doc={documentElement:{dataset:{}},querySelectorAll:()=>[],addEventListener:()=>{}};
 const translations=structuredClone(hmn);
 const context=vm.createContext({document:doc,location:{search:'',href:'http://localhost:3000/'},localStorage:{getItem:()=>null,setItem:()=>{}},history:{replaceState:()=>{}},URL,URLSearchParams,CustomEvent:class{},console:{error:()=>{}},fetch:async url=>({ok:!(failHmong&&url.includes('hmn')),json:async()=>url.includes('hmn')?translations:vi}),window:{dispatchEvent:()=>{}}});
 vm.runInContext(read('public/lib/i18n.js'),context);
 return {api:context.window.HmongI18n,translations};
}
const {api,translations}=i18nContext(); await api.ready;
assert.equal(api.t('common.hello'),'Nyob zoo!');
assert.equal(api.t('home.needUsername'),vi['home.needUsername']);
assert.equal(api.t('race.winner',{name:'Núi'}),'Núi chiến thắng!');
translations['home.needUsername']={text:'DO NOT SHOW DRAFT',status:'TODO'};
assert.equal(api.t('home.needUsername'),vi['home.needUsername']);
translations['race.winner']={text:'MISSING VARIABLE',status:'approved'};
assert.equal(api.t('race.winner',{name:'Núi'}),'Núi chiến thắng!');
assert.equal(api.isReviewed('race.winner'),false);
api.setLanguage('vi'); assert.equal(api.t('common.hello'),'Xin chào!');
api.setLanguage('invalid'); assert.equal(api.language,'vi');
const failed=i18nContext({failHmong:true});await failed.api.ready;assert.equal(failed.api.t('common.hello'),'Xin chào!');

// Manifest gates must keep unapproved, remote and traversal assets out of the renderer.
const trialManifest={characters:[
 {src:'/assets/hmong/male.png',approved:false,license:'CC0'},
 {src:'https://example.com/female.png',approved:true,license:'CC0'},
 {src:'/assets/../private.png',approved:true,license:'CC0'},
 {src:'/assets/hmong/approved.png',approved:true,license:'CC0'}
],background:{src:'/assets/background.jpg',approved:false},audio:{}};
const assetContext=vm.createContext({window:{},fetch:async()=>({ok:true,json:async()=>trialManifest}),console,performance, HmongI18n:api});
vm.runInContext(read('public/lib/hmong-assets.js'),assetContext);
await assetContext.window.HmongAssets.ready;
assert.deepEqual(Array.from(assetContext.window.HmongAssets.characters(['a','b','c','d'])),['a','b','c','/assets/hmong/approved.png']);
assert.equal(assetContext.window.HmongAssets.background('fallback.svg'),'fallback.svg');

// Exercise existing game logic with normalized-style chat/like/gift payloads.
let clock=10000;
const gameContext=vm.createContext({window:{},console,fetch:async()=>({ok:true,json:async()=>JSON.parse(read('public/locales/chat-commands.json'))}),performance:{now:()=>clock},Date:class extends Date {static now(){return clock;}},Image:class{}});
vm.runInContext(read('public/lib/chat-commands.js'),gameContext);
await gameContext.window.HmongChat.ready;
const matcher=gameContext.window.HmongChat;
for(const [viText,hmongText,expected] of [['Xin chào!','Nyob zoo!','hello'],['cam on','UA TSAUG!','thanks'],['tôi yêu bạn','Kuv hlub koj.','love'],['hẹn gặp lại','Sib ntsib dua!','goodbye'],['Bạn khỏe không?','Koj nyob li cas?','wellbeing']]) {
 assert.equal(matcher.intent(viText),expected);assert.equal(matcher.intent(hmongText),expected);
}
assert.equal(matcher.intent('koj zoo nkauj heev'),null);
assert.equal(matcher.intent('nyob zoob'),null); // Do not strip RPA tone letters.
assert.equal(matcher.intent('đừng nói xin chào'),null); // Avoid accidental substring commands.
const manifest=JSON.parse(read('public/assets/hmong/manifest.json'));
for(const asset of [...manifest.characters,manifest.background,...Object.values(manifest.audio)])if(asset.approved)assert.ok(fs.existsSync(path.join(root,'public',asset.src)),asset.src);

if(process.argv.includes('--write-review')) {
 const safe=s=>String(s).replaceAll('|','\\|').replaceAll('\n',' ');
 const lines=Object.entries(vi).map(([key,text])=>`| ${key} | ${safe(text)} | ${safe(hmn[key].text||'TODO — chờ người bản địa')} | ${safe(contexts[key].context)} | ${safe(contexts[key].original)} |`);
 fs.writeFileSync(path.join(root,'docs/HMONG_TRANSLATION_REVIEW.md'),'# Danh sách câu chữ để người bản địa duyệt\n\nPhương ngữ đích: gia đình tại Mù Cang Chải. Chữ RPA không tự xác định phương ngữ. `user-provided` là các ví dụ do người dùng cung cấp, chưa thay thế việc người bản địa duyệt toàn bộ sản phẩm. Các mục `TODO` hiển thị tiếng Việt dự phòng, không dùng bản dịch suy đoán.\n\nSửa `public/locales/hmn.json`: điền `text`, đặt `status: "approved"`, ghi người duyệt vào `source`. Giữ nguyên biến `{name}`, `{count}`, v.v. Chạy `node scripts/check-hmong.mjs --write-review` để kiểm tra và cập nhật bảng.\n\n| Key | Tiếng Việt | H’Mông | Ngữ cảnh | Câu gốc |\n|---|---|---|---|---|\n'+lines.join('\n')+'\n');
}
console.log(`PASS: ${Object.keys(vi).length} locale keys, reviewed-only fallback, placeholders, page assets, JavaScript syntax.`);
