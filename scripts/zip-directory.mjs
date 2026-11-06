import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {crc32,deflateRawSync} from 'node:zlib';
export async function zipDirectory(source,destination){
 const entries=[];async function walk(folder,prefix=''){for(const item of (await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const name=prefix+item.name;if(item.isDirectory())await walk(join(folder,item.name),name+'/');else if(item.isFile())entries.push({name,data:await readFile(join(folder,item.name))})}}await walk(source);
 if(entries.length>65535)throw Error('ZIP entry limit exceeded');const parts=[],directory=[];let offset=0;
 for(const entry of entries){const name=Buffer.from(entry.name,'utf8'),compressed=deflateRawSync(entry.data),method=compressed.length<entry.data.length?8:0,payload=method?compressed:entry.data,sum=crc32(entry.data);if(payload.length>0xffffffff||entry.data.length>0xffffffff)throw Error('ZIP file too large');
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(method,8);local.writeUInt16LE(33,12);local.writeUInt32LE(sum,14);local.writeUInt32LE(payload.length,18);local.writeUInt32LE(entry.data.length,22);local.writeUInt16LE(name.length,26);
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(method,10);central.writeUInt16LE(33,14);central.writeUInt32LE(sum,16);central.writeUInt32LE(payload.length,20);central.writeUInt32LE(entry.data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);
  parts.push(local,name,payload);directory.push(central,name);offset+=local.length+name.length+payload.length;
 }
 const central=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);await mkdir(dirname(destination),{recursive:true});await writeFile(destination,Buffer.concat([...parts,central,end]));return entries.length;
}
