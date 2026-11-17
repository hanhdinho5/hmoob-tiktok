import { clubSpace } from './club-space.js';
import * as THREE from 'three';

// Fit arbitrary camera directions, not just a fixed front view. Bounds include
// the actor, nameplate and the actual animated prop, in portrait and landscape.
export function fitShot(position,target,bounds,{fov=42,aspect=1,padding=1.18}={}){
 const outward=position.clone().sub(target).normalize();
 if(outward.lengthSq()<.5)outward.set(0,.2,1).normalize();
 const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),outward).normalize();
 if(right.lengthSq()<.5)right.set(1,0,0);
 const up=new THREE.Vector3().crossVectors(outward,right).normalize();
 const tanV=Math.tan(THREE.MathUtils.degToRad(fov/2)),tanH=tanV*Math.max(.1,aspect);
 let distance=position.distanceTo(target);
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const point=new THREE.Vector3(x,y,z).sub(target),depth=point.dot(outward);
  distance=Math.max(distance,depth+Math.abs(point.dot(right))*padding/tanH,depth+Math.abs(point.dot(up))*padding/tanV);
 }
 return position.copy(target).addScaledVector(outward,distance);
}

export function idleShot(kind,time,progress,home,center,items,{portrait=false}={}){
 const position=home.clone(),target=center.clone(),offset=home.clone().sub(center),distance=offset.length(),s=Math.sin,space=clubSpace(portrait),pan=portrait?.35:1;
 switch(kind){
  case 'crowd': position.x+=s(time*.22)*distance*.16*pan;position.y=Math.max(2,home.y*.8);break;
  case 'orbit': offset.applyAxisAngle(new THREE.Vector3(0,1,0),s(time*.12)*.35*pan);position.copy(center).add(offset);break;
  case 'tour': offset.applyAxisAngle(new THREE.Vector3(0,1,0),(progress-.5)*1.05*pan);position.copy(center).addScaledVector(offset,1.15);position.y+=Math.sin(progress*Math.PI)*2;break;
  case 'side': position.x+=distance*.42*pan;position.z+=distance*.12;target.x-=.4;break;
  case 'crane': position.y+=distance*.35*(1-progress);position.z+=distance*.15*progress;break;
  case 'top': position.copy(center).add(new THREE.Vector3(s(time*.15)*2,distance*.95,distance*.45));break;
  case 'dj': target.set(0,1.9,space.djZ);position.set(Math.sin(time*.25)*(portrait?.55:1.3),2.5,space.djZ+5.75);break;
  case 'stage': position.x+=s(time*.2)*.6;position.z+=1;target.z-=.8;target.y+=.4;break;
  case 'dancer': {const actor=items[Math.floor(time/8)%items.length];if(actor){target.copy(actor.root.position);target.y+=actor.root.scale.x*1.4;position.copy(target).add(new THREE.Vector3(s(time*.18)*1.5,1,8));}break;}
 }
 return {position,target};
}
