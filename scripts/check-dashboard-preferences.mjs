import assert from 'node:assert/strict';
import { savePreferences, restorePreferences, PREFERENCES_KEY } from '../public/games/hmong-3d/dashboard-preferences.js';
let saved=null;const storage={getItem:key=>key===PREFERENCES_KEY?saved:null,setItem(key,value){saved=value;}};
const inputs={cameraAuto:{type:'checkbox',checked:true},volume:{type:'range',value:'.35',min:'0',max:'1'},theme:{tagName:'SELECT',value:'club',options:[{value:'club'},{value:'royal'}]}};
const config={animations:{dance:{}},giftRules:[]};
assert.equal(savePreferences(storage,{cameraAuto:false,volume:.7,theme:'royal'},[{names:['Rose'],action:'dance',target:'all'}]),true);restorePreferences(storage,Object.keys(inputs),key=>inputs[key],config);assert.equal(inputs.cameraAuto.checked,false);assert.equal(inputs.volume.value,'0.7');assert.equal(inputs.theme.value,'royal');assert.equal(config.giftRules.length,1);
saved=JSON.stringify({version:1,settings:{cameraAuto:'false',volume:99,theme:'missing'},giftRules:[{action:'invalid'}]});restorePreferences(storage,Object.keys(inputs),key=>inputs[key],config);assert.equal(inputs.volume.value,'1');assert.equal(inputs.theme.value,'royal');assert.equal(inputs.cameraAuto.checked,false);assert.equal(config.giftRules.length,1);
saved='broken';restorePreferences(storage,Object.keys(inputs),key=>inputs[key],config);assert.equal(savePreferences({setItem(){throw Error('blocked');}},{},[]),false);
console.log('PASS: scene/audio/camera preferences and gift rules restore; invalid selections, bad JSON, out-of-range numbers and blocked storage are safe.');
