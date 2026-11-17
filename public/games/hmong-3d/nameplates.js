import * as THREE from 'three';
export function shortPlayerName(value){const letters=Array.from(String(value));return letters.length>16?letters.slice(0,13).join('')+'...':letters.join('');}
export class Nameplates {
 constructor(canvas){this.canvas=canvas;this.nodes=new Map();this.layer=document.createElement('div');this.layer.className='player-names';document.body.append(this.layer);this.up=new THREE.Vector3();this.point=new THREE.Vector3();}
 update(items,camera){
  const living=new Set(),width=this.canvas.clientWidth,height=this.canvas.clientHeight;
  this.up.setFromMatrixColumn(camera.matrixWorld,1);
  for(const item of items){
   living.add(item.key);let node=this.nodes.get(item.key);if(!node){node=document.createElement('div');node.className='player-name';const name=item.user.nickname||item.user.uniqueId||item.key;node.textContent=shortPlayerName(name);node.title=name;this.layer.append(node);this.nodes.set(item.key,node);}
   const art=item.model.getObjectByName('CharacterArt'),scale=item.root.scale.y;
   // Project the sprite's actual head using the billboard's screen-facing axis.
   const head=(art?art.position.y+art.scale.y*(1-art.center.y):2.7)*scale;
   this.point.copy(item.root.position).addScaledVector(this.up,head).project(camera);
   const visible=item.label.visible&&this.point.z>-1&&this.point.z<1&&Math.abs(this.point.x)<.94&&Math.abs(this.point.y)<.87;
   node.hidden=!visible;if(!visible)continue;
   let x=(this.point.x+1)*width/2,y=(1-this.point.y)*height/2-height*.004;
   node.style.left=x+'px';node.style.top=y+'px';
   if(node.measuredWidth!==width){node.plateWidth=node.offsetWidth;node.plateHeight=node.offsetHeight;node.measuredWidth=width;}
   const w=node.plateWidth,h=node.plateHeight;x=Math.max(w/2+5,Math.min(width-w/2-5,x));
   node.style.left=x+'px';node.style.top=y+'px';
   // Nearer viewers cover farther nameplates; never move names off their heads.
   node.style.zIndex=String(Math.round((1-this.point.z)*100000));
  }
  for(const[key,node]of this.nodes)if(!living.has(key)){node.remove();this.nodes.delete(key);}
 }
 dispose(){this.layer.remove();this.nodes.clear();}
}
