import * as THREE from 'three';
import { roomLayout } from './room-layout.js';

// Independent side scenery: no wall writes depth over the 2.5D dancers.
export class ClubRooms {
 constructor(scene){
  this.group=new THREE.Group();this.group.name='ClubRooms';scene.add(this.group);this.parts=[];this.signs=[];this.rooms=new Map();this.textures=[];this.walls=[];this.portrait=null;
  this.wallMaterial=new THREE.MeshBasicMaterial({color:'#151329',transparent:true,opacity:.94,depthWrite:false,side:THREE.DoubleSide});
  this.trimMaterial=new THREE.MeshBasicMaterial({color:'#75549d',toneMapped:false});this.box=new THREE.BoxGeometry(1,1,1);
  const wall=(x,y,z,w,h,d)=>{const obj=new THREE.Mesh(this.box,this.wallMaterial);obj.position.set(x,y,z);obj.scale.set(w,h,d);obj.renderOrder=-30;this.group.add(obj);this.walls.push(obj);return obj;};
  this.leftWall=wall(0,1.8,0,.12,3.6,1);this.rightWall=wall(0,1.8,0,.12,3.6,1);this.rearWall=wall(0,1.8,0,1,3.6,.12);this.rearWall.visible=false; // ClubBackdrop already supplies the decorated rear wall.
  for(const info of roomLayout().rooms){
   const group=new THREE.Group(),accent=new THREE.MeshBasicMaterial({color:info.color,toneMapped:false}),paint=new THREE.MeshStandardMaterial({color:info.id==='beer'?'#47301c':'#28203d',roughness:.65,metalness:.2}),inner=new THREE.MeshBasicMaterial({color:'#100d19'});group.name=info.label;this.group.add(group);
   const add=(mat,x,y,z,w,h,d)=>{const mesh=new THREE.Mesh(this.box,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);group.add(mesh);return mesh;};
   const back=add(paint,0,1.1,-.45,1,2.2,.08),left=add(paint,-.5,1.1,0,.08,2.2,1),right=add(paint,.5,1.1,0,.08,2.2,1),roof=add(paint,0,2.3,0,1,.14,1);
   const interior=add(inner,0,1,.05,.9,1.95,.05),jambs=[add(accent,-.37,.95,.5,.04,1.9,.04),add(accent,.37,.95,.5,.04,1.9,.04),add(accent,0,1.91,.5,.78,.04,.04)];
   const hinge=new THREE.Group();hinge.position.set(-.34,0,.54);group.add(hinge);const door=add(paint,0,0,0,.68,1.8,.05);door.removeFromParent();door.position.set(.34,.9,0);hinge.add(door);
   const handle=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),accent);handle.position.set(.58,.9,.06);hinge.add(handle);
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#110c22';ctx.fillRect(0,0,512,256);ctx.strokeStyle=info.color;ctx.lineWidth=8;ctx.strokeRect(5,5,502,246);ctx.fillStyle=info.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${info.id==='beer'?84:65}px system-ui`;if(info.id==='beer')ctx.fillText(info.label,256,133,480);else{ctx.fillText('PHÒNG',256,85,480);ctx.fillText('THAY ĐỒ',256,183,480);}
   const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;this.textures.push(map);const sign=new THREE.Mesh(new THREE.PlaneGeometry(1,.68),new THREE.MeshBasicMaterial({map,toneMapped:false,transparent:true,depthWrite:false}));sign.position.set(0,2.16,.58);group.add(sign);this.signs.push(sign);
   const details=new THREE.Group();group.add(details);
   if(info.id==='beer'){
    for(let i=0;i<5;i++){const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.055,.36,8),new THREE.MeshStandardMaterial({color:i%2?'#c78a29':'#4d9a57',roughness:.3}));bottle.position.set((i-2)*.13,1.05,-.15);details.add(bottle);}
    const shelf=add(accent,0,.84,-.12,.8,.035,.2);details.add(shelf);
   }else{
    for(let i=0;i<4;i++){const shirt=new THREE.Mesh(new THREE.BoxGeometry(.14,.35,.035),new THREE.MeshStandardMaterial({color:['#e78cc4','#7ee1da','#b58aee','#f4c76b'][i]}));shirt.position.set((i-1.5)*.19,1.15,-.14);details.add(shirt);}
    const rail=add(accent,0,1.4,-.14,.85,.025,.025);details.add(rail);
   }
   paint.transparent=true;
   this.rooms.set(info.id,{group,back,left,right,roof,interior,jambs,hinge,sign,details,door,paint,open:0});
  }
  this.setPortrait(false);
 }
 setPortrait(portrait){
  if(this.portrait===portrait)return;this.portrait=portrait;const layout=roomLayout(portrait),depth=layout.front-layout.rear;
  for(const [wall,side]of [[this.leftWall,-1],[this.rightWall,1]]){wall.position.set(side*layout.halfWidth,1.8,(layout.rear+layout.front)/2);wall.scale.set(.12,3.6,depth);}
  this.rearWall.position.set(0,1.8,layout.rear);this.rearWall.scale.set(layout.halfWidth*2,3.6,.12);
  for(const info of layout.rooms){const room=this.rooms.get(info.id);room.group.position.set(info.x,-.095,info.z);room.group.scale.y=info.height/2.5;room.back.position.z=-info.depth/2;room.back.scale.x=info.width;
   for(const[panel,side]of [[room.left,-1],[room.right,1]]){panel.position.x=side*info.width/2;panel.scale.z=info.depth;}
   room.roof.scale.set(info.width+.08,.14,info.depth+.08);room.interior.position.z=-info.depth/2+.05;room.interior.scale.x=info.width-.18;
   for(const jamb of room.jambs)jamb.position.z=info.depth/2+.04;room.hinge.position.z=info.depth/2+.06;room.sign.position.z=info.depth/2+.09;room.sign.scale.x=info.width+.15;room.details.position.z=info.depth/2-.15;
  }
  this.bounds=new THREE.Box3(new THREE.Vector3(portrait?-3.5:-layout.halfWidth+.15,-.1,layout.rear),new THREE.Vector3(portrait?3.5:layout.halfWidth-.15,3.6,portrait?3.9:layout.front));
 }
 setDoor(id,value){const room=this.rooms.get(id);if(room)room.open=Math.max(0,Math.min(1,value));}
 update(delta,camera){for(const room of this.rooms.values()){
  room.hinge.rotation.y+=(-room.open*Math.PI*.7-room.hinge.rotation.y)*Math.min(1,delta*10);
  const foreground=Math.sign(camera.position.x)===Math.sign(room.group.position.x)&&Math.abs(camera.position.x)>Math.abs(room.group.position.x)-.7;
  room.paint.opacity+=( (foreground?.18:1)-room.paint.opacity)*Math.min(1,delta*3);room.paint.depthWrite=!foreground;
 }
  // Near walls become a translucent cutaway; they never write depth over heads.
  const layout=roomLayout(this.portrait),outside=Math.abs(camera.position.x)>layout.halfWidth-.5;this.wallMaterial.opacity=outside?.12:.86;
 }
 dispose(){const geometries=new Set([this.box]),materials=new Set([this.wallMaterial,this.trimMaterial]);this.group.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)materials.add(obj.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());this.group.removeFromParent();}
}
