import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
const core=(await readFile('game-core.js','utf8')).replace(/^export /gm,'');
const app=(await readFile('app.js','utf8')).replace(/^import .*?;\n/,'');
const js=`(()=>{\n${core}\n${app}\n})();`;
const hash=createHash('sha256').update(js).digest('hex').slice(0,12);
const css=await readFile('style.css','utf8');const cssHash=createHash('sha256').update(css).digest('hex').slice(0,12);
let html=await readFile('index.html','utf8');html=html.replace('<script type="module" src="app.js"></script>',`<script defer src="app.${hash}.js"></script>`).replace('href="style.css"',`href="style.${cssHash}.css"`);
html=html.replace('<span id="app-version">開發版</span>',`<span id="app-version">版本 ${hash.slice(0,8)}</span>`);await writeFile('dist/index.html',html);await writeFile(`dist/app.${hash}.js`,js);await writeFile(`dist/style.${cssHash}.css`,css);await copyFile('scene.svg','dist/scene.svg');await writeFile('dist/.nojekyll','');console.log('Built versioned, self-contained browser bundle:',hash);
// Publish a separate visual experiment without changing the primary site or its saved data.
await mkdir('dist/fantasy-test/assets',{recursive:true});
const previewJs=js.replace("indexedDB.open('mosslight',1)","indexedDB.open('mosslight-fantasy-preview',1)").replaceAll("'#345b43'","'#71628e'").replaceAll('*94/12','*94/8').replaceAll('*.94/12','*.94/8').replace('Math.floor(position/11)*11','Math.floor(position/7)*7').replace('state.position-cameraStart>=11','state.position-cameraStart>=7');
const previewHash=createHash('sha256').update(previewJs).digest('hex').slice(0,12);
const theme=await readFile('fantasy-test/theme.css','utf8');const themeHash=createHash('sha256').update(theme).digest('hex').slice(0,12);
let preview=html.replace('<title>苔光之境 Mosslight — 像素冒險</title>','<title>苔光幻境 — 奇幻像素美術測試版</title>').replace(`href="style.${cssHash}.css"`,`href="../style.${cssHash}.css"`).replace('</head>',`<link rel="stylesheet" href="theme.${themeHash}.css"></head>`).replace(`src="app.${hash}.js"`,`src="app.${previewHash}.js"`).replace('苔光之境<small>','苔光幻境<small>').replace('MOSSLIGHT ADVENTURE','FANTASY PIXEL EDITION').replace('</header>','</header><div class="test-ribbon"><b>✦ 奇幻像素・美術測試版</b><span>測試資料獨立儲存</span><a href="../">返回正式版 ↗</a></div>').replace('YOUR NEXT LITTLE ADVENTURE','A NEW LOOK, A FAMILIAR ADVENTURE').replace('每一步，都是新的發現','在微光深處，展開奇幻旅程').replace('帶上好奇心，讓知識成為冒險的魔法。','紫藤垂落，精靈甦醒。循著石階，走進你的森林故事。').replace(`版本 ${hash.slice(0,8)}`,`美術測試版 ${previewHash.slice(0,8)}`);
await writeFile('dist/fantasy-test/index.html',preview);await writeFile(`dist/fantasy-test/app.${previewHash}.js`,previewJs);await writeFile(`dist/fantasy-test/theme.${themeHash}.css`,theme);
for(const asset of ['forest.png','hero.png','stone.png'])await copyFile(`fantasy-test/assets/${asset}`,`dist/fantasy-test/assets/${asset}`);
console.log('Built separate fantasy art preview: /fantasy-test/');
