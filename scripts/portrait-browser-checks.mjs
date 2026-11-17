import assert from 'node:assert/strict';
export async function checkPortrait({navigate,evaluate,until,screenshot,viewport}){
 for(const [width,height]of [[1440,1000],[390,844],[1080,1920]]){
  await viewport(width,height);await navigate('/games/hmong-3d/index.html?lang=hmn&mode=crowd&demo=1&count=20');await until(()=>evaluate('window.Hmong3D?.ready'),'portrait display ready');
  const rect=await evaluate('(()=>{const r=document.querySelector("#scene").getBoundingClientRect();return {width:r.width,height:r.height};})()');assert.ok(Math.abs(rect.width/rect.height-9/16)<.001);
  const metrics=await evaluate('Hmong3D.stats()');assert.ok(Math.abs(metrics.renderResolution[0]-1080)<=2);assert.ok(Math.abs(metrics.renderResolution[1]-1920)<=2);
  await until(()=>evaluate('document.querySelectorAll("#giftGuide img:not([hidden])").length===9'),'all nine real gift icons');
  assert.ok(await evaluate('(()=>{const cards=[...document.querySelectorAll(".gift-guide-card")],tops=cards.map(c=>c.getBoundingClientRect().top),guide=document.querySelector("#giftGuide").getBoundingClientRect(),body=document.body.getBoundingClientRect();return Math.max(...tops)-Math.min(...tops)<1&&Math.abs(guide.top-body.top)<1;})()'),'nine gifts occupy one row at the top edge');
  await until(()=>evaluate('document.querySelectorAll(".player-name:not([hidden])").length>0'),'visible player nameplates');
  assert.ok(await evaluate('parseFloat(getComputedStyle(document.querySelector(".player-name:not([hidden])")).fontSize)>=8'),'nameplate text stays readable');
  await evaluate('Hmong3D.inject("error",{message:"User is offline"})');await until(()=>evaluate('document.querySelector("#connection").dataset.state==="error"'),'visible TikTok failure');assert.match(await evaluate('document.querySelector("#connection").textContent'),/User is offline/);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#connection")).display'),'none','connection errors never appear to live viewers');
  await evaluate('Hmong3D.inject("connected",{roomId:"test"})');await until(()=>evaluate('document.querySelector("#connection").dataset.state==="connected"'),'visible TikTok success');assert.match(await evaluate('document.querySelector("#connection").textContent'),/ĐÃ KẾT NỐI TIKTOK/);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#connection")).display'),'none','connection success never appears to live viewers');
  if(width===390)await screenshot('hmong-portrait-sharp-mobile.png');
 }
 console.log('PASS: portrait display on desktop/mobile/Studio dimensions, Full HD drawing buffer and clear connection/error messages.');
}
