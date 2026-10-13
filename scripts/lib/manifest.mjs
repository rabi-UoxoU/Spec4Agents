import {readFile, realpath} from 'node:fs/promises';
import path from 'node:path';
export async function loadManifest(root) {
 const file=path.join(root,'src/chapters.json'); let manifest;
 try { manifest=JSON.parse(await readFile(file,'utf8')); } catch(e) { throw new Error(`${file}: ${e.message}`); }
 const single=v=>typeof v==='string' && v.trim() && !/[\r\n]/.test(v);
 if(manifest.version!==1 || !single(manifest.title) || !Array.isArray(manifest.chapters) || !manifest.chapters.length) throw new Error(`${file}: invalid version/title/chapters`);
 const ids=new Set();
 for(const [i,c] of manifest.chapters.entries()) {
  if(!c || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id??'') || !single(c.title) || typeof c.source!=='string' || !c.source) throw new Error(`${file}: chapters[${i}] invalid id/source/title`);
  if(ids.has(c.id)) throw new Error(`${file}: chapters[${i}] duplicate id ${c.id}`); ids.add(c.id);
 }
 return manifest;
}
export async function loadDocuments(manifest, directory) {
 return Promise.all(manifest.chapters.map(async c=>{
  const sourcePath=path.resolve(directory,c.source);
  try {return {...c,sourcePath,canonicalPath:await realpath(sourcePath),text:await readFile(sourcePath,'utf8'),outputName:`${c.id}.md`};}
  catch(e){throw new Error(`${sourcePath}: chapter ${c.id}: ${e.message}`);}
 }));
}
