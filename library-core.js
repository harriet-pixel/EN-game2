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
