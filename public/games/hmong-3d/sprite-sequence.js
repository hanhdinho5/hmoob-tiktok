import * as THREE from 'three';
// Every frame keeps the same camera, scale and baseline; never crop each pose separately.
export function sequenceMap(texture,clip){const map=texture.clone();map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;map.magFilter=THREE.LinearFilter;map.needsUpdate=true;return {map,clip};}
export function selectFrame(sequence,index){
 const {map,clip}=sequence,frame=(clip.startFrame||0)+Math.max(0,Math.min(clip.frames-1,index));
 const row=Math.floor(frame/clip.columns),bounds=clip.rowBounds?.[row]||[row/clip.rows,(row+1)/clip.rows];
 map.repeat.set(1/clip.columns,bounds[1]-bounds[0]);map.offset.set((frame%clip.columns)/clip.columns,1-bounds[1]);
}
