// Gift performances are composited after the room, with their own depth buffer.
// Actor and mount still occlude each other correctly; room panels and pillars
// cannot cut a featured rider in half. All scene/layer state is frame-local.
export function renderFocusedScene(renderer,scene,camera,roots=[]){
 const participants=roots.filter(root=>root?.parent);
 if(!participants.length){renderer.render(scene,camera);return;}
 const masks=new Map(),cameraMask=camera.layers.mask,background=scene.background,autoClear=renderer.autoClear;
 const remember=object=>{if(!masks.has(object))masks.set(object,object.layers.mask);};
 try{
  for(const root of participants)root.traverse(object=>{remember(object);object.layers.set(1);});
  scene.traverse(object=>{if(object.isLight){remember(object);object.layers.enable(1);}});
  camera.layers.set(0);renderer.render(scene,camera);
  renderer.autoClear=false;renderer.clearDepth();scene.background=null;
  camera.layers.set(1);renderer.render(scene,camera);
 }finally{
  for(const[object,mask]of masks)object.layers.mask=mask;
  camera.layers.mask=cameraMask;scene.background=background;renderer.autoClear=autoClear;
 }
}
