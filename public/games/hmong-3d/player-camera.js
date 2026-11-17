import * as THREE from 'three';
import { fitShot } from './camera-shots.js';

function cameraSlot(time){
 const phase=((time%40)+40)%40;
 return phase<8?0:phase<15?1:phase<18?2:phase<26?3:phase<33?4:5;
}
const CAMERA_KINDS=['medium','high','wide','close','medium','high'];
export function cameraBeat(time){return CAMERA_KINDS[cameraSlot(time)];}
// Alternate moving medium shots, a short overview, then a closer return.
function sampleShot(items,time,aspect,kind,turn){
 const actors=items.filter(item=>!item.showLocked);if(!actors.length)return null;
 const wide=kind==='wide',lead=actors[((turn%actors.length)+actors.length)%actors.length],p=lead.root.position;
 const group=wide?actors:actors.filter(item=>item===lead||Math.abs(item.root.position.y-p.y)<.3&&item.root.position.distanceTo(p)<2.8).sort((a,b)=>a.root.position.distanceToSquared(p)-b.root.position.distanceToSquared(p)).slice(0,5);
 const bounds=new THREE.Box3();for(const item of group){const q=item.root.position,s=item.root.scale.x;bounds.expandByPoint(new THREE.Vector3(q.x-s*.7,q.y,q.z-.25));bounds.expandByPoint(new THREE.Vector3(q.x+s*.7,q.y+s*3.3,q.z+.25));}
 const target=bounds.getCenter(new THREE.Vector3());
 // Keep the camera in the central corridor so neither side building blocks it.
 target.x*=.35;
 const angle=0;
 const dolly=1+Math.sin(time*.35)*.045;
 const distance=(kind==='close'?10:wide?17:12.5)*dolly,height=kind==='high'?distance*1.15:wide?7:2.8;
 const position=target.clone().add(new THREE.Vector3(Math.sin(angle)*distance,height,Math.cos(angle)*distance));
 fitShot(position,target,bounds,{aspect,fov:40,padding:wide?1.08:1.2});
 // People passing in front of the featured group must not fill the screen.
 const outward=position.clone().sub(target).normalize(),tan=Math.tan(THREE.MathUtils.degToRad(20)),maxHeight=kind==='close'?.4:wide?.23:.33;
 let safeDistance=position.distanceTo(target);
 for(const actor of actors){const depth=actor.root.position.clone().sub(target).dot(outward);safeDistance=Math.max(safeDistance,depth+actor.root.scale.y*2.8/(2*tan*maxHeight));}
 position.copy(target).addScaledVector(outward,safeDistance*1.32);
 return {position,target,bounds,lead:lead.key,fov:40,kind};
}

export function playerShot(items,time,aspect=9/16){
 const starts=[0,8,15,18,26,33],kinds=CAMERA_KINDS;
 const cycle=Math.floor(time/40),phase=((time%40)+40)%40,slot=cameraSlot(time),turn=cycle*6+slot;
 const current=sampleShot(items,time,aspect,kinds[slot],turn);if(!current||turn===0)return current;
 const previous=sampleShot(items,time,aspect,kinds[(slot+5)%6],turn-1);
 const progress=Math.min(1,(phase-starts[slot])/(kinds[slot]==='wide'?2:3.5));
 const blend=progress**3*(progress*(progress*6-15)+10);
 current.position.lerp(previous.position,1-blend);current.target.lerp(previous.target,1-blend);
 if(blend<.5)current.lead=previous.lead;
 return current;
}
