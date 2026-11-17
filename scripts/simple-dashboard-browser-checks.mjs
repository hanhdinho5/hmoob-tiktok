import assert from 'node:assert/strict';
export async function checkDashboard({navigate,evaluate,until,screenshot,viewport,send}){
 await viewport(1440,1000);await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'simple dashboard ready');
 const game='document.querySelector("#preview").contentWindow.Hmong3D';
 assert.equal(await evaluate(`${game}.stats().characters`),0);assert.equal(await evaluate('document.querySelectorAll("[data-gift-id]").length'),9);assert.equal(await evaluate('document.querySelectorAll(".controls > section").length'),4);
 assert.equal(await evaluate('!!document.querySelector("#giftRules,#formation,#variant,#animationButtons,#mcSample")'),false,'advanced and duplicate controls removed');
 const displayUrl=await evaluate('document.querySelector("#overlayUrl").textContent');assert.match(new URL(displayUrl).searchParams.get('room'),/^local_[a-f0-9]{32}$/);
 const {targetId}=await send('Target.createTarget',{url:displayUrl,newWindow:true}),{sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});const display=expression=>evaluate(expression,false,sessionId);
 try{
  await until(()=>display('window.Hmong3D?.ready'),'separate display ready');
  await evaluate('document.querySelector("[data-action=chat]").click()');await until(()=>evaluate(`${game}.stats().characters===1`),'first comment creates viewer');await until(()=>display('Hmong3D.stats().characters===1'),'comment reaches display');
  await evaluate('document.querySelector("[data-action=like]").click()');await until(()=>evaluate(`${game}.stats().characters===2`),'like creates viewer');await until(()=>display('Hmong3D.stats().characters===2'),'like reaches display');
  await evaluate('document.querySelector("[data-action=join10]").click()');await until(()=>evaluate(`${game}.stats().characters===12`),'add ten');await until(()=>display('Hmong3D.stats().characters===12'),'add ten reaches display');
  await evaluate(`document.querySelector('#testViewer').selectedIndex=1;document.querySelector('[data-gift-id="5487"]').click()`);await until(()=>evaluate(`${game}.stats().cameraShot==='car'`),'car gift preview');await until(()=>display('Hmong3D.stats().cameraShot==="car"'),'car gift display');
  await evaluate(`${game}.director.clear()`);await display('Hmong3D.director.clear()');
  await evaluate(`document.querySelector('[data-gift-id="5827"]').click()`);await until(()=>display('Hmong3D.stats().cameraShot==="beer"'),'beer gift works');await evaluate(`${game}.director.clear()`);await display('Hmong3D.director.clear()');
  assert.ok(await evaluate('document.querySelector("#musicTrack").options.length>=3'));
  const original=await evaluate('document.querySelector("#musicTrack").value');await evaluate('document.querySelector("#musicNext").click()');const next=await evaluate('document.querySelector("#musicTrack").value');assert.notEqual(next,original);await until(()=>display(`Hmong3D.music.current.id===${JSON.stringify(next)}`),'next song reaches display');
  await evaluate('document.querySelector("#musicPrevious").click()');await until(()=>display(`Hmong3D.music.current.id===${JSON.stringify(original)}`),'previous song reaches display');
  await evaluate('document.querySelector("#musicVolume").value="0.2";document.querySelector("#musicVolume").dispatchEvent(new Event("input"))');await until(()=>display('Hmong3D.music.baseVolume===.2'),'music volume reaches display');assert.equal(await evaluate(`${game}.music.audio.muted`),true);
  await evaluate('document.querySelector("#musicTrack").value="ThlxD4LeFQo";document.querySelector("#musicTrack").dispatchEvent(new Event("change"))');
  await until(()=>display('Hmong3D.music.current.id==="ThlxD4LeFQo"&&Hmong3D.music.audio.readyState>=2'),'new song decodes on display');
  const duration=await display('Hmong3D.music.audio.duration');assert.ok(duration>205&&duration<215);
  await evaluate('Hmong3D.music.play()',true,sessionId);await until(()=>display('Hmong3D.music.audio.currentTime>.1&&!Hmong3D.music.audio.paused'),'downloaded song actually plays');
  await evaluate('document.querySelector("#musicToggle").click()');await until(()=>display('Hmong3D.music.enabled===false'),'pause music reaches display');await evaluate('document.querySelector("#musicToggle").click()');await until(()=>display('Hmong3D.music.enabled===true'),'play music reaches display');
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);await screenshot('hmong-simple-dashboard-desktop.png');
  await viewport(390,844);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);await screenshot('hmong-simple-dashboard-mobile.png');
  await evaluate(`${game}.inject('member',{user:{uniqueId:'real_viewer',nickname:'Real viewer'}})`);await display("Hmong3D.inject('member',{user:{uniqueId:'real_viewer',nickname:'Real viewer'}})");await until(()=>display('Hmong3D.stats().characters===13'),'real viewer exists');
  await evaluate('document.querySelector("[data-action=reset]").click()');await until(()=>evaluate(`${game}.stats().characters===1`),'clear only test people');await until(()=>display('Hmong3D.stats().characters===1'),'clear reaches display and preserves real viewer');
  // A gift can also create a viewer when the test roster is empty.
  await evaluate(`document.querySelector('[data-gift-id="5655"]').click()`);await until(()=>display('Hmong3D.stats().cameraShot==="zoom"'),'gift auto-creates test sender');
 }finally{await send('Target.closeTarget',{targetId});}
 console.log('PASS: simplified four-section dashboard, comment/like/new sender spawns, gift actions, independent display synchronization, music controls, mobile layout and safe test reset.');
}
