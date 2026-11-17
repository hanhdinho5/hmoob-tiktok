import assert from 'node:assert/strict';
export async function checkDJ({navigate,evaluate,until,screenshot,viewport}){
 await viewport(1440,1000);await navigate('/games/hmong-3d/dashboard.html');
 await until(()=>evaluate('window.HmongDashboard?.ready'),'DJ dashboard ready');
 const g='document.querySelector("#preview").contentWindow.Hmong3D';
 assert.equal(await evaluate('document.querySelector("#djGiftName").value'),'GG');
 await evaluate('document.querySelector("[data-player-action=join10]").click()');await until(()=>evaluate(`${g}.stats().characters===10`),'DJ test viewers');
 await evaluate('document.querySelector("[data-player-action=dj]").click()');await until(()=>evaluate(`${g}.stats().cameraShot==='dj'`),'DJ gift starts role');
 await evaluate(`${g}.director.update(5)`);assert.equal(await evaluate(`${g}.dj.group.visible`),false);
 const key=await evaluate(`${g}.stats().djViewer`);assert.ok(key);assert.ok(await evaluate(`${g}.stats().djRemaining<=30`));
 await evaluate(`${g}.director.enqueue({user:{uniqueId:${JSON.stringify(key)}},giftName:'GG'})`);assert.equal(await evaluate(`${g}.stats().djQueue.length`),0);
 await screenshot('hmong-guest-dj-dashboard.png');
 await evaluate(`${g}.director.update(34)`);assert.equal(await evaluate(`${g}.dj.group.visible`),true);assert.equal(await evaluate(`${g}.director.characters.items.get(${JSON.stringify(key)}).showLocked`),false);
 await evaluate(`${g}.director.clear();${g}.inject('gift',{user:{uniqueId:${JSON.stringify(key)}},giftName:'Rose',giftId:5655,giftValue:1})`);await until(()=>evaluate(`${g}.stats().cameraShot==='zoom'`),'Rose still zooms');await evaluate(`${g}.director.clear()`);
 // Fixture catalog tests image/ID selection without requiring a real LIVE session.
 await evaluate(`window.__originalFetch=window.fetch;window.fetch=(url,...args)=>String(url).startsWith('/api/gifts/')?Promise.resolve(new Response(JSON.stringify({gifts:[{id:987654321,name:'GG Test',diamonds:1,imageUrl:location.origin+'/assets/landscape.svg'}]}),{status:200})):window.__originalFetch(url,...args);document.querySelector('#username').value='qa_catalog';document.querySelector('#loadGiftCatalog').click()`);
 await until(()=>evaluate('document.querySelector("#djCatalog").options.length===2'),'catalog gift choice');
 await evaluate(`document.querySelector('#djCatalog').value='987654321';document.querySelector('#djCatalog').dispatchEvent(new Event('change'));document.querySelector('#username').value='';window.fetch=window.__originalFetch`);
 await until(()=>evaluate(`${g}.director.djGift.id===987654321`),'chosen gift applies to preview');assert.equal(await evaluate('document.querySelector("#djGiftImage").hidden'),false);
 await evaluate(`document.querySelector('[data-player-action=dj]').click()`);await until(()=>evaluate(`${g}.stats().cameraShot==='dj'`),'selected catalog gift starts DJ');await evaluate(`${g}.director.update(5)`);
 await viewport(390,844);await screenshot('hmong-guest-dj-mobile.png');assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'no horizontal overflow');
 await evaluate(`${g}.director.clear();document.querySelector('#djGiftId').value='0';document.querySelector('#djGiftName').value='GG';document.querySelector('#djGiftName').dispatchEvent(new Event('input'))`);
 console.log('PASS: DJ dashboard controls, actual WebGL role, Rose isolation, catalog image/ID selection, cleanup and mobile layout.');
}
