#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadManifest,loadDocuments} from './lib/manifest.mjs';
import {indexLinks,validateLinks,renderMerged,renderReference} from './lib/documents.mjs';
import {assembleSkill,archiveSkill,commitOutputs} from './lib/artifacts.mjs';
import {validateRendered,validateSkillPaths} from './lib/validate.mjs';
export const repositoryRoot=fileURLToPath(new URL('../',import.meta.url));
export async function build(target='all',{root=repositoryRoot,beforeArchive=()=>{},beforeCommit=()=>{},beforeRename=()=>{},rename=fs.rename}={}){
 if(!['all','markdown','skill','check'].includes(target))throw new Error(`unknown target: ${target}`);
 const dist=path.join(root,'dist');await fs.mkdir(dist,{recursive:true});const lock=path.join(dist,'.build-lock');let stage;let preserve=false;
 try{await fs.mkdir(lock);}catch(e){throw new Error(`${lock}: build already running or interrupted; inspect lock and .stage-* backups before removing remnants (${e.message})`);}
 try{
  const remnants=(await fs.readdir(dist)).filter(n=>n.startsWith('.stage-'));if(remnants.length)throw new Error(`interrupted build remnants: ${remnants.join(', ')}; inspect backups before retrying`);
  stage=await fs.mkdtemp(path.join(dist,'.stage-'));const manifest=await loadManifest(root);const documents=await loadDocuments(manifest,path.join(root,'src'));const index=indexLinks(documents);validateLinks(documents,index);
  const names=[];
  if(target!=='skill'){
   const body=renderMerged(documents,index,manifest);validateRendered(new Map([['AGENTS.md',body]]));await fs.mkdir(path.join(stage,'markdown'));await fs.writeFile(path.join(stage,'markdown/AGENTS.md'),body);names.push('markdown');
  }
  if(target!=='markdown'){
   const references=new Map(documents.map(d=>[d.outputName,renderReference(d,index)]));validateRendered(references);const assembled=path.join(stage,'skill/spec4agents');await assembleSkill(root,assembled,documents,references);await validateSkillPaths(assembled);if(target!=='check'){await beforeArchive();await archiveSkill(assembled,path.join(stage,'skill/SKILL.spec4agents.tgz'));}names.push('skill');
  }
  if(target!=='check'){await beforeCommit();await commitOutputs(dist,stage,names,{beforeRename,rename});}
 }catch(e){preserve=!!e.preserveStage;throw new Error(`${e.message}\nBuild failed; any restored/existing outputs belong to the previous successful build.`);}
 finally{if(!preserve){if(stage)await fs.rm(stage,{recursive:true,force:true});await fs.rmdir(lock);}}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build(process.argv[2]??'all').then(()=>console.log('Build/check complete')).catch(e=>{console.error(e.message);process.exitCode=1;});
