import * as THREE from 'three';

export class Stage {
 constructor(scene){this.scene=scene;this.group=new THREE.Group();scene.add(this.group);this.theme='terraces';this.materials=[];this.lamps=[];
  const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.85,...extra});this.materials.push(m);return m;};
  const sage=material('#91ab79'),earth=material('#536e55'),wood=material('#805c49'),gold=material('#e9c98b'),dark=material('#35545c');
  const mesh=(geometry,mat,x,y,z)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);this.group.add(m);return m;};
  mesh(new THREE.CylinderGeometry(25,26,.8,64),earth,0,-1.2,-2);
  for(let step=0;step<4;step++)mesh(new THREE.CylinderGeometry(6.4-step*.27,6.55-step*.27,.17,64),step%2?sage:earth,0,-.72+step*.17,0);
  mesh(new THREE.CylinderGeometry(5.5,5.7,.20,64),material('#d4c2a0'),0,-.11,0);
  mesh(new THREE.TorusGeometry(5.43,.045,6,64),gold,0,.005,0).rotation.x=-Math.PI/2;
  for(const side of [-1,1])for(let row=0;row<5;row++)mesh(new THREE.CylinderGeometry(4.7-row*.48,4.9-row*.48,.35,32),row%2?sage:earth,side*9,-.9+row*.35,-7);
  for(let i=0;i<9;i++){const height=4+(i%3)*1.8;mesh(new THREE.ConeGeometry(4.5,height,5),material(['#8faea0','#abc5af','#78998e'][i%3]),(i-4)*5,height/2-1,-18-(i%2)*3);}
  const treeGeo=new THREE.ConeGeometry(.7,2,6),trunkGeo=new THREE.CylinderGeometry(.07,.11,1,5),leafMat=material('#3e7464');
  const trees=new THREE.InstancedMesh(treeGeo,leafMat,24),trunks=new THREE.InstancedMesh(trunkGeo,wood,24),dummy=new THREE.Object3D();
  for(let i=0;i<24;i++){const side=i%2?1:-1,x=side*(6.8+(i%5)*1.2),z=-3-Math.floor(i/4)*2.0;dummy.position.set(x,1.4,z);dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);dummy.position.y=.15;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);}this.group.add(trees,trunks);
  for(const [x,z]of [[-7,-8],[7,-10]]){mesh(new THREE.BoxGeometry(2.2,1.5,1.8),wood,x,.35,z);const roof=mesh(new THREE.ConeGeometry(1.9,.9,4),dark,x,1.55,z);roof.rotation.y=Math.PI/4;mesh(new THREE.BoxGeometry(.45,.8,.04),dark,x,.15,z+.92);}
  const lampMat=material('#ffe3a1',{emissive:'#efb84d',emissiveIntensity:.4});
  const cable=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-6,4.8,-3),new THREE.Vector3(0,3.1,-3),new THREE.Vector3(6,4.8,-3));mesh(new THREE.TubeGeometry(cable,32,.017,4,false),wood,0,0,0);
  for(const x of [-6,6])mesh(new THREE.CylinderGeometry(.045,.07,5,6),wood,x,1.8,-3);
  for(let i=0;i<13;i++){const p=cable.getPoint(i/12);this.lamps.push(mesh(new THREE.SphereGeometry(.13,10,8),lampMat,p.x,p.y-.16,p.z));}
  const stones=new THREE.InstancedMesh(new THREE.SphereGeometry(.12,6,5),gold,32);for(let i=0;i<32;i++){const a=i/32*Math.PI*2;dummy.position.set(Math.sin(a)*5.5,.06,Math.cos(a)*5.5);dummy.scale.set(1,.5,1);dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);}this.group.add(stones);
  this.shadows=new THREE.InstancedMesh(new THREE.CircleGeometry(.45,20),new THREE.MeshBasicMaterial({color:'#243b39',transparent:true,opacity:.16,depthWrite:false}),100);this.shadows.frustumCulled=false;this.group.add(this.shadows);
  const particles=new Float32Array(120*3);this.particleGeometry=new THREE.BufferGeometry();this.particleGeometry.setAttribute('position',new THREE.BufferAttribute(particles,3));this.particles=new THREE.Points(this.particleGeometry,new THREE.PointsMaterial({color:'#f5ce75',size:.09,transparent:true,opacity:0}));this.group.add(this.particles);this.burst=0;
 }
 setTheme(theme){if(!['terraces','evening'].includes(theme))return;this.theme=theme;this.scene.background=new THREE.Color(theme==='evening'?'#29424e':'#c9dfda');this.scene.fog=new THREE.Fog(this.scene.background,20,55);}
 celebrate(){this.burst=4;const values=this.particleGeometry.attributes.position.array;for(let i=0;i<values.length;i+=3){values[i]=(Math.random()-.5)*9;values[i+1]=1+Math.random()*4;values[i+2]=(Math.random()-.5)*5;}this.particleGeometry.attributes.position.needsUpdate=true;}
 update(delta,items,effects){const dummy=new THREE.Object3D();let i=0;for(const item of items){dummy.position.copy(item.root.position);dummy.position.y=.015;dummy.rotation.x=-Math.PI/2;dummy.scale.setScalar(item.root.scale.x);dummy.updateMatrix();this.shadows.setMatrixAt(i++,dummy.matrix);}this.shadows.count=i;this.shadows.instanceMatrix.needsUpdate=true;
  this.burst=Math.max(0,this.burst-delta);this.particles.visible=effects&&this.burst>0;this.particles.material.opacity=Math.min(1,this.burst);
  if(this.particles.visible){const values=this.particleGeometry.attributes.position.array;for(let k=1;k<values.length;k+=3)values[k]-=delta*.75;this.particleGeometry.attributes.position.needsUpdate=true;}
 }
 dispose(){const geo=new Set(),mat=new Set();this.group.traverse(n=>{if(n.geometry)geo.add(n.geometry);if(n.material)mat.add(n.material);if(n.isInstancedMesh)n.dispose();});geo.forEach(g=>g.dispose());mat.forEach(m=>m.dispose());this.scene.remove(this.group);}
}
