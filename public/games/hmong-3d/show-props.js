import * as THREE from 'three';

// Original lightweight geometry, shared materials, no remote models or textures.
export function createShowProp(kind){
 const group=new THREE.Group(),parts={wheels:[],wings:[],segments:[],flames:[],tails:[]};
 const mats={eye:new THREE.MeshBasicMaterial({color:'#111327'}),red:new THREE.MeshStandardMaterial({color:'#ff6637',emissive:'#a12f08',emissiveIntensity:.5,roughness:.4}),body:new THREE.MeshStandardMaterial({color:kind==='phoenix'?'#f59d23':'#6135b9',metalness:.7,roughness:.25}),dark:new THREE.MeshStandardMaterial({color:'#111424',metalness:.5,roughness:.3}),glass:new THREE.MeshStandardMaterial({color:'#69d7ed',metalness:.8,roughness:.15}),gold:new THREE.MeshStandardMaterial({color:'#ffd674',metalness:.7,roughness:.25}),glow:new THREE.MeshBasicMaterial({color:kind==='dragon'?'#49ffe0':'#ffad37',toneMapped:false}),pink:new THREE.MeshBasicMaterial({color:'#f6acff',toneMapped:false,side:THREE.DoubleSide})};
 function mesh(geo,mat,x=0,y=0,z=0,parent=group){const obj=new THREE.Mesh(geo,mats[mat]);obj.position.set(x,y,z);parent.add(obj);return obj;}
 const box=(w,h,d,mat,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);
 const ball=(r,mat,x,y,z,parent)=>mesh(new THREE.SphereGeometry(r,12,8),mat,x,y,z,parent);
 if(kind==='car'){
  const profile=new THREE.Shape();profile.moveTo(-1.5,.27);profile.lineTo(-1.48,.48);profile.quadraticCurveTo(-1.3,.67,-.75,.68);profile.lineTo(-.3,1.03);profile.quadraticCurveTo(.1,1.12,.55,1.02);profile.lineTo(.92,.7);profile.lineTo(1.45,.57);profile.lineTo(1.5,.27);profile.closePath();
  const body=mesh(new THREE.ExtrudeGeometry(profile,{depth:1.2,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:2,steps:1}),'body',0,0,-.6);
  const window=new THREE.Shape();window.moveTo(-.6,.72);window.lineTo(-.25,.98);window.lineTo(.48,.98);window.lineTo(.8,.72);window.closePath();
  for(const z of [-.67,.67]){const glass=mesh(new THREE.ShapeGeometry(window),'glass',0,0,z);if(z<0)glass.rotation.y=Math.PI;box(2.2,.035,.03,'gold',0,.35,z);box(.035,.28,.035,'dark',.15,.85,z);}
  box(2.95,.09,1.32,'dark',0,.22,0);box(.85,.025,.65,'dark',-.98,.66,0);box(.2,.03,1.5,'gold',1.22,.8,0);
  for(const x of [-.94,.94])for(const z of [-.7,.7]){const wheel=mesh(new THREE.CylinderGeometry(.3,.3,.18,16),'dark',x,.3,z);wheel.rotation.x=Math.PI/2;parts.wheels.push(wheel);const rim=mesh(new THREE.CylinderGeometry(.2,.2,.19,16),'gold',x,.3,z);rim.rotation.x=Math.PI/2;const hub=mesh(new THREE.CylinderGeometry(.09,.09,.2,12),'dark',x,.3,z);hub.rotation.x=Math.PI/2;}
  for(const z of [-.44,.44]){box(.04,.13,.28,'glow',-1.42,.48,z);box(.04,.1,.25,'pink',1.42,.48,z);}
  parts.door=new THREE.Group();parts.door.position.set(.55,.86,.7);group.add(parts.door);box(.95,.42,.05,'body',-.45,-.22,0,parts.door);box(.18,.035,.025,'gold',-.65,-.13,.035,parts.door);
  for(const z of [-.78,.78]){const mirror=ball(.09,'body',-.35,.9,z);mirror.scale.set(1.3,.6,.7);}
  box(.05,.09,.45,'gold',-1.53,.35,0);box(.025,.04,.28,'pink',1.52,.43,0);
 }else if(kind==='heli'){
  const body=ball(.8,'body',0,1.1,0);body.scale.set(1.5,.85,.85);const nose=ball(.58,'glass',-.7,1.15,0);nose.scale.set(1,.8,1);
  box(1.9,.14,.16,'body',1.5,1.2,0);box(.18,.75,.4,'gold',2.4,1.45,0);box(.12,.5,.12,'dark',0,1.9,0);
  parts.rotor=new THREE.Group();group.add(parts.rotor);parts.rotor.position.y=2.15;box(4.8,.035,.13,'dark',0,0,0,parts.rotor);box(.13,.035,4.8,'dark',0,0,0,parts.rotor);
  for(const z of [-.62,.62]){box(.75,.48,.025,'glass',.15,1.12,z);box(.12,.025,.025,'gold',.45,.98,z*1.03);ball(.07,'pink',2.42,1.8,z*.25);}
  parts.tailRotor=new THREE.Group();parts.tailRotor.position.set(2.4,1.45,.3);group.add(parts.tailRotor);box(.85,.06,.04,'dark',0,0,0,parts.tailRotor);box(.06,.85,.04,'dark',0,0,0,parts.tailRotor);
  for(const z of [-.65,.65]){box(2.3,.08,.08,'gold',0,.12,z);box(.08,.65,.08,'dark',0,.45,z);}
 }else if(kind==='dragon'||kind==='phoenix'){
  if(kind==='dragon'){
   for(let i=0;i<16;i++){const segment=ball(.38*(1-i*.035),'body',i*.32,0,0);parts.segments.push(segment);const spine=mesh(new THREE.ConeGeometry(.11,.4,5),'gold',0,.4,0,segment);spine.rotation.z=-.3;}
   const head=ball(.48,'gold',-.45,.12,0);head.scale.set(1.15,.8,.8);const muzzle=ball(.3,'body',-.96,-.03,0);muzzle.scale.set(1.5,.6,1);for(const side of [-1,1]){const whisker=mesh(new THREE.TorusGeometry(.38,.018,4,16,Math.PI*.85),'gold',-1.05,0,side*.3);whisker.rotation.x=side*.5;}
   for(const z of [-.27,.27]){ball(.13,'glow',-.7,.27,z);ball(.07,'eye',-.76,.29,z*1.18);const horn=mesh(new THREE.ConeGeometry(.1,.65,5),'gold',-.12,.6,z);horn.rotation.z=-.5;}
  }else{
   const body=ball(.65,'body',0,0,0);body.scale.set(1.5,.7,.6);
   const neck=ball(.35,'red',-.65,.4,0);neck.scale.set(.7,1.6,.75);ball(.33,'gold',-.85,.85,0);
   const beak=mesh(new THREE.ConeGeometry(.13,.5,7),'glow',-1.24,.82,0);beak.rotation.z=Math.PI/2;
   for(const side of [-1,1]){ball(.075,'eye',-.99,.94,side*.24);ball(.025,'pink',-1.01,.96,side*.28);const crest=mesh(new THREE.ConeGeometry(.1,.65,6),'red',-.65,1.25,side*.12);crest.rotation.z=-.5;}

   for(let i=0;i<7;i++){const tail=mesh(new THREE.ConeGeometry(.11,2.8,6),'glow',1.3+i*.08,-.2, (i-3)*.17);tail.rotation.z=-1.2;parts.tails.push(tail);const eye=ball(.1,'red',0,.95,0,tail);eye.scale.set(1,2,.4);}
  }
  const saddle=mesh(new THREE.TorusGeometry(.36,.07,6,24),'gold',0,.43,0);saddle.rotation.x=Math.PI/2;box(.55,.08,.55,'red',0,.35,0);
  for(const side of [-1,1]){const wing=new THREE.Group();wing.position.set(.1,.1,side*.25);group.add(wing);parts.wings.push(wing);for(let i=0;i<6;i++){const feather=ball(1,kind==='dragon'?'gold':'glow',i*.13,0,side*(.35+i*.29),wing);feather.scale.set(.95-i*.07,.055,.19);feather.rotation.y=side*(.25+i*.06);}}
 }else if(kind==='wings'){
  for(const side of [-1,1]){const wing=new THREE.Group();group.add(wing);parts.wings.push(wing);for(let i=0;i<7;i++){const feather=mesh(new THREE.SphereGeometry(1,10,6),'pink',side*(.35+i*.12),.5-i*.08,0,wing);feather.scale.set(.16,.65-i*.04,.06);feather.rotation.z=-side*(.3+i*.12);}}
 }else if(kind==='torch'){
  mesh(new THREE.CylinderGeometry(.07,.1,1,8),'gold',0,.5,0);for(let i=0;i<5;i++){const flame=mesh(new THREE.ConeGeometry(.18-i*.02,.6,7),'glow',(i%2-.5)*.12,1.15+i*.05,0);parts.flames.push(flame);}
 }else if(kind==='change'){
  parts.door=box(2,2.6,.08,'body',0,1.25,.35);for(const x of [-1,1])box(.06,2.7,.5,'gold',x,1.25,.1);box(2.1,.07,.5,'glow',0,2.6,.1);
 }
 return {group,parts,update(t){for(const wheel of parts.wheels)wheel.rotation.y=t*8;if(parts.rotor)parts.rotor.rotation.y=t*32;if(parts.tailRotor)parts.tailRotor.rotation.z=t*40;parts.tails.forEach((tail,i)=>{tail.rotation.z=-1.2+Math.sin(t*3-i*.4)*.13;tail.rotation.x=Math.sin(t*2-i*.25)*.1;});parts.wings.forEach((wing,i)=>wing.rotation.x=Math.sin(t*5)*(kind==='wings'?.15:.45)*(i?1:-1));parts.segments.forEach((seg,i)=>{seg.position.y=Math.sin(t*4-i*.45)*.16;seg.position.z=Math.sin(t*2-i*.4)*.2;});parts.flames.forEach((flame,i)=>flame.scale.setScalar(.8+Math.sin(t*18+i)*.2));if(parts.door&&kind==='car')parts.door.rotation.x=-Math.min(1,Math.max(0,t-3.2))*Math.min(1,Math.max(0,7-t))*1.2;},dispose(){const geometries=new Set();group.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);});geometries.forEach(geo=>geo.dispose());Object.values(mats).forEach(mat=>mat.dispose());group.removeFromParent();}};
}
