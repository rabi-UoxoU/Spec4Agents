import * as fs from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {repositoryRoot} from '../scripts/build.mjs';
export async function fixture(t,{chapters=[{id:'one',source:'one.md',title:'第一章'}],texts={ 'one.md':'<a id="top"></a>\n\n## 正文\n\n中文内容。\n'}}={}){
 const root=await fs.mkdtemp(path.join(tmpdir(),'spec fixture '));t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.mkdir(path.join(root,'src'));
 await fs.writeFile(path.join(root,'src/chapters.json'),JSON.stringify({version:1,title:'文档 [标题] *示例*',chapters}));
 for(const [file,text] of Object.entries(texts)){const dest=path.resolve(root,'src',file);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,text);}
 await fs.cp(path.join(repositoryRoot,'skill'),path.join(root,'skill'),{recursive:true});
 await fs.writeFile(path.join(root,'skill/SKILL.md'),`---\nname: spec4agents\ndescription: Test fixture\n---\n\n# Spec\n\n${chapters.map(c=>`[${c.title}](references/${c.id}.md)`).join('\n')}\n`);
 const reference=await fs.readFile(path.join(repositoryRoot,'src/reference.md'),'utf8');const extraction=reference.slice(reference.indexOf('<!-- template:requirements.md:start -->'));
 // Canonical markers added to test source, outside rendered-document fixture tests.
 await fs.appendFile(path.join(root,'src',chapters[0].source),`\n${extraction}`);
 return root;
}
export const read=filename=>fs.readFile(filename,'utf8');
