import { createRequire } from 'node:module';
// Local Chrome QA using its built-in DevTools protocol; no extra npm dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const socketRequire=createRequire(createRequire(import.meta.url).resolve('socket.io'));
const WebSocket=socketRequire('ws');
const root=fileURLToPath(new URL('../',import.meta.url));
const chrome=process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
assert.ok(fs.existsSync(chrome),'Set CHROME_PATH to an installed Chrome/Chromium executable.');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'hmong-live-qa-'));
const artifacts=path.join(root,'artifacts');fs.mkdirSync(artifacts,{recursive:true});
const free=net.createServer();await new Promise(resolve=>free.listen(0,'127.0.0.1',resolve));const port=free.address().port;await new Promise(resolve=>free.close(resolve));
const base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['src/server.js'],{cwd:root,env:{...process.env,PORT:String(port)},windowsHide:true,stdio:['ignore','pipe','pipe']});
let serverOutput='';server.stdout.on('data',b=>{serverOutput+=b;});server.stderr.on('data',b=>{serverOutput+=b;});
let browser,ws;
async function until(callback,label){for(let i=0;i<150;i++){const value=await callback();if(value)return value;await delay(100);}throw Error(`Timeout: ${label}\n${serverOutput}`);}
try {
 console.log('Checking local server startup…');
 await until(async()=>{try{return(await fetch(`${base}/api/health`,{signal:AbortSignal.timeout(1500)})).ok;}catch{return false;}},'server startup');
 console.log('Starting headless Chrome…');
 browser=spawn(chrome,['--headless=new','--disable-gpu','--mute-audio','--enable-unsafe-swiftshader','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 const debugFile=path.join(profile,'DevToolsActivePort');
 await until(()=>fs.existsSync(debugFile),'Chrome DevTools');
 const debugPort=fs.readFileSync(debugFile,'utf8').split('\n')[0];
 const targets=await(await fetch(`http://127.0.0.1:${debugPort}/json/list`,{signal:AbortSignal.timeout(1500)})).json();
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 let id=0;const pending=new Map(),errors=[],badResponses=[];
 ws.addEventListener('message',message=>{const event=JSON.parse(message.data);if(event.id){const item=pending.get(event.id);pending.delete(event.id);if(event.error)item.reject(Error(JSON.stringify(event.error)));else item.resolve(event.result);}else if(event.method==='Runtime.exceptionThrown')errors.push(event.params.exceptionDetails);else if(event.method==='Network.responseReceived'&&event.params.response.status>=400&&!event.params.response.url.endsWith('/favicon.ico'))badResponses.push(event.params.response.url);});
 function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(Error(`CDP timeout: ${method}`));},10000);pending.set(key,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id:key,method,params,...(sessionId?{sessionId}:{})}));});}
 async function evaluate(expression,userGesture=false,sessionId){const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture},sessionId);if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;}
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
 async function viewport(width,height){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});}
 async function navigate(url){
  await evaluate('window.__qaLeavingDocument=true');await send('Page.navigate',{url:base+url});
  const ready=async()=>{try{return await evaluate('(async()=>{if(window.__qaLeavingDocument||document.readyState!=="complete"||!window.HmongI18n)return false;const i18n=window.HmongI18n;await i18n.ready;return window.HmongI18n===i18n;})()');}catch(error){if(/context.*destroyed|Cannot find context|target navigated/i.test(error.message))return false;throw error;}};
  await until(ready,url);await delay(250);await until(ready,`${url} after redirects`);
 }
 async function screenshot(name){const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(artifacts,name),Buffer.from(result.data,'base64'));}

 if(!process.argv.includes('--three-only')&&!process.argv.includes('--music-only')&&!process.argv.includes('--simulator-only')&&!process.argv.includes('--mc-only')&&!process.argv.includes('--dashboard-only')&&!process.argv.includes('--shows-only')&&!process.argv.includes('--motion-only')&&!process.argv.includes('--occlusion-only')&&!process.argv.includes('--lighting-only')&&!process.argv.includes('--beer-only')&&!process.argv.includes('--dance-only')&&!process.argv.includes('--dj-only')&&!process.argv.includes('--portrait-only')&&!process.argv.includes('--camera-only')&&!process.argv.includes('--connect-only')) {
 await viewport(1440,1000);await navigate('/');
 assert.equal(await evaluate('HmongI18n.language'),'hmn');
 await until(()=>evaluate('window.HmongDashboard?.ready'),'home dashboard');
 assert.ok(await evaluate('location.pathname.endsWith("/dashboard.html")'));
 await evaluate('scrollTo({top:0,behavior:"instant"})');
 await screenshot('hmong-home-desktop.png');
 await viewport(390,844);await navigate('/');
 assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),'Home overflows mobile viewport');
 await screenshot('hmong-home-mobile.png');

 await navigate('/debug.html');
 assert.ok(await evaluate('document.title.includes("H’Mông")'));
 }
 if(process.argv.includes('--music-only')){
  await navigate('/debug.html');
  await evaluate('(async()=>{const {MusicPlayer}=await import("/lib/music-player.js");window.musicCheck=new MusicPlayer();await musicCheck.load();musicCheck.select(musicCheck.tracks.at(-1).id,false);})()');
  await evaluate('musicCheck.play()',true);
  await until(async()=>evaluate('musicCheck.audio.readyState >= 2 && musicCheck.audio.currentTime > 0'),'trimmed local audio decodes and plays');
  assert.ok(await evaluate('Math.abs(musicCheck.audio.duration - musicCheck.current.duration) < .05'),'Audio duration must match playlist metadata');
  await evaluate('musicCheck.audio.dispatchEvent(new Event("ended"))',true);
  await until(async()=>evaluate('musicCheck.current.id === "m4UT1z6jVf4"'),'third song loops to first song');
  await evaluate('musicCheck.dispose()');
  console.log('PASS: newest local M4A plays in Chrome, duration matches metadata, playlist loops to the first song.');
 }
 if(process.argv.includes('--three')||process.argv.includes('--three-only')) {
  console.log('Checking 3D WebGL / GLB / controls…');
  await viewport(1440,900);await navigate('/games/hmong-3d/index.html?metrics=1&mode=stage');
  await until(async()=>evaluate('!!window.Hmong3D?.ready'),'3D model loading');
  assert.equal(await evaluate('Hmong3D.stats().characters'),6);
  assert.equal(await evaluate('Hmong3D.stats().allCharactersFramed'),true);
  assert.ok(await evaluate('Hmong3D.music.tracks.length >= 3'));
  await evaluate('Hmong3D.music.play()',true);
  await until(async()=>evaluate('Hmong3D.music.audio.readyState >= 2 && Hmong3D.music.audio.currentTime > 0'),'first local music decodes and plays');
  assert.ok(await evaluate('Math.abs(Hmong3D.music.audio.duration - 233) < 3'));
  await evaluate('Hmong3D.music.next(true)',true);
  await until(async()=>evaluate('Hmong3D.music.current.id === "RPS4tUgiTjY" && Hmong3D.music.audio.currentTime > 0'),'second local music decodes and plays');
  assert.ok(await evaluate('Math.abs(Hmong3D.music.audio.duration - 234) < 3'));
  await evaluate('Hmong3D.music.next(true)',true);
  await until(async()=>evaluate('Hmong3D.music.current.id === "Un4PF7fTBbk-0230-0800" && Hmong3D.music.audio.currentTime > 0'),'trimmed third song decodes and plays');
  assert.ok(await evaluate('Math.abs(Hmong3D.music.audio.duration - 330) < .05'));
  await evaluate('Hmong3D.music.select(Hmong3D.music.tracks.at(-1).id,false);Hmong3D.music.audio.dispatchEvent(new Event("ended"))',true);
  await until(async()=>evaluate('Hmong3D.music.current.id === "m4UT1z6jVf4"'),'music playlist loops');
  await evaluate('Hmong3D.settings({musicEnabled:false,musicVolume:.2})');
  assert.ok(await evaluate('Hmong3D.music.audio.paused && Hmong3D.music.audio.volume === .2'));
  assert.ok(await evaluate('document.querySelector(".scene-note").textContent.includes("Trang phục và điệu múa")'),'Vietnamese Unicode was corrupted');
  const before=await evaluate('JSON.stringify(Hmong3D.snapshot().map(p=>[p.head,p.spriteRotation,p.position]))');await delay(450);
  assert.notEqual(await evaluate('JSON.stringify(Hmong3D.snapshot().map(p=>p.head))'),before,'Character did not animate');
  assert.ok(await evaluate('Hmong3D.stats().drawCalls > 0 && Hmong3D.stats().triangles > 0'));
  await screenshot('hmong-3d-stage-desktop.png');
  await viewport(540,960);await delay(1400);await screenshot('hmong-3d-stage-vertical.png');
  await evaluate('Hmong3D.settings({animation:"idle"});Hmong3D.inject("gift",{user:{uniqueId:"viewer",nickname:"Nyob zoo!"},giftName:"Rose",giftValue:1,repeatCount:1})');
  await until(async()=>evaluate('Hmong3D.snapshot()[0].action === "dance"'),'gift animation mapping');
  await evaluate('Hmong3D.settings({mode:"crowd",limit:30});for(let i=0;i<80;i++)Hmong3D.inject("member",{user:{uniqueId:"same_user",nickname:"Nyob zoo!"}})');
  await until(async()=>evaluate('Hmong3D.stats().queue === 0'),'event queue drains');
  assert.equal(await evaluate('Hmong3D.stats().characters'),1,'Duplicate viewer creates multiple characters');
  await evaluate('for(let i=0;i<1200;i++)Hmong3D.inject("like",{user:{uniqueId:"same_user",nickname:"Nyob zoo!"},likeCount:1})');
  assert.ok(await evaluate('Hmong3D.stats().queue <= 256 && Hmong3D.stats().dropped > 0'));
  await viewport(960,540);
  if(!process.argv.includes('--no-benchmark')) {
  const profiles=[];
  for(const count of [6,30,60]){
   await navigate(`/games/hmong-3d/index.html?benchmark=1&count=${count}&metrics=1`);
   await until(async()=>evaluate(`!!window.Hmong3D?.ready && Hmong3D.stats().characters === ${count}`),`benchmark ${count} characters`);
   assert.equal(await evaluate('Hmong3D.stats().allCharactersFramed'),true,`Camera crops ${count} people`);
   await delay(2200);const samples=[];for(let i=0;i<6;i++){await delay(1000);samples.push(await evaluate('Hmong3D.stats()'));}
   profiles.push({count,samples});
   if(count===30)await screenshot('hmong-3d-crowd-30.png');
   if(count===60){await screenshot('hmong-3d-crowd-60.png');await viewport(540,960);await delay(1200);assert.equal(await evaluate('Hmong3D.stats().allCharactersFramed'),true,'Portrait camera crops 60 people');await screenshot('hmong-3d-crowd-60-vertical.png');await viewport(960,540);}
  }
  const environment=await evaluate('(()=>{const gl=document.querySelector("#scene").getContext("webgl2"),ext=gl.getExtension("WEBGL_debug_renderer_info");return {userAgent:navigator.userAgent,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):"unavailable",vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):"unavailable",deviceMemory:navigator.deviceMemory??null};})()');
  fs.writeFileSync(path.join(artifacts,'hmong-3d-performance.json'),JSON.stringify({method:'Chrome headless; software WebGL allowed; 960×540; warmup >=2.2s; 6 samples separated by 1s; not OBS/hardware certification',environment,profiles},null,2));
  }
  await navigate('/games/hmong-3d/dashboard.html');
  await until(async()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D?.ready'),'3D admin preview');
  assert.ok(await evaluate('document.querySelector("#musicTrack").options.length >= 3'));
  assert.equal(await evaluate('document.querySelector("#preview").contentWindow.Hmong3D.music.audio.muted'),true);
  await evaluate('document.querySelector("#mode").value="stage";document.querySelector("#mode").dispatchEvent(new Event("input"))');
  await until(async()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.snapshot().length === 6 && document.querySelector("#preview").contentWindow.Hmong3D.snapshot().every(p=>p.key.startsWith("performer_"))'),'admin stage preview mode control');
  await evaluate('document.querySelector("#mode").value="crowd";document.querySelector("#mode").dispatchEvent(new Event("input"))');
  await until(async()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.stats().characters === 0'),'admin preview mode control');
  await screenshot('hmong-3d-admin.png');
 }
 if(process.argv.includes('--dance-only')){const {checkDances}=await import('./dance-browser-checks.mjs');await checkDances({navigate,evaluate,until,viewport,screenshot,delay});}
 if(process.argv.includes('--beer-only')){const {checkBeer}=await import('./beer-browser-checks.mjs');await checkBeer({navigate,evaluate,until,viewport,screenshot,delay});}
 if(process.argv.includes('--lighting-only')){const {checkLighting}=await import('./lighting-browser-checks.mjs');await checkLighting({navigate,evaluate,until,viewport,screenshot,delay});}
 if(process.argv.includes('--occlusion-only')){const {checkOcclusion}=await import('./occlusion-browser-checks.mjs');await checkOcclusion({navigate,evaluate,until,viewport,screenshot,delay});}
 if(process.argv.includes('--motion-only')){const {checkCrowdMotion}=await import('./crowd-motion-browser-checks.mjs');await checkCrowdMotion({navigate,evaluate,until,screenshot,viewport,delay});}
 if(process.argv.includes('--connect-only')){const {checkConnectButton}=await import('./connect-browser-checks.mjs');await checkConnectButton({send,navigate,evaluate,until,viewport,screenshot});}
 if(process.argv.includes('--camera-only')){const {checkCameraMotion}=await import('./camera-browser-checks.mjs');await checkCameraMotion({navigate,evaluate,until,screenshot,viewport});}
 if(process.argv.includes('--portrait-only')){const {checkPortrait}=await import('./portrait-browser-checks.mjs');await checkPortrait({navigate,evaluate,until,screenshot,viewport});}
 if(process.argv.includes('--dj-only')){const {checkDJ}=await import('./dj-browser-checks.mjs');await checkDJ({navigate,evaluate,until,screenshot,viewport});}
 if(process.argv.includes('--shows-only')){const {checkGiftShows}=await import('./gift-show-browser-checks.mjs');await checkGiftShows({navigate,evaluate,until,screenshot,viewport,delay});}
 if(process.argv.includes('--simulator')||process.argv.includes('--simulator-only')||process.argv.includes('--dashboard-only')){const {checkDashboard}=await import('./simple-dashboard-browser-checks.mjs');await checkDashboard({navigate,evaluate,until,screenshot,viewport,send,delay});}
 if(process.argv.includes('--mc-only')){
  await viewport(1280,800);await navigate('/games/hmong-3d/index.html?mode=stage&music=0&mc=0');
  await until(()=>evaluate('window.Hmong3D?.ready && !!Hmong3D.mc.reference'),'male reference loaded');
  assert.equal(await evaluate('Hmong3D.mc.gender'),'male');assert.equal(await evaluate('document.querySelector("#mcStatus").textContent.includes("bản thu nữ")'),false);
  await evaluate('Hmong3D.music.setVolume(.4);document.querySelector("#mcReference").click()',true);
  await until(()=>evaluate('Hmong3D.mc.audio.readyState>=2 && Hmong3D.mc.audio.currentTime>0'),'male reference decodes and plays');
  assert.ok(await evaluate('Math.abs(Hmong3D.mc.audio.duration-30)<.01'));assert.equal(await evaluate('Hmong3D.music.audio.volume'),.1);
  await evaluate('document.querySelector("#mcReference").click()',true);assert.equal(await evaluate('Hmong3D.mc.audio.paused'),true);assert.equal(await evaluate('Hmong3D.music.audio.volume'),.4);
  assert.equal(await evaluate('Hmong3D.mc.event("member")'),false);assert.equal(await evaluate('Hmong3D.mc.audio.paused'),true);
  await screenshot('hmong-male-mc-reference.png');
  await navigate('/games/hmong-3d/index.html?hud=0&music=0');await until(()=>evaluate('window.Hmong3D?.ready'),'silent MC preview');assert.equal(await evaluate('Hmong3D.mc.playReference()'),false);
 }
 assert.equal(errors.length,0,JSON.stringify(errors));
 assert.equal(badResponses.length,0,JSON.stringify(badResponses));
 if(!process.argv.includes('--music-only')){
  console.log('PASS: selected browser checks, game rendering, controls, Unicode and asset responses.');
  console.log('Screenshots saved in artifacts/. Live TikTok and streaming software require a real session.');
 }
} finally {
 ws?.close();
 browser?.kill();server.kill();
 // Only this script's fresh temporary profile can be removed.
 await delay(700);
 const target=path.resolve(profile),parent=path.resolve(os.tmpdir());
 if(path.dirname(target)===parent&&path.basename(target).startsWith('hmong-live-qa-')){
  try{fs.rmSync(target,{recursive:true,force:true,maxRetries:3,retryDelay:200});}catch{}
 }
}
