import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { startQuiz } from './modules/quiz.js';
import { startMissions } from './modules/missions.js';
import { startShift } from './modules/shift.js';
import { startHandbook } from './modules/handbook.js';
import { searchHandbook } from './modules/search.js';
import { setupAI } from './modules/setup_ai.js';
import { startTutor } from './modules/tutor.js';
import { getProgress, setFirstRunComplete, setName } from './utils/progress.js';
import { COLORS, displayWelcome, displayDivider, displayLogo } from './utils/ui.js';

import { startModuleREPL } from './modules/repl.js';
import { explainCommand } from './modules/explain.js';
import { showHistory } from './modules/history.js';
import { addHistory, getHistory } from './utils/progress.js';
import { GROUPS } from './utils/paths.js';

const program = new Command();

// Middleware for history and suggestion logic
function preActionHook(moduleName, actionName) {
  if (moduleName) {
    const fullCmd = actionName ? `${moduleName} ${actionName}` : moduleName;
    addHistory(`shellcraft ${fullCmd}`);
  }
}

const handleAction = async (module, action) => {
  if (action === 'learn') return await startHandbook(module);
  if (action === 'quiz') return await startQuiz(module);
  if (action === 'sim' || action === 'simulation') return await startShift(module);
  return await startModuleREPL(module);
};

program
  .name('shellcraft')
  .description('The open-source terminal-based training platform.')
  .version('0.1.0')
  .argument('[module]', 'Module to start (linux, networking, docker, git, cicd, terraform, cloud)')
  .argument('[action]', 'Action to perform (learn, quiz, sim)')
  .action(async (module, action) => {
    if (module && action) {
      preActionHook(module, action);
      return await handleAction(module, action);
    } else if (module) {
      const knownGroups = ['core', 'cloud-basics', 'devops', 'cloud-platforms'];
      if (knownGroups.includes(module)) return; // Handled by subcommands

      const knownCommands = ['linux', 'docker', 'networking', 'git', 'cicd', 'terraform', 'cloud', 'start', 'list', 'score', 'ai-setup', 'progress', 'mission', 'explain', 'history', 'replay'];
      if (!knownCommands.includes(module)) {
        return await startModuleREPL(module);
      }
    }

    const progress = getProgress();
    if (progress.isFirstRun) {
      await displayFirstRun();
      setFirstRunComplete();
    }
    await interactiveMenu();
  });

// Core Engineering Group
program
  .command('core')
  .description('Core Engineering modules')
  .argument('<module>', 'Module (linux, networking, git, docker, cicd, terraform)')
  .argument('[action]', 'Action (learn, quiz, sim)')
  .action(async (module, action) => {
    preActionHook('core', `${module} ${action || ''}`);
    await handleAction(module, action);
  });

// Cloud Engineering Basics Group
program
  .command('cloud-basics')
  .description('Cloud Engineering Basics')
  .argument('[action]', 'Action (learn, quiz, sim)')
  .action(async (action) => {
    preActionHook('cloud-basics', action);
    await handleAction('cloud', action);
  });

// Cloud Platforms Group
const cloudPlatforms = program.command('cloud-platforms').description('Cloud Platforms (AWS, GCP, Azure)');

['aws', 'gcp', 'azure'].forEach(provider => {
  const providerCmd = cloudPlatforms.command(provider);
  const tracks = {
    aws: ['practitioner', 'solutions-architect'],
    gcp: ['ace', 'professional'],
    azure: ['az900', 'az104']
  };

  tracks[provider].forEach(track => {
    providerCmd
      .command(track)
      .argument('[action]', 'Action (learn, quiz, sim)')
      .action(async (action) => {
        const modulePath = `${provider}/${track}`;
        preActionHook('cloud-platforms', `${provider} ${track} ${action || ''}`);
        await handleAction(modulePath, action);
      });
  });
});

program
  .command('start')
  .description('Start interactive mode for a module')
  .argument('<module>', 'Module to start (e.g., linux, docker)')
  .action(async (module) => {
    preActionHook('start', module);
    await startModuleREPL(module);
  });

program
  .command('progress')
  .description('View your current training progress')
  .action(() => {
    preActionHook('progress');
    const { xp, rank, completedMissions, name, handbookProgress } = getProgress();
    displayLogo();
    console.log(COLORS.highlight(`🏆 ${name}'s Training Progress:\n`));
    console.log(`${COLORS.muted('XP Total:      ')} ${COLORS.warning(xp)}`);
    console.log(`${COLORS.muted('Current Rank:  ')} ${COLORS.secondary.bold(rank)}`);
    console.log(`${COLORS.muted('Missions:      ')} ${COLORS.accent(completedMissions.length + ' completed')}`);
    
    console.log(`\n${COLORS.primary.bold('Module Completion:')}`);
    ['linux', 'networking', 'docker', 'git', 'cicd', 'terraform', 'cloud'].forEach(m => {
      const keys = Object.keys(handbookProgress).filter(k => k.startsWith(m));
      const status = keys.length > 0 ? COLORS.accent(`${keys.length} chapters started`) : COLORS.muted('Not started');
      console.log(`${COLORS.muted(` • ${m.padEnd(12)}: `)} ${status}`);
    });
    console.log('');
    });

    program
    .command('mission')
    .description('Start a specific mission by name')
    .argument('<name>', 'Name of the mission')
    .action(async (name) => {
    preActionHook('mission', name);
    const modules = ['linux', 'networking', 'docker', 'git', 'cicd', 'terraform', 'cloud'];
    const targetMod = modules.find(m => name.toLowerCase().includes(m)) || 'linux';
    await startMissions(targetMod);
    });


program
  .command('explain')
  .description('Explain a CLI command or flag')
  .argument('<cmd>', 'Command to explain')
  .action(async (cmd) => {
    preActionHook('explain', cmd);
    await explainCommand(cmd);
  });

program
  .command('history')
  .description('Show command history')
  .action(() => {
    preActionHook('history');
    showHistory();
  });

program
  .command('replay')
  .description('Replay a command from history by ID')
  .argument('<id>', 'History ID')
  .action(async (id) => {
    const history = getHistory();
    const entry = history.find(h => h.id === parseInt(id));
    if (entry) {
      console.log(COLORS.accent(`\n Replaying: ${entry.command}`));
      const cmdStr = entry.command.replace('shellcraft ', '');
      const parts = cmdStr.split(' ');
      if (parts.length === 2) {
        const [mod, act] = parts;
        if (act === 'learn') await startHandbook(mod);
        if (act === 'quiz') await startQuiz(mod);
        if (act === 'sim') await startShift(mod);
      } else {
        await startModuleREPL(parts[0]);
      }
    } else {
      console.log(COLORS.error(` History ID ${id} not found.`));
    }
  });

program.on('command:*', function () {
  const attempted = program.args[0];
  const known = ['linux', 'docker', 'networking', 'git', 'cicd', 'terraform', 'cloud', 'start', 'progress', 'mission', 'explain', 'history', 'replay'];
  const suggestion = known.find(k => k.startsWith(attempted.slice(0, 3)));
  console.error(COLORS.error(`\n Invalid command: "${attempted}"`));
  if (suggestion) console.log(COLORS.muted(` Did you mean "shellcraft ${suggestion}"?\n`));
  process.exit(1);
});


async function displayFirstRun() {
  displayLogo();
  console.log(COLORS.highlight(' Hello! I\'m Shellcraft, your personal Cloud Engineering mentor.'));
  console.log(COLORS.muted(' I\'m here to help you master the Linux terminal, Docker, and beyond.\n'));
  
  console.log(COLORS.primary.bold(' What I can do for you:'));
  console.log(`${COLORS.accent(' •')} ${COLORS.highlight('Interactive Quizzes:')} Test your terminal knowledge in real-time.`);
  console.log(`${COLORS.accent(' •')} ${COLORS.highlight('Mission Paths:')} Follow structured learning paths to mastery.`);
  console.log(`${COLORS.accent(' •')} ${COLORS.highlight('On-Duty Simulations:')} Experience real-world scenarios.`);
  console.log(`${COLORS.accent(' •')} ${COLORS.highlight('XP & Ranks:')} Earn points and level up as you learn.\n`);

  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What should I call you?',
      default: 'Operator',
      validate: (input) => {
        if (input.trim().length === 0) return 'Please enter a name.';
        return true;
      }
    }
  ]);
  
  setName(name);
  console.log(`\n${COLORS.highlight(`Great to meet you, ${name}! Let's get started.`)}\n`);

  await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ready',
      message: 'Ready to start your journey?',
      default: true
    }
  ]);
  console.clear();
}

async function interactiveMenu() {
  while (true) {
    const progress = getProgress();
    displayWelcome(progress);

    const { mainAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainAction',
        message: 'Where would you like to focus today?',
        pageSize: 10,
        choices: [
          { name: `🏗️  ${COLORS.highlight('Core Engineering')}`, value: 'core' },
          { name: `☁️  ${COLORS.highlight('Cloud Engineering Basics')}`, value: 'cloud-basics' },
          { name: `♾️  ${COLORS.highlight('DevOps Pipeline')}`, value: 'devops' },
          { name: `🌐 ${COLORS.highlight('Cloud Platforms')}`, value: 'cloud-platforms' },
          new inquirer.Separator(),
          { name: `🤖 ${COLORS.highlight('Chat with AI Tutor')}`, value: 'tutor' },
          { name: `📊 ${COLORS.highlight('View My Progress')}`, value: 'score' },
          { name: `⚙️  ${COLORS.highlight('AI Settings')}`, value: 'ai' },
          new inquirer.Separator(),
          { name: `👋 ${COLORS.muted('Exit Shellcraft')}`, value: 'exit' }
        ]
      }
    ]);

    if (mainAction === 'exit') {
      console.log(`\n${COLORS.muted('Thanks for training with')} ${COLORS.primary.bold('Shellcraft')}${COLORS.muted('! See you soon. 👋\n')}`);
      process.exit(0);
    }

    if (mainAction === 'ai') {
      await setupAI();
      continue;
    }

    if (mainAction === 'tutor') {
      await startTutor();
      continue;
    }

    if (mainAction === 'score') {
      console.clear();
      displayLogo();
      const { xp, rank, completedMissions, badges, name } = getProgress();
      console.log(COLORS.highlight(`🏆 ${name}'s Professional Standing:\n`));
      console.log(`${COLORS.muted('XP Total:      ')} ${COLORS.warning(xp)}`);
      console.log(`${COLORS.muted('Current Rank:  ')} ${COLORS.secondary.bold(rank)}`);
      console.log(`${COLORS.muted('Missions:      ')} ${COLORS.accent(completedMissions.length + ' completed')}`);
      console.log(`${COLORS.muted('Badges Earned: ')} ${COLORS.primary(badges.length)}\n`);
      
      if (badges.length > 0) {
        console.log(COLORS.muted('Badges: ') + badges.map(b => COLORS.accent(`🛡️  ${b.toUpperCase()}`)).join(' '));
      }

      displayDivider();
      console.log(COLORS.muted('\n Keep training to reach the next rank!\n'));
      
      await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return...' }]);
      console.clear();
      continue;
    }

    if (['core', 'cloud-basics', 'devops', 'cloud-platforms'].includes(mainAction)) {
      console.clear();
      await runGroupSession(mainAction);
    }
  }
}

async function runGroupSession(group) {
  displayLogo();
  const groupNames = {
    'core': 'Core Engineering',
    'cloud-basics': 'Cloud Engineering Basics',
    'devops': 'DevOps Pipeline',
    'cloud-platforms': 'Cloud Platforms'
  };

  console.log(COLORS.primary.bold(`\n📁 ${groupNames[group].toUpperCase()}\n`));

  let moduleChoices = [];
  if (group === 'core') {
    moduleChoices = [
      { name: COLORS.highlight('Linux (Basic Mastery)'), value: 'linux' },
      { name: COLORS.highlight('Networking (Connectivity)'), value: 'networking' },
      { name: COLORS.highlight('Git (Version Control)'), value: 'git' },
      { name: COLORS.highlight('Docker (Containerization)'), value: 'docker' },
      { name: COLORS.highlight('CI/CD (Automation)'), value: 'cicd' },
      { name: COLORS.highlight('Terraform (IaC)'), value: 'terraform' }
    ];
  } else if (group === 'cloud-basics') {
    return await runLearningSession('cloud');
  } else if (group === 'devops') {
    console.log(COLORS.muted(' (DevOps specific modules coming soon...)'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return...' }]);
    return;
  } else if (group === 'cloud-platforms') {
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select a Cloud Provider:',
        choices: [
          { name: COLORS.highlight('AWS (Amazon Web Services)'), value: 'aws' },
          { name: COLORS.highlight('GCP (Google Cloud Platform)'), value: 'gcp' },
          { name: COLORS.highlight('Azure (Microsoft Azure)'), value: 'azure' },
          new inquirer.Separator(),
          { name: `🏠 ${COLORS.muted('Back')}`, value: 'back' }
        ]
      }
    ]);
    if (provider === 'back') return;

    const tracks = {
      aws: [
        { name: 'AWS Certified Cloud Practitioner', value: 'aws/practitioner' },
        { name: 'AWS Certified Solutions Architect', value: 'aws/solutions-architect' }
      ],
      gcp: [
        { name: 'GCP Associate Cloud Engineer (ACE)', value: 'gcp/ace' },
        { name: 'GCP Professional Cloud Architect', value: 'gcp/professional' }
      ],
      azure: [
        { name: 'Azure Fundamentals (AZ-900)', value: 'azure/az900' },
        { name: 'Azure Administrator (AZ-104)', value: 'azure/az104' }
      ]
    };

    const { track } = await inquirer.prompt([
      {
        type: 'list',
        name: 'track',
        message: 'Select a Track:',
        choices: [...tracks[provider], new inquirer.Separator(), { name: `🏠 ${COLORS.muted('Back')}`, value: 'back' }]
      }
    ]);
    if (track === 'back') return runGroupSession(group);
    return await runLearningSession(track);
  }

  const { module } = await inquirer.prompt([
    {
      type: 'list',
      name: 'module',
      message: 'Select a Module:',
      choices: [...moduleChoices, new inquirer.Separator(), { name: `🏠 ${COLORS.muted('Back')}`, value: 'back' }]
    }
  ]);

  if (module === 'back') return;
  await runLearningSession(module);
}

async function runLearningSession(module) {
  const { category } = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: `Training for ${module.toUpperCase()}:`,
      choices: [
        { name: `📖 ${COLORS.highlight('Learn')}           (Step-by-Step Handbook)`, value: 'learn' },
        { name: `🎯 ${COLORS.highlight('Quiz')}            (Challenges & Missions)`, value: 'quiz' },
        { name: `💼 ${COLORS.highlight('Simulation')}      (Real-world Scenarios)`, value: 'simulation' },
        new inquirer.Separator(),
        { name: `↩️  ${COLORS.muted('Back')}`, value: 'back' }
      ]
    }
  ]);

  if (category === 'back') return;

  if (category === 'learn') {
    const { learnAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'learnAction',
        message: 'Learn Mode:',
        choices: [
          { name: `📖 ${COLORS.highlight('Browse Chapters')}`, value: 'browse' },
          { name: `🔍 ${COLORS.highlight('Search Concepts')}`, value: 'search' },
          { name: `↩️  ${COLORS.muted('Back')}`, value: 'back' }
        ]
      }
    ]);

    if (learnAction === 'back') return runLearningSession(module);
    if (learnAction === 'search') {
      const { query } = await inquirer.prompt([{ type: 'input', name: 'query', message: 'Enter search term:' }]);
      await searchHandbook(query, module);
      return runLearningSession(module);
    }
    
    await startHandbook(module);
    return runLearningSession(module);
  }

  if (category === 'quiz') {
    const { quizMode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'quizMode',
        message: 'Select Quiz Mode:',
        choices: [
          { name: `🎯 ${COLORS.highlight('Normal Mode')}           (Standard Quiz)`, value: 'normal' },
          { name: `⭐ ${COLORS.highlight('Shellcraft XP Rank')}    (Earn XP & Rank Up)`, value: 'xp_rank' },
          { name: `❤️  ${COLORS.highlight('Shellcraft Life')}       (3 Lives Survival)`, value: 'life' },
          { name: `🗺️  ${COLORS.highlight('Shellcraft Missions')}   (Mission Path)`, value: 'missions' },
          new inquirer.Separator(),
          { name: `↩️  ${COLORS.muted('Back')}`, value: 'back' }
        ]
      }
    ]);

    if (quizMode === 'back') return runLearningSession(module);
    
    if (quizMode === 'missions') {
      await startMissions(module);
    } else {
      await startQuiz(module, quizMode);
    }
    return runLearningSession(module);
  }

  if (category === 'simulation') {
    const { simMode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'simMode',
        message: 'Select Simulation:',
        choices: [
          { name: `💼 ${COLORS.highlight('Shellcraft Shift')}      (On Duty Simulation)`, value: 'shift' },
          new inquirer.Separator(),
          { name: `↩️  ${COLORS.muted('Back')}`, value: 'back' }
        ]
      }
    ]);

    if (simMode === 'back') return runLearningSession(module);
    if (simMode === 'shift') await startShift(module);
    return runLearningSession(module);
  }
}


program.parse();
