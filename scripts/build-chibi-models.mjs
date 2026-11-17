// Original prototype geometry, real skinned GLB and animation clips. No cultural authenticity claim.
import * as THREE from 'three';
import { sculptClubCharacter } from './club-model-design.mjs';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result=value; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result=`data:${blob.type};base64,${Buffer.from(value).toString('base64')}`;this.onloadend?.(); }); }
};
const output=fileURLToPath(new URL('../public/assets/hmong/3d/',import.meta.url));fs.mkdirSync(output,{recursive:true});
const variants=[['male-daily',false,false,0],['female-daily',true,false,0],['male-festival',false,true,1],['female-festival',true,true,1],['male-white',false,false,2],['female-bun',true,true,2],['male-vest',false,true,3],['female-longhair',true,true,3]];

function createModel(id,female,festival,style=0) {
 const {scene,bones,geometry}=sculptClubCharacter(id,female,festival,style);
 const clips=[];
 for(const action of ['idle','dance','happy','celebrate','wave','surprise','clap','gift','walk']) {
  const duration=action==='wave'?2.4:2, times=Array.from({length:17},(_,i)=>i*duration/16),tracks=[];
  for(const b of bones) {
   const quaternions=[];
   for(let i=0;i<times.length;i++) {
    const phase=i/16*Math.PI*2,s=Math.sin(phase),c=Math.cos(phase);let x=0,y=0,z=0;
    if(b.name==='Spine'){z=s*(action==='idle'?.015:.07);y=action==='dance'?s*.14:0;}
    if(b.name==='Head'){z=-s*.035;y=action==='wave'?s*.10:0;}
    const side=b.name.endsWith('L')?1:-1;
    if(b.name.startsWith('Arm')){
     if(action==='idle'){z=side*.035*s;}
     if(['dance','gift','happy','walk'].includes(action)){x=s*.65*side;z=-side*(action==='walk'?.06:.40+c*.20);}
     if(action==='wave'){z=-side*(side===-1?2.45+s*.18:.08);x=side===-1?s*.20:0;}
     if(action==='celebrate'){z=-side*(2.55+s*.18);x=.15*s;}
     if(action==='clap'){z=side*1.02;x=-.8;}
     if(action==='surprise'){z=side*1.45;x=-.3;}
    }
    if(b.name.startsWith('Elbow')){
     x=['clap','surprise'].includes(action)?-.9+Math.abs(s)*.4:-.12;
     if(action==='wave'&&side===-1)x=-.5+s*.45;
    }
    if(b.name.startsWith('Leg')){x=['dance','walk'].includes(action)?s*.28*side:0;z=action==='happy'?side*.08*Math.abs(s):0;}
    if(b.name.startsWith('Knee'))x=['dance','walk'].includes(action)?Math.max(0,-s*side)*.35:0;
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));quaternions.push(q.x,q.y,q.z,q.w);
   }
   tracks.push(new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`,times,quaternions));
  }
  const positions=[];
  for(let i=0;i<times.length;i++){const p=i/16*Math.PI*2;const h=action==='idle'?.012:action==='happy'||action==='celebrate'?.13:.055;positions.push(action==='dance'?Math.sin(p)*.045:0,.91+(1-Math.cos(p*2))*h,0);}
  tracks.push(new THREE.VectorKeyframeTrack('Hips.position',times,positions));
  clips.push(new THREE.AnimationClip(action,duration,tracks));
 }
 return {scene,clips,triangles:geometry.index.count/3,vertices:geometry.attributes.position.count};
}
for(const [id,female,festival,style]of variants){const {scene,clips,triangles,vertices}=createModel(id,female,festival,style);const glb=await new GLTFExporter().parseAsync(scene,{binary:true,animations:clips});fs.writeFileSync(path.join(output,`${id}-club-v3.glb`),Buffer.from(glb));console.log(`${id}: ${glb.byteLength} bytes, ${triangles} triangles, ${vertices} vertices, ${clips.length} clips`);}
