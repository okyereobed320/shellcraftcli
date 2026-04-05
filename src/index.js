import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { startQuiz } from './modules/quiz.js';
import { startMissions } from './modules/missions.js';
import { startShift } from './modules/shift.js';
import { getProgress } from './utils/progress.js';

const program = new Command();

program
  .name('shellcraft')
  .description('The open-source terminal-based training platform.')
  .version('0.1.0')
  .action(async () => {
    // Default action: Start interactive menu
    await interactiveMenu();
  });

async function interactiveMenu() {
  console.log(chalk.cyan.bold('\nWelcome to Shellcraft!'));
  console.log(chalk.gray('Your terminal-based path to mastery...\n'));

  while (true) {
    const { mainAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainAction',
        message: 'What would you like to do?',
        choices: [
          { name: '🚀 Start Learning Session', value: 'start' },
          { name: '🏆 View My Progress', value: 'score' },
          { name: '📜 List Available Modules', value: 'list' },
          { name: '👋 Exit Shellcraft', value: 'exit' }
        ]
      }
    ]);

    if (mainAction === 'exit') {
      console.log(chalk.gray('\nThanks for training with Shellcraft! See you soon. 👋\n'));
      process.exit(0);
    }

    if (mainAction === 'list') {
      console.log(chalk.green('\nAvailable Modules:'));
      console.log(chalk.yellow(' - linux   (Basic Linux Mastery)'));
      console.log(chalk.gray(' - docker  (Coming Soon)'));
      console.log(chalk.gray(' - git     (Coming Soon)\n'));
      continue;
    }

    if (mainAction === 'score') {
      const { xp, rank, completedMissions } = getProgress();
      console.log(chalk.cyan('\n🏆 Your Progress:'));
      console.log(chalk.white(' - XP:        ' + chalk.yellow(xp)));
      console.log(chalk.white(' - Rank:      ' + chalk.magenta(rank)));
      console.log(chalk.white(' - Missions:  ' + chalk.green(completedMissions.length + ' completed')) + '\n');
      continue;
    }

    if (mainAction === 'start') {
      await runLearningSession();
    }
  }
}

async function runLearningSession() {
  const { module } = await inquirer.prompt([
    {
      type: 'list',
      name: 'module',
      message: 'Select a Module:',
      choices: [
        { name: 'Linux (Basic Mastery)', value: 'linux' },
        { name: 'Docker (Coming Soon)', value: 'docker', disabled: true }
      ]
    }
  ]);

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select Game Mode:',
      choices: [
        { name: 'Normal Mode           (Standard Quiz)', value: 'normal' },
        { name: 'Shellcraft XP Rank    (Earn XP & Rank Up)', value: 'xp_rank' },
        { name: 'Shellcraft Life       (3 Lives Survival)', value: 'life' },
        { name: 'Shellcraft Missions   (Mission Path)', value: 'missions' },
        { name: 'Shellcraft Shift      (On Duty Simulation)', value: 'shift' }
      ]
    }
  ]);

  while (true) {
    if (mode === 'shift') {
      await startShift(module);
    } else if (mode === 'missions') {
      await startMissions(module);
    } else {
      await startQuiz(module, mode);
    }

    const { postAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'postAction',
        message: 'Session Complete! What now?',
        choices: [
          { name: 'Try this session again', value: 'again' },
          { name: 'Change Module or Mode', value: 'change' },
          { name: 'Back to Main Menu', value: 'menu' }
        ]
      }
    ]);

    if (postAction === 'again') continue;
    if (postAction === 'change') return runLearningSession();
    if (postAction === 'menu') return;
  }
}

program
  .command('start')
  .description('Start a learning session directly')
  .argument('[module]', 'Module to start (e.g., linux, docker)', 'linux')
  .action(async (module) => {
    // If user explicitly runs 'start', we can still offer the loop
    const normalizedModule = module.toLowerCase();
    
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Select Game Mode:',
        choices: [
          { name: 'Normal Mode           (Standard Quiz)', value: 'normal' },
          { name: 'Shellcraft XP Rank    (Earn XP & Rank Up)', value: 'xp_rank' },
          { name: 'Shellcraft Life       (3 Lives Survival)', value: 'life' },
          { name: 'Shellcraft Missions   (Mission Path)', value: 'missions' },
          { name: 'Shellcraft Shift      (On Duty Simulation)', value: 'shift' }
        ]
      }
    ]);

    if (mode === 'shift') {
      await startShift(normalizedModule);
    } else if (mode === 'missions') {
      await startMissions(normalizedModule);
    } else {
      await startQuiz(normalizedModule, mode);
    }
    
    // After direct start, we could also go to the interactive menu
    await interactiveMenu();
  });

program
  .command('list')
  .description('List available learning modules')
  .action(() => {
    console.log(chalk.green('\nAvailable Modules:'));
    console.log(chalk.yellow(' - linux   (Basic Linux Mastery)'));
    console.log(chalk.gray(' - docker  (Coming Soon)'));
    console.log(chalk.gray(' - git     (Coming Soon)\n'));
  });

program
  .command('score')
  .description('View your current progress and scores')
  .action(() => {
    const { xp, rank, completedMissions } = getProgress();
    console.log(chalk.cyan('\n🏆 Your Progress:'));
    console.log(chalk.white(' - XP:        ' + chalk.yellow(xp)));
    console.log(chalk.white(' - Rank:      ' + chalk.magenta(rank)));
    console.log(chalk.white(' - Missions:  ' + chalk.green(completedMissions.length + ' completed')) + '\n');
  });

program.parse();
