import assert from 'node:assert/strict';
import { GIFT_SHOWS } from '../public/games/hmong-3d/gift-shows.js';
export async function checkGiftShows({navigate,evaluate,until,screenshot,viewport,delay}){
 await viewport(1080,1920);await navigate('/games/hmong-3d/index.html?mode=crowd&music=0&mc=0');
 await until(()=>evaluate('window.Hmong3D?.ready'),'show overlay ready');
 await evaluate(`Hmong3D.inject('chat',{user:{uniqueId:'show_a',nickname:'Khán giả A'},comment:'nhảy 2'});Hmong3D.inject('member',{user:{uniqueId:'show_b',nickname:'Khán giả B'}})`);
 await until(()=>evaluate('Hmong3D.stats().characters===2'),'show actors spawn');
 const initial=await evaluate('Hmong3D.stats()');
 for(const show of GIFT_SHOWS){
  await evaluate(`Hmong3D.director.clear();Hmong3D.inject('gift',${JSON.stringify({user:{uniqueId:'show_a',nickname:'Khán giả A'},giftId:show.id,giftName:show.name,giftValue:show.value,repeatCount:1})})`);
  await until(()=>evaluate(`Hmong3D.stats().cameraShot==='${show.kind}' && Hmong3D.stats().showViewer==='show_a'`),`${show.kind} targets sender`);
  await evaluate(`Hmong3D.director.update(${show.kind==='change'?2.8:show.kind==='car'?4.8:show.kind==='heli'?6:3})`);await delay(150);
  assert.equal(await evaluate('Hmong3D.snapshot().every(p=>p.position.every(Number.isFinite))'),true);
  if(show.kind==='change')assert.notEqual(await evaluate('Hmong3D.snapshot().find(p=>p.key==="show_a").index'),await evaluate('Hmong3D.director.active.originalIndex'));
  await screenshot(`hmong-show-${show.kind}.png`);
  await evaluate(`Hmong3D.director.update(${show.duration})`);
  assert.equal(await evaluate('Hmong3D.stats().showViewer'),null);
  assert.equal(await evaluate('Hmong3D.snapshot().find(p=>p.key==="show_a").base'),'danceB');
 }
 // Large crowds keep a bounded queue; deleting the actor cancels its show.
 assert.equal(await evaluate("(()=>{for(let i=0;i<35;i++)Hmong3D.director.enqueue({user:{uniqueId:'viewer_'+i},giftName:'Rose'});return Hmong3D.stats().showQueue;})()"),24);
 await evaluate("Hmong3D.director.clear();Hmong3D.inject('gift',{user:{uniqueId:'show_a',nickname:'A'},giftName:'Finger Heart'});");await until(()=>evaluate("Hmong3D.stats().cameraShot==='car'"),'cancel actor setup');
 await evaluate("Hmong3D.director.characters.removeViewer({uniqueId:'show_a'});Hmong3D.director.update(.1)");assert.equal(await evaluate('Hmong3D.stats().showViewer'),null);
 await evaluate("Hmong3D.settings({cameraAuto:false,giftShows:false});Hmong3D.inject('gift',{user:{uniqueId:'show_b'},giftName:'Rose'})");await delay(200);assert.equal(await evaluate('Hmong3D.stats().showViewer'),null);
 await viewport(1440,900);await delay(300);assert.equal(await evaluate('Hmong3D.snapshot().every(p=>p.position.every(Number.isFinite))'),true);
 await screenshot('hmong-show-landscape.png');
 console.log('Show resource delta',await evaluate(`JSON.stringify({initial:${JSON.stringify(initial)},after:Hmong3D.stats()})`));
 await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'show dashboard ready');assert.equal(await evaluate('document.querySelectorAll("#giftShowButtons button").length'),10);
 await evaluate('document.querySelector("[data-player-action=join]").click()');await until(()=>evaluate('!document.querySelector("#giftShowButtons button").disabled'),'quick gifts unlocked');
 await evaluate('document.querySelectorAll("#giftShowButtons button")[3].click()');await until(()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.stats().cameraShot==="car"'),'quick car button reaches preview');
 await viewport(390,844);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true);await screenshot('hmong-show-dashboard-mobile.png');
 // Exercise arrival clearance with a dense crowd, then verify it is released.
 await evaluate('document.querySelector("[data-player-action=joinAll]").click()');await until(()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.stats().characters>=20'),'dense crowd for arrival');
 await evaluate('(()=>{const game=document.querySelector("#preview").contentWindow.Hmong3D;game.director.clear();game.director.enqueue({user:game.director.characters.items.values().next().value.user,giftName:"Perfume"});game.director.update(4.5);})()');await delay(400);
 assert.equal(await evaluate('!!document.querySelector("#preview").contentWindow.Hmong3D.director.characters.showClearance'),true);
 assert.equal(await evaluate('document.querySelector("#preview").contentWindow.Hmong3D.snapshot().every(p=>p.position.every(Number.isFinite))'),true);
 await evaluate('document.querySelector("#preview").contentWindow.Hmong3D.director.clear()');assert.equal(await evaluate('document.querySelector("#preview").contentWindow.Hmong3D.director.characters.showClearance'),null);
 // Reload must restore settings, and the preview still remains silent.
 await evaluate("document.querySelector('#cameraAuto').checked=false;document.querySelector('#volume').value='0.65';document.querySelector('#theme').value='royal';document.querySelector('#cameraAuto').dispatchEvent(new Event('input'))");await delay(250);
 await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'restored dashboard ready');
 assert.equal(await evaluate('document.querySelector("#cameraAuto").checked'),false);assert.equal(await evaluate('document.querySelector("#volume").value'),'0.65');assert.equal(await evaluate('document.querySelector("#theme").value'),'royal');
 await until(()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.director.enabled===false'),'saved camera preference reaches preview');
 console.log('PASS: preferences survive dashboard reload and reach the preview.');
 console.log('PASS: all ten shows, sender targeting, variant change, dance restoration, departure cleanup, queue bounds, disabled shows, portrait/landscape and dashboard buttons.');
}
