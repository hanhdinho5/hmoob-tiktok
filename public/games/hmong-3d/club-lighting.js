import * as THREE from 'three';
import { lightFrame, bankLevel } from './light-patterns.js';

const PALETTES=[['#31dcff','#ef36d3','#7953ff','#ffbd55'],['#5affb8','#7861ff','#ff4aa9','#40cfff'],['#ff9b42','#f64ddd','#557dff','#ffdf65'],['#46e9ff','#a358ff','#ff478f','#74ffce']];
export class ClubLighting {
 constructor(parent){
  this.group=new THREE.Group();this.group.name='ClubLighting';parent.add(this.group);this.beams=[];this.pools=[];this.lenses=[];this.fans=[];this.segments=[];this.rails=[];this.time=0;this.motion=0;this.options={musicLights:true,intensity:.8,reduced:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false};
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'#ffffff');gradient.addColorStop(.25,'#ffffffaa');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);this.glow=new THREE.CanvasTexture(canvas);
  const basic=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,toneMapped:false,transparent:opacity<1,opacity,depthWrite:opacity===1,blending:opacity<1?THREE.AdditiveBlending:THREE.NormalBlending});
  const mesh=(geometry,material,parent=this.group)=>{const obj=new THREE.Mesh(geometry,material);parent.add(obj);return obj;};
  const housing=new THREE.CylinderGeometry(.17,.22,.3,10),dark=new THREE.MeshStandardMaterial({color:'#100d23',metalness:.5,roughness:.3});
  const cone=new THREE.ConeGeometry(.8,1,24,1,true);cone.translate(0,-.5,0);const poolGeometry=new THREE.PlaneGeometry(2.4,2.4);
  for(let i=0;i<8;i++){
   const x=(i-3.5)*1.45,z=i%2? -3.55:-4.0,fixture=mesh(housing,dark);fixture.position.set(x,5.5,z);
   const lens=mesh(new THREE.SphereGeometry(.13,10,6),basic('#b85bff'));lens.position.set(x,5.31,z);this.lenses.push(lens);
   const beam=mesh(cone,new THREE.MeshBasicMaterial({color:'#dd55ff',transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false}));beam.position.copy(lens.position);this.beams.push(beam);
   const pool=mesh(poolGeometry,new THREE.MeshBasicMaterial({map:this.glow,color:'#dd55ff',transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));pool.rotation.x=-Math.PI/2;pool.position.y=-.065;this.pools.push(pool);
  }
  for(let i=0;i<12;i++){const segment=mesh(new THREE.TorusGeometry(4.25,.035,5,10,Math.PI/6-.06),basic('#55bbff'));segment.rotation.x=-Math.PI/2;segment.rotation.z=i*Math.PI/6;segment.position.set(0,-.058,-.5);this.segments.push(segment);}
  for(const side of [-1,1])for(let i=0;i<4;i++){const rail=mesh(new THREE.BoxGeometry(.065,.85,.045),basic('#9a66ff'));rail.position.set(side*5.48,.75+i*1.05,-3.69);this.rails.push(rail);}
  for(const side of [-1,1]){
   const positions=new Float32Array(12*6),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
   const material=new THREE.LineBasicMaterial({color:side<0?'#53ffd9':'#e94bff',transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
   const fan=new THREE.LineSegments(geometry,material);fan.position.set(side*4.9,4.4,-5.1);fan.frustumCulled=false;this.group.add(fan);this.fans.push(fan);
  }
  this.down=new THREE.Vector3(0,-1,0);this.direction=new THREE.Vector3();this.state=lightFrame(0,null,this.options);
 }
 configure(settings={}){if(typeof settings.musicLights==='boolean')this.options.musicLights=settings.musicLights;if(Number.isFinite(Number(settings.lightIntensity)))this.options.intensity=Math.max(0,Math.min(1,Number(settings.lightIntensity)));}
 update(delta,features,{enabled=true,theme='club',dense=false}={}){
  this.time+=delta;const state=lightFrame(this.time,features,this.options);this.state=state;this.motion+=delta*state.speed;this.group.visible=enabled&&state.brightness>0;if(!this.group.visible)return;
  const palette=theme==='royal'?PALETTES[2]:PALETTES[state.pattern],t=this.motion;
  for(let i=0;i<this.beams.length;i++){
   const beam=this.beams[i],pool=this.pools[i],bank=bankLevel(state,i),side=i<4?-1:1;
   beam.visible=!dense||i%2===0;pool.visible=beam.visible;
   let x,z;
   if(state.pattern===0){x=Math.sin(t+i*.72)*3.7;z=.5+Math.cos(t*.8+i)*2.5;}
   else if(state.pattern===1){x=-side*(1.3+Math.sin(t*.85+i*.2)*2.3);z=-.5+Math.sin(t+i*.45)*2.7;}
   else if(state.pattern===2){x=Math.sin(t*1.2)*4.2+(i-3.5)*.25;z=.4+Math.cos(t*.7+i*.9)*2.3;}
   else{x=Math.sin(t+i*.78)*3.6;z=Math.cos(t+i*.78)*3-.2;}
   pool.position.set(x,-.065,z);pool.scale.setScalar(.7+state.energy*.4+state.pulse*.2);pool.material.color.set(palette[i%4]);pool.material.opacity=bank*.48;
   this.direction.set(x-beam.position.x,-.065-beam.position.y,z-beam.position.z);const length=this.direction.length();beam.quaternion.setFromUnitVectors(this.down,this.direction.normalize());beam.scale.set(1+state.energy*.25,length,1+state.energy*.25);
   beam.material.color.set(palette[i%4]);beam.material.opacity=.015+bank*.14;this.lenses[i].material.color.copy(beam.material.color).multiplyScalar(.4+bank*2);
  }
  for(let i=0;i<this.segments.length;i++){const segment=this.segments[i],bank=bankLevel(state,i);segment.material.color.set(palette[(i+Math.floor(state.beatIndex/2))%4]).multiplyScalar(.2+bank*1.5);}
  for(let i=0;i<this.rails.length;i++)this.rails[i].material.color.set(palette[(i+state.beatIndex)%4]).multiplyScalar(.25+bankLevel(state,i)*1.8);
  for(let f=0;f<this.fans.length;f++){
   const fan=this.fans[f];fan.visible=!dense;const values=fan.geometry.attributes.position.array,side=f?1:-1;
   fan.material.color.set(palette[(f+1)%4]);fan.material.opacity=bankLevel(state,f*2)*.72;
   for(let i=0;i<12;i++){const offset=i*6,spread=(i-5.5)*.24;values[offset]=0;values[offset+1]=0;values[offset+2]=0;values[offset+3]=-side*3.2+Math.sin(t*.9)*2.4+spread;values[offset+4]=-4.4;values[offset+5]=5.1+Math.cos(t*.7+f)*1.9+Math.abs(spread)*.8;}
   fan.geometry.attributes.position.needsUpdate=true;
  }
 }
 dispose(){const geometries=new Set(),materials=new Set();this.group.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)materials.add(obj.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.glow.dispose();this.group.removeFromParent();}
}
