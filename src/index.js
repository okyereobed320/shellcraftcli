import { Command } from 'commander';
import chalk from 'chalk';
import { startQuiz } from './modules/quiz.js';

const program = new Command();

program
  .name('shellcraft')
  .description('The open-source terminal-based training platform.')
  .version('0.1.0');

program
  .command('start')
  .description('Start a learning session')
  .argument('[module]', 'Module to start (e.g., linux, docker)', 'linux')
  .action(async (module) => {
    const normalizedModule = module.toLowerCase();
    console.log(chalk.blue.bold('\n🚀 Starting Shellcraft: ' + normalizedModule.toUpperCase() + ' module\n'));
    await startQuiz(normalizedModule);
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
    console.log(chalk.cyan('\n🏆 Your Progress:'));
    console.log(chalk.white(' - Not available in MVP (Coming Soon)\n'));
  });

program.parse();
