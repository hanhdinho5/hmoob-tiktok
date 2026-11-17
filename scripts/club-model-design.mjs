// Sculpted mesh parts for the supplied modern chibi stage-costume reference.
// Decorative designs are reference-inspired, not verified traditional attire.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export function sculptClubCharacter(id,female,festival,style=0){
 const scene=new THREE.Group();scene.name='ClubChibi';const bones=[],byName={};
 function bone(name,parent,x,y,z=0){const b=new THREE.Bone();b.name=name;b.position.set(x,y,z);bones.push(b);byName[name]=b;if(parent)byName[parent].add(b);return b;}
 bone('Hips',null,0,.91);bone('Spine','Hips',0,.40);bone('Head','Spine',0,.62);
 for(const [side,x]of [['L',-.17],['R',.17]]){bone(`Leg${side}`,'Hips',x,-.05);bone(`Knee${side}`,`Leg${side}`,0,-.35);bone(`Arm${side}`,'Spine',x<0?-.31:.31,.10);bone(`Elbow${side}`,`Arm${side}`,0,-.28);}
 const batches=[[],[],[],[]],temp=new THREE.Object3D();
 function part(g,color,boneName,position,scale=[1,1,1],rotation=[0,0,0],fabric=false,repeat=[1,1]){
  temp.position.set(...position);temp.scale.set(...scale);temp.rotation.set(...rotation);temp.updateMatrix();const geometry=g.index?g.toNonIndexed():g;geometry.applyMatrix4(temp.matrix);
  const count=geometry.attributes.position.count,col=new THREE.Color(color),colors=[],indices=[],weights=[],bi=bones.indexOf(byName[boneName]);
  for(let i=0;i<count;i++){
   colors.push(col.r,col.g,col.b);
   if(boneName.startsWith('Leg')){const lower=THREE.MathUtils.clamp((.63-geometry.attributes.position.getY(i))/.23,0,1),knee=bones.indexOf(byName[`Knee${boneName.slice(-1)}`]);indices.push(bi,knee,0,0);weights.push(1-lower,lower,0,0);}
   else{indices.push(bi,0,0,0);weights.push(1,0,0,0);}
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  if(geometry.attributes.uv){for(let i=0;i<geometry.attributes.uv.count;i++){geometry.attributes.uv.setXY(i,geometry.attributes.uv.getX(i)*repeat[0],geometry.attributes.uv.getY(i)*repeat[1]);}}
  const category=fabric==='face'?3:color==='#171522'||fabric==='hair'?2:fabric?1:0;
  batches[category].push(geometry);
 }
 const skin='#f0c4ad',hair='#171522',indigo='#141727',silver='#e2e2ec',rose='#d04891';
 const sphere=()=>new THREE.SphereGeometry(1,12,8),capsule=()=>new THREE.CapsuleGeometry(1,1,4,8);
 const curve=(points,radius,color,boneName)=>part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),10,radius,5,false),color,boneName,[0,0,0]);
 function hairLock(points,width){
  // Broad lens-shaped hair sheets replace the old round noodle-shaped tubes.
  const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),positions=[],indices=[],uv=[];
  for(let ring=0;ring<=16;ring++){
   const t=ring/16,center=path.getPointAt(t),tangent=path.getTangentAt(t),side=new THREE.Vector3().crossVectors(tangent,new THREE.Vector3(0,0,1)).normalize();
   if(side.lengthSq()<.01)side.set(1,0,0);const normal=new THREE.Vector3().crossVectors(side,tangent).normalize(),taper=.015+Math.pow(Math.sin(Math.PI*(.15+.85*t)),.65);
   for(let edge=0;edge<=8;edge++){const angle=edge/8*Math.PI*2,p=center.clone().addScaledVector(side,Math.cos(angle)*width*taper).addScaledVector(normal,Math.sin(angle)*width*.20*taper);positions.push(p.x,p.y,p.z);uv.push(edge/8,t);}
  }
  for(let r=0;r<16;r++)for(let e=0;e<8;e++){const a=r*9+e,b=a+9;indices.push(a,b,a+1,a+1,b,b+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();part(g,hair,'Head',[0,0,0]);
 }
 // A smooth tapered jaw and facial albedo give almond eyes instead of toy spheres.
 const head=new THREE.SphereGeometry(1,28,20);
 for(let i=0;i<head.attributes.position.count;i++){const y=head.attributes.position.getY(i),jaw=y<0?.82+.18*(y+1):1;head.attributes.position.setXYZ(i,head.attributes.position.getX(i)*.415*jaw,y*.445,head.attributes.position.getZ(i)*.355);}
 head.computeVertexNormals();part(head,skin,'Head',[0,2,0]);
 const face=new THREE.PlaneGeometry(.64,.55,24,20);
 for(let i=0;i<face.attributes.position.count;i++){const x=face.attributes.position.getX(i),y=face.attributes.position.getY(i)-.035,jaw=y<0?.82+.18*(y/.445+1):1,z=.355*Math.sqrt(Math.max(.025,1-(x/(.415*jaw))**2-(y/.445)**2));face.attributes.position.setXYZ(i,x,y+2,z+.006);}
 face.computeVertexNormals();part(face,'#ffffff','Head',[0,0,0],[1,1,1],[0,0,0],'face');
 for(const side of [-1,1])part(sphere(),skin,'Head',[side*.392,1.99,.005],[.048,.078,.04]);
 part(sphere(),skin,'Head',[0,1.95,.359],[.027,.036,.027]);
 part(new THREE.SphereGeometry(1,24,14,0,Math.PI*2,0,1.55),hair,'Head',[0,2.07,-.03],[.438,.435,.389]);
 if(female){
  for(let i=0;i<5;i++){const x=-.29+i*.10;hairLock([[x-.05,2.40,-.08],[x-.08,2.49,.10],[x+.04,2.37,.30],[x+.13,2.20+i*.009,.34]],.09);}
 }else if(style===1){
  for(const side of [-1,1])for(let i=0;i<4;i++)hairLock([[side*.02,2.43,-.12],[side*(.15+i*.045),2.55-i*.02,.06],[side*(.20+i*.047),2.39,.28],[side*(.14+i*.065),2.23-(i%2)*.035,.33]],.095);
 }else{
  for(let i=0;i<5;i++){const x=-.27+i*.125,sweep=style===3?-.16:.17;hairLock([[x-sweep*.5,2.39,-.14],[x-sweep,2.50+Math.sin(i*1.8)*.045,.035],[x-.025,2.39+Math.cos(i)*.035,.26],[x+sweep*.5,2.25,.35],[x+sweep*.8,2.17+Math.sin(i*2)*.055,.33]],.12);}
 }
 if(female){
  if(style===3){for(const side of [-1,1])for(let i=0;i<3;i++)hairLock([[side*.30,2.2,-.20],[side*.42,1.85,-.20],[side*.38,1.43,-.16],[side*(.35+i*.025),1.12,-.08]],.085);part(new THREE.TorusGeometry(.33,.015,6,24),silver,'Head',[0,2.38,-.03],[1,.55,1],[Math.PI/2,0,0]);}
  else if(style===2||!festival){part(sphere(),hair,'Head',[.07,2.44,-.20],[.215,.18,.20]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;part(sphere(),silver,'Head',[.07+Math.cos(a)*.20,2.44+Math.sin(a)*.14,-.02],[.018,.025,.018]);}if(style!==2)for(let i=0;i<5;i++)part(new THREE.ConeGeometry(.018,.09,5),silver,'Head',[(i-2)*.065,2.56,-.03]);}
  else {
   part(new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),'#ffffff','Head',[0,2.28,-.025],[.50,.30,.45],[0,0,0],true,[2,1]);
   part(new THREE.CylinderGeometry(.50,.50,.08,24),'#ffffff','Head',[0,2.28,-.025],[1,1,.9],[0,0,0],true,[5,.4]);
   for(let i=0;i<14;i++){const a=i/14*Math.PI*2;part(sphere(),silver,'Head',[Math.sin(a)*.47,2.23,Math.cos(a)*.41],[.027,.045,.025]);}
  }
  // Long curved hair rather than the former two capsule braids.
  for(const side of [-1,1])for(let lock=0;lock<3;lock++)hairLock([[side*.37,2.14,-.14],[side*(.43+lock*.025),1.92,-.18],[side*.43,1.65,-.08],[side*(.36+lock*.02),1.39+lock*.035,.05]],.065);
 }
 if(!female&&style===2)part(new THREE.CylinderGeometry(.465,.465,.09,24),'#ffffff','Head',[0,2.18,-.018],[1,1,.93],[0,0,0],true,[2,.6]);
 // Neck and fitted jacket / white shirt.
 part(capsule(),skin,'Spine',[0,1.56,0],[.10,.08,.10]);
 const shirtProfile=[new THREE.Vector2(.25,-.24),new THREE.Vector2(.222,-.13),new THREE.Vector2(.245,.04),new THREE.Vector2(.265,.15),new THREE.Vector2(.20,.24)];
 part(new THREE.LatheGeometry(shirtProfile,24),style>=2&&!female?'#eee8ef':indigo,'Spine',[0,1.28,0],[1,1,.72]);
 if(!female&&style===3)for(const side of [-1,1])part(new THREE.BoxGeometry(.18,.41,.04),indigo,'Spine',[side*.15,1.29,.16],[1,1,1],[0,0,side*.10]);
 if(female){part(new THREE.BoxGeometry(.30,.09,.025),skin,'Spine',[0,1.015,.17]);part(new THREE.BoxGeometry(.43,.055,.035),indigo,'Spine',[0,1.055,.17]);}
 for(const side of [-1,1]){
  part(new THREE.BoxGeometry(.07,.43,.035),'#ffffff','Spine',[side*.16,1.29,.207],[1,1,1],[0,0,side*-.08],true,[.25,1.5]);
  for(let i=0;i<4;i++)part(sphere(),silver,'Spine',[side*.21,1.40-i*.075,.21],[.013,.013,.01]);
 }
 part(new THREE.CylinderGeometry(.25,.27,.09,16),'#ffffff','Hips',[0,1.00,0],[1,1,.77],[0,0,0],true,[2,.5]);
 if(festival&&!female)for(const side of [-1,1])part(new THREE.BoxGeometry(.11,.30,.025),'#ffffff','Hips',[side*.21,.91,.16],[1,1,1],[0,0,side*.12],true,[.7,1]);
 for(const [side,x]of [['L',-.32],['R',.32]]){
  part(capsule(),style===2&&!female?'#eee8ef':indigo,`Arm${side}`,[x,1.29,0],[.095,.12,.095]);
  part(new THREE.CylinderGeometry(.105,.105,.08,12),'#ffffff',`Arm${side}`,[x,1.16,0],[1,1,1],[0,0,0],true,[1,.5]);
  part(capsule(),female?skin:indigo,`Elbow${side}`,[x,1.015,.015],[.07,.095,.075]);
  part(new THREE.CylinderGeometry(.083,.083,.055,12),'#ffffff',`Elbow${side}`,[x,.91,.02],[1,1,1],[0,0,0],true,[1,.5]);
  part(sphere(),skin,`Elbow${side}`,[x,.84,.03],[.071,.085,.065]);
  // Thumb makes a readable hand silhouette at small size.
  part(sphere(),skin,`Elbow${side}`,[x+(x>0?-.055:.055),.86,.06],[.025,.043,.03]);
 }
 for(const [side,x]of [['L',-.17],['R',.17]]){
  part(new THREE.CylinderGeometry(female?.078:.15,female?.07:.125,.65,12,8),female?skin:indigo,`Leg${side}`,[x,.565,0]);
  if(female)part(new THREE.CylinderGeometry(.092,.086,.24,12),'#ffffff',`Knee${side}`,[x,.29,0],[1,1,1],[0,0,0],true,[1,.8]);
  else part(new THREE.CylinderGeometry(.14,.14,.095,12),'#ffffff',`Knee${side}`,[x,.245,0],[1,1,1],[0,0,0],true,[1,.5]);
  // White-soled 3D high-top sneakers like the supplied reference.
  part(sphere(),'#dedce8',`Knee${side}`,[x,.105,.064],[.13,.057,.205]);
  part(sphere(),female?(style===2?'#704064':'#263650'):'#242a42',`Knee${side}`,[x,.17,.045],[.118,.09,.18]);
  for(let lace=0;lace<3;lace++)part(new THREE.BoxGeometry(.13,.012,.015),'#faf5f8',`Knee${side}`,[x,.235-lace*.022,.12+lace*.018]);
 }
 if(female){
  part(new THREE.CylinderGeometry(.245,.43,.36,32),'#ffffff','Hips',[0,.85,0],[1,1,1],[0,0,0],true,[3,1.2]);
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;part(new THREE.BoxGeometry(.024,.32,.025),indigo,'Hips',[Math.sin(a)*.36,.84,Math.cos(a)*.36],[1,1,1],[Math.cos(a)*-.44,0,Math.sin(a)*.44]);}
  part(new THREE.CylinderGeometry(.427,.44,.045,32),rose,'Hips',[0,.68,0]);
 }else{
  for(const side of [-1,1])part(new THREE.BoxGeometry(.13,.53,.03),'#ffffff','Hips',[side*.17,.73,.155],[1,1,1],[0,0,side*.08],true,[.75,2]);
 }
 // Silver collar, waist coins, earrings and scarf tails; actual geometry, not painted dots.
 part(new THREE.TorusGeometry(.175,.018,6,20),silver,'Spine',[0,1.49,.16],[1,.65,1],[.28,0,0]);
 for(let i=0;i<(female?9:4);i++){const x=(i-(female?4:1.5))*.055;part(new THREE.CylinderGeometry(.023,.023,.012,10),silver,'Hips',[x,.93-Math.abs(x)*.30,.225],[1,1,1],[Math.PI/2,0,0]);}
 if(female)for(const side of [-1,1]){part(new THREE.TorusGeometry(.05,.009,5,12),silver,'Head',[side*.426,1.87,.04]);part(sphere(),silver,'Head',[side*.426,1.80,.04],[.025,.035,.018]);}
 if(festival||!female)part(new THREE.BoxGeometry(.09,.42,.022),'#ffffff','Hips',[-.25,.76,.09],[1,1,1],[0,0,-.10],true,[.6,2]);
 const geometries=batches.map(parts=>mergeVertices(mergeGeometries(parts,false))),geometry=mergeGeometries(geometries,true);geometry.computeBoundingSphere();
 const plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:0});plain.name='Base';
 const textile=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:.01});textile.name='Embroidery';
 const hairMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:0});hairMaterial.name='SculptedHair';
 const features=new THREE.MeshStandardMaterial({roughness:.8,transparent:true,alphaTest:.035,depthWrite:false});features.name=female?'FemaleFaceFeatures':'MaleFaceFeatures';
 const mesh=new THREE.SkinnedMesh(geometry,[plain,textile,hairMaterial,features]);mesh.name='Body';mesh.frustumCulled=false;mesh.add(bones[0]);mesh.bind(new THREE.Skeleton(bones));scene.add(mesh);
 scene.userData={prototype:true,culturalReview:'pending',variant:id,reference:'User second image: modern embroidered chibi dance club',source:'scripts/club-model-design.mjs'};
 return {scene,bones,geometry};
}
