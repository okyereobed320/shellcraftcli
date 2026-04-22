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
import { COLORS, displayDivider } from '../utils/ui.js';
import { askAI, isAIConfigured } from './ai.js';

const getLifeDisplay = (lives) => {
  if (lives <= 0) return COLORS.error('Shell Life: 0');
  return COLORS.error('Shell Life: ' + '◉ '.repeat(lives).trim());
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

    console.log(COLORS.highlight(`\n🕹️  MODE: ${mode.toUpperCase().replace('_', ' ')}`));
    if (isLifeMode) console.log(getLifeDisplay(lives));
    displayDivider();

    // UX: Randomize questions and pick a sample of 10
    shuffle(questions);
    if (questions.length > 10) questions = questions.slice(0, 10);

    let score = 0;
    let totalGainedXP = 0;
    
    for (const [index, q] of questions.entries()) {
      if (isGameOver) break;

      console.log(`${COLORS.warning(`\n[Question ${index + 1}/${questions.length}]`)} ${COLORS.highlight(q.difficulty?.toUpperCase() || 'EASY')}`);
      
      const options = shuffle([...q.options]);

      try {
        const { selected } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selected',
            message: COLORS.highlight(q.question),
            choices: options
          }
        ]);

        if (selected === q.answer) {
          console.log(COLORS.accent.bold(' ✔ Correct!'));
          score++;
          
          if (isXPMode || isLifeMode) {
            const xp = XP_VALUES[q.difficulty?.toLowerCase()] || XP_VALUES.easy;
            totalGainedXP += xp;
            console.log(COLORS.warning(` +${xp} XP`));
          }
        } else {
          console.log(COLORS.error.bold(' ✘ Incorrect.'));
          console.log(COLORS.muted('   Correct Answer: ') + COLORS.highlight(q.answer));
          
          if (isLifeMode) {
            lives--;
            console.log(getLifeDisplay(lives));
            if (lives <= 0) {
              console.log(COLORS.error.bold('\n💀 Session failed. You ran out of Shell Life.'));
              isGameOver = true;
            }
          }

          if (isAIConfigured() && !isGameOver) {
            const { explain } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'explain',
                message: COLORS.primary('Would you like an AI explanation?'),
                default: false
              }
            ]);

            if (explain) {
              console.log(COLORS.muted('   Consulting the Shellcraft Mentor...'));
              try {
                const prompt = `Question: ${q.question}\nOptions: ${q.options.join(', ')}\nCorrect Answer: ${q.answer}\nUser chose an incorrect answer. Explain why the correct answer is right and why it matters in Linux/Cloud Engineering. Keep it concise (2-3 sentences).`;
                const explanation = await askAI(prompt);
                console.log(`\n${COLORS.secondary.bold(' 🤖 AI MENTOR:')}`);
                console.log(COLORS.highlight(`   ${explanation}\n`));
              } catch (aiError) {
                console.log(COLORS.error(`   Failed to get AI explanation: ${aiError.message}`));
              }
            }
          }
        }
        
        if (q.explanation) {
          console.log(COLORS.muted('   💡 ' + q.explanation));
        }
      } catch (promptError) {
        console.log(COLORS.muted('\nQuiz session ended. Bye! 👋'));
        return;
      }
    }

    if (!isGameOver || score > 0) {
      displayDivider();
      console.log(COLORS.primary.bold(`\n🎉 Module complete! Your score: ${score}/${questions.length}`));

      if (totalGainedXP > 0 && (isXPMode || isLifeMode)) {
        const result = addXP(totalGainedXP);
        console.log(COLORS.warning(` Total XP Gained: ${totalGainedXP}`));
        if (result.rankUp) {
          console.log(COLORS.accent.bold('\n🌟 RANK UP!'));
          console.log(`${COLORS.highlight(' New Rank: ')}${COLORS.secondary.bold(result.newRank)}`);
          console.log(COLORS.muted(' 🔥 You are getting dangerous with the terminal...'));
        }
      }
    }

    if (onComplete) {
      await onComplete(score, questions.length);
    }
    
    console.log('');
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return to menu...' }]);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(chalk.red('Error: Module ' + moduleName + ' not found.'));
    } else {
      console.error(chalk.red('Error starting quiz:'), error.message);
    }
  }
}
