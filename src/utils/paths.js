import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const GROUPS = {
  'core': ['linux', 'networking', 'git', 'docker', 'cicd', 'terraform'],
  'cloud-basics': ['cloud'],
  'devops': [], // Currently empty as per user mapping
  'cloud-platforms': ['aws/practitioner', 'aws/solutions-architect', 'gcp/ace', 'gcp/professional', 'azure/az900', 'azure/az104']
};

export function getModulePath(moduleName) {
  for (const [group, modules] of Object.entries(GROUPS)) {
    if (modules.includes(moduleName)) {
      return { group, path: moduleName };
    }
  }
  // Fallback/Backward compatibility
  return { group: 'core', path: moduleName };
}

export function getDataPath(moduleName) {
  const { group, path: modPath } = getModulePath(moduleName);
  return path.join(__dirname, `../../data/${group}/${modPath}.json`);
}

export function getHandbookPath(moduleName) {
  const { group, path: modPath } = getModulePath(moduleName);
  return path.join(__dirname, `../../data/${group}/handbook/${modPath}`);
}
