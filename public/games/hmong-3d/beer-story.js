import * as THREE from 'three';
import { smooth } from './gift-shows.js';
import { clubSpace } from './club-space.js';
import { beerEntrance, roomLayout } from './room-layout.js';

export { beerCommand, chooseBeerGuest } from './beer-commands.js';
export function pointOnPath(points,progress){
 const distances=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y,p.z-points[i].z)),length=distances.reduce((a,b)=>a+b,0);let left=Math.max(0,Math.min(1,progress))*length;
 for(let i=0;i<distances.length;i++){if(left<=distances[i]||i===distances.length-1){const f=Math.min(1,left/Math.max(.0001,distances[i]));return {x:THREE.MathUtils.lerp(points[i].x,points[i+1].x,f),y:THREE.MathUtils.lerp(points[i].y,points[i+1].y,f),z:THREE.MathUtils.lerp(points[i].z,points[i+1].z,f)};}left-=distances[i];}
 return {...points[0]};
}
export function floorPath(origin,destination,portrait){
 const space=clubSpace(portrait),points=[{x:origin.x,y:origin.y,z:origin.z}];
 if(origin.y>.1&&origin.z<space.approachZ){const x=(origin.x<0?-1:1)*space.laneX;points.push({x,y:.57,z:-5.65*space.zScale},{x,y:.38,z:-5.14*space.zScale},{x,y:.19,z:-4.62*space.zScale},{x,y:0,z:-4.1*space.zScale},{x,y:-.095,z:space.approachZ});}
 points.push({...destination});return points;
}

export class BeerStory {
 constructor(scene,characters,giver,guest,{portrait=false}={}){
  this.characters=characters;this.giver=giver;this.guest=guest;this.portrait=portrait;this.group=new THREE.Group();this.group.name='BeerToast';scene.add(this.group);this.members=[giver,guest].map(item=>({item,origin:item.root.position.clone(),label:item.label.visible,opacity:item.model.getObjectByName('CharacterArt')?.material.opacity??1}));
  for(const member of this.members){member.item.showLocked=true;member.item.label.visible=true;}
  this.entrance=beerEntrance(portrait);const corridor={x:Math.max(-1.5,Math.min(1.5,this.members[0].origin.x)),y:-.095,z:this.entrance.z+.8};this.toShop=floorPath(this.members[0].origin,corridor,portrait);this.toShop.push({x:this.entrance.x,y:-.095,z:corridor.z},{...this.entrance});
  this.meet=[{x:-.68,y:-.095,z:1},{x:.68,y:-.095,z:1}];this.toMeet=[{...this.entrance},{x:this.entrance.x,y:-.095,z:this.entrance.z+.8},this.meet[0]];this.guestToMeet=floorPath(this.members[1].origin,this.meet[1],portrait);
  this.back=[floorPath(this.members[0].origin,this.meet[0],portrait).reverse(),floorPath(this.members[1].origin,this.meet[1],portrait).reverse()];
  this.materials={glass:new THREE.MeshStandardMaterial({color:'#fff0bf',transparent:true,opacity:.4,roughness:.15,metalness:.2,depthWrite:false}),beer:new THREE.MeshStandardMaterial({color:'#e9a72e',roughness:.25,metalness:.15}),foam:new THREE.MeshStandardMaterial({color:'#fff6da',roughness:.8}),handle:new THREE.MeshStandardMaterial({color:'#ffedbb',transparent:true,opacity:.7,roughness:.18})};
  this.mugs=[0,1].map(index=>{const root=new THREE.Group();root.name=`BeerMug${index+1}`;this.group.add(root);const add=(geometry,mat,y)=>{const obj=new THREE.Mesh(geometry,this.materials[mat]);obj.position.y=y;root.add(obj);return obj;};add(new THREE.CylinderGeometry(.22,.2,.5,18,1,true),'glass',.25);add(new THREE.CylinderGeometry(.18,.17,.39,16),'beer',.22);const foam=add(new THREE.CylinderGeometry(.19,.19,.09,16),'foam',.455);const handle=add(new THREE.TorusGeometry(.15,.035,6,16),'handle',.28);handle.position.x=.25;return {root,liquid:root.children[1],foam};});
  this.right=new THREE.Vector3();this.up=new THREE.Vector3();this.out=new THREE.Vector3();this.phase='fetch';this.lastCue='';
 }
 valid(){return this.members.every(({item})=>this.characters.items.get(item.key)===item);}
 attach(mug,item,side,height,camera){
  this.right.setFromMatrixColumn(camera.matrixWorld,0);this.up.setFromMatrixColumn(camera.matrixWorld,1);this.out.setFromMatrixColumn(camera.matrixWorld,2);
  mug.root.position.copy(item.root.position).addScaledVector(this.right,side*item.root.scale.x).addScaledVector(this.up,height*item.root.scale.x).addScaledVector(this.out,.12);mug.root.quaternion.copy(camera.quaternion);mug.root.scale.setScalar(item.root.scale.x*.95);
 }
 update(time,camera){
  const a=this.giver,b=this.guest,t=time;this.phase=t<7?'fetch':t<12?'offer':t<13.5?'clink':t<15.5?'drink':t<17?'toss':'return';
  if(t<6){const p=pointOnPath(this.toShop,t/6);a.root.position.set(p.x,p.y,p.z);}
  else if(t<8){a.root.position.set(this.entrance.x,-.095,this.entrance.z-.3*Math.sin((t-6)/2*Math.PI));}
  else if(t<12){const p=pointOnPath(this.toMeet,smooth((t-8)/4));a.root.position.set(p.x,p.y,p.z);}
  else a.root.position.set(this.meet[0].x,-.095,this.meet[0].z);
  if(t<9.5)b.root.position.copy(this.members[1].origin);else if(t<12){const p=pointOnPath(this.guestToMeet,smooth((t-9.5)/2.5));b.root.position.set(p.x,p.y,p.z);}else b.root.position.set(this.meet[1].x,-.095,this.meet[1].z);
  if(t>=17)for(let i=0;i<2;i++){const p=pointOnPath(this.back[i],smooth((t-17)/5));this.members[i].item.root.position.set(p.x,p.y,p.z);}
  const fade=t<6?1:t<6.7?1-smooth((t-6)/.7):t<7.2?0:smooth((t-7.2)/.8);
  for(const [i,member]of this.members.entries()){
   const item=member.item,sprite=item.model.getObjectByName('CharacterArt');if(sprite){sprite.material.opacity=member.opacity*(i===0?fade:1);sprite.material.rotation=this.phase==='drink'?Math.sin(smooth((t-13.5)/.6)*Math.PI*.5)*(i?-.08:.08):0;}
   item.label.visible=i===0?fade>.5:true;
   if(i===0||t>=9.5)item.animation.play?.(t<12||t>=17?'walk':'idle',.2);
  }
  for(const mug of this.mugs){mug.root.visible=t>=7.3&&t<17; mug.liquid.scale.y=1;mug.foam.position.y=.455;}
  this.attach(this.mugs[0],a,.52,1.12,camera);this.attach(this.mugs[1],t<11.6?a:b,t<11.6?-.52:-.52,1.12,camera);
  if(t>=12&&t<13.5){const f=Math.sin(Math.min(1,(t-12)/1.5)*Math.PI),center=a.root.position.clone().add(b.root.position).multiplyScalar(.5).addScaledVector(this.up,(a.root.scale.x+b.root.scale.x)*.6);
   this.mugs.forEach((mug,i)=>{const target=center.clone().addScaledVector(this.right,(i?1:-1)*.12);mug.root.position.lerp(target,f);});}
  if(t>=13.5&&t<15.5){const f=smooth((t-13.5)/.7),drank=smooth((t-14)/1.2);this.mugs.forEach((mug,i)=>{const item=i?b:a;this.attach(mug,item,i?-.2:.2,1.12+f*.85,camera);mug.root.rotateZ((i?1:-1)*f*.95);mug.liquid.scale.y=1-drank*.9;mug.foam.position.y=.455-drank*.32;});}
  if(t>=15.5&&t<17){const f=(t-15.5)/1.5;this.mugs.forEach((mug,i)=>{const item=i?b:a;this.attach(mug,item,i?-.2:.2,1.7,camera);mug.root.position.x+=(i?1:-1)*f*1.4;mug.root.position.y=THREE.MathUtils.lerp(mug.root.position.y,.04,f)+Math.sin(f*Math.PI)*.8;mug.root.rotateZ(f*(i?1:-1)*7);mug.root.scale.multiplyScalar(1-smooth((f-.75)/.25));mug.liquid.scale.y=.1;});}
  const roots=t<9.5?[a]:[a,b],bounds=new THREE.Box3();for(const item of roots){const p=item.root.position,s=item.root.scale.x;bounds.expandByPoint(new THREE.Vector3(p.x-s,p.y,p.z-.5));bounds.expandByPoint(new THREE.Vector3(p.x+s,p.y+s*3.4,p.z+.5));}
  if(t>=3&&t<8.5){const shop=roomLayout(this.portrait).rooms[0],front=shop.z+shop.depth/2;bounds.expandByPoint(new THREE.Vector3(shop.x-shop.width/2,0,front-.1));bounds.expandByPoint(new THREE.Vector3(shop.x+shop.width/2,shop.height+.15,front+.2));}
  bounds.expandByObject(this.group);return {bounds,phase:this.phase,door:t>5.3&&t<8.5?1:0};
 }
 finish(){for(const member of this.members){const {item}=member;if(this.characters.items.get(item.key)!==item)continue;item.showLocked=false;item.root.position.copy(member.origin);item.label.visible=member.label;const sprite=item.model.getObjectByName('CharacterArt');if(sprite){sprite.material.opacity=member.opacity;sprite.material.rotation=0;}item.animation.setBase(item.selectedDance||this.characters.base);}}
 dispose(){const geometries=new Set();this.group.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);});geometries.forEach(g=>g.dispose());Object.values(this.materials).forEach(m=>m.dispose());this.group.removeFromParent();}
}
