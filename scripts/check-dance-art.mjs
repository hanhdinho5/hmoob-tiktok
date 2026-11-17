import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const config=JSON.parse(fs.readFileSync('public/games/hmong-3d/config.json','utf8'));
const borderFailures=[];
const paeth=(a,b,c)=>{const p=a+b-c,x=Math.abs(p-a),y=Math.abs(p-b),z=Math.abs(p-c);return x<=y&&x<=z?a:y<=z?b:c;};
function decode(url){
 const file=fs.readFileSync('public'+url),w=file.readUInt32BE(16),h=file.readUInt32BE(20);assert.equal(file[24],8);assert.equal(file[25],6);
 const chunks=[];for(let pos=8;pos<file.length;){const size=file.readUInt32BE(pos);if(file.toString('ascii',pos+4,pos+8)==='IDAT')chunks.push(file.subarray(pos+8,pos+8+size));pos+=size+12;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(w*h*4),stride=w*4;assert.equal(raw.length,h*(stride+1));
 for(let y=0;y<h;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const target=y*stride+x,a=x>=4?pixels[target-4]:0,b=y?pixels[target-stride]:0,c=y&&x>=4?pixels[target-stride-4]:0;pixels[target]=(raw[y*(stride+1)+1+x]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}}
 return {w,h,pixels};
}
function rowBounds({w,h,pixels}){
 const runs=[];let start=null;
 for(let y=0;y<=h;y++){
  let count=0;if(y<h)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>128)count++;
  if(count>=12&&start===null)start=y;
  if(count<12&&start!==null){if(y-start>35)runs.push([start,y-1]);start=null;}
 }
 assert.equal(runs.length,6,'Extended atlas must contain exactly six complete pose rows');
 const edges=[0,...runs.slice(0,-1).map((r,i)=>Math.floor((r[1]+runs[i+1][0])/2)),h];
 return runs.map((_,i)=>[edges[i],edges[i+1]]);
}
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
for(const descriptor of config.characters){
 const clips=Object.entries(descriptor.sequences);assert.equal(clips.length,6);
 const images=new Map();for(const [,clip]of clips)if(!images.has(clip.url))images.set(clip.url,decode(clip.url));
 const heights=new Map(),extendedImage=images.get(descriptor.sequences.danceD.url),bounds=rowBounds(extendedImage),rowHeights=[];
 for(const [name,clip]of clips){
  const {w,h,pixels}=images.get(clip.url),extended=['danceD','danceE','danceF'].includes(name);
  assert.equal(clip.frames,extended?12:8);assert.equal(clip.columns,extended?6:4);assert.equal(clip.rows,6);assert.ok(w%clip.columns===0&&h%clip.rows===0);
  assert.equal(clip.startFrame,extended?['danceD','danceE','danceF'].indexOf(name)*12:['danceA','danceB','danceC'].indexOf(name)*8);
  const footMargins=[],poseHeights=[];
  for(let index=0;index<clip.frames;index++){
   const frame=clip.startFrame+index,cw=w/clip.columns,row=Math.floor(frame/clip.columns),y0=extended?bounds[row][0]:row*h/clip.rows,ch=extended?bounds[row][1]-y0:h/clip.rows,x0=frame%clip.columns*cw;
   let occupied=0,top=ch,bottom=-1;const borders=[0,0,0,0];
   for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
    const alpha=pixels[((y0+y)*w+x0+x)*4+3];if(alpha>64)occupied++;
    if(alpha>128){top=Math.min(top,y);bottom=Math.max(bottom,y);if(y===0)borders[0]++;if(y===ch-1)borders[1]++;if(x===0)borders[2]++;if(x===cw-1)borders[3]++;}
   }
   assert.ok(occupied>cw*ch*.06&&occupied<cw*ch*.8,`${descriptor.id} ${name}/${index}: empty or opaque background`);
   footMargins.push(Number(((ch-1-bottom)/ch).toFixed(5)));poseHeights.push((bottom-top+1)/ch);if(extended){rowHeights[row]??=[];rowHeights[row].push(bottom-top+1);}
   if(!borders.every((count,i)=>count<(i<2?cw:ch)*.03+4))borderFailures.push({id:descriptor.id,name,index,borders});
  }
  heights.set(name,median(poseHeights));
  if(process.argv.includes('--write-pivots')&&extended){
   // Read actual row spacing without editing PNGs; normalize each row once, never each pose.
   clip.framePivots=footMargins;clip.pivot=Math.min(...footMargins);
   clip.width=clip.height=Number((2.8*heights.get('danceA')).toFixed(5));clip.rowBounds=bounds.map(([a,b])=>[a/h,b/h]);
  }
  if(extended&&clip.framePivots){assert.equal(clip.framePivots.length,clip.frames);assert.ok(clip.framePivots.every(p=>p>=0&&p<.4));}
 }
 if(process.argv.includes('--write-pivots'))for(const name of ['danceD','danceE','danceF'])descriptor.sequences[name].rowScales=rowHeights.map(samples=>(extendedImage.w/6)/median(samples));
 console.log(`${descriptor.id}: six dances, 60 nonempty transparent frames`);
}
if(borderFailures.length)console.log(JSON.stringify(borderFailures));
assert.equal(borderFailures.length,0,'Character silhouettes touch cell borders; inspect and repair these frames.');
if(process.argv.includes('--write-pivots')){fs.writeFileSync('public/games/hmong-3d/config.json',JSON.stringify(config,null,2)+'\n');console.log('Calibrated extended dance scale and supporting soles; original PNGs unchanged.');}
