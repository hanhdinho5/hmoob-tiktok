import assert from 'node:assert/strict';
export async function checkCameraMotion({navigate,evaluate,until,screenshot,viewport}){
 await viewport(390,844);await navigate('/games/hmong-3d/index.html?mode=crowd&demo=1&count=20&music=0&mc=0');
 await until(()=>evaluate('window.Hmong3D?.ready&&Hmong3D.stats().characters===20'),'crowd ready for camera motion');
 console.log('Browser camera settings',JSON.stringify(await evaluate('({enabled:Hmong3D.director.enabled,reduced:Hmong3D.director.reduced})')));
 // Advance every intermediate camera frame, including all shot boundaries.
 const samples=await evaluate(`(()=>{
  const d=Hmong3D.director,rows=[];d.time=0;d.cameraVelocity?.set(0,0,0);d.lookVelocity?.set(0,0,0);
  for(let i=0;i<1260;i++){
   const before=d.camera.position.clone(),rotation=d.camera.quaternion.clone();d.update(1/30);
   rows.push({time:d.time,speed:before.distanceTo(d.camera.position)*30,rotation:rotation.angleTo(d.camera.quaternion),position:d.camera.position.toArray(),target:d.look.toArray()});
  }return rows;
 })()`);
 assert.ok(Math.max(...samples.map(r=>r.speed))<=6.001,'camera has a strict speed limit across every transition');
 assert.ok(Math.max(...samples.map(r=>r.rotation))<.06,'no sudden rotation cuts');
 const left=samples[419],right=samples[989],high=samples[1199];
 console.log('Camera offsets',JSON.stringify([left,right,high].map(r=>({time:r.time,offset:r.position.map((v,i)=>v-r.target[i])}))));
 assert.ok(samples.every(r=>Math.abs(r.position[0])<2),'camera stays in central corridor');assert.ok(high.position[1]>high.target[1]+6,'camera actually reaches high view');
 // Reproduce the old FPS-window/reset + new-viewer camera jump.
 const jump=await evaluate(`(()=>{const d=Hmong3D.director,r=d.rendering,c=d.characters;r.frames=0;const before=d.camera.position.clone();c.request({uniqueId:'camera_new',nickname:'New viewer'});c.update(1/30);r.frame(c.items.values(),1/30,true,c.bounds,c.revision);return before.distanceTo(d.camera.position);})()`);
 assert.ok(jump<=.201,'new viewer during FPS reset cannot snap the camera');
 for(const [time,name]of [[12,'high-first'],[22,'close'],[30,'front'],[37,'high']]){
  await evaluate(`(()=>{const d=Hmong3D.director;d.time=${time-4};for(let i=0;i<120;i++)d.update(1/30);})()`);
  await screenshot('hmong-camera-smooth-'+name+'.png');
 }
 const guide=await evaluate('(()=>{const r=document.querySelector("#giftGuide").getBoundingClientRect(),b=document.body.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top-b.top,source:b.width};})()');
 assert.ok(guide.width>guide.source*.85&&guide.height<100&&guide.top<150,'gift instructions stay a compact top strip');
 console.log('PASS: browser camera motion across 42 seconds, bounded movement/rotation, front/high views without side sweeps, FPS-reset regression and compact gift guide.');
}
