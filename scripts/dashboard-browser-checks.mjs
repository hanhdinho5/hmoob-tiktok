import assert from 'node:assert/strict';

export async function checkDashboard({navigate,evaluate,until,screenshot,viewport,send,delay}){
 await viewport(1440,1000);await navigate('/');
 await until(()=>evaluate('location.pathname.endsWith("/dashboard.html") && window.HmongDashboard?.ready'),'home opens unified dashboard');
 const game='document.querySelector("#preview").contentWindow.Hmong3D';
 assert.equal(await evaluate(`${game}.stats().characters`),0,'Preview starts empty, without automatic fake viewers');
 assert.equal(await evaluate('document.querySelectorAll("#testGift").length'),1);
 await until(()=>evaluate('!!HmongDashboard.voiceSample?.reference'),'male sample available on dashboard');
 await evaluate('document.querySelector("#mcSample").click()',true);await until(()=>evaluate('HmongDashboard.voiceSample.audio.currentTime>0'),'male sample plays on control page');await evaluate('document.querySelector("#mcSample").click()',true);assert.equal(await evaluate('HmongDashboard.voiceSample.audio.paused'),true);
 const displayUrl=await evaluate('document.querySelector("#overlayUrl").textContent');assert.ok(displayUrl.includes('/games/hmong-3d/index.html'));assert.equal(new URL(displayUrl).searchParams.has('demo'),false);assert.match(new URL(displayUrl).searchParams.get('room'),/^local_[a-f0-9]{32}$/);
 assert.equal(await evaluate('new Promise(resolve=>{const s=io();s.emit("join-control-room","invalid",reply=>{s.disconnect();resolve(reply.ok);});})'),false);
 const {targetId}=await send('Target.createTarget',{url:displayUrl,newWindow:true});const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const display=expression=>evaluate(expression,false,sessionId);
 try{
  await until(()=>display('window.Hmong3D?.ready'),'separate display page');
  await until(()=>evaluate('document.querySelector("#displayStatus").dataset.connected==="true"'),'dashboard detects separate display');
  await evaluate('document.querySelector("#username").value="test_username";document.querySelector("#username").dispatchEvent(new Event("input"))');
  assert.equal(new URL(await evaluate('document.querySelector("#overlayUrl").textContent')).searchParams.get('room'),new URL(displayUrl).searchParams.get('room'),'typing a username preserves display control room');
  await evaluate('document.querySelector("#username").value="";document.querySelector("#username").dispatchEvent(new Event("input"))');
  await evaluate("document.querySelector('#musicLights').checked=false;document.querySelector('#lightIntensity').value='0.35';document.querySelector('#lightIntensity').dispatchEvent(new Event('input'))");
  await until(()=>display('Hmong3D.director.rendering.stage.lighting.options.intensity===.35 && Hmong3D.director.rendering.stage.lighting.options.musicLights===false'),'lighting settings reach separate display');
  await evaluate("document.querySelector('#musicLights').checked=true;document.querySelector('#lightIntensity').value='0.8';document.querySelector('#lightIntensity').dispatchEvent(new Event('input'))");
  await until(()=>display('Hmong3D.director.rendering.stage.lighting.options.musicLights===true'),'restore music lights');

  assert.equal(await display('getComputedStyle(document.querySelector(".overlay-footer")).display'),'none');
  await evaluate('document.querySelector("[data-player-action=join]").click()');
  await until(()=>evaluate(`${game}.stats().characters===1`),'add one in preview');await until(()=>display('Hmong3D.stats().characters===1'),'add one on display');
  const first=await evaluate(`${game}.snapshot()[0].key`);assert.ok(first.startsWith('dashboard_sim_'));
  await evaluate('document.querySelector("#testComment").value="nhảy 2";document.querySelector("[data-player-action=chat]").click()');
  await until(()=>evaluate(`${game}.snapshot()[0].base==='danceB'`),'selected viewer chooses dance');await until(()=>display("Hmong3D.snapshot()[0].base==='danceB'"),'display receives viewer command');
  for(const [command,gender]of [['nam','male'],['nữ','female'],['nu','female']]){
   await evaluate(`document.querySelector('#testComment').value=${JSON.stringify(command)};document.querySelector('[data-player-action=chat]').click()`);
   await until(()=>evaluate(`${game}.snapshot()[0].selectedGender==='${gender}'`),`${command} changes own preview avatar`);
   await until(()=>display(`Hmong3D.snapshot()[0].selectedGender==='${gender}'`),`${command} reaches separate display`);
   assert.equal(await display(`Hmong3D.director.characters.config.characters[Hmong3D.snapshot()[0].index].id.startsWith('${gender}-')`),true);
   assert.equal(await display('Hmong3D.snapshot()[0].base'),'danceB');
  }
  await evaluate('document.querySelector("[data-player-action=join10]").click()');await until(()=>evaluate(`${game}.stats().characters===11`),'add ten in preview');await until(()=>display('Hmong3D.stats().characters===11'),'add ten on display');
  await evaluate('document.querySelector("[data-player-action=duplicate]").click()');await until(()=>evaluate(`${game}.stats().queue===0`),'duplicate events drain');assert.equal(await evaluate(`${game}.stats().characters`),11);
  const others=await display(`JSON.stringify(Hmong3D.snapshot().filter(p=>p.key!==${JSON.stringify(first)}).map(p=>[p.key,p.index]))`);
  await evaluate('document.querySelector("#testGiftKind").value="medium";document.querySelector("#testGiftCount").value="1";document.querySelector("#testGift").click()');
  await until(()=>display('Hmong3D.stats().cameraShot==="change"'),'gift change scene starts');
  await display('Hmong3D.director.update(2.7)');
  assert.equal(await display(`Hmong3D.director.characters.config.characters[Hmong3D.snapshot().find(p=>p.key===${JSON.stringify(first)}).index].id.startsWith('female-')`),true);
  assert.equal(await display(`JSON.stringify(Hmong3D.snapshot().filter(p=>p.key!==${JSON.stringify(first)}).map(p=>[p.key,p.index]))`),others);
  await display('Hmong3D.director.clear()');await evaluate(`${game}.director.clear()`);
  await evaluate('document.querySelector("#testGiftKind").value="large";document.querySelector("#testGiftCount").value="2";document.querySelector("#testGift").click()');
  await until(()=>display(`Hmong3D.snapshot().find(p=>p.key===${JSON.stringify(first)})?.action==='celebrate'`),'gift combo on selected display avatar');
  await until(()=>display(`Hmong3D.snapshot().find(p=>p.key===${JSON.stringify(first)})?.action==='danceB'`),'preferred dance resumes');
  await evaluate('document.querySelector("[data-player-action=leave]").click()');await until(()=>display('Hmong3D.stats().characters===10'),'remove selected simulated viewer');
  await evaluate(`${game}.inject('chat',{user:{uniqueId:'dashboard_sim_real_account',nickname:'Người thật'},comment:'Nyob zoo!'})`);await display("Hmong3D.inject('chat',{user:{uniqueId:'dashboard_sim_real_account',nickname:'Người thật'},comment:'Nyob zoo!'})");
  await until(()=>display('Hmong3D.stats().characters===11'),'real viewer preserved setup');
  await evaluate('document.querySelector("[data-player-action=reset]").click()');await until(()=>display('Hmong3D.stats().characters===1'),'clear only test viewers');assert.equal(await display('Hmong3D.snapshot()[0].key'),'dashboard_sim_real_account');
  await evaluate('document.querySelector("#clear").click()');await until(()=>display('Hmong3D.stats().characters===0'),'explicit clear room');
  await evaluate('document.querySelector("[data-player-action=joinAll]").click()');await until(()=>evaluate(`${game}.stats().characters===20`),'all twenty models from dashboard');await until(()=>display('Hmong3D.stats().characters===20'),'twenty on display');
  assert.equal(await evaluate(`new Set(${game}.snapshot().map(p=>p.index)).size`),20);
  for(const dance of ['danceD','danceE','danceF','danceA','danceB','danceC']){
   await evaluate(`document.querySelector('#animation').value='${dance}';document.querySelector('#animation').dispatchEvent(new Event('input'))`);
   await until(()=>display(`Hmong3D.snapshot().every(p=>p.clip==='${dance}')`),`${dance} for all models on display`);
  }
  await evaluate(`${game}.director.clear()`);await display('Hmong3D.director.clear()');
  await evaluate('document.querySelector("[data-player-action=beer]").click()');await until(()=>evaluate(`${game}.stats().cameraShot==='beer'`),'beer preview scene');await until(()=>display('Hmong3D.stats().cameraShot==="beer"'),'beer scene reaches separate display');
  const guest=await evaluate(`${game}.stats().socialPeer`);assert.equal(await display('Hmong3D.stats().socialPeer'),guest,'beer guest must match across preview/display');
  await evaluate(`${game}.director.active.time=12.75;${game}.director.update(0)`);await display('Hmong3D.director.active.time=12.75;Hmong3D.director.update(0)');
  assert.equal(await display('Hmong3D.stats().socialPhase'),'clink');await evaluate(`${game}.director.active.time=22;${game}.director.update(0)`);await display('Hmong3D.director.active.time=22;Hmong3D.director.update(0)');
  assert.equal(await display('Hmong3D.snapshot().every(p=>p.base==="danceC")'),true);
  await screenshot('hmong-unified-dashboard.png');
  const health=await evaluate('fetch("/api/health").then(r=>r.json())');assert.equal(health.stats.activeConnections,0,'Local display must not start TikTok connections');
  await evaluate('document.querySelector("[data-player-action=auto]").click()');assert.equal(await evaluate('!!HmongDashboard.sim.timer'),true);await evaluate('document.querySelector("[data-player-action=reset]").click()');await until(()=>display('Hmong3D.stats().characters===0'),'stop auto and clear test viewers');assert.equal(await evaluate('HmongDashboard.sim.timer'),null);
  await viewport(390,844);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'dashboard mobile overflow');await screenshot('hmong-unified-dashboard-mobile.png');
 }finally{await send('Target.closeTarget',{targetId});}
 await viewport(1440,1000);await navigate('/games/hmong-3d/simulator.html');await until(()=>evaluate('location.pathname.endsWith("/dashboard.html") && window.HmongDashboard?.ready'),'old simulator redirects to dashboard');
 console.log('PASS: two-page workflow, dashboard game controls reach preview and separate display, own dances, gifts, leave, fake-only clear and all 20 models.');
}
