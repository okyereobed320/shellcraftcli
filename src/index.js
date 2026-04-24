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

const program = new Command();

// Middleware for history and suggestion logic
function preActionHook(moduleName, actionName) {
  if (moduleName) {
    const fullCmd = actionName ? `${moduleName} ${actionName}` : moduleName;
    addHistory(`shellcraft ${fullCmd}`);
  }
}

program
  .name('shellcraft')
  .description('The open-source terminal-based training platform.')
  .version('0.1.0')
  .argument('[module]', 'Module to start (linux, networking, docker, git, cicd)')
  .argument('[action]', 'Action to perform (learn, quiz, sim)')
  .action(async (module, action) => {
    if (module && action) {
      preActionHook(module, action);
      if (action === 'learn') return await startHandbook(module);
      if (action === 'quiz') return await startQuiz(module);
      if (action === 'sim') return await startShift(module);
      console.log(COLORS.error(`\n Unknown action: "${action}" for module "${module}".`));
      return;
    } else if (module) {
      const knownCommands = ['linux', 'docker', 'networking', 'git', 'cicd', 'start', 'list', 'score', 'ai-setup', 'progress', 'mission', 'explain', 'history', 'replay'];
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
    ['linux', 'networking', 'docker', 'git', 'cicd'].forEach(m => {
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
    const modules = ['linux', 'networking', 'docker', 'git', 'cicd'];
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
  const known = ['linux', 'docker', 'networking', 'git', 'cicd', 'start', 'progress', 'mission', 'explain', 'history', 'replay'];
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
          { name: `🚀 ${COLORS.highlight('Start Training Session')}`, value: 'start' },
          { name: `🤖 ${COLORS.highlight('Chat with AI Tutor')}`, value: 'tutor' },
          { name: `📊 ${COLORS.highlight('View My Progress')}`, value: 'score' },
          { name: `📜 ${COLORS.highlight('Browse Learning Paths')}`, value: 'list' },
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

    if (mainAction === 'list') {
      console.clear();
      displayLogo();
      console.log(COLORS.highlight('Available Learning Modules:\n'));
      console.log(`${COLORS.warning(' • linux      ')} ${COLORS.highlight('(Basic Linux Mastery)')}`);
      console.log(`${COLORS.warning(' • networking ')} ${COLORS.highlight('(Modern Connectivity)')}`);
      console.log(`${COLORS.warning(' • docker     ')} ${COLORS.highlight('(Containerization)')}`);
      console.log(`${COLORS.warning(' • git        ')} ${COLORS.highlight('(Version Control System)')}`);
      console.log(`${COLORS.warning(' • cicd       ')} ${COLORS.highlight('(Automation & Pipelines)')}\n`);
      
      await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return...' }]);
      console.clear();
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

    if (mainAction === 'start') {
      console.clear();
      await runLearningSession();
    }
  }
}

async function runLearningSession() {
  displayLogo();
  const { module } = await inquirer.prompt([
    {
      type: 'list',
      name: 'module',
      message: 'Select a Module:',
      choices: [
        { name: COLORS.highlight('Linux (Basic Mastery)'), value: 'linux' },
        { name: COLORS.highlight('Networking (Connectivity)'), value: 'networking' },
        { name: COLORS.highlight('Docker (Containerization)'), value: 'docker' },
        { name: COLORS.highlight('Git (Version Control)'), value: 'git' },
        { name: COLORS.highlight('CI/CD (Automation)'), value: 'cicd' },
        new inquirer.Separator(),
        { name: `🏠 ${COLORS.muted('Back to Main Menu')}`, value: 'back' }
      ]
    }
  ]);

  if (module === 'back') return;

  const { category } = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Select Training Category:',
      choices: [
        { name: `📖 ${COLORS.highlight('Learn')}           (Step-by-Step Handbook)`, value: 'learn' },
        { name: `🎯 ${COLORS.highlight('Quiz')}            (Challenges & Missions)`, value: 'quiz' },
        { name: `💼 ${COLORS.highlight('Simulation')}      (Real-world Scenarios)`, value: 'simulation' },
        new inquirer.Separator(),
        { name: `↩️  ${COLORS.muted('Back to Module')}`, value: 'back' }
      ]
    }
  ]);

  if (category === 'back') return runLearningSession();

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

    if (learnAction === 'back') return runLearningSession();
    if (learnAction === 'search') {
      const { query } = await inquirer.prompt([{ type: 'input', name: 'query', message: 'Enter search term:' }]);
      await searchHandbook(query, module);
      return runLearningSession();
    }
    
    await startHandbook(module);
    return runLearningSession();
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

    if (quizMode === 'back') return runLearningSession();
    
    if (quizMode === 'missions') {
      await startMissions(module);
    } else {
      await startQuiz(module, quizMode);
    }
    return runLearningSession();
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

    if (simMode === 'back') return runLearningSession();
    if (simMode === 'shift') await startShift(module);
    return runLearningSession();
  }
}

program.parse();
