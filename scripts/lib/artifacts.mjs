import * as fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {parse as parseYaml} from 'yaml';
import {tmpdir} from 'node:os';
export const run=(command,args,options={})=>new Promise((resolve,reject)=>{
 const child=spawn(command,args,{stdio:['ignore','pipe','pipe'],...options});const chunks=[];let errors='';child.stdout.on('data',c=>chunks.push(c));child.stderr.on('data',c=>errors+=c);child.on('error',reject);child.on('close',code=>code===0?resolve(Buffer.concat(chunks)):reject(new Error(`${command} exited ${code}: ${errors}`)));
});
export async function fileMap(directory){const entries=[];
 async function visit(base,rel=''){for(const name of (await fs.readdir(base)).sort()){
  const full=path.join(base,name),key=rel?`${rel}/${name}`:name;const stat=await fs.lstat(full);
  if(stat.isDirectory())await visit(full,key);else if(stat.isFile())entries.push([key,(await fs.readFile(full)).toString('base64'),!!(stat.mode&0o111)]);else throw new Error(`unexpected artifact type: ${full}`);
 }}await visit(directory);return entries;
}
export async function normalizeModes(directory){await fs.chmod(directory,0o755);for(const name of await fs.readdir(directory)){const full=path.join(directory,name);const stat=await fs.stat(full);if(stat.isDirectory())await normalizeModes(full);else await fs.chmod(full,name==='init-spec.mjs'?0o755:0o644);}}
export async function verifyArchive(archive,assembled,{tar=process.env.GNU_TAR??'tar'}={}){
 const scratch=await fs.mkdtemp(path.join(tmpdir(),'spec4agents-unpack-'));
 try{await run(tar,['-xzf',archive,'-C',scratch]);if(JSON.stringify(await fs.readdir(scratch))!==JSON.stringify(['spec4agents']))throw new Error('archive must contain only spec4agents/');
  const actual=await fileMap(path.join(scratch,'spec4agents'));const expected=await fileMap(assembled);if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('archive path/content/executable mismatch');
 }finally{await fs.rm(scratch,{recursive:true,force:true});}
}
export async function archiveSkill(skillDirectory,archive,options={}){
 const tar=options.tar??process.env.GNU_TAR??'tar';const raw=await run(tar,['--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','--format=gnu','-cf','-','-C',path.dirname(skillDirectory),'spec4agents']);
 const tarFile=archive+'.tar';await fs.writeFile(tarFile,raw);
 try{const compressed=await run(options.gzip??'gzip',['-n','-c',tarFile]);await fs.writeFile(archive,compressed);await verifyArchive(archive,skillDirectory,{tar});}finally{await fs.rm(tarFile,{force:true});}
}
export function extractTemplates(documents){const result=new Map();for(const name of ['requirements.md','design.md','tasks.md','bugfix.md']){
 const start=`<!-- template:${name}:start -->`,end=`<!-- template:${name}:end -->`;
 const sources=documents.map(d=>d.text).join('\n');if(sources.split(start).length!==2 || sources.split(end).length!==2)throw new Error(`template marker missing or repeated: ${name}`);
 const segment=sources.slice(sources.indexOf(start)+start.length,sources.indexOf(end)).trim();const match=/^(`{3,})markdown\n([\s\S]*)\n\1$/.exec(segment);if(!match)throw new Error(`invalid fenced template: ${name}`);result.set(name,match[2]+'\n');
 }return result;
}
export async function assembleSkill(root,out,documents,references){
 await fs.mkdir(out,{recursive:true});
 for(const rel of ['SKILL.md','scripts/init-spec.mjs','assets/templates/.config.agent','assets/templates/README.md',...['requirements.md','design.md','tasks.md','bugfix.md'].map(n=>`assets/templates/pending/${n}`)]){
  const destination=path.join(out,rel);await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(path.join(root,'skill',rel),destination);
 }
 const entry=await fs.readFile(path.join(out,'SKILL.md'),'utf8');
 const frontmatter=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(entry);let metadata;
 try{metadata=frontmatter?parseYaml(frontmatter[1]):null;}catch(e){throw new Error(`invalid SKILL.md frontmatter: ${e.message}`);}
 if(metadata?.name!=='spec4agents'||typeof metadata.description!=='string'||!metadata.description.trim())throw new Error('SKILL.md requires name: spec4agents and description frontmatter');
 if(entry.split('\n').length>500)console.error('Warning: SKILL.md exceeds suggested 500 lines');
 for(const [name,body] of extractTemplates(documents))await fs.writeFile(path.join(out,'assets/templates',name),body);
 await fs.mkdir(path.join(out,'references'),{recursive:true});for(const [name,body] of references)await fs.writeFile(path.join(out,'references',name),body);
 await normalizeModes(out);
}
export async function commitOutputs(dist,stage,names,{beforeRename=()=>{},rename=fs.rename}={}){
 const backups=[],installed=[];
 try{
  for(const name of names){const dest=path.join(dist,name),backup=path.join(stage,`backup-${name}`);try{await rename(dest,backup);backups.push([dest,backup]);}catch(e){if(e.code!=='ENOENT')throw e;}}
  for(const name of names){await beforeRename(name);const dest=path.join(dist,name);await rename(path.join(stage,name),dest);installed.push(dest);}
 }catch(e){try{for(const dest of installed.reverse())await fs.rm(dest,{recursive:true,force:true});for(const [dest,backup] of backups.reverse())await rename(backup,dest);}catch(recovery){const error=new Error(`${e.message}; rollback failed: ${recovery.message}. Inspect and recover backups at ${stage}`);error.preserveStage=true;throw error;}throw e;}
}
