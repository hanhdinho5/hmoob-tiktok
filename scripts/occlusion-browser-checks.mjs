import assert from 'node:assert/strict';

export async function checkOcclusion({navigate,evaluate,until,viewport,screenshot,delay}){
 await viewport(390,844);await navigate('/games/hmong-3d/index.html?mode=crowd&music=0&mc=0');await until(()=>evaluate('window.Hmong3D?.ready'),'visibility overlay ready');
 await evaluate("Hmong3D.inject('member',{user:{uniqueId:'visibility_actor',nickname:'Người cưỡi phượng'}})");await until(()=>evaluate('Hmong3D.stats().characters===1'),'visibility actor');
 await evaluate(`(async()=>{
  const THREE=await import('/vendor/three/build/three.module.js');const {renderFocusedScene}=await import('./focus-renderer.js');
  window.measureShowVisibility=(legacy=false)=>{
   const d=Hmong3D.director,r=d.rendering.renderer,scene=d.rendering.scene,camera=d.camera,actor=d.active.item.root,roots=d.focusRoots;
   const width=camera.aspect<1?144:384,height=camera.aspect<1?256:216,target=new THREE.WebGLRenderTarget(width,height),priorTarget=r.getRenderTarget(),priorColor=r.getClearColor(new THREE.Color()),priorAlpha=r.getClearAlpha(),bg=scene.background;
   const saved=[];let full,reference,mount;
   const read=()=>{const pixels=new Uint8Array(width*height*4);r.readRenderTargetPixels(target,0,0,width,height,pixels);return pixels;};
   try{
    scene.updateMatrixWorld(true);r.setRenderTarget(target);r.setClearColor(0,0);
    if(legacy)r.render(scene,camera);else renderFocusedScene(r,scene,camera,roots);full=read();
    for(const child of scene.children){saved.push([child,child.visible]);if(!child.isLight&&!roots.includes(child))child.visible=false;}
    scene.background=null;renderFocusedScene(r,scene,camera,roots);mount=read();
    for(const root of roots)if(root!==actor){saved.push([root,root.visible]);root.visible=false;}
    renderFocusedScene(r,scene,camera,[actor]);reference=read();
   }finally{for(const[obj,visible]of saved.reverse())obj.visible=visible;scene.background=bg;r.setRenderTarget(priorTarget);r.setClearColor(priorColor,priorAlpha);target.dispose();}
   let lo=height,hi=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(reference[(y*width+x)*4+3]>250){lo=Math.min(lo,y);hi=Math.max(hi,y);}
   const compare=(ref,head=false)=>{let samples=0,matching=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(ref[i+3]<251||head&&y<lo+(hi-lo)*.6)continue;samples++;const error=Math.abs(full[i]-ref[i])+Math.abs(full[i+1]-ref[i+1])+Math.abs(full[i+2]-ref[i+2]);if(error<32)matching++;}return {samples,visible:matching/Math.max(1,samples)};};
   return {head:compare(reference,true),performance:compare(mount)};
  };
 })()`);
 // Reproduce the reported failure using the old opaque backdrop and a rider
 // behind it. The ordinary pass must fail; the performance pass must stay visible.
 const reproduction=await evaluate(`(()=>{
  const d=Hmong3D.director,item=d.characters.items.get('visibility_actor');d.enqueue({user:item.user,giftName:'Colorful Wings'});d.update(.01);
  item.root.position.set(0,2.8,-8.7);d.prop.group.position.set(0,2.53,-8.7);d.prop.group.scale.setScalar(.65);d.camera.position.set(1,4,2);d.camera.lookAt(0,3.4,-8.7);d.camera.updateMatrixWorld();
  const back=d.rendering.stage.backdrop,m=back.material,old=[m.depthWrite,m.depthTest,back.renderOrder];m.depthWrite=true;m.depthTest=true;back.renderOrder=0;
  try{return {old:measureShowVisibility(true),fixed:measureShowVisibility(false)};}finally{[m.depthWrite,m.depthTest,back.renderOrder]=old;d.clear();}
 })()`);
 assert.ok(reproduction.old.head.visible<.5,JSON.stringify(reproduction));assert.ok(reproduction.fixed.head.visible>.98,JSON.stringify(reproduction));
 console.log('Reproduced opaque-wall failure and verified foreground correction:',JSON.stringify(reproduction));
 for(const [width,height]of [[390,844],[1260,720]]){
  await viewport(width,height);await delay(100);
  for(const giftName of ['Colorful Wings','Dragon Crown'])for(const origin of ['floor','deck']){
   await evaluate(`(()=>{const d=Hmong3D.director,item=d.characters.items.get('visibility_actor'),portrait=d.camera.aspect<1;d.clear();item.root.position.set(${origin==='deck'?'portrait?1.457:2.35':'0'},${origin==='deck'?'.57':'-.095'},${origin==='deck'?'portrait?-4.52:-5.65':'-2.5'});d.enqueue({user:item.user,giftName:${JSON.stringify(giftName)}});d.update(.01);})()`);
   for(const time of [.1,1.5,3,5,7.5,10,12.5,14.5,15.5]){
    const result=await evaluate(`(()=>{const d=Hmong3D.director;d.active.time=${time};d.update(0);d.camera.position.copy(d.position);d.look.copy(d.target);d.camera.lookAt(d.look);d.camera.updateProjectionMatrix();d.camera.updateMatrixWorld();return measureShowVisibility();})()`);
    assert.ok(result.head.samples>=12&&result.head.visible>.98,`${giftName} ${origin} ${width}x${height} t=${time}: head ${JSON.stringify(result)}`);
    assert.ok(result.performance.samples>=30&&result.performance.visible>.98,`${giftName} ${origin} t=${time}: mount ${JSON.stringify(result)}`);
   }
   if(giftName==='Colorful Wings'&&origin==='deck'){await delay(50);await screenshot(`hmong-phoenix-visible-${width}.png`);}
   await evaluate('Hmong3D.director.clear()');
  }
 }
 assert.equal(await evaluate('Hmong3D.director.characters.items.get("visibility_actor").model.getObjectByName("CharacterArt").layers.mask'),1,'layers restored after show');
 console.log('PASS: pixel comparisons keep rider heads and complete mounts visible throughout both rides, from floor/deck, in portrait and landscape; render layers restore.');
}
