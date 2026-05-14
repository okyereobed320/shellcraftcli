import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS, displayHeader, displayDivider } from '../utils/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mocked Registry Data
const REGISTRY = [
  {
    id: 'terraform-advanced',
    name: 'Advanced Terraform Labs',
    author: 'IaC_Expert',
    description: 'Master Workspace management, State locking, and Custom Providers.',
    price: 0,
    type: 'skill-path',
    downloads: 150
  },
  {
    id: 'k8s-mastery',
    name: 'Kubernetes Mastery 2024',
    author: 'CloudGuru_Obed',
    description: 'Deep dive into K8s Pods, Services, and Deployments.',
    price: 0,
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
  }
];

export async function startMarketplace() {
  console.clear();
  displayHeader('SHELLCRAFT MARKETPLACE', COLORS.primary);
  console.log(COLORS.muted(' Expand your deck with community-contributed mastery tracks.\n'));

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Marketplace Operations:',
        choices: [
          { name: ' 🌐 Browse Official Registry', value: 'browse' },
          { name: ' 🔗 Import from URL (Remote)', value: 'import' },
          { name: ' 🛠️  Create New Course (Wizard)', value: 'scaffold' },
          { name: ' 📦 My Installed Syllabi', value: 'installed' },
          { name: ' 🚀 How to Publish/Share', value: 'guide' },
          new inquirer.Separator(),
          { name: ' ↩️  Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (action === 'back') break;

    if (action === 'browse') {
      await browseCourses();
    } else if (action === 'import') {
      await importFromURL();
    } else if (action === 'scaffold') {
      await createCourseScaffold();
    } else if (action === 'installed') {
      await listInstalled();
    } else if (action === 'guide') {
      await showPublishingGuide();
    }
  }
}

async function importFromURL() {
  console.clear();
  displayHeader('REMOTE IMPORT ENGINE', COLORS.market);
  console.log(COLORS.muted(' Enter a direct link to a course ZIP or JSON manifest.\n'));

  const { url } = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Direct Source URL:',
      validate: (input) => input.startsWith('http') ? true : 'Please enter a valid URL.'
    }
  ]);

  console.log(`\n ${COLORS.primary('●')} Initializing handshake with remote source...`);
  console.log(COLORS.muted(' [ This feature requires automated extraction tools ]'));
  
  // Note: In a full implementation, we'd use node-fetch and a zip library.
  // For this deck version, we provide the interactive flow and logic.
  console.log(COLORS.warning('\n ! VERIFICATION PENDING: System is ready to receive stream.'));
  console.log(COLORS.muted(' To finish this import, ensure the remote source is a valid Shellcraft Package.'));
  
  await inquirer.prompt([{ type: 'input', name: 'c', message: '\nPress Enter to return...' }]);
}

async function showPublishingGuide() {
  console.clear();
  displayHeader('PUBLISHING & SHARING PROTOCOLS', COLORS.secondary);
  
  console.log(COLORS.highlight(' Choose your preferred way to share knowledge:\n'));

  const options = [
    ` 1. ${COLORS.accent('THE OPEN SOURCE WAY')} (GitHub PR)`,
    `    Fork our repo, add your folder to ${COLORS.muted('data/community/')}, and submit a PR.`,
    '',
    ` 2. ${COLORS.accent('THE REMOTE WAY')} (Direct Link)`,
    `    Host your course ZIP on GitHub/S3 and give the URL to other operators.`,
    '',
    ` 3. ${COLORS.accent('THE MANUAL WAY')} (Drag-and-Drop)`,
    `    Share your course folder directly. Users just drop it into ${COLORS.muted('data/community/')}.`,
    '',
    ` 4. ${COLORS.accent('THE BUILDER WAY')} (Scaffolding Wizard)`,
    '    Use our internal Wizard to generate a perfect structure instantly.',
  ].join('\n');

  console.log(options);
  console.log(`\n${COLORS.muted('──────────────────────────────────────────────────────────────')}`);
  await inquirer.prompt([{ type: 'input', name: 'c', message: 'Press Enter to return...' }]);
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
    
    // Sample Quiz Data
    const sampleQuiz = [
      {
        question: "Which command is used to manage multiple environments in Terraform?",
        options: ["terraform env", "terraform workspace", "terraform stage", "terraform switch"],
        answer: "terraform workspace",
        difficulty: "medium",
        explanation: "Terraform workspaces allow you to manage multiple states for the same configuration."
      }
    ];

    // Sample Handbook Data
    const sampleHandbook = {
      title: "Advanced Workspaces",
      content: [
        {
          title: "Introduction to Workspaces",
          text: "Workspaces allow you to manage separate state files for the same configuration directory. This is useful for Dev/Staging/Prod environments."
        }
      ]
    };
    
    await fs.writeFile(path.join(communityDir, 'quiz.json'), JSON.stringify(sampleQuiz, null, 2));
    await fs.writeFile(path.join(communityDir, 'handbook/01_intro.json'), JSON.stringify(sampleHandbook, null, 2));
    
    console.log(`${COLORS.primary(' [2/2] ')} Registering module...`);
    console.log(COLORS.accent(`\n ✅ SUCCESS: MASTERY_TRK :: ${course.name.toUpperCase()} registered!`));
    console.log(COLORS.muted(` You can now access this via: SHELLCRAFT_SYLLABI sector.`));
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

async function createCourseScaffold() {
  console.clear();
  displayHeader('COURSE CREATION WIZARD', COLORS.secondary);
  console.log(COLORS.highlight(' Let\'s scaffold your new mastery track!\n'));

  const answers = await inquirer.prompt([
    { type: 'input', name: 'id', message: 'Course ID (lowercase-no-spaces):', default: 'my-new-course' },
    { type: 'input', name: 'name', message: 'Course Name:', default: 'Mastering X' },
    { type: 'input', name: 'author', message: 'Author Name:', default: 'Engineer' },
    { type: 'input', name: 'description', message: 'Short Description:', default: 'Learn how to...' }
  ]);

  const targetDir = path.join(process.cwd(), answers.id);
  
  try {
    await fs.mkdir(targetDir, { recursive: true });
    await fs.mkdir(path.join(targetDir, 'handbook'), { recursive: true });

    const manifest = {
      id: answers.id,
      name: answers.name,
      author: answers.author,
      description: answers.description,
      version: '1.0.0',
      type: 'skill-path'
    };

    const quiz = [
      {
        question: "Sample Question?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A",
        difficulty: "easy",
        explanation: "This is why Option A is correct."
      }
    ];

    const lesson = {
      title: "Introduction to " + answers.name,
      content: [
        {
          title: "Chapter 1",
          text: "Start writing your professional training content here."
        }
      ]
    };

    await fs.writeFile(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    await fs.writeFile(path.join(targetDir, 'quiz.json'), JSON.stringify(quiz, null, 2));
    await fs.writeFile(path.join(targetDir, 'handbook/01_intro.json'), JSON.stringify(lesson, null, 2));

    console.log(`\n${COLORS.accent('✔ SUCCESS:')} Course scaffold created at ${COLORS.highlight('./' + answers.id)}`);
    console.log(COLORS.muted('\nNext Steps:'));
    console.log('1. Edit the JSON files with your real content.');
    console.log('2. Test it locally by copying the folder to data/community/.');
    console.log('3. ZIP the folder and share it with the community!');
  } catch (err) {
    console.log(COLORS.error('\n✘ Scaffolding failed: ' + err.message));
  }
  
  await inquirer.prompt([{ type: 'input', name: 'c', message: '\nPress Enter to return...' }]);
}
