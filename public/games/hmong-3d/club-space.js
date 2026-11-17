// Portrait uses a narrower room and a shorter route to the upper deck. Avatar
// proportions stay unchanged: only scenery and walking coordinates adapt.
export const CLUB_DECK={height:.57,front:-5.4,back:-8.3,width:11,djZ:-6.7};
export function clubSpace(portrait=false){
 const xScale=portrait?.62:1,zScale=portrait?.8:1;
 return {xScale,zScale,floorHalfWidth:portrait?2.65:5.4,floorFront:portrait?3.6:5,approachZ:-3.5*zScale,deckFront:CLUB_DECK.front*zScale,deckBack:CLUB_DECK.back*zScale,djZ:CLUB_DECK.djZ*zScale,laneX:2.35*xScale};
}
