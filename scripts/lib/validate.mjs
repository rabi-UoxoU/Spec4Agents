import {parseMarkdown,walk} from './documents.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
export function validateRendered(files){const anchors=new Map();
 for(const [file,body] of files){const ids=new Set();walk(parseMarkdown(body),n=>{if(n.type==='html')for(const m of n.value.matchAll(/<a\s+id=["']([^"']+)["']\s*>/g)){if(ids.has(m[1]))throw new Error(`${file}: duplicate output anchor ${m[1]}`);ids.add(m[1]);}});anchors.set(file,ids);}
 for(const [file,body] of files)walk(parseMarkdown(body),n=>{if(!['link','image','definition'].includes(n.type)||/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(n.url))return;
  const [target,fragment]=n.url.split('#');const resolved=target?path.posix.normalize(path.posix.join(path.posix.dirname(file),decodeURIComponent(target))):file;
  if(!anchors.has(resolved)||(fragment&&!anchors.get(resolved).has(decodeURIComponent(fragment))))throw new Error(`${file}:${n.position?.start.line}: missing output target ${n.url}`);
 });
}
export async function validateSkillPaths(directory){
 const entry=await fs.readFile(path.join(directory,'SKILL.md'),'utf8');const templateReadme=await fs.readFile(path.join(directory,'assets/templates/README.md'),'utf8');
 for(const [file,body] of [['SKILL.md',entry],['assets/templates/README.md',templateReadme]]){
  const targets=[];walk(parseMarkdown(body),n=>{if(n.type==='link'&&!/^(?:[a-z][a-z\d+.-]*:|#)/i.test(n.url))targets.push(n.url);});
  for(const target of targets)await fs.access(path.resolve(directory,path.dirname(file),target.split('#')[0]));
 }
}
