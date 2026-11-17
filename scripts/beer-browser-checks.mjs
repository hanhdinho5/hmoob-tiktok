import assert from 'node:assert/strict';
export async function checkBeer({navigate,evaluate,until,viewport,screenshot,delay}){
 await viewport(390,844);await navigate('/games/hmong-3d/index.html?mode=crowd&music=0&mc=0');await until(()=>evaluate('window.Hmong3D?.ready'),'beer room ready');
 assert.equal(await evaluate('Hmong3D.director.rendering.stage.rooms.rooms.size'),2);assert.equal(await evaluate('Hmong3D.stats().characters'),0);
 await evaluate("Hmong3D.inject('gift',{user:{uniqueId:'beer_a',nickname:'Bạn A'},giftId:5827,giftName:'Ice Cream Cone',giftValue:1,repeatCount:1})");await until(()=>evaluate('Hmong3D.stats().characters===1'),'solo beer gift spawns actor');await delay(100);assert.equal(await evaluate('Hmong3D.stats().showViewer'),null);
 await evaluate("Hmong3D.inject('chat',{user:{uniqueId:'beer_a'},comment:'nhảy 2'});Hmong3D.inject('chat',{user:{uniqueId:'beer_b',nickname:'Bạn B'},comment:'nhảy 3'});Hmong3D.inject('member',{user:{uniqueId:'beer_c',nickname:'Bạn C'}})");await until(()=>evaluate('Hmong3D.stats().characters===3'),'beer guests spawn');
 await delay(150);await screenshot('hmong-side-rooms-phone.png');
 for(const [width,height]of [[390,844],[1260,720]]){
  await viewport(width,height);await evaluate("Hmong3D.director.clear();Hmong3D.director.enqueueBeer({user:{uniqueId:'beer_a',nickname:'Bạn A'}})");await until(()=>evaluate('Hmong3D.stats().cameraShot==="beer"'),'beer storyline starts');
  const peer=await evaluate('Hmong3D.stats().socialPeer');assert.notEqual(peer,'beer_a');assert.ok(['beer_b','beer_c'].includes(peer));
  for(const [time,phase]of [[3,'fetch'],[5.5,'fetch'],[7.5,'offer'],[12.7,'clink'],[14.5,'drink'],[16.2,'toss'],[19,'return']]){
   await evaluate(`(()=>{const d=Hmong3D.director;d.active.time=${time};d.update(0);d.camera.position.copy(d.position);d.look.copy(d.target);d.camera.lookAt(d.look);d.camera.updateMatrixWorld();})()`);
   assert.equal(await evaluate('Hmong3D.stats().socialPhase'),phase);assert.equal(await evaluate('Hmong3D.snapshot().every(p=>p.position.every(Number.isFinite))'),true);
   if(time===5.5){await delay(50);await screenshot(`hmong-beer-shop-${width}.png`);}
   if(['clink','drink'].includes(phase)){assert.equal(await evaluate('Hmong3D.director.active.beer.mugs.every(m=>m.root.visible)'),true);await delay(50);await screenshot(`hmong-beer-${phase}-${width}.png`);}
  }
  await evaluate('Hmong3D.director.active.time=22;Hmong3D.director.update(0)');assert.equal(await evaluate('Hmong3D.stats().showViewer'),null);assert.equal(await evaluate('Hmong3D.snapshot().find(p=>p.key==="beer_a").base'),'danceB');assert.equal(await evaluate('Hmong3D.director.characters.items.get('+JSON.stringify(peer)+').showLocked'),false);
  await evaluate('Hmong3D.director.beerCooldown.clear()');if(width>700){await evaluate('Hmong3D.director.camera.copy(Hmong3D.director.rendering.homeCamera);Hmong3D.director.look.copy(Hmong3D.director.rendering.homeTarget)');await delay(80);await screenshot('hmong-side-rooms-wide.png');}
 }
 await evaluate("Hmong3D.director.enqueueBeer({user:{uniqueId:'beer_a'}})");await until(()=>evaluate('Hmong3D.stats().cameraShot==="beer"'),'departure scene starts');await evaluate("Hmong3D.director.characters.removeViewer({uniqueId:Hmong3D.stats().socialPeer});Hmong3D.director.update(.1)");assert.equal(await evaluate('Hmong3D.stats().showViewer'),null);assert.equal(await evaluate('Hmong3D.director.characters.items.get("beer_a").showLocked'),false);
 await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'beer dashboard');await evaluate('document.querySelector("[data-player-action=join10]").click()');await until(()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.stats().characters===10'),'dashboard guests');await evaluate('document.querySelector("[data-player-action=beer]").click()');await until(()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.stats().cameraShot==="beer"'),'beer button uses chat pipeline');
 console.log('PASS: two signed rooms, no extra viewers, solo command handling, random non-self peer, six beer phases, both dances/locks restored, departure cancellation, portrait/landscape and dashboard chat button.');
}
