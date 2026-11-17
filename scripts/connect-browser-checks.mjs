import assert from 'node:assert/strict';
export async function checkConnectButton({send,navigate,evaluate,until,viewport,screenshot}){
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{let factory;Object.defineProperty(window,'io',{configurable:true,get(){return factory?function(...args){const socket=factory(...args),emit=socket.emit;socket.emit=function(event,...data){if(event!=='join-room')return emit.call(this,event,...data);this.flags={};window.__connectAttempts=(window.__connectAttempts||0)+1;window.__connectName=data[0];const reply=data.at(-1);setTimeout(()=>reply(null,{ok:window.__connectAttempts>1,username:data[0],message:'Test account is offline'}),80);return this;};return socket;}:undefined;},set(value){factory=value;}});})()`});
 await viewport(1000,900);await navigate('/games/hmong-3d/dashboard.html');await until(()=>evaluate('window.HmongDashboard?.ready'),'dashboard ready');
 await evaluate('document.querySelector("#connectTikTok").click()');assert.equal(await evaluate('window.__connectAttempts||0'),0,'blank username does not connect');
 await evaluate('document.querySelector("#username").value="test_user";document.querySelector("#username").dispatchEvent(new Event("input"));document.querySelector("#connectTikTok").click()');await until(()=>evaluate('document.querySelector("#tiktokStatus").dataset.state==="error"'),'offline failure visible');
 await evaluate('document.querySelector("#connectTikTok").click()');await until(()=>evaluate('document.querySelector("#tiktokStatus").dataset.state==="connected"'),'retry succeeds without opening display tab');assert.equal(await evaluate('window.__connectName'),'test_user');
 assert.match(await evaluate('document.querySelector("#tiktokStatus").textContent'),/ĐÃ KẾT NỐI/);assert.equal(await evaluate('document.querySelector("#connectTikTok").disabled'),false);
 assert.notEqual(await evaluate('getComputedStyle(document.querySelector("#tiktokStatus")).display'),'none','dashboard retains visible connection status');
 // No display is open, but local settings must not clear the direct connection.
 await evaluate('document.querySelector("#musicNext").click()');assert.equal(await evaluate('document.querySelector("#tiktokStatus").dataset.state'),'connected');
 await screenshot('hmong-dashboard-connect-button.png');await evaluate('document.querySelector("#username").value="";document.querySelector("#username").dispatchEvent(new Event("input"))');assert.equal(await evaluate('document.querySelector("#tiktokStatus").dataset.state'),'local');
 console.log('PASS: direct connection button, username validation, offline retry/success states, no display tab required, status retained and input reset.');
}
