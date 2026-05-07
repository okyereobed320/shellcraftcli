import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS, displayHeader, displayDivider } from '../utils/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mocked Registry Data (In production, this would be an API call)
const REGISTRY = [
  {
    id: 'k8s-mastery',
    name: 'Kubernetes Mastery 2024',
    author: 'CloudGuru_Obed',
    description: 'Deep dive into K8s Pods, Services, and Deployments.',
    price: 0, // Free
    type: 'certification',
    downloads: 1240
  },
  {
    id: 'aws-security-pro',
    name: 'AWS Security Professional',
    author: 'SecurityFirst_Labs',
    description: 'Master AWS IAM, KMS, and Shield for the Pro exam.',
    price: 24.99,
    type: 'pro-cert',
    downloads: 450
  },
  {
    id: 'python-for-devops',
    name: 'Python for DevOps Engineers',
    author: 'AutomationWizard',
    description: 'Learn Boto3, Paramiko, and OS scripting for automation.',
    price: 9.99,
    type: 'skill-path',
    downloads: 890
  }
];

export async function startMarketplace() {
  console.clear();
  displayHeader('SHELLCRAFT MARKETPLACE', COLORS.primary);
  console.log(COLORS.muted(' Browse and install community-contributed courses.\n'));

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Marketplace Menu:',
        choices: [
          { name: '🌐 Browse All Courses', value: 'browse' },
          { name: '🛠️  Post Your Own Course (Developer)', value: 'post' },
          { name: '📦 Installed Modules', value: 'installed' },
          new inquirer.Separator(),
          { name: '↩️  Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (action === 'back') break;

    if (action === 'browse') {
      await browseCourses();
    } else if (action === 'post') {
      await postCourseGuide();
    } else if (action === 'installed') {
      await listInstalled();
    }
  }
}

async function browseCourses() {
  const choices = REGISTRY.map(c => ({
    name: `${c.name.padEnd(30)} | ${c.price === 0 ? chalk.green('FREE') : chalk.yellow('$' + c.price)} | By: ${c.author}`,
    value: c
  }));

  const { course } = await inquirer.prompt([
    {
      type: 'list',
      name: 'course',
      message: 'Select a course for details:',
      choices: [...choices, new inquirer.Separator(), { name: '↩️  Back', value: null }]
    }
  ]);

  if (!course) return;

  console.clear();
  displayHeader(course.name.toUpperCase(), COLORS.accent);
  console.log(`${COLORS.muted('Author:')}      ${course.author}`);
  console.log(`${COLORS.muted('Type:')}        ${course.type}`);
  console.log(`${COLORS.muted('Downloads:')}   ${course.downloads}`);
  console.log(`${COLORS.muted('Description:')} ${course.description}\n`);
  
  if (course.price > 0) {
    console.log(COLORS.warning(' 💰 This is a PAID course.'));
  }

  const { intent } = await inquirer.prompt([
    {
      type: 'list',
      name: 'intent',
      message: 'Action:',
      choices: [
        { name: course.price === 0 ? '⬇️  Install Now' : '🛒 Buy and Install', value: 'install' },
        { name: '↩️  Cancel', value: 'cancel' }
      ]
    }
  ]);

  if (intent === 'install') {
    if (course.price > 0) {
      console.log(`\n${COLORS.highlight(' Redirecting to Stripe for payment...')}`);
      console.log(COLORS.muted(` [URL: https://checkout.shellcraft.io/buy/${course.id}]`));
      console.log(COLORS.warning('\n (This is a foundation demo. Payment integration coming soon!)'));
    } else {
      await installModule(course);
    }
    await inquirer.prompt([{ type: 'input', name: 'c', message: 'Press Enter to continue...' }]);
  }
}

async function installModule(course) {
  const communityDir = path.join(__dirname, `../../data/community/${course.id}`);
  
  console.log(`\n${COLORS.primary(' [1/2] ')} Downloading artifacts for ${course.id}...`);
  await new Promise(r => setTimeout(resolve => r(), 1000));
  
  try {
    await fs.mkdir(communityDir, { recursive: true });
    await fs.mkdir(path.join(communityDir, 'handbook'), { recursive: true });
    
    // Creating dummy files to simulate installation
    await fs.writeFile(path.join(communityDir, 'quiz.json'), '[]');
    await fs.writeFile(path.join(communityDir, 'handbook/01_intro.json'), '[]');
    
    console.log(`${COLORS.primary(' [2/2] ')} Registering module...`);
    console.log(COLORS.success(`\n ✅ SUCCESS: ${course.name} installed!`));
    console.log(COLORS.muted(` You can now access this via: /community ${course.id}`));
  } catch (err) {
    console.log(COLORS.error(`\n ✘ Installation failed: ${err.message}`));
  }
}

async function listInstalled() {
  const communityPath = path.join(__dirname, '../../data/community');
  try {
    const dirs = await fs.readdir(communityPath);
    if (dirs.length === 0) {
      console.log(COLORS.muted('\n No community modules installed yet.\n'));
    } else {
      console.log(`\n${COLORS.primary(' Installed Modules:')}`);
      dirs.forEach(d => console.log(` • ${COLORS.highlight(d)}`));
      console.log('');
    }
  } catch {
    console.log(COLORS.muted('\n No community modules installed yet.\n'));
  }
  await inquirer.prompt([{ type: 'input', name: 'c', message: 'Press Enter to continue...' }]);
}

async function postCourseGuide() {
  console.clear();
  displayHeader('PUBLISH TO MARKETPLACE', COLORS.secondary);
  console.log(COLORS.highlight(' Share your knowledge with the Shellcraft community!\n'));
  console.log(' To post a course, follow these steps:');
  console.log(` 1. Create a ${COLORS.accent('manifest.json')} following our schema.`);
  console.log(' 2. Zip your data folder (quizzes + handbooks).');
  console.log(' 3. Submit your PR to our registry repository or use our dev portal.');
  console.log(`\n${COLORS.muted(' (Coming Soon: One-command publish "shellcraft marketplace publish")')}\n`);
  await inquirer.prompt([{ type: 'input', name: 'c', message: 'Press Enter to return...' }]);
}
