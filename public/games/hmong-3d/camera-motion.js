import * as THREE from 'three';
// A moving camera has limited speed and acceleration, even when its subject
// disappears or crowd membership changes during a shot.
export function moveCameraPoint(position,target,velocity,delta,{speed=6,acceleration=5}={}){
 const dt=Math.max(0,Math.min(.1,delta));if(!dt)return;
 const error=new THREE.Vector3().subVectors(target,position),desired=error.clone().multiplyScalar(1.8).clampLength(0,speed);
 const change=desired.sub(velocity).clampLength(0,acceleration*dt);velocity.add(change);
 const step=velocity.clone().multiplyScalar(dt);
 if(error.lengthSq()<.000001&&velocity.lengthSq()<.0001){position.copy(target);velocity.set(0,0,0);}else position.add(step);
}
