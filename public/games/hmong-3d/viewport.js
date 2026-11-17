export function isPortrait(){return typeof document!=='undefined'&&document.body?.dataset.layout==='portrait'||globalThis.innerWidth<globalThis.innerHeight;}
export function renderViewport(width,height,{preview=false}={}){
 const targetWidth=preview?540:1080;
 const safeWidth=Math.max(1,width),safeHeight=Math.max(1,height);
 return {width:safeWidth,height:safeHeight,pixelRatio:Math.min(3,Math.max(1,targetWidth/safeWidth))};
}
