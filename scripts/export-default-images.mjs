import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPaperDoll} from '../paper-doll.js';
import {createGemState,getGemCatalog,gemImage} from '../gems.js';
export async function exportDefaultImages(output){const destination=resolve(output);await mkdir(join(destination,'gems'),{recursive:true});await mkdir(join(destination,'dice'),{recursive:true});
const core=[['base-body.webp','全身人偶底模',1086,1448],['head.webp','服裝用人偶頭',1086,554],['stone.webp','石階',2172,724],['forest.webp','森林背景，五個預設場景共用並調整色調',1536,1024],['portal.webp','魔法陣',1254,1254]];
const manifest=[];for(const [file,use,width,height] of core){await copyFile(new URL('../assets/'+file,import.meta.url),join(destination,file));manifest.push({file,use,width,height})}
const svgData=source=>decodeURIComponent(source.slice(source.indexOf(',')+1));for(const item of createPaperDoll().assets){const file=item.id+'.svg';await writeFile(join(destination,file),svgData(item.image));manifest.push({file,use:item.name,width:1000,height:1400})}
const gems=createGemState();for(const gem of getGemCatalog(gems)){const file='gems/'+gem.id+'.svg';await writeFile(join(destination,file),svgData(gemImage(gem)));manifest.push({file,use:gem.name,viewBox:'0 0 80 100'})}
const css=await readFile(new URL('../fantasy.css',import.meta.url),'utf8');for(const match of css.matchAll(/\.dice\[data-face=["\x27]?(\d)["\x27]?\]\s*\{\s*--dice-face:\s*url\(["\x27]?([^"\x27)]+)["\x27]?\)/g)){const file='dice/'+match[1]+'.svg';await writeFile(join(destination,file),svgData(match[2]));manifest.push({file,use:'骰子 '+match[1]+' 點（白色遮罩）',viewBox:'0 0 100 100'})}
await writeFile(join(destination,'manifest.json'),JSON.stringify(manifest,null,2));
await writeFile(join(destination,'圖檔說明.txt'),`EN-game2 新裝置預設圖檔\n\n共 ${manifest.length} 個圖檔：5 個主要 WebP、1 個預設寵物 SVG、160 個預設寶石 SVG、6 個骰子 SVG。\n\nhead.webp 是獨立內建的服裝用人偶頭，像素原樣取自全身底模頂端，保留透明背景；網站會以原本頭部基準擺放。\n原始內建髮型、眼睛與服裝已從新裝置預設配件移除；不影響自行上傳的素材。\n\n預設寵物與寶石在程式中以 SVG 產生，此處匯出相同的圖檔，方便自行轉檔。五個預設場景共用 forest.webp，配色由程式調整。\n骰子 SVG 是透明底白色遮罩，網站以 CSS 套色，本包也提供原始 SVG。頭像圓框、對話框、陰影、按鈕與介面符號由 CSS／字元繪製，沒有另外的圖檔。字型與音檔不是圖檔，不包含在本包。\n\n壓縮或替換時請保留畫布尺寸、透明背景與位置，避免紙娃娃配件錯位。這是新裝置的預設素材，不包含個人瀏覽器上傳的題庫、配件、頭像或自訂場景；那些素材可另由完整備份保存。\n\nmanifest.json 記錄每個圖檔的用途與尺寸。\n`);
return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const directory=resolve(process.argv[2]||'/workspace/artifacts/EN-game2-default-images');const manifest=await exportDefaultImages(directory);console.log(JSON.stringify({directory,images:manifest.length}))}
