export function isWebPFile(file){return file.type?.toLowerCase()==='image/webp'||/\.webp$/i.test(file.name||'')}
export function isImageFile(file){return file.type?.startsWith('image/')||isWebPFile(file)}
export function validWebPHeader(bytes){return bytes.length>=12&&bytes[0]===82&&bytes[1]===73&&bytes[2]===70&&bytes[3]===70&&bytes[8]===87&&bytes[9]===69&&bytes[10]===66&&bytes[11]===80}
export function readImageData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('無法讀取圖片'));reader.readAsDataURL(file)})}
export async function readWebPData(file){if(!validWebPHeader(new Uint8Array(await file.slice(0,12).arrayBuffer())))throw Error('檔案不是有效 WebP');return readImageData(new Blob([file],{type:'image/webp'}))}
