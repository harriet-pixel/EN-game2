// Only content-addressed files shipped with this site are accepted as linked media.
export function isBundledMedia(value,kind='image'){
 if(typeof value!=='string')return false;
 const extensions=kind==='audio'?'ogg|oga|wav|mp3|m4a|webm':'webp|png|jpg|jpeg|svg';
 const pattern=new RegExp('(?:^|/)assets/defaults/[a-f0-9]{64}\\.('+extensions+')$');
 if(value.startsWith('assets/defaults/'))return pattern.test(value);
 try{const url=new URL(value);return typeof location!=='undefined'&&url.origin===location.origin&&pattern.test(url.pathname)&&!url.search&&!url.hash}catch{return false}
}
export async function embedBundledMedia(value,readBlob,cache=new Map()){
 if(typeof value==='string'&&(isBundledMedia(value)||isBundledMedia(value,'audio'))){
  if(!cache.has(value))cache.set(value,(async()=>{const response=await fetch(value);if(!response.ok)throw Error('無法讀取預設素材');return readBlob(await response.blob())})());
  return cache.get(value);
 }
 if(Array.isArray(value))return Promise.all(value.map(v=>embedBundledMedia(v,readBlob,cache)));
 if(value&&typeof value==='object'){const result={};for(const [key,v]of Object.entries(value))result[key]=await embedBundledMedia(v,readBlob,cache);return result}
 return value;
}
