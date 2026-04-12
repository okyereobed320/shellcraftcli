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

const program = new Command();

program
  .name('shellcraft')
  .description('The open-source terminal-based training platform.')
  .version('0.1.0')
  .action(async () => {
    const progress = getProgress();
    
    if (progress.isFirstRun) {
      await displayFirstRun();
      setFirstRunComplete();
    }
    
    await interactiveMenu();
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
      console.log(`${COLORS.muted(' • docker     ')} ${COLORS.muted('(Coming Soon)')}`);
      console.log(`${COLORS.muted(' • git    ')} ${COLORS.muted('(Coming Soon)')}\n`);
      
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
        { name: COLORS.muted('Docker (Coming Soon)'), value: 'docker', disabled: true }
      ]
    }
  ]);

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

program
  .command('start')
  .description('Start a learning session directly')
  .argument('[module]', 'Module to start (e.g., linux, docker)', 'linux')
  .action(async (module) => {
    const normalizedModule = module.toLowerCase();
    displayLogo();
    
    const { category } = await inquirer.prompt([
      {
        type: 'list',
        name: 'category',
        message: 'Select Training Category:',
        choices: [
          { name: `📖 ${COLORS.highlight('Learn')}           (Step-by-Step Handbook)`, value: 'learn' },
          { name: `🎯 ${COLORS.highlight('Quiz')}            (Challenges & Missions)`, value: 'quiz' },
          { name: `💼 ${COLORS.highlight('Simulation')}      (Real-world Scenarios)`, value: 'simulation' }
        ]
      }
    ]);

    if (category === 'learn') {
      await startHandbook(normalizedModule);
      return interactiveMenu();
    }

    let mode = null;
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
            { name: `🗺️  ${COLORS.highlight('Shellcraft Missions')}   (Mission Path)`, value: 'missions' }
          ]
        }
      ]);
      mode = quizMode;
    }

    if (category === 'simulation') {
      const { simMode } = await inquirer.prompt([
        {
          type: 'list',
          name: 'simMode',
          message: 'Select Simulation:',
          choices: [
            { name: `💼 ${COLORS.highlight('Shellcraft Shift')}      (On Duty Simulation)`, value: 'shift' }
          ]
        }
      ]);
      mode = simMode;
    }

    if (mode === 'shift') {
      await startShift(normalizedModule);
    } else if (mode === 'missions') {
      await startMissions(normalizedModule);
    } else {
      await startQuiz(normalizedModule, mode);
    }
    
    await interactiveMenu();
  });

program
  .command('list')
  .description('List available learning modules')
  .action(async () => {
    displayLogo();
    console.log(COLORS.highlight('Available Learning Modules:\n'));
    console.log(`${COLORS.warning(' • linux      ')} ${COLORS.highlight('(Basic Linux Mastery)')}`);
    console.log(`${COLORS.warning(' • networking ')} ${COLORS.highlight('(Modern Connectivity)')}`);
    console.log(`${COLORS.muted(' • docker     ')} ${COLORS.muted('(Coming Soon)')}`);
    console.log(`${COLORS.muted(' • git    ')} ${COLORS.muted('(Coming Soon)')}\n`);
  });

program
  .command('score')
  .description('View your current progress and scores')
  .action(() => {
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
  });

program
  .command('ai-setup')
  .description('Configure AI provider (Gemini, Groq, etc.)')
  .action(async () => {
    await setupAI();
  });

program.parse();
