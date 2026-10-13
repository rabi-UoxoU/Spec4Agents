import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyArchive} from './lib/artifacts.mjs';
import {validateRendered,validateSkillPaths} from './lib/validate.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
try{
 const body=await fs.readFile(path.join(root,'dist/markdown/AGENTS.md'),'utf8');if(!body.trim())throw new Error('empty AGENTS.md');validateRendered(new Map([['AGENTS.md',body]]));
 const skill=path.join(root,'dist/skill/spec4agents');const refs=new Map();for(const name of await fs.readdir(path.join(skill,'references')))refs.set(name,await fs.readFile(path.join(skill,'references',name),'utf8'));validateRendered(refs);await validateSkillPaths(skill);
 await verifyArchive(path.join(root,'dist/skill/SKILL.spec4agents.tgz'),skill);console.log('Verified Markdown and unpacked Skill');
}catch(e){console.error(e.message);process.exitCode=1;}
