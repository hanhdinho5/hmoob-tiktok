import assert from 'node:assert/strict';
export async function checkLighting({navigate,evaluate,until,viewport,screenshot,delay}){
 await viewport(390,844);await navigate('/games/hmong-3d/index.html?mode=crowd&music=0&mc=0');await until(()=>evaluate('window.Hmong3D?.ready'),'reactive lighting overlay');
 await evaluate('Hmong3D.music.play()',true);await until(()=>evaluate('Hmong3D.music.reactivity.context?.state==="running" && Hmong3D.music.audio.currentTime>0'),'music and Web Audio play together');
 await evaluate('Hmong3D.music.audio.currentTime=35');await until(()=>evaluate('Hmong3D.stats().musicReactive && Hmong3D.stats().musicEnergy>.03'),'real local audio drives lighting');
 assert.equal(await evaluate('Hmong3D.music.reactivity.source!==null'),true);assert.equal(await evaluate('Hmong3D.director.rendering.stage.lighting.beams.length'),8);assert.equal(await evaluate('Hmong3D.director.rendering.stage.lighting.fans.length'),2);
 await evaluate('window.originalMusicSource=Hmong3D.music.reactivity.source;Hmong3D.music.next(true)',true);await until(()=>evaluate('Hmong3D.music.audio.currentTime>0'),'track switching still plays');assert.equal(await evaluate('Hmong3D.music.reactivity.source===originalMusicSource'),true);
 await evaluate('Hmong3D.music.pause()');await delay(500);assert.equal(await evaluate('Hmong3D.music.audio.paused'),true);
 // Controlled input exercises the actual rig/renderer independently of song intros.
 await evaluate("for(let i=0;i<10;i++)Hmong3D.inject('member',{user:{uniqueId:'light_'+i,nickname:'Người nhảy '+i}})");await until(()=>evaluate('Hmong3D.stats().characters===10'),'lighting crowd');
 await evaluate("window.originalMusicFeatures=Hmong3D.music.features.bind(Hmong3D.music);Hmong3D.music.features=()=>({source:'audio',playing:true,energy:.25,bass:.2,beat:.25,phase:.2,bpm:90,beatIndex:1});Hmong3D.settings({cameraAuto:false});");await delay(200);
 const slow=await evaluate('Hmong3D.director.rendering.stage.lighting.state.speed');await screenshot('hmong-club-lights-soft.png');
 await evaluate("Hmong3D.music.features=()=>({source:'audio',playing:true,energy:.95,bass:.95,beat:1,phase:.05,bpm:170,beatIndex:9})");await delay(200);
 assert.ok((await evaluate('Hmong3D.director.rendering.stage.lighting.state.speed'))>slow*1.5);await screenshot('hmong-club-lights-bass.png');
 const pose=await evaluate('Hmong3D.director.rendering.stage.lighting.beams[0].quaternion.toArray()');await delay(250);assert.notDeepEqual(await evaluate('Hmong3D.director.rendering.stage.lighting.beams[0].quaternion.toArray()'),pose);
 await evaluate('Hmong3D.settings({lightIntensity:0})');await until(()=>evaluate('!Hmong3D.director.rendering.stage.lighting.group.visible'),'zero intensity disables lights');
 await evaluate('Hmong3D.settings({lightIntensity:.8,musicLights:false})');await until(()=>evaluate('Hmong3D.stats().lightSource==="auto"'),'manual rhythm fallback');
 await evaluate('Hmong3D.settings({effects:false})');await until(()=>evaluate('!Hmong3D.director.rendering.stage.lighting.group.visible'),'effects master switch');await evaluate('Hmong3D.settings({effects:true,musicLights:true});Hmong3D.music.features=originalMusicFeatures');
 await viewport(1260,720);await delay(200);await screenshot('hmong-club-lights-wide.png');
 await evaluate('window.lightContext=Hmong3D.music.reactivity.context;Hmong3D.dispose()');await until(()=>evaluate('lightContext.state==="closed"'),'audio context cleanup');
 await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'lighting dashboard');
 await evaluate("document.querySelector('#lightIntensity').value='0.45';document.querySelector('#musicLights').checked=false;document.querySelector('#lightIntensity').dispatchEvent(new Event('input'))");await until(()=>evaluate('document.querySelector("#preview").contentWindow.Hmong3D.director.rendering.stage.lighting.options.intensity===.45'),'light settings reach silent preview');
 assert.equal(await evaluate('document.querySelector("#preview").contentWindow.Hmong3D.music.audio.paused && document.querySelector("#preview").contentWindow.Hmong3D.music.reactivity.context===null'),true);
 await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'lighting settings restore');assert.equal(await evaluate('document.querySelector("#lightIntensity").value'),'0.45');assert.equal(await evaluate('document.querySelector("#musicLights").checked'),false);
 console.log('PASS: actual M4A/Web Audio analysis, one audio graph across tracks, soft/strong speed response, moving fixtures, controls, silent preview, persistence and audio cleanup.');
}
