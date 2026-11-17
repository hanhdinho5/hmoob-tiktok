import assert from 'node:assert/strict';
export async function checkDances({navigate,evaluate,until,viewport,screenshot,delay}){
 await viewport(1200,900);await navigate('/games/hmong-3d/index.html?mode=crowd&music=0&mc=0');await until(()=>evaluate('window.Hmong3D?.ready'),'dance overlay ready');
 await evaluate(`(()=>{const c=Hmong3D.director.characters;c.clear();for(let i=0;i<c.config.characters.length;i++)c.add({uniqueId:'dance_qa_'+i,nickname:c.config.characters[i].id},i);c.setFormation('rows');Hmong3D.settings({cameraAuto:false});})()`);
 assert.equal(await evaluate('Hmong3D.stats().characters'),20);
 for(const name of ['danceD','danceE','danceF']){
  const result=await evaluate(`(()=>{const c=Hmong3D.director.characters;return [...c.items.values()].map(item=>{const a=item.animation;a.setBase('${name}');const frames=new Set();for(let n=0;n<240;n++){a.update(1/120);frames.add(a.frame);}const sprite=item.model.getObjectByName('CharacterArt');return {clip:a.clip,frames:frames.size,pivot:sprite.center.y,scale:sprite.scale.toArray(),uv:[...sprite.material.map.offset.toArray(),...sprite.material.map.repeat.toArray()]};});})()`);
  assert.ok(result.every(x=>x.clip===name&&x.frames===12&&x.pivot>=0&&x.pivot<.4&&x.scale[0]>1&&x.scale[1]>1&&x.uv.every(Number.isFinite)));
  // Diagnostic contact sheet uses the actual loaded maps/UVs and sprite scales.
  await evaluate(`(()=>{document.querySelector('#dance-qa')?.remove();const panel=document.createElement('div');panel.id='dance-qa';Object.assign(panel.style,{position:'fixed',inset:0,zIndex:9999,background:'#100d20',display:'grid',gridTemplateColumns:'repeat(5,1fr)',gridTemplateRows:'repeat(4,1fr)'});document.body.append(panel);for(const item of Hmong3D.director.characters.items.values()){const card=document.createElement('div'),label=document.createElement('div'),canvas=document.createElement('canvas');label.textContent=item.animation.clip+' · '+item.user.nickname;label.style='color:white;font:12px system-ui;text-align:center';canvas.width=220;canvas.height=194;card.append(label,canvas);panel.append(card);const sprite=item.model.getObjectByName('CharacterArt'),map=sprite.material.map,image=map.image,ctx=canvas.getContext('2d'),factor=160/2.6,w=sprite.scale.x*factor,h=sprite.scale.y*factor;ctx.strokeStyle='#4f466c';ctx.beginPath();ctx.moveTo(0,184);ctx.lineTo(220,184);ctx.stroke();ctx.drawImage(image,map.offset.x*image.width,(1-map.offset.y-map.repeat.y)*image.height,map.repeat.x*image.width,map.repeat.y*image.height,110-w/2,184-h*(1-sprite.center.y),w,h);}})()`);
  await screenshot(`hmong-dance-${name}-all-models.png`);await evaluate("document.querySelector('#dance-qa').remove()");
 }
 // Automatic selection reaches all six loops; a reaction restores a chosen new dance.
 const auto=await evaluate(`(()=>{const a=Hmong3D.director.characters.items.values().next().value.animation;a.setBase('dance');a.time=0;a.phase=0;const seen=[];for(let n=0;n<48*12;n++){a.update(1/12);if(!seen.includes(a.clip))seen.push(a.clip);}a.setBase('danceD');a.play('gift',.1);a.update(.2);return {seen,base:a.base,name:a.name,clip:a.clip};})()`);
 assert.equal(auto.seen.length,6);assert.equal(auto.name,'danceD');assert.equal(auto.clip,'danceD');
 await viewport(390,844);await evaluate("for(const item of Hmong3D.director.characters.items.values())item.animation.setBase('danceD')");await delay(350);await screenshot('hmong-dance-hips-phone.png');
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
 console.log('PASS: all 20 identities play all 12 frames of three new dances; valid UVs, supporting soles, automatic six-dance selection, reaction return and phone rendering.');
}
