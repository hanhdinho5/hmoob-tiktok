const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const follow=(value,target,delta,rate)=>value+(target-value)*(1-Math.exp(-delta*rate));

// Transient bass detection, with a rolling tempo estimate rather than a
// hard-coded song BPM. Spectral readings remain independent of MC/audio FX.
export class BeatTracker {
 constructor(){this.reset();}
 reset(){this.time=0;this.lastBeat=-10;this.average=.08;this.previousBass=0;this.intervals=[];this.energy=0;this.kick=0;this.phase=0;this.bpm=120;this.beatIndex=0;}
 update({bass=0,mid=0,high=0,rms=0,playing=true}={},delta=1/30){
  delta=clamp(delta,0,.5);this.time+=delta;bass=clamp(bass);mid=clamp(mid);high=clamp(high);rms=clamp(rms);
  const level=playing?clamp(rms*1.7+bass*.3+mid*.12):0;
  this.energy=follow(this.energy,level,delta,level>this.energy?9:2.5);
  this.kick*=Math.exp(-delta*9);this.phase=(this.phase+delta*this.bpm/60)%1;
  const rising=bass-this.previousBass,elapsed=this.time-this.lastBeat;
  const onset=playing&&rms>.012&&bass>.08&&bass>this.average*1.17+.025&&rising>.025&&elapsed>.28;
  if(onset){
   if(elapsed<1.2){this.intervals.push(elapsed);if(this.intervals.length>10)this.intervals.shift();
    if(this.intervals.length>=3){const sorted=[...this.intervals].sort((a,b)=>a-b);let estimate=60/sorted[Math.floor(sorted.length/2)];while(estimate<70)estimate*=2;while(estimate>190)estimate/=2;this.bpm=follow(this.bpm,estimate,.3,2.5);}
   }
   this.lastBeat=this.time;this.beatIndex++;this.phase=0;this.kick=clamp(.45+bass*.8);
  }
  this.average=follow(this.average,bass,delta,1.5);this.previousBass=bass;
  const confidence=playing&&this.time-this.lastBeat<2.5?Math.min(1,this.intervals.length/6):0;
  return {source:'audio',playing,energy:this.energy,bass,mid,high,beat:this.kick,phase:this.phase,bpm:this.bpm,beatIndex:this.beatIndex,confidence};
 }
}

export class MusicReactivity {
 constructor(audio,{preview=false}={}){this.audio=audio;this.preview=preview;this.tracker=new BeatTracker();this.context=null;this.source=null;this.analyser=null;this.disposed=false;this.clock=0;this.track='';this.state=null;}
 unlock(){
  if(this.disposed||this.preview)return;
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;
  try{
   if(!this.context)this.context=new Context();
   const connect=()=>{
    if(this.disposed||this.context.state!=='running'||this.source)return;
    const analyser=this.context.createAnalyser();analyser.fftSize=1024;analyser.smoothingTimeConstant=.45;
    // Attach only after the context is running. Until then the media element
    // keeps its native audio output, so autoplay cannot become silently muted.
    const source=this.context.createMediaElementSource(this.audio);source.connect(analyser);analyser.connect(this.context.destination);
    this.source=source;this.analyser=analyser;this.frequencies=new Uint8Array(analyser.frequencyBinCount);this.wave=new Uint8Array(analyser.fftSize);
   };
   if(this.context.state==='running')connect();else this.context.resume().then(connect).catch(()=>{});
  }catch{/* Unsupported analysis must not prevent ordinary music playback. */}
 }
 sample(delta=1/30){
  this.clock+=delta;const track=this.audio.currentSrc||this.audio.src||'';
  if(track!==this.track){this.track=track;this.tracker.reset();this.lastAudioTime=undefined;}
  const playing=!this.audio.paused&&!this.audio.ended&&!this.disposed;
  if(this.analyser&&this.context?.state==='running'){
   this.analyser.getByteFrequencyData(this.frequencies);this.analyser.getByteTimeDomainData(this.wave);
   const hz=this.context.sampleRate/this.analyser.fftSize;
   const band=(low,high)=>{let total=0,count=0;for(let i=Math.max(1,Math.floor(low/hz));i<Math.min(this.frequencies.length,Math.ceil(high/hz));i++){const v=this.frequencies[i]/255;total+=v*v;count++;}return Math.sqrt(total/Math.max(1,count));};
   let power=0;for(const value of this.wave)power+=((value-128)/128)**2;
   const audioTime=this.context.currentTime,elapsed=this.lastAudioTime===undefined?delta:Math.max(0,audioTime-this.lastAudioTime);this.lastAudioTime=audioTime;
   this.state=this.tracker.update({bass:band(40,180),mid:band(180,1800),high:band(2000,10000),rms:Math.sqrt(power/this.wave.length),playing},elapsed);
  }else{
   const demo=this.preview,bpm=demo||playing?128:90,phase=(this.clock*bpm/60)%1;
   this.state={source:demo?'demo':playing?'auto':'idle',playing,energy:demo||playing?.55:.17,bass:0,mid:0,high:0,beat:Math.exp(-phase*7)*(demo||playing?.7:.15),phase,bpm,beatIndex:Math.floor(this.clock*bpm/60),confidence:0};
  }
  return this.state;
 }
 dispose(){this.disposed=true;this.source?.disconnect();this.analyser?.disconnect();this.context?.close().catch(()=>{});}
}
