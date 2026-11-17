import * as THREE from 'three';

// One reusable particle pool for all arrivals, with no per-frame GPU allocation.
export class ShowEffects {
 constructor(scene){
  this.geometry=new THREE.BufferGeometry();this.positions=new Float32Array(64*3);this.velocity=new Float32Array(64*3);
  this.geometry.setAttribute('position',new THREE.BufferAttribute(this.positions,3));
  this.material=new THREE.PointsMaterial({color:'#d6bce7',size:.09,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  this.points=new THREE.Points(this.geometry,this.material);this.points.frustumCulled=false;this.points.visible=false;scene.add(this.points);this.life=0;
 }
 burst(position,color='#d6bce7'){
  this.points.position.copy(position);this.points.position.y=Math.max(-.06,position.y);this.material.color.set(color);this.life=1.2;
  for(let i=0;i<64;i++){const n=i*3,a=i*2.39996,r=.1+(i%7)*.05;this.positions[n]=Math.cos(a)*r;this.positions[n+1]=.02;this.positions[n+2]=Math.sin(a)*r;this.velocity[n]=Math.cos(a)*(1+i%5*.25);this.velocity[n+1]=.4+i%4*.12;this.velocity[n+2]=Math.sin(a)*(1+i%5*.25);}
  this.geometry.attributes.position.needsUpdate=true;
 }
 update(delta,enabled=true){
  this.life=Math.max(0,this.life-delta);this.points.visible=enabled&&this.life>0;this.material.opacity=this.life*.55;
  if(this.life<=0)return;for(let i=0;i<64;i++){const n=i*3;this.positions[n]+=this.velocity[n]*delta;this.positions[n+1]+=this.velocity[n+1]*delta;this.positions[n+2]+=this.velocity[n+2]*delta;this.velocity[n+1]-=delta*.4;}this.geometry.attributes.position.needsUpdate=true;
 }
 clear(){this.life=0;this.points.visible=false;}
 dispose(){this.geometry.dispose();this.material.dispose();this.points.removeFromParent();}
}
