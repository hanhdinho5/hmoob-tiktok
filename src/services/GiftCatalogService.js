import { TikTokLiveConnection } from 'tiktok-live-connector';
import { giftCatalog } from '../lib/giftCatalog.js';

// Fetching the public gift list does not open a TikTok LIVE connection.
export class GiftCatalogService {
 constructor({fetchGifts=()=>new TikTokLiveConnection('tiktok',{webClientOptions:{timeout:8000}}).fetchAvailableGifts(),now=()=>Date.now()}={}){this.fetchGifts=fetchGifts;this.now=now;this.cached=null;this.expires=0;this.pending=null;this.retryAfter=0;}
 async get(){
  if(this.cached&&this.now()<this.expires)return this.cached;
  if(this.pending)return this.pending;
  if(this.now()<this.retryAfter)throw Error('TikTok gift catalog temporarily unavailable');
  this.pending=(async()=>{
   try{const gifts=giftCatalog(await this.fetchGifts());if(!gifts.length)throw Error('Empty gift catalog');this.cached=gifts;this.expires=this.now()+300000;return gifts;}
   catch(error){this.retryAfter=this.now()+30000;throw error;}
   finally{this.pending=null;}
  })();return this.pending;
 }
}
export default new GiftCatalogService();
