import assert from 'node:assert/strict';
export async function checkCrowdMotion({navigate,evaluate,until,screenshot,viewport,delay}){
 await viewport(1080,1920);await navigate('/games/hmong-3d/index.html?mode=crowd&music=0&mc=0');await until(()=>evaluate('window.Hmong3D?.ready'),'roaming overlay ready');
 assert.equal(await evaluate('Hmong3D.stats().characters'),0,'resident DJ must not count as a viewer');assert.equal(await evaluate('Hmong3D.dj.group.parent!==null'),true);
 assert.equal(await evaluate('Hmong3D.dj.group.position.y'),.57);
 await evaluate("for(let i=0;i<20;i++)Hmong3D.inject('member',{user:{uniqueId:'roam_'+i,nickname:'Người nhảy '+(i+1)}})");await until(()=>evaluate('Hmong3D.stats().characters===20'),'roaming crowd spawns');
 await evaluate('Hmong3D.settings({cameraAuto:false});window.roamInitial=Hmong3D.snapshot().map(p=>({key:p.key,position:p.position}));');
 const climbed=await evaluate(`(()=>{const c=Hmong3D.director.characters;for(let frame=0;frame<2400;frame++){c.update(1/30);const dancer=[...c.items.values()].find(item=>item.motionLocation==='stage');if(dancer){window.stageViewer=dancer.key;return true;}}return false;})()`);assert.equal(climbed,true);
 assert.equal(await evaluate('Hmong3D.snapshot().filter(p=>Math.hypot(p.position[0]-roamInitial.find(a=>a.key===p.key).position[0],p.position[2]-roamInitial.find(a=>a.key===p.key).position[2])>1).length>=10'),true);
 await delay(300);
 const medianHeight=await evaluate(`(()=>{const c=Hmong3D.director.characters,camera=Hmong3D.director.camera,heights=[...c.items.values()].map(item=>{const bottom=item.root.position.clone().project(camera),top=item.root.position.clone();top.y+=item.root.scale.x*2.6;return Math.abs(top.project(camera).y-bottom.y)/2;}).sort((a,b)=>a-b);return heights[Math.floor(heights.length/2)];})()`);
 assert.ok(medianHeight>.05,`Portrait dancers too small: ${medianHeight}`);
 await screenshot('hmong-roaming-stage-portrait.png');
 await evaluate("Hmong3D.settings({cameraAuto:true});Hmong3D.director.idle=6;Hmong3D.director.elapsed=0;Hmong3D.director.update(2)");await screenshot('hmong-resident-dj.png');
 await evaluate("(()=>{const d=Hmong3D.director,item=d.characters.items.get(stageViewer);window.stageReturn=item.root.position.toArray();d.enqueue({user:item.user,giftName:'Finger Heart',repeatCount:1});d.update(4.8);})()");assert.equal(await evaluate('Hmong3D.stats().cameraShot'),'car');assert.equal(await evaluate('Hmong3D.director.active.origin.z'),0,'stage gift vehicle performs on floor');
 await evaluate('Hmong3D.director.update(10)');assert.equal(await evaluate('Hmong3D.stats().showViewer'),null);assert.equal(await evaluate('Hmong3D.director.characters.items.get(stageViewer).root.position.distanceTo({x:stageReturn[0],y:stageReturn[1],z:stageReturn[2]})<.2'),true);
 await evaluate("Hmong3D.inject('chat',{user:{uniqueId:'roam_0'},comment:'đứng yên'})");await until(()=>evaluate("Hmong3D.snapshot().find(p=>p.key==='roam_0').base==='idle'"),'idle stops roaming');const idle=await evaluate("Hmong3D.snapshot().find(p=>p.key==='roam_0').position");await evaluate('for(let i=0;i<90;i++)Hmong3D.director.characters.update(1/30)');assert.deepEqual(await evaluate("Hmong3D.snapshot().find(p=>p.key==='roam_0').position"),idle);
 await evaluate("Hmong3D.settings({formation:'rows',cameraAuto:false})");await delay(500);assert.equal(await evaluate('Hmong3D.director.characters.motion.states.size'),0);
 await viewport(1440,900);await delay(200);await screenshot('hmong-roaming-stage-landscape.png');
 await evaluate('Hmong3D.dispose()');assert.equal(await evaluate('Hmong3D.dj.group.parent'),null);
 await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'portrait dashboard ready');
 for(const [width,height]of [[1440,900],[390,844],[360,800],[430,932]]){
  await viewport(width,height);await delay(120);const ratio=await evaluate('(()=>{const r=document.querySelector("#preview").getBoundingClientRect();return r.width/r.height;})()');assert.ok(Math.abs(ratio-9/16)<.002,`Preview must remain 9:16 at ${width}x${height}: ${ratio}`);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true);
 }
 await screenshot('hmong-phone-dashboard.png');
 console.log('PASS: resident DJ independent of viewer counts, 20 roaming dancers, stair visits, stage gifts return correctly, idle/formation controls, portrait/landscape and DJ cleanup.');
}
