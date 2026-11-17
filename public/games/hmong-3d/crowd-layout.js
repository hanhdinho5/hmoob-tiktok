import * as THREE from 'three';

// Deterministic crowd spacing and frustum fit, independently testable without WebGL.
export function crowdLayout(count,{portrait=false,formation='free',characterScale=.85}={}){
 const size=Math.max(0,Math.min(100,Math.round(count))),factor=Math.max(.55,Math.min(1.25,Number(characterScale)||1));
 const spacingScale=size<=6?.72:size<=20?.62:size<=40?.53:size<=70?.44:.37,scale=(portrait?.86:spacingScale)*factor;
 const columns=Math.max(1,Math.min(size||1,Math.ceil(Math.sqrt(size*(portrait?.65:1.8))))),rows=Math.ceil(size/columns),slots=[];
 for(let i=0;i<size;i++){
  let x,z;
  if(formation==='free'){const angle=i*2.399963229728653+.12*Math.sin(i*17),r=i?1.3*Math.sqrt(i)*spacingScale:0;x=Math.cos(angle)*r*(portrait?.85:1.2);z=Math.sin(angle)*r*(portrait?1.15:.9);}
  else if(formation==='circle'){const angle=i/Math.max(1,size)*Math.PI*2,r=Math.max(1.4,size*.50*spacingScale/Math.PI);x=Math.sin(angle)*r;z=Math.cos(angle)*r;}
  else{const col=i%columns,row=Math.floor(i/columns),rowCount=Math.min(columns,size-row*columns);x=(col-(rowCount-1)/2)*spacingScale*1.65;z=(row-(rows-1)/2)*spacingScale*2.25;}
  slots.push({x,z,y:-.095-.048*scale,scale,travel:formation==='free'?.3*scale:0});
 }
 return slots;
}

export function layoutBounds(slots){
 const bounds=new THREE.Box3();
 for(const slot of slots){const radius=(slot.radius??.62)*slot.scale+(slot.travel||0);bounds.expandByPoint(new THREE.Vector3(slot.x-radius,slot.y,slot.z-radius));bounds.expandByPoint(new THREE.Vector3(slot.x+radius,slot.y+(slot.height??2.9)*slot.scale,slot.z+radius));}
 if(bounds.isEmpty())bounds.set(new THREE.Vector3(-2.8,-.1,-1.5),new THREE.Vector3(2.8,2,1.5));
 return bounds;
}

export function fitCrowdCamera(camera,bounds,{count=6,portrait=false,padding=1.3,tilt}={}){
 const center=bounds.getCenter(new THREE.Vector3()),outward=new THREE.Vector3(0,tilt??(count>40?1.1:count>6?.85:.24),1).normalize();
 const right=new THREE.Vector3(1,0,0),up=new THREE.Vector3().crossVectors(outward,right).normalize();
 camera.fov=portrait?42:38;
 const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect;
 let distance=0;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const corner=new THREE.Vector3(x,y,z).sub(center),depth=corner.dot(outward);
  distance=Math.max(distance,depth+Math.abs(corner.dot(right))/tanH*padding,depth+Math.abs(corner.dot(up))/tanV*padding);
 }
 camera.position.copy(center).addScaledVector(outward,Math.max(distance,portrait?7:7.8));camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 return {distance,center:center.toArray()};
}
