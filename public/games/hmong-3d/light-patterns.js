const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
export function lightFrame(time,features,{musicLights=true,intensity=.8,reduced=false}={}){
 const audio=musicLights&&features;
 const bpm=clamp(audio?features.bpm:128,70,190),energy=clamp(audio?features.energy:.58),phase=audio?features.phase:(time*bpm/60)%1;
 const beatIndex=audio?features.beatIndex:Math.floor(time*bpm/60),pulse=clamp(audio?features.beat:Math.exp(-phase*7));
 return {source:audio?features.source:'auto',bpm,energy,phase,beatIndex,pulse,pattern:Math.floor(beatIndex/8)%4,
  speed:(.35+energy*2.5*bpm/120)*(reduced?.35:1),
  brightness:clamp(intensity)*(reduced?.55:1),chase:Math.floor((beatIndex+phase)*4),reduced};
}
export function bankLevel(frame,index){
 const chase=(index+frame.chase)%4<2?1:.18;
 return frame.brightness*(.15+frame.energy*.5+frame.pulse*.35)*(frame.reduced?.65:chase);
}
