import { isPortrait } from './viewport.js';
import { clubSpace } from './club-space.js';
import { CrowdMotion, CLUB_DECK } from './crowd-motion.js';
import { characterGender, genderVariant } from './character-commands.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { CharacterAnimation } from './animation.js';
import { loadBillboardAssets } from './billboard-assets.js';
import { SpriteAnimation } from './sprite-animation.js';
import { sequenceMap } from './sprite-sequence.js';
import { crowdLayout, layoutBounds } from './crowd-layout.js';

export class Characters {
 constructor(scene,config){this.scene=scene;this.config=config;this.motion=new CrowdMotion();this.templates=[];this.items=new Map();this.pending=new Map();this.mode='stage';this.limit=config.maxCharacters;this.formation='free';this.time=performance.now()/1000;this.base='dance';this.variant='auto';this.characterScale=config.defaultCharacterScale??.85;this.revision=0;this.bounds=layoutBounds([]);}
 async load(){
  if(this.config.characterPresentation==='billboard'){
   Object.assign(this,await loadBillboardAssets(this.config));
   this.onResize=()=>this.layout();window.addEventListener('resize',this.onResize);return;
  }
  const loader=new GLTFLoader(),textures=new THREE.TextureLoader();
  [this.fabric,this.maleFace,this.femaleFace]=await Promise.all(['/assets/hmong/club/embroidered-fabric.png','/assets/hmong/club/male-face-v3.png','/assets/hmong/club/female-face-v3.png'].map(url=>textures.loadAsync(url)));
  for(const texture of [this.fabric,this.maleFace,this.femaleFace])texture.colorSpace=THREE.SRGBColorSpace;
  this.fabric.wrapS=this.fabric.wrapT=THREE.RepeatWrapping;this.fabric.anisotropy=4;
  this.templates=await Promise.all(this.config.characters.map(async descriptor=>{const gltf=await loader.loadAsync(descriptor.url);gltf.scene.traverse(node=>{for(const material of node.material?(Array.isArray(node.material)?node.material:[node.material]):[]){if(material.name==='Embroidery')material.map=this.fabric;if(material.name==='MaleFaceFeatures')material.map=this.maleFace;if(material.name==='FemaleFaceFeatures')material.map=this.femaleFace;if(material.map)material.needsUpdate=true;}});return {descriptor,...gltf};}));
  this.onResize=()=>this.layout();window.addEventListener('resize',this.onResize);
 }
 key(user){return String(user?.uniqueId||user?.nickname||'').trim().toLowerCase();}
 request(user,action='wave'){
  const key=this.key(user);if(!key)return null;
  const existing=this.items.get(key);if(existing){existing.lastActive=this.time;existing.animation.play(action);return existing;}
  if(this.mode!=='crowd')return null;
  if(this.pending.has(key)){const pending=this.pending.get(key);pending.action=action;pending.user={...user};}
  else if(this.pending.size<256)this.pending.set(key,{user:{...user},action});
  return null;
 }
 setDance(user,dance){
  if(this.mode!=='crowd'||!['dance','danceA','danceB','danceC','danceD','danceE','danceF','idle'].includes(dance))return;
  const key=this.key(user);if(!key)return;
  const item=this.items.get(key);
  if(item){item.selectedDance=dance;item.lastActive=this.time;item.animation.setBase(dance);return;}
  this.request(user,dance);const pending=this.pending.get(key);if(pending)pending.selectedDance=dance;
 }
 setGender(user,gender){
  if(this.mode!=='crowd'||!['male','female'].includes(gender))return;
  const key=this.key(user);if(!key)return;
  const item=this.items.get(key);
  if(item){const index=genderVariant(this.config.characters,gender,key,item.index);if(index===null)return;item.selectedGender=gender;item.lastActive=this.time;if(index!==item.index)this.changeVariant(item,index);return;}
  this.request(user,this.base||'dance');const pending=this.pending.get(key);if(pending)pending.selectedGender=gender;
 }
 nextVariant(item){
  const count=this.templates.length;
  for(let offset=1;offset<=count;offset++){const index=(item.index+offset)%count;if(characterGender(this.config.characters[index])===(item.selectedGender||characterGender(this.config.characters[item.index])))return index;}
  return item.index;
 }
 label(text){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#130b2dd9';ctx.beginPath();ctx.roundRect(4,6,504,80,24);ctx.fill();ctx.fillStyle='#fff1ff';ctx.font='600 30px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(text).slice(0,28),256,47,470);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false}));sprite.scale.set(1.12,.21,1);sprite.position.y=2.70;return sprite;
 }
 add(user,index){
  const key=this.key(user);if(!key)return null;if(this.items.has(key))return this.items.get(key);
  while(this.items.size>=this.limit&&this.items.size)this.remove(this.items.keys().next().value);
  const template=this.templates[index%this.templates.length],model=template.billboard?template.scene.clone(true):clone(template.scene),root=new THREE.Group();root.add(model);
  if(template.billboard)model.getObjectByName('CharacterArt').material=model.getObjectByName('CharacterArt').material.clone();
  let sharedSkeleton;
  model.traverse(node=>{if(node.isMesh){node.castShadow=false;node.frustumCulled=false;}if(node.isSkinnedMesh){if(!sharedSkeleton)sharedSkeleton=node.skeleton;else node.skeleton=sharedSkeleton;}});
  const label=this.label(user.nickname||HmongI18n.t('common.anonymous'));label.material.opacity=0;
  // Use the same screen-facing vertical axis as the cutout, so a high camera
  // cannot project a world-space nameplate across the character's eyes.
  if(template.billboard){label.position.y=0;label.center.set(.5,-14);}
  root.add(label);this.scene.add(root);
  const phase=[...key].reduce((sum,c)=>sum+c.charCodeAt(0),0)*.73;
  const sequences={};if(template.billboard)for(const [name,clip]of Object.entries(template.descriptor.sequences||{}))sequences[name]=sequenceMap(this.sequenceTextures.get(clip.url),clip);
  const animation=template.billboard?new SpriteAnimation(model.getObjectByName('CharacterArt'),this.config.animations,{phase,sequences}):new CharacterAnimation(model,template.animations,this.config.animations);animation.setBase(this.base);
  const item={key,user,root,model,label,animation,lastActive:this.time,index:index%this.templates.length};this.items.set(key,item);this.layout();return item;
 }
 changeVariant(item,index){
  if(!this.templates[index]?.billboard||item.selectedGender&&characterGender(this.config.characters[index])!==item.selectedGender)return;
  const template=this.templates[index],model=template.scene.clone(true);
  model.getObjectByName('CharacterArt').material=model.getObjectByName('CharacterArt').material.clone();
  const sequences={};for(const [name,clip]of Object.entries(template.descriptor.sequences||{}))sequences[name]=sequenceMap(this.sequenceTextures.get(clip.url),clip);
  item.animation.dispose();item.model.traverse(node=>{if(node.isSprite)node.material.dispose();});item.model.removeFromParent();
  item.model=model;item.root.add(model);item.index=index;
  item.animation=new SpriteAnimation(model.getObjectByName('CharacterArt'),this.config.animations,{sequences});item.animation.setBase(item.selectedDance||this.base);
 }
 remove(key){this.motion.release(key);const item=this.items.get(key);if(!item)return;item.animation.dispose();item.model.traverse(node=>{if(node.isSprite)node.material.dispose();});const skeletons=new Set();item.model.traverse(node=>{if(node.isSkinnedMesh)skeletons.add(node.skeleton);});skeletons.forEach(s=>s.dispose());item.label.material.map.dispose();item.label.material.dispose();this.scene.remove(item.root);this.items.delete(key);this.layoutDirty=true;}
 clear(){this.motion.clear();for(const key of [...this.items.keys()])this.remove(key);this.pending.clear();this.layout();}
 removeViewer(user){const key=this.key(user);this.pending.delete(key);this.remove(key);if(this.layoutDirty)this.layout();}
 setMode(mode){if(!['stage','crowd'].includes(mode))return;this.clear();this.mode=mode;
  if(mode==='stage'){const count=this.config.stageCharacters||6;this.limit=Math.max(this.limit,count);for(let i=0;i<count;i++)this.add({uniqueId:`performer_${i}`,nickname:HmongI18n.t(this.config.characters[i].nameKey)},i);}
 }
 setLimit(value){const n=Number(value);if(!Number.isFinite(n))return;this.limit=Math.max(4,Math.min(this.config.hardLimit,Math.round(n)));while(this.items.size>this.limit)this.remove(this.items.keys().next().value);this.layout();}
 setFormation(value){if(!['free','rows','circle'].includes(value))return;this.formation=value;this.layout();}
 setScale(value){if(!Number.isFinite(Number(value)))return;this.characterScale=Math.max(.55,Math.min(1.25,Number(value)));this.layout();}
 layout(){
  const all=[...this.items.values()],n=all.length,slots=[];
  const crowd=crowdLayout(n,{portrait:isPortrait(),formation:this.formation,characterScale:this.characterScale});
  all.forEach((item,index)=>{
   // Dense crowds otherwise get black nameplates covering other dancers' faces.
   item.label.visible=true;
   if(this.mode==='stage'&&this.formation!=='free'){const portrait=isPortrait(),scale=.78*this.characterScale;const x=portrait?(index%3-1)*1.12:(index-(n-1)/2)*1.0;const z=portrait?(Math.floor(index/3)-.5)*1.8:(index%2?-.12:.12);item.target=new THREE.Vector3(x,portrait&&index<3?.95:0,z);item.root.scale.setScalar(scale);}
   else{const slot=crowd[index],space=clubSpace(isPortrait());item.target=new THREE.Vector3(this.mode==='crowd'&&this.formation==='free'?Math.max(-space.floorHalfWidth,Math.min(space.floorHalfWidth,slot.x)):slot.x,slot.y,this.mode==='crowd'&&this.formation==='free'?Math.max(space.approachZ,Math.min(space.floorFront,slot.z)):slot.z);item.root.scale.setScalar(slot.scale);}
   if(item.target.y===0)item.target.y=-.095-.048*item.root.scale.x;
   if(this.config.characterPresentation==='billboard'&&item.target.y<.1)item.target.y=-.095;
   if(!item.placed){item.root.position.copy(item.target);item.placed=true;}
   slots.push({x:item.target.x,y:item.target.y,z:item.target.z,scale:item.root.scale.x,travel:this.formation==='free'?.3*item.root.scale.x:0,radius:this.config.characterPresentation==='billboard'?.95:.62,height:item.label.visible?3.25:2.9});
  });
  this.bounds=layoutBounds(slots);if(this.mode==='crowd'&&this.formation==='free'&&n){const space=clubSpace(isPortrait());this.bounds.expandByPoint(new THREE.Vector3(-space.floorHalfWidth-.55,-.15,space.deckBack));this.bounds.expandByPoint(new THREE.Vector3(space.floorHalfWidth+.55,3.5,space.floorFront+.6));}this.revision++;this.layoutDirty=false;
 }
 act(action,target='all',seconds){const all=[...this.items.values()];if(target==='all')all.forEach(item=>item.animation.play(action,seconds));else{const item=typeof target==='number'?all[target]:this.items.get(target);item?.animation.play(action,seconds);}}
 update(delta){
  this.time=performance.now()/1000;
  for(let n=0;n<this.config.spawnPerFrame&&this.pending.size;n++){const [key,{user,action,selectedDance,selectedGender,simulationVariant,simulated}]=this.pending.entries().next().value;this.pending.delete(key);let index=this.variant==='auto'?(Number.isInteger(simulationVariant)?simulationVariant:[...key].reduce((sum,char)=>sum+char.charCodeAt(0),0)%this.templates.length):Number(this.variant);if(selectedGender)index=genderVariant(this.config.characters,selectedGender,key,index)??index;const item=this.add(user,index);if(item&&selectedGender)item.selectedGender=selectedGender;if(item&&simulated)item.simulated=true;if(item&&selectedDance){item.selectedDance=selectedDance;item.animation.setBase(selectedDance);}item?.animation.play(action,action===selectedDance?Infinity:undefined);}
  const roaming=this.mode==='crowd'&&this.formation==='free';
  if(roaming)this.motion.update(delta,[...this.items.values()],{portrait:isPortrait()});else this.motion.clear();
  for(const [key,item]of this.items){
   if(!roaming)item.motionLocation='formation';
   if(item.showLocked){item.lastActive=this.time;item.animation.update(delta);continue;}
   const target=roaming?item.root.position.clone():item.target.clone();
   if(this.formation==='free'&&!roaming){const phase=[...key].reduce((sum,c)=>sum+c.charCodeAt(0),0);target.x+=Math.sin(this.time*.37+phase)*.3*item.root.scale.x;target.z+=Math.sin(this.time*.29+phase*1.7)*.3*item.root.scale.x;item.root.rotation.y=Math.sin(this.time*.31+phase)*.25;}
   else if(!roaming)item.root.rotation.y=0;
   const clearance=this.showClearance;
   if(clearance&&clearance.key!==key){const dx=target.x-clearance.center.x,dz=target.z-clearance.center.z,distance=Math.hypot(dx,dz);if(distance<clearance.radius){const angle=distance>.01?Math.atan2(dz,dx):key.length*2.39996;const push=(clearance.radius-distance)*clearance.strength;target.x+=Math.cos(angle)*push;target.z+=Math.sin(angle)*push;}}
   item.root.position.lerp(target,Math.min(1,delta*7));item.animation.update(delta);if(this.mode==='crowd'&&this.time-item.lastActive>this.config.inactivitySeconds)this.remove(key);
  }
  if(this.layoutDirty)this.layout();
 }
 dispose(){window.removeEventListener('resize',this.onResize);this.clear();const geometries=new Set(),materials=new Set(),textures=new Set([this.fabric,this.maleFace,this.femaleFace,this.atlas,...(this.sequenceTextures?.values()||[])].filter(Boolean));for(const template of this.templates)template.scene.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const mat of node.material?(Array.isArray(node.material)?node.material:[node.material]):[]){materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);}if(node.isSkinnedMesh)node.skeleton.dispose();});textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());}
}
