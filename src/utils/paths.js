import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const GROUPS = {
  'core': ['linux', 'networking', 'git', 'docker', 'cicd', 'terraform'],
  'cloud-basics': ['cloud'],
  'devops': [], 
  'cloud-platforms': ['aws/practitioner', 'aws/solutions-architect', 'gcp/ace', 'gcp/professional', 'azure/az900', 'azure/az104'],
  'community': [] // Dynamically installed modules
};

export function getModulePath(moduleName) {
  // Check if it's a community module (installed from marketplace)
  if (moduleName.startsWith('community/')) {
    return { group: 'community', path: moduleName.replace('community/', '') };
  }

  for (const [group, modules] of Object.entries(GROUPS)) {
    if (modules.includes(moduleName)) {
      return { group, path: moduleName };
    }
  }

  // Handle provider/track format (e.g. gcp/ace)
  if (moduleName.includes('/')) {
    return { group: 'cloud-platforms', path: moduleName };
  }

  // Fallback to core
  return { group: 'core', path: moduleName };
}

export async function getInstalledModules() {
  const communityPath = path.join(__dirname, '../../data/community');
  try {
    const files = await fs.readdir(communityPath, { withFileTypes: true });
    return files.filter(f => f.isDirectory()).map(f => f.name);
  } catch (err) {
    return [];
  }
}

export function getDataPath(moduleName) {
  const { group, path: modPath } = getModulePath(moduleName);
  if (group === 'community') {
    return path.join(__dirname, `../../data/community/${modPath}/quiz.json`);
  }
  return path.join(__dirname, `../../data/${group}/${modPath}.json`);
}

export function getHandbookPath(moduleName) {
  const { group, path: modPath } = getModulePath(moduleName);
  if (group === 'community') {
    return path.join(__dirname, `../../data/community/${modPath}/handbook`);
  }
  return path.join(__dirname, `../../data/${group}/handbook/${modPath}`);
}
