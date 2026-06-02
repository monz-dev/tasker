import fs from 'fs';
import path from 'path';

const skillsDir = 'C:\\Users\\User\\.gemini\\antigravity-cli\\skills';
const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('sdd-') && dirent.name !== '_shared' && dirent.name !== 'skill-registry')
    .map(dirent => dirent.name);

const registry = [];

for (const dir of dirs) {
    const skillPath = path.join(skillsDir, dir, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;
    
    const content = fs.readFileSync(skillPath, 'utf-8');
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const descMatch = content.match(/^description:\s*(.+)$/m);
    
    if (nameMatch && descMatch) {
        let name = nameMatch[1].replace(/["']/g, '');
        let desc = descMatch[1].replace(/["']/g, '');
        registry.push(`- **${name}**: ${desc} (Path: ${skillPath.replace(/\\/g, '/')})`);
    }
}

console.log(registry.join('\n'));
