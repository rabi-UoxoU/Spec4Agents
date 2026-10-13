#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const help=`Usage: node init-spec.mjs feature-name --spec-type feature|bugfix
  --workflow-type requirements-first|design-first (Feature only)
  [--project-dir directory] [--template-dir directory] [--help]
Defaults: project directory is cwd; templates are located beside the installed Skill.`;
export function parseArgs(args){
 if(args.length===1&&args[0]==='--help')return {help:true};
 const options={};const allowed=new Set(['--spec-type','--workflow-type','--project-dir','--template-dir']);
 for(let i=0;i<args.length;i++){
  const arg=args[i];
  if(arg.startsWith('--')){if(!allowed.has(arg)||arg in options||!args[i+1]||args[i+1].startsWith('--'))throw new Error(`invalid or repeated option: ${arg}`);options[arg]=args[++i];}
  else if(options.name)throw new Error(`unexpected argument: ${arg}`);else options.name=arg;
 }
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.name??''))throw new Error('feature-name must be explicit kebab-case');
 if(!['feature','bugfix'].includes(options['--spec-type']))throw new Error('--spec-type must be feature or bugfix');
 if(options['--spec-type']==='feature'&&!['requirements-first','design-first'].includes(options['--workflow-type']))throw new Error('Feature requires --workflow-type requirements-first or design-first');
 if(options['--spec-type']==='bugfix'&&'--workflow-type' in options)throw new Error('Bugfix forbids --workflow-type');
 return options;
}
export async function initSpec(options,{io=fs,afterWrite=()=>{}}={}){
 const project=path.resolve(options['--project-dir']??process.cwd());
 if(!(await io.stat(project)).isDirectory())throw new Error(`project directory does not exist: ${project}`);
 const templates=path.resolve(options['--template-dir']??fileURLToPath(new URL('../assets/templates/',import.meta.url)));
 const bug=options['--spec-type']==='bugfix'; const first=bug?'bugfix.md':options['--workflow-type']==='design-first'?'design.md':'requirements.md';
 const names=[bug?'bugfix.md':'requirements.md','design.md','tasks.md']; const contents=new Map();
 for(const name of names){const file=path.join(templates,name===first?'':'pending',name);const body=await io.readFile(file,'utf8');contents.set(name,body.replaceAll('{{featureName}}',options.name));}
 const config={specId:randomUUID(),specType:options['--spec-type']};if(!bug)config.workflowType=options['--workflow-type'];
 const dirs=[]; const files=[];const target=path.join(project,'.agents','specs',options.name);
 try{
  for(const dir of [path.join(project,'.agents'),path.join(project,'.agents','specs')]){try{await io.mkdir(dir);dirs.push(dir);}catch(e){if(e.code!=='EEXIST')throw e;}}
  await io.mkdir(target);dirs.push(target);
  for(const [name,content] of [['.config.agent',JSON.stringify(config,null,2)+'\n'],...contents]){
   const file=path.join(target,name);const handle=await io.open(file,'wx',0o644);files.push(file);try{await handle.writeFile(content,'utf8');}finally{await handle.close();}await afterWrite(file);
  }
  return target;
 }catch(e){
  const remaining=[];for(const file of files.reverse())try{await io.unlink(file);}catch(err){remaining.push(`${file}: ${err.message}`);}
  for(const dir of dirs.reverse())try{await io.rmdir(dir);}catch(err){remaining.push(`${dir}: ${err.message}`);}
  throw new Error(`${e.message}${e.code==='EEXIST'?` (existing Spec will not be overwritten: ${target})`:''}${remaining.length?'\nUnremoved paths: '+remaining.join('\n'):''}`);
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 let options;try{options=parseArgs(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=2;}
 if(options){if(options.help)console.log(help);else try{console.log(await initSpec(options));}catch(e){console.error(e.message);process.exitCode=1;}}
}
