import { isPortrait } from './viewport.js';
import { ClubRooms } from './club-rooms.js';
import { ClubLighting } from './club-lighting.js';
import { clubSpace } from './club-space.js';
import { CLUB_DECK } from './crowd-motion.js';
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

// Real floor, stairs, pillars, arch lights and spot beams; a generated detailed
// far-wall texture supplies the distant decorative set without thousands of meshes.
export class ClubStage {
 constructor(scene){
  this.scene=scene;this.rooms=new ClubRooms(scene);this.group=new THREE.Group();scene.add(this.group);this.theme='club';this.time=0;this.burst=0;this.lights=[];this.beams=[];this.resources=[];
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.35,...extra});
  const dark=mat('#080818'),gold=mat('#be8855'),neon=(color)=>new THREE.MeshBasicMaterial({color,toneMapped:false});
  const mesh=(geometry,material,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);this.group.add(object);return object;};
  const loader=new THREE.TextureLoader();
  const backdrop=loader.load('/assets/hmong/club/dance-hall.png');backdrop.colorSpace=THREE.SRGBColorSpace;this.resources.push(backdrop);
  // The top portion of the artwork is the far wall; the foreground is a 3D floor.
  backdrop.repeat.set(1,.78);backdrop.offset.set(0,.22);
  this.backdrop=mesh(new THREE.PlaneGeometry(18,8),new THREE.MeshBasicMaterial({map:backdrop,toneMapped:false,depthWrite:false,depthTest:false}),0,2.8,-8.5);
  // This image is scenery, not a physical wall: billboards must never be cut
  // by it when a high/side camera tilts their screen-facing plane backwards.
  this.backdrop.material.color.set('#8c799e');this.backdrop.name='ClubBackdrop';this.backdrop.renderOrder=-100;
  const textile=loader.load('/assets/hmong/club/embroidered-fabric.png');textile.colorSpace=THREE.SRGBColorSpace;textile.wrapS=textile.wrapT=THREE.RepeatWrapping;textile.repeat.set(4,1);this.resources.push(textile);
  const led=new THREE.MeshBasicMaterial({map:textile,color:'#b8a5ff',toneMapped:false});
  mesh(new THREE.BoxGeometry(24,.35,22),dark,0,-.28,-1);
  const floor=new Reflector(new THREE.PlaneGeometry(24,22),{clipBias:.003,textureWidth:384,textureHeight:256,color:0x777799});floor.rotation.x=-Math.PI/2;floor.position.set(0,-.095,-1);this.group.add(floor);this.floor=floor;
  const reflect=floor.onBeforeRender;floor.onBeforeRender=(...args)=>{if(this.mirrorEnabled)reflect.apply(floor,args);};this.mirrorEnabled=true;
  const glaze=mesh(new THREE.PlaneGeometry(24,22),new THREE.MeshBasicMaterial({color:'#0d0927',transparent:true,opacity:.45,depthWrite:false}),0,-.088,-1);glaze.rotation.x=-Math.PI/2;
  // Festival riser and three stairs behind the dancers.
  for(let step=0;step<3;step++){
   const z=-4.1-step*.52,y=step*.19;
   mesh(new THREE.BoxGeometry(12-step*.35,.18,.54),dark,0,y-.1,z);
   mesh(new THREE.BoxGeometry(11.9-step*.35,.025,.035),neon(step%2?'#a542ff':'#3da7ff'),0,y,z+.25);
  }
  mesh(new THREE.BoxGeometry(CLUB_DECK.width,.66,2.9),dark,0,.24,-6.85);
  mesh(new THREE.BoxGeometry(CLUB_DECK.width,.035,.04),neon('#e4af67'),0,.58,CLUB_DECK.front);
  mesh(new THREE.BoxGeometry(6,.65,1.15),dark,0,CLUB_DECK.height+.325,-7.15);
  mesh(new THREE.PlaneGeometry(5.8,.60),led,0,CLUB_DECK.height+.325,-6.565);
  this.djDiscs=[];for(const x of [-1.15,1.15]){const disc=mesh(new THREE.CylinderGeometry(.46,.46,.035,24),dark,x,1.245,-7.15);this.djDiscs.push(disc);const marker=new THREE.Mesh(new THREE.BoxGeometry(.22,.008,.035),gold);marker.position.set(.2,.025,0);disc.add(marker);mesh(new THREE.CylinderGeometry(.13,.13,.04,16),neon('#b875ff'),x,1.27,-7.15);}
  for(let i=0;i<8;i++)mesh(new THREE.BoxGeometry(.13,.025,.13),neon(i%2?'#62e4df':'#ef76c8'),(i%4-.5)*.21-.25,1.245,-7.0-Math.floor(i/4)*.2);
  // Portrait composition gives the rear trio a real riser, keeping all faces clear.
  this.portraitRiser=new THREE.Group();this.group.add(this.portraitRiser);
  const riser=new THREE.Mesh(new THREE.BoxGeometry(4.3,1.1,1.4),dark);riser.position.set(0,.45,-1);this.portraitRiser.add(riser);
  const riserEdge=new THREE.Mesh(new THREE.BoxGeometry(4.3,.025,.035),neon('#9c62ef'));riserEdge.position.set(0,1.0,-.285);this.portraitRiser.add(riserEdge);this.portraitRiser.visible=false;
  for(const side of [-1,1]){
   const x=side*5.8;
   mesh(new THREE.BoxGeometry(.55,6,.5),dark,x,2.9,-4.0);
   mesh(new THREE.PlaneGeometry(.35,5.7),led,x,2.9,-3.74);
   for(const offset of [-.31,.31])mesh(new THREE.BoxGeometry(.026,6.1,.026),neon('#8753fa'),x+offset,2.9,-3.70);
   // Side LED balcony panels and trim.
   mesh(new THREE.BoxGeometry(2.7,1.1,.2),dark,side*7.1,4.2,-5.8);
   mesh(new THREE.PlaneGeometry(2.5,.85),led,side*7.1,4.2,-5.68);
   mesh(new THREE.BoxGeometry(2.8,.035,.035),neon('#eaa96d'),side*7.1,3.60,-5.6);
  }
  for(const [radius,color]of [[3.3,'#bc58ff'],[3.65,'#d89a65'],[4.0,'#366af8']]){
   const ring=mesh(new THREE.TorusGeometry(radius,.026,6,96),neon(color),0,3.0,-6.1);ring.scale.y=1.05;
  }
  // Concentric floor lighting and panel seams.
  for(const [r,color]of [[3.9,'#8058de'],[4.5,'#396be5']]){const ring=mesh(new THREE.TorusGeometry(r,.012,5,96),neon(color),0,-.078,-.5);ring.rotation.x=-Math.PI/2;}
  const lineMaterial=new THREE.LineBasicMaterial({color:'#403251',transparent:true,opacity:.32});const segments=[];
  for(let i=-10;i<=10;i++){segments.push(-12,-.074,i,12,-.074,i,i,-.074,-12,i,-.074,10);}const lines=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(segments,3)),lineMaterial);this.group.add(lines);
  this.lighting=new ClubLighting(this.group);this.beams=this.lighting.beams;
  this.shadows=new THREE.InstancedMesh(new THREE.CircleGeometry(.38,16),new THREE.MeshBasicMaterial({color:'#03020c',transparent:true,opacity:.35,depthWrite:false}),100);this.shadows.frustumCulled=false;this.group.add(this.shadows);this.dummy=new THREE.Object3D();
  this.particleGeometry=new THREE.BufferGeometry();this.particleGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(100*3),3));this.particles=new THREE.Points(this.particleGeometry,new THREE.PointsMaterial({color:'#f9b8ff',size:.065,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));this.group.add(this.particles);
  this.setTheme('club');
 }
 setTheme(theme){this.theme=['evening','royal'].includes(theme)?'royal':'club';this.scene.background=new THREE.Color('#03030c');this.scene.fog=new THREE.Fog('#060413',55,120);for(const child of this.scene.children)if(child.isLight){if(child.isHemisphereLight)child.color.set('#b6a8dd');}}
 celebrate(){this.burst=4;const values=this.particleGeometry.attributes.position.array;for(let i=0;i<values.length;i+=3){values[i]=(Math.random()-.5)*8;values[i+1]=1+Math.random()*4;values[i+2]=(Math.random()-.5)*3;}this.particleGeometry.attributes.position.needsUpdate=true;}
 setPortrait(portrait){this.rooms.setPortrait(portrait);this.portrait=portrait;const space=clubSpace(portrait);this.group.scale.set(space.xScale,1,space.zScale);}
 update(delta,items,effects,musicFeatures){
  this.time+=delta;for(const disc of this.djDiscs)disc.rotation.y+=delta*2;let i=0,raised=false;const dummy=this.dummy;
  for(const item of items){raised ||= item.root.position.y>.8&&item.root.position.z>-3;dummy.position.copy(item.root.position);dummy.position.x/=this.group.scale.x;dummy.position.z/=this.group.scale.z;dummy.position.y=item.root.position.z<clubSpace(this.portrait).deckFront?CLUB_DECK.height+.01:item.root.position.y>.8&&item.root.position.z>-3?1.005:-.08;dummy.rotation.x=-Math.PI/2;dummy.scale.set(item.root.scale.x/this.group.scale.x,item.root.scale.x/this.group.scale.z,item.root.scale.x);dummy.updateMatrix();this.shadows.setMatrixAt(i++,dummy.matrix);}this.shadows.count=i;this.shadows.instanceMatrix.needsUpdate=true;this.mirrorEnabled=!this.portrait&&i<=12;this.floor.visible=this.mirrorEnabled;this.portraitRiser.visible=i===6&&isPortrait()&&raised;
  this.lighting.update(delta,musicFeatures,{enabled:effects,theme:this.theme,dense:i>40});
  this.burst=Math.max(0,this.burst-delta);this.particles.visible=effects&&i<40&&this.burst>0;this.particles.material.opacity=Math.min(.8,this.burst);
  if(this.particles.visible){const v=this.particleGeometry.attributes.position.array;for(let n=1;n<v.length;n+=3)v[n]-=delta*.7;this.particleGeometry.attributes.position.needsUpdate=true;}
 }
 dispose(){this.rooms.dispose();this.lighting.dispose();const geometries=new Set(),materials=new Set();this.group.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of object.material?(Array.isArray(object.material)?object.material:[object.material]):[])materials.add(material);if(object.isInstancedMesh)object.dispose();});this.floor.getRenderTarget().dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.resources.forEach(t=>t.dispose());this.scene.remove(this.group);}
}
