export function folderName(state,value,previous=null){
 const name=String(value??'').trim().slice(0,40);
 if(!name)throw Error('請輸入資料夾名稱。');
 if(['全部','未分類'].includes(name))throw Error('這是系統保留名稱，請使用其他名稱。');
 if(name!==previous&&state.folders.includes(name))throw Error('此資料夾名稱已存在。');
 return name;
}
export function renameFolder(state,previous,value){
 const index=state.folders.indexOf(previous);if(index<0)throw Error('找不到這個資料夾。');
 const name=folderName(state,value,previous);state.folders[index]=name;
 state.questions.forEach(q=>{if(q.folder===previous)q.folder=name});
 state.disabledFolders=(state.disabledFolders||[]).map(f=>f===previous?name:f);
 return name;
}
export function removeFolder(state,name){
 const index=state.folders.indexOf(name);if(index<0)throw Error('找不到這個資料夾。');
 state.folders.splice(index,1);state.disabledFolders=(state.disabledFolders||[]).filter(f=>f!==name);
 let moved=0;state.questions.forEach(q=>{if(q.folder===name){q.folder='';moved++}});return moved;
}
export function moveFolder(state,name,delta){
 const index=state.folders.indexOf(name),target=index+delta;
 if(!Number.isInteger(delta)||Math.abs(delta)!==1||index<0||target<0||target>=state.folders.length)return false;
 [state.folders[index],state.folders[target]]=[state.folders[target],state.folders[index]];return true;
}

export const questionTypes=['image','choice','true-false'];
export function questionType(q){return q?.type==='choice'||q?.type==='true-false'?q.type:'image'}
export function enabledQuestionTypes(state){return Array.isArray(state.enabledQuestionTypes)?questionTypes.filter(t=>state.enabledQuestionTypes.includes(t)):['image']}
export function validateTypedQuestion(q){
 if(!String(q.prompt||'').trim())throw Error('題目不可空白');
 if(questionType(q)==='choice'){
  const options=q.options||{};if(['A','B','C','D'].filter(k=>String(options[k]||'').trim()).length<2)throw Error('選擇題須有 2～4 個非空選項');
  if(!['A','B','C','D'].includes(q.answer)||!String(options[q.answer]||'').trim())throw Error('正確答案須為 A～D 且指向非空選項');
 }else if(questionType(q)==='true-false'&&!['TRUE','FALSE'].includes(q.answer))throw Error('是非題答案須為 TRUE 或 FALSE');
 return q;
}
export function isCorrectAnswer(q,answer){try{validateTypedQuestion(q)}catch{return false}return questionType(q)!=='image'&&answer===q.answer}

// RFC-style quoted fields, including embedded CRLF and escaped quotes; physical row numbers survive.
export function parseQuestionCSV(source){
 const text=String(source).replace(/^\uFEFF/,''),rows=[];let fields=[],value='',quoted=false,closed=false,line=1,start=1;
 const row=()=>{rows.push({line:start,fields:[...fields,value]});fields=[];value='';closed=false;start=line+1};
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){value+='"';i++}else{quoted=false;closed=true}}else{value+=c;if(c==='\n')line++}continue}
  if(c==='"'){if(value||closed)throw Error('第 '+line+' 列引號格式錯誤');quoted=true}
  else if(c===','){fields.push(value);value='';closed=false}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row();line++;start=line}
  else{if(closed)throw Error('第 '+line+' 列引號後含多餘字元');value+=c}
 }
 if(quoted)throw Error('第 '+start+' 列引號未結束');if(value||fields.length||closed)row();return rows;
}
export function questionCSVTemplate(type){
 const rows=type==='choice'?[['題目','選項A','選項B','選項C','選項D','正確答案'],['#說明：保留標題列；填寫2～4個非空選項；答案填A～D並對應非空選項；以#說明開頭的列不匯入。','','','','','']]:[['題目','正確答案'],['#說明：保留標題列；題目不可空白；答案填TRUE或FALSE；以#說明開頭的列不匯入。','']];
 return '\uFEFF'+rows.map(row=>row.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
}
export function inspectQuestionCSV(source,type){
 if(!['choice','true-false'].includes(type))throw Error('不支援的題型');
 const rows=parseQuestionCSV(source).filter(r=>r.fields.some(v=>v.trim())),header=rows.shift();
 const expected=type==='choice'?['題目','選項A','選項B','選項C','選項D','正確答案']:['題目','正確答案'];
 if(!header||header.fields.length!==expected.length||header.fields.some((v,i)=>v.trim()!==expected[i]))throw Error('欄位須依序為：'+expected.join('、'));
 const questions=[],errors=[];
 for(const row of rows){if(row.fields[0].trim().startsWith('#說明'))continue;
  try{if(row.fields.length!==expected.length)throw Error('欄位數不符');const f=row.fields.map(v=>v.trim()),q={type,title:f[0].slice(0,100),prompt:f[0],answer:f.at(-1).toUpperCase(),image:'',folder:''};if(type==='choice')q.options=Object.fromEntries(['A','B','C','D'].map((k,i)=>[k,f[i+1]]));validateTypedQuestion(q);questions.push(q)}catch(error){errors.push({line:row.line,message:error.message})}
 }
 return {questions,errors};
}
export function appendQuestionCSV(state,inspection,folder='',makeId=()=>crypto.randomUUID()){
 // Never replace or normalize pre-existing questions, folders, activation or progress.
 const additions=inspection.questions.map(q=>({...structuredClone(q),id:makeId(),folder}));state.questions.push(...additions);return additions.length;
}
