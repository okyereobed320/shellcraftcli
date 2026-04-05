import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to shuffle an array
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

import { addXP, XP_VALUES } from '../utils/progress.js';

const getLifeDisplay = (lives) => {
  if (lives <= 0) return chalk.red('Shell Life: 0');
  return chalk.red('Shell Life: ' + '◉ '.repeat(lives).trim());
};

export async function startQuiz(moduleName, mode = 'normal', preFilteredQuestions = null, onComplete = null) {
  try {
    let questions;
    if (preFilteredQuestions) {
      questions = preFilteredQuestions;
    } else {
      const dataPath = path.join(__dirname, '../../data', moduleName + '.json');
      const content = await fs.readFile(dataPath, 'utf-8');
      questions = JSON.parse(content);
    }

    // Mode-specific configuration
    const isXPMode = mode === 'xp_rank';
    const isLifeMode = mode === 'life';
    const isNormalMode = mode === 'normal';
    
    let lives = isLifeMode ? 3 : null;
    let isGameOver = false;

    console.log(chalk.cyan.bold(`\n🕹️  MODE: ${mode.toUpperCase().replace('_', ' ')}`));
    if (isLifeMode) console.log(getLifeDisplay(lives));
    console.log(chalk.gray('━'.repeat(50)));

    // UX: Randomize questions and pick a sample of 10
    shuffle(questions);
    if (questions.length > 10) questions = questions.slice(0, 10);

    let score = 0;
    let totalGainedXP = 0;
    
    for (const [index, q] of questions.entries()) {
      if (isGameOver) break;

      console.log(chalk.yellow(`\n[Question ${index + 1}/${questions.length}]`));
      
      const options = shuffle([...q.options]);

      try {
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'selected',
            message: q.question,
            choices: options
          }
        ]);

        if (answer.selected === q.answer) {
          console.log(chalk.green.bold('✔ Correct!'));
          score++;
          
          if (isXPMode || isLifeMode) { // XP also earned in Life mode? Usually yes in games.
            const xp = XP_VALUES[q.difficulty?.toLowerCase()] || XP_VALUES.easy;
            totalGainedXP += xp;
            console.log(chalk.yellow(`+${xp} XP`));
          }
        } else {
          console.log(chalk.red.bold('✘ Wrong. The correct answer was: ' + q.answer));
          
          if (isLifeMode) {
            lives--;
            console.log(getLifeDisplay(lives));
            if (lives <= 0) {
              console.log(chalk.red.bold('\n💀 Session failed. You ran out of Shell Life.'));
              isGameOver = true;
            }
          }
        }
        
        if (q.explanation) {
          console.log(chalk.italic.gray('  💡 ' + q.explanation));
        }
      } catch (promptError) {
        console.log(chalk.gray('\nQuiz session ended. Bye! 👋'));
        return;
      }
    }

    if (!isGameOver || score > 0) {
      console.log(chalk.gray('\n' + '━'.repeat(50)));
      console.log(chalk.cyan.bold(`🎉 Module complete! Your score: ${score}/${questions.length}`));

      if (totalGainedXP > 0 && (isXPMode || isLifeMode)) {
        const result = addXP(totalGainedXP);
        console.log(chalk.yellow(`Total XP Gained: ${totalGainedXP}`));
        if (result.rankUp) {
          console.log(chalk.bold.green('\n🌟 RANK UP!'));
          console.log(chalk.white(`New Rank: ${chalk.bold.magenta(result.newRank)}`));
          console.log(chalk.italic.cyan('🔥 You are getting dangerous with the terminal...'));
        }
      }
    }

    if (onComplete) {
      await onComplete(score, questions.length);
    }
    console.log('');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(chalk.red('Error: Module ' + moduleName + ' not found.'));
    } else {
      console.error(chalk.red('Error starting quiz:'), error.message);
    }
  }
}
