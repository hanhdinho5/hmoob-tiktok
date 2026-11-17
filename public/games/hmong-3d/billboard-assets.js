import * as THREE from 'three';

export async function loadBillboardAssets(config){
 const textures=new Map(),loader=new THREE.TextureLoader();
 const urls=[...new Set([config.spriteAtlas.url,...config.characters.flatMap(d=>[d.portrait?.url,...Object.values(d.sequences||{}).map(c=>c.url)]).filter(Boolean)])];
 let next=0;
 try{
  // Bound decode concurrency as the character library grows.
  const loaded=await Promise.allSettled(Array.from({length:Math.min(4,urls.length)},async()=>{while(next<urls.length){const url=urls[next++],texture=await loader.loadAsync(url);texture.colorSpace=THREE.SRGBColorSpace;textures.set(url,texture);}}));
  const failure=loaded.find(result=>result.status==='rejected');if(failure)throw failure.reason;
  const templates=config.characters.map((descriptor,index)=>{
   const layout=descriptor.portrait||{...config.spriteAtlas,frame:index},source=textures.get(layout.url),frame=layout.frame||0;
   if(frame>=layout.columns*layout.rows)throw Error(`Invalid portrait cell for ${descriptor.id}`);
   const left=Math.round(frame%layout.columns*source.image.width/layout.columns),right=Math.round((frame%layout.columns+1)*source.image.width/layout.columns),top=Math.round(Math.floor(frame/layout.columns)*source.image.height/layout.rows),bottom=Math.round((Math.floor(frame/layout.columns)+1)*source.image.height/layout.rows);
   const canvas=document.createElement('canvas');canvas.width=right-left;canvas.height=bottom-top;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source.image,left,top,canvas.width,canvas.height,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let x0=canvas.width,y0=canvas.height,x1=0,y1=0;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>128){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   if(x1<=x0||y1<=y0)throw Error(`Empty character portrait ${descriptor.id}`);
   x0=Math.max(0,x0-2);x1=Math.min(canvas.width-1,x1+2);y0=Math.max(0,y0-2);y1=Math.min(canvas.height-1,y1+2);
   const map=source.clone();map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;map.repeat.set((x1-x0+1)/source.image.width,(y1-y0+1)/source.image.height);map.offset.set((left+x0)/source.image.width,1-(top+y1+1)/source.image.height);map.needsUpdate=true;
   const material=new THREE.SpriteMaterial({map,transparent:true,alphaTest:.15,depthWrite:true,toneMapped:false});
   const sprite=new THREE.Sprite(material);sprite.name='CharacterArt';sprite.center.set(.5,.01);sprite.scale.set(2.6*(x1-x0+1)/(y1-y0+1),2.6,1);
   const scene=new THREE.Group();scene.add(sprite);return {descriptor,scene,animations:[],billboard:true};
  });
  return {templates,atlas:textures.get(config.spriteAtlas.url),sequenceTextures:textures};
 }catch(error){for(const texture of textures.values())texture.dispose();throw error;}
}
