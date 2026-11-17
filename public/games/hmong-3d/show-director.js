import { playerShot } from './player-camera.js';
import { moveCameraPoint } from './camera-motion.js';
import { isBeerGift } from './cheap-gifts.js';
import { DJStory, DJ_DURATION } from './dj-story.js';
import { DEFAULT_DJ_GIFT, validDJGift, isDJGift } from './dj-rules.js';
import { DressingStory } from './dressing-story.js';
import { BeerStory, chooseBeerGuest } from './beer-story.js';
import { ridePose } from './ride-path.js';
import * as THREE from 'three';
import { GIFT_SHOWS, giftShow, ShowQueue, smooth } from './gift-shows.js';
import { fitShot, idleShot } from './camera-shots.js';
import { ShowEffects } from './show-effects.js';
import { createShowProp } from './show-props.js';

const IDLE=['wide','crowd','orbit','crane','dancer','stage','dj','tour','top','side'];
const lerp=THREE.MathUtils.lerp;
export class ShowDirector {
 constructor(rendering,characters,{sound,onCaption=()=>{}}={}){
  this.rendering=rendering;this.characters=characters;this.sound=sound;this.onCaption=onCaption;
  this.djGift={...DEFAULT_DJ_GIFT};this.beerCooldown=new Map();this.beerSequence=0;this.noticeUntil=0;this.effects=new ShowEffects(rendering.scene);this.effectsEnabled=true;this.faded=new Map();this.queue=new ShowQueue();this.active=null;this.time=0;this.idle=0;this.elapsed=0;this.enabled=new URLSearchParams(location.search).get('benchmark')!=='1';this.showsEnabled=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.camera=rendering.camera;this.look=new THREE.Vector3(0,1,0);this.target=new THREE.Vector3();this.position=new THREE.Vector3();
  this.ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.025,6,48),new THREE.MeshBasicMaterial({color:'#f9bd6e',toneMapped:false}));this.ring.rotation.x=-Math.PI/2;this.ring.visible=false;rendering.scene.add(this.ring);
  this.spot=new THREE.PointLight('#ffc2ee',0,7,2);rendering.scene.add(this.spot);
 }
 enqueue(data){
  if(!this.showsEnabled)return;
  if(isBeerGift(data)){this.enqueueBeer(data);return;}
  if(isDJGift(data,this.djGift)){
   const key=this.characters.key(data.user);if(!key||this.active?.kind==='dj'&&this.active.key===key||this.queue.items.some(show=>show.kind==='dj'&&show.key===key))return;
   this.queue.push({kind:'dj',key,user:{...data.user},label:'🎧 DJ khách mời',duration:DJ_DURATION,count:1,maxAgeMs:30*60*1000});return;
  }
  const value=Math.max(1,Number(data.giftValue)||1)*Math.max(1,Number(data.repeatCount)||1);
  const descriptor=giftShow(data)||GIFT_SHOWS.find(show=>show.kind===(value>=100?'party':'zoom')),key=this.characters.key(data.user);if(!descriptor||!key)return;
  const count=Math.max(1,Number(data.repeatCount)||1);
  if(this.active?.key===key&&this.active.kind===descriptor.kind){this.active.count=Math.min(9999,this.active.count+count);this.caption();return;}
  this.queue.push({...descriptor,key,user:{...data.user},count});
 }
 enqueueBeer(data){
  const key=this.characters.key(data.user);if(!key||this.time-(this.beerCooldown.get(key)??-100)<12)return;
  this.beerCooldown.set(key,this.time);if(this.beerCooldown.size>256)this.beerCooldown.delete(this.beerCooldown.keys().next().value);
  const sequence=this.beerSequence++,candidates=[...this.characters.items.values()];
  for(const[pendingKey,pending]of this.characters.pending)if(!this.characters.items.has(pendingKey))candidates.push({key:pendingKey,selectedDance:pending.selectedDance,animation:{base:pending.selectedDance||this.characters.base}});
  const guest=chooseBeerGuest(candidates,key,sequence);
  this.queue.push({kind:'beer',key,user:{...data.user},label:'🍻 Mời bia',duration:22,count:1,sequence,guestKey:guest?.key});
 }
 enqueueDressing(data){
  const key=this.characters.key(data.user);if(!key||this.active?.key===key&&this.active.kind==='change')return;
  this.queue.push({...GIFT_SHOWS.find(show=>show.kind==='change'),key,user:{...data.user},count:1});
 }
 settings(next){if(next.djGift&&validDJGift(next.djGift))this.djGift={id:next.djGift.id,name:next.djGift.name.trim()};if(typeof next.effects==='boolean')this.effectsEnabled=next.effects;if(typeof next.cameraAuto==='boolean')this.enabled=next.cameraAuto;if(typeof next.giftShows==='boolean'){this.showsEnabled=next.giftShows;if(!this.showsEnabled)this.clear();}}
 start(show,item){
  if(show.kind==='dj'){this.active={...show,time:0,item,dj:new DJStory(this.characters,item,this.rendering.residentDJ,{portrait:this.camera.aspect<1})};return;}
  if(show.kind==='change'){this.active={...show,duration:15,time:0,item,dressing:new DressingStory(this.characters,item,{portrait:this.camera.aspect<1})};return;}
  if(show.kind==='beer'){
   const preferred=this.characters.items.get(show.guestKey);const guest=preferred&&preferred.key!==item.key&&!preferred.showLocked&&preferred.selectedDance!=='idle'&&preferred.animation.base!=='idle'?preferred:chooseBeerGuest(this.characters.items.values(),item.key,show.sequence);
   if(!guest){this.beerCooldown.delete(item.key);this.onCaption('🍻 Cần thêm một người đang nhảy để mời bia');this.noticeUntil=this.time+4;return;}
   const beer=new BeerStory(this.rendering.scene,this.characters,item,guest,{portrait:this.camera.aspect<1});
   this.active={...show,time:0,item,beer};return;
  }
  this.active={...show,time:0,item,originalIndex:item.index,swapped:false,returnOrigin:item.root.position.clone(),origin:item.root.position.clone(),scale:item.root.scale.x,visibleLabel:item.label.visible};
  if(['car','heli'].includes(show.kind)&&this.active.origin.z< -3.6)this.active.origin.set(item.root.position.x,-.095,0);
  item.showLocked=true;item.label.visible=true;
  this.prop=createShowProp(show.kind);this.rendering.scene.add(this.prop.group);
  this.caption();
  if(show.kind==='party')this.rendering.stage.celebrate();
  if(['car','heli'].includes(show.kind)){this.sound?.tone({frequency:show.kind==='car'?70:120,endFrequency:180,duration:1.3,volume:.09,type:'sawtooth'});}
 }
 caption(){const show=this.active;if(show)this.onCaption(`${show.label} · ${show.user.nickname||show.key}${show.count>1?` ×${show.count}`:''}`);}
 finish(){
  const active=this.active;if(active?.beer)active.beer.finish();if(active?.dressing)active.dressing.finish();if(active?.dj)active.dj.finish();if(active&&!active.beer&&!active.dressing&&!active.dj){const item=this.characters.items.get(active.key);if(item===active.item){item.showLocked=false;item.root.position.copy(active.returnOrigin||active.origin);item.root.rotation.y=0;item.label.visible=active.visibleLabel;item.animation.setBase(item.selectedDance||this.characters.base);}}
  for(const [sprite,opacity] of this.faded)sprite.material.opacity=opacity;this.faded.clear();
  this.rendering.stage.rooms?.setDoor('beer',0);this.rendering.stage.rooms?.setDoor('dressing',0);this.ring.material.color.set('#f9bd6e');this.spot.color.set('#ffc2ee');this.characters.showClearance=null;this.effects.clear();
  active?.beer?.dispose();this.prop?.dispose();this.prop=null;this.active=null;this.elapsed=0;this.ring.visible=false;this.spot.intensity=0;this.onCaption('');
 }
 clear(){this.finish();this.queue.clear();}
 update(delta){
  this.time+=delta;this.elapsed+=delta;if(!this.active&&this.noticeUntil&&this.time>=this.noticeUntil){this.noticeUntil=0;this.onCaption('');}if(this.active?.kind==='dj')for(const queued of this.queue.items)queued.enqueuedAt+=Math.max(0,delta)*1000;this.queue.prune();this.effects.update(delta,this.effectsEnabled);
  if(this.active&&(this.characters.items.get(this.active.key)!==this.active.item||this.active.beer&&!this.active.beer.valid()))this.finish();
  if(!this.active&&this.queue.items.length){
   // Viewers can still be waiting for their spawn budget; retain these events.
   const next=this.queue.items[0];if(!this.characters.pending.has(next.key)&&!(next.kind==='beer'&&next.guestKey&&this.characters.pending.has(next.guestKey))){
    const show=this.queue.take(key=>this.characters.items.has(key));if(show)this.start(show,this.characters.items.get(show.key));
   }
  }
  const camera=this.camera,home=this.rendering.homeCamera;
  this.position.copy(home.position);this.target.copy(this.rendering.homeTarget);let fov=home.fov;
  if(this.active){
   const s=this.active;const speed=s.kind==='dj'?1:this.queue.items.length>=6?1.8:this.queue.items.length>=3?1.35:1;s.time+=delta*speed;const t=s.time,item=s.item,origin=s.origin;
   if(t>=s.duration){this.finish();return this.update(0);}
   if(s.dj){this.updateDJ(s,delta);return;}
   if(s.dressing){this.updateDressing(s,delta);return;}
   if(s.beer){this.updateBeer(s,delta);return;}
   const p=item.root.position,scale=s.scale,exit=smooth((t-3.5)/1.2),returning=smooth((t-(s.duration-1.5))/1.5);
   p.copy(origin);item.root.rotation.y=0;const prop=this.prop.group;
   if(s.kind==='car'){
    const x=t<3.5?lerp(10,origin.x+2.4,smooth(t/3.5)):t<7?origin.x+2.4:origin.x+2.4+12*smooth((t-7)/3);
    prop.position.set(x,0,origin.z+1.3);prop.scale.setScalar(.85);
    p.set(lerp(x,origin.x,exit),lerp(.7,origin.y,exit)+Math.sin(exit*Math.PI)*.6,lerp(origin.z+1.3,origin.z,exit));
   }else if(s.kind==='heli'){
    const landed=smooth(t/4),depart=smooth((t-8)/4);prop.position.set(lerp(8,origin.x,landed)-depart*10,lerp(7,0,landed)+depart*7,origin.z+1.5);prop.scale.setScalar(.75);
    const walk=smooth((t-4)/1.7);p.set(lerp(prop.position.x,origin.x,walk),lerp(prop.position.y+.8,origin.y,walk),lerp(origin.z+1.5,origin.z,walk));
   }else if(s.kind==='dragon'||s.kind==='phoenix'){
    const flight=ridePose(t,s.duration,origin,camera.aspect<1);
    prop.position.set(flight.x,flight.y,flight.z);prop.rotation.y=flight.rotation;prop.scale.setScalar(.65);
    p.copy(prop.position);p.y+=.27;
   }else if(s.kind==='solo'){
    p.z+=1.4*smooth(t)*(1-returning);p.y+=Math.abs(Math.sin(t*3))*.1;
   }else if(s.kind==='wings'){prop.position.copy(p);prop.position.y+=scale*1.5;prop.position.z-=.1;prop.scale.setScalar(scale);}
   else if(s.kind==='torch'){prop.position.copy(p);prop.position.x+=scale*.7;prop.position.y+=scale*.8;prop.scale.setScalar(scale);}

   if(returning)p.lerp(s.returnOrigin,returning);
   this.prop.update(t);
   const arrival=s.kind==='car'?3.5:s.kind==='heli'?4:['dragon','phoenix'].includes(s.kind)?2.5:0;
   if(arrival&&t>=arrival&&!s.arrived){s.arrived=true;if(this.effectsEnabled)this.effects.burst(prop.position,s.kind==='phoenix'?'#ffb94f':'#d2bbff');this.sound?.noise({duration:.5,volume:.08,frequency:s.kind==='car'?2200:400,sweepTo:s.kind==='car'?300:1800});}
   if(s.kind==='heli'&&!s.rotorCue){s.rotorCue=true;for(let i=0;i<6;i++)this.sound?.noise({delay:i*.14,duration:.1,frequency:150,volume:.035});}
   if(['car','heli'].includes(s.kind))this.characters.showClearance={key:s.key,center:origin,radius:s.kind==='car'?2.2:2.6,strength:smooth(t/1.5)*(1-returning)};

   for(const other of this.characters.items.values()){const sprite=other.model.getObjectByName('CharacterArt');if(other!==item&&sprite&&s.kind!=='party'){if(!this.faded.has(sprite))this.faded.set(sprite,sprite.material.opacity);sprite.material.opacity=.22;}}
   this.ring.visible=true;this.ring.position.set(p.x,Math.max(-.07,p.y+.01),p.z);this.ring.scale.setScalar(scale*(1.3+Math.sin(t*3)*.1));
   this.spot.position.copy(p);this.spot.position.y+=2;this.spot.intensity=!this.effectsEnabled?0:s.kind==='torch'?8:4;
   this.target.copy(p);this.target.y+=scale*1.5;
   if(s.kind==='dragon'){this.target.x+=Math.cos(prop.rotation.y)*1.0;this.target.z-=Math.sin(prop.rotation.y)*1.0;}
   const vehicle=s.kind==='car'&&t<8||s.kind==='heli'&&t<6,ride=['dragon','phoenix'].includes(s.kind),angle=this.reduced?0:Math.sin(t*.25)*.4;
   if(vehicle){this.target.lerp(prop.position,.4);this.target.y+=.5;}
   const distance=vehicle?9:ride?10:Math.max(3.8,scale*6),portrait=camera.aspect<1;
   this.position.copy(this.target).add(new THREE.Vector3(Math.sin(angle)*distance,vehicle?3:ride?1.5:.6,Math.cos(angle)*distance*(portrait?1.25:1)));
   if(s.kind==='car'&&t<8){this.position.x=this.target.x-2;}
   fov=vehicle?48:42;
   if(s.kind==='party'){
    this.position.copy(home.position).multiplyScalar(1.15);this.position.x+=Math.sin(t*.7)*2;this.target.copy(this.rendering.homeTarget);if(t%2<delta)this.rendering.stage.celebrate();
   }
   const halfWidth=Math.max(.45,scale*.95),height=scale*3.4;
   const frameBounds=new THREE.Box3(new THREE.Vector3(p.x-halfWidth,p.y,p.z-halfWidth),new THREE.Vector3(p.x+halfWidth,p.y+height,p.z+halfWidth));
   if(vehicle||ride){prop.updateWorldMatrix(true,true);frameBounds.union(new THREE.Box3().setFromObject(prop));}
   if(s.kind==='party'&&this.rendering.lastBounds)frameBounds.union(this.rendering.lastBounds);
   if(vehicle||ride)frameBounds.getCenter(this.target);
   fitShot(this.position,this.target,frameBounds,{fov,aspect:camera.aspect});
   // Fade back to the room before handing the camera to the next viewer.
   this.position.lerp(home.position,returning);this.target.lerp(this.rendering.homeTarget,returning);fov=lerp(fov,home.fov,returning);
  }else if(this.characters.items.size){
   const shot=playerShot([...this.characters.items.values()],this.enabled?this.time:0,camera.aspect);
   if(shot){this.position.copy(shot.position);this.target.copy(shot.target);fov=shot.fov;}
  }
  this.applyCamera(delta,fov);
 }
 applyCamera(delta,fov){
  const camera=this.camera;this.cameraVelocity??=new THREE.Vector3();this.lookVelocity??=new THREE.Vector3();
  moveCameraPoint(camera.position,this.position,this.cameraVelocity,delta,{speed:this.active?14:6,acceleration:this.active?14:5});
  moveCameraPoint(this.look,this.target,this.lookVelocity,delta,{speed:this.active?8:2.5,acceleration:this.active?10:2});
  camera.fov+=THREE.MathUtils.clamp(fov-camera.fov,-delta*5,delta*5);
  camera.lookAt(this.look);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 }
 updateDJ(show,delta){
  const result=show.dj.update(show.time),name=show.user.nickname||show.key;
  const caption=result.phase==='enter'?'Đang lên bàn DJ':result.phase==='mix'?'DJ khách mời · '+result.remaining+'s':'Cảm ơn DJ! Trở lại sàn nhảy';
  this.onCaption('🎧 '+name+' · '+caption);
  if(result.phase==='mix'&&!show.djCue){show.djCue=true;if(this.effectsEnabled)this.effects.burst(show.item.root.position,'#45eaff');this.sound?.tone({frequency:440,endFrequency:880,duration:.5,volume:.06,type:'sine'});}
  result.bounds.getCenter(this.target);this.position.copy(this.target).add(new THREE.Vector3(this.reduced?0:Math.sin(show.time*.18)*.8,1.2,this.camera.aspect<1?7:6));fitShot(this.position,this.target,result.bounds,{aspect:this.camera.aspect,fov:44,padding:1.2});
  const back=smooth((show.time-36)/2);this.position.lerp(this.rendering.homeCamera.position,back);this.target.lerp(this.rendering.homeTarget,back);this.ring.visible=false;this.spot.intensity=0;this.applyCamera(delta,lerp(44,this.rendering.homeCamera.fov,back));
 }
 updateDressing(show,delta){
  const result=show.dressing.update(show.time),item=show.item,p=item.root.position;
  this.rendering.stage.rooms?.setDoor('dressing',result.door);
  if(show.phase!==result.phase){show.phase=result.phase;const labels={enter:'Vào phòng thay đồ',change:'Đang chọn trang phục mới…',reveal:'Wow! Trang phục mới đẹp quá! Chúc mừng bạn!',return:'Trở lại sàn nhảy'};this.onCaption('✨ '+(show.user.nickname||show.key)+' · '+labels[result.phase]);}
  if(show.time>=7.3&&!show.revealCue){show.revealCue=true;if(this.effectsEnabled)this.effects.burst(p,'#ff2345');this.sound?.tone({frequency:660,endFrequency:1320,duration:.65,volume:.07,type:'sine'});}
  this.ring.visible=this.effectsEnabled&&result.phase==='reveal';this.ring.material.color.set('#ff2345');this.ring.position.set(p.x,p.y+.04,p.z);this.ring.scale.setScalar(item.root.scale.x*(1.4+Math.sin(show.time*3)*.15));
  this.spot.color.set('#ff2345');this.spot.position.copy(p);this.spot.position.y+=2;this.spot.intensity=this.effectsEnabled&&result.phase==='reveal'?6:0;
  result.bounds.getCenter(this.target);this.position.copy(this.target).add(new THREE.Vector3(0,1,this.camera.aspect<1?7:6));fitShot(this.position,this.target,result.bounds,{aspect:this.camera.aspect,fov:42,padding:1.2});
  const back=smooth((show.time-13)/2);this.position.lerp(this.rendering.homeCamera.position,back);this.target.lerp(this.rendering.homeTarget,back);this.applyCamera(delta,lerp(42,this.rendering.homeCamera.fov,back));
 }
 updateBeer(show,delta){
  const story=show.beer,result=story.update(show.time,this.camera),phase=result.phase;
  this.rendering.stage.rooms?.setDoor('beer',result.door);
  if(show.phase!==phase){show.phase=phase;const labels={fetch:'Đi lấy bia',offer:'Mời bạn',clink:'Chạm cốc!',drink:'Cùng uống',toss:'Ném cốc · Dọn sàn',return:'Về nhảy tiếp'};this.onCaption(`🍻 ${show.user.nickname||show.key} mời ${story.guest.user?.nickname||story.guest.key} · ${labels[phase]}`);
  }
  if(show.time>=12.7&&!show.clinkCue){show.clinkCue=true;this.sound?.tone({frequency:1700,endFrequency:1100,duration:.24,volume:.07,type:'sine'});}
  if(show.time>=16.75&&!show.dropCue){show.dropCue=true;this.sound?.noise({duration:.18,volume:.055,frequency:3000,sweepTo:800});if(this.effectsEnabled)this.effects.burst(new THREE.Vector3(0,-.06,1),'#e6c27a');}
  for(const other of this.characters.items.values())if(other!==story.giver&&other!==story.guest){const sprite=other.model.getObjectByName('CharacterArt');if(sprite){if(!this.faded.has(sprite))this.faded.set(sprite,sprite.material.opacity);sprite.material.opacity=.25;}}
  result.bounds.getCenter(this.target);const distance=this.camera.aspect<1?6.5:5.5;this.position.copy(this.target).add(new THREE.Vector3(Math.sin(show.time*.2)*.5,1,distance));fitShot(this.position,this.target,result.bounds,{aspect:this.camera.aspect,fov:42,padding:1.25});
  const returning=smooth((show.time-20)/2);this.position.lerp(this.rendering.homeCamera.position,returning);this.target.lerp(this.rendering.homeTarget,returning);this.ring.visible=false;this.spot.intensity=this.effectsEnabled?3:0;this.spot.position.copy(this.target);this.spot.position.y+=1;this.applyCamera(delta,lerp(42,this.rendering.homeCamera.fov,returning));
 }
 get focusRoots(){return this.active?.dj?[]:this.active?.beer?[this.active.beer.giver.root,this.active.beer.guest.root,this.active.beer.group]:this.active?[this.active.item.root,this.prop?.group,this.ring]:[];}
 stats(){return {cameraShot:this.active?.kind||(!this.enabled?'wide':IDLE[this.idle]),showViewer:this.active?.key||null,showTime:this.active?.time||0,showQueue:this.queue.items.length,djViewer:this.active?.kind==='dj'?this.active.key:null,djRemaining:this.active?.kind==='dj'?Math.max(0,Math.ceil(34-this.active.time)):0,djQueue:this.queue.items.filter(show=>show.kind==='dj').map(show=>show.user.nickname||show.key),showsDropped:this.queue.dropped,showsExpired:this.queue.expired,showCount:this.active?.count||0,socialPeer:this.active?.beer?.guest.key||null,socialPhase:this.active?.phase||null};}
 dispose(){this.clear();this.effects.dispose();this.ring.geometry.dispose();this.ring.material.dispose();this.ring.removeFromParent();this.spot.removeFromParent();}
}
