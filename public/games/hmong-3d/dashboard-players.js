import { GIFT_SHOWS } from './gift-shows.js';
import { CrowdSimulator } from './simulator-engine.js';

export function initDashboardPlayers({config,readSettings,send,command}){
 const $=id=>document.getElementById(id),t=(...args)=>HmongI18n.t(...args),prefix=`dashboard_sim_${crypto.randomUUID().replaceAll('-','').slice(0,12)}`;
 const labels={member:'Vào phòng',simulationLeave:'Rời phòng',chat:'Bình luận',gift:'Tặng quà',like:'Thả tim',share:'Chia sẻ'};
 let activeGame=null,lastRoster='',lastSettings='';const variants=new Map();
 function roster(){const signature=[...sim.users.keys()].join('|');if(signature===lastRoster)return;lastRoster=signature;const selected=$('testViewer').value;$('testViewer').replaceChildren(...[...sim.users.values()].map(user=>{const option=document.createElement('option');option.value=user.uniqueId;option.textContent=user.nickname;return option;}));if(sim.users.has(selected))$('testViewer').value=selected;}
 const sim=new CrowdSimulator((event,data)=>{
  if(Number.isInteger(data.simulationVariant))variants.set(data.user.uniqueId,data.simulationVariant);
  if(event!=='simulationLeave'){$('mode').value='crowd';const settings=readSettings(),key=$('username').value+JSON.stringify(settings);if(key!==lastSettings){lastSettings=key;send({action:'settings',payload:{hmong3d:settings}});}}
  command('simulateEvent',{event,data});
 },{variantCount:config.characters.length,idPrefix:prefix,onLog:event=>{const line=document.createElement('li');line.textContent=`${event.user} · ${labels[event.type]||event.type} ${event.gift||event.comment}`;$('testLog').prepend(line);while($('testLog').children.length>40)$('testLog').lastElementChild.remove();roster();}});
 const actions={
  join:()=>sim.join(),join10:()=>sim.join(10),joinAll:()=>sim.join(config.characters.length),
  leave:()=>sim.leave($('testViewer').value),duplicate:()=>sim.duplicate($('testViewer').value),
  chat:()=>{const comment=$('testComment').value.trim();if(comment)sim.interact('chat',$('testViewer').value,{comment});},
  dj:()=>sim.interact('gift',$('testViewer').value,{giftId:readSettings().djGift.id,giftName:readSettings().djGift.name,giftValue:1,repeatCount:1}),
  beer:()=>sim.interact('gift',$('testViewer').value,{giftId:5827,giftName:'Ice Cream Cone',giftValue:1,repeatCount:1}),
  like:()=>sim.interact('like',$('testViewer').value,{likeCount:10}),share:()=>sim.interact('share',$('testViewer').value),
  gift:()=>{const gifts={rose:{giftName:'Rose',giftValue:1},medium:{giftName:'TikTok',giftValue:10},large:{giftName:'Concert',giftValue:199}};sim.interact('gift',$('testViewer').value,{...gifts[$('testGiftKind').value],repeatCount:Math.max(1,Math.min(100,Math.round(Number($('testGiftCount').value)||1)))});},
  auto:()=>{if(sim.timer)sim.stop();else sim.start();$('testAuto').textContent=t(sim.timer?'three.testStopAuto':'three.testAuto');},
  reset:()=>{sim.stop();sim.users.clear();variants.clear();roster();command('clearTestViewers');$('testAuto').textContent=t('three.testAuto');}
 };
 const quickGifts=document.getElementById('giftShowButtons');
 for(const show of GIFT_SHOWS){const button=document.createElement('button');button.textContent=`${show.name} · ${show.label}`;button.dataset.giftId=String(show.id);button.dataset.needsPlayer='';button.disabled=true;button.addEventListener('click',()=>sim.interact('gift',$('testViewer').value,{giftId:show.id,giftName:show.name,giftValue:show.value,repeatCount:Math.max(1,Math.min(100,Math.round(Number($('testGiftCount').value)||1)))}));quickGifts.appendChild(button);}
 document.querySelectorAll('[data-player-action]').forEach(button=>{button.disabled=true;button.addEventListener('click',()=>actions[button.dataset.playerAction]?.());});
 $('testComment').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();actions.chat();}});
 const monitor=setInterval(()=>{
  const game=$('preview').contentWindow.Hmong3D;if(!game?.ready)return;
  if(game!==activeGame){activeGame=game;game.settings({...readSettings(),musicEnabled:false,mcEnabled:false,sound:false});document.querySelectorAll('[data-player-action]').forEach(button=>button.disabled=false);}
  const stats=game.stats();$('testStats').textContent=`${stats.characters} nhân vật · ${stats.fps} FPS · Đang chờ ${stats.queue+(stats.pendingSpawns||0)} · Màn quà chờ ${stats.showQueue||0}${stats.djViewer?` ? DJ: ${stats.djViewer} (${stats.djRemaining}s)`:''}${stats.djQueue?.length?` ? Ch? DJ: ${stats.djQueue.join(', ')}`:''}${stats.showsExpired?` · Lượt quá hạn ${stats.showsExpired}`:''}`;
  if(!stats.queue&&!stats.pendingSpawns){const present=new Set(game.snapshot().map(item=>item.key));for(const key of sim.users.keys())if(!present.has(key))sim.users.delete(key);roster();}
  document.querySelectorAll('[data-needs-player]').forEach(button=>button.disabled=!sim.users.size);
 },350);
 window.HmongDashboard={sim,get ready(){return !!activeGame;}};
 window.addEventListener('pagehide',()=>{clearInterval(monitor);sim.stop();},{once:true});
 return {replay:()=>{for(const user of sim.users.values())command('simulateEvent',{event:'member',data:{user,simulationVariant:variants.get(user.uniqueId)}});}};
}
