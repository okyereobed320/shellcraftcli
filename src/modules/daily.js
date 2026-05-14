import inquirer from 'inquirer';
import fs from 'fs/promises';
import { COLORS, displayDivider, displayLogo, drawProgressBar } from '../utils/ui.js';
import { addXP, XP_VALUES } from '../utils/progress.js';
import { GROUPS, getDataPath } from '../utils/paths.js';

export async function startDailyChallenge() {
  console.clear();
  displayLogo();
  console.log(COLORS.warning.bold('⚡ DAILY QUICK-FIRE CHALLENGE ⚡'));
  console.log(COLORS.muted('60 seconds. as many as you can. let\'s go!\n'));

  const { ready } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ready',
      message: 'Ready to start?',
      default: true
    }
  ]);

  if (!ready) return;

  // Load questions from all core modules
  const coreModules = GROUPS.core;
  let allQuestions = [];
  
  for (const mod of coreModules) {
    try {
      const data = JSON.parse(await fs.readFile(getDataPath(mod), 'utf-8'));
      allQuestions = allQuestions.concat(data.map(q => ({ ...q, module: mod })));
    } catch (e) {}
  }

  // Shuffle
  allQuestions.sort(() => Math.random() - 0.5);

  let score = 0;
  let startTime = Date.now();
  const timeLimit = 60000; // 60 seconds
  let expired = false;

  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    const remaining = Math.max(0, Math.ceil((timeLimit - (Date.now() - startTime)) / 1000));
    
    if (remaining <= 0) {
      expired = true;
      break;
    }

    console.clear();
    console.log(COLORS.warning.bold(`⚡ TIME REMAINING: ${remaining}s`));
    console.log(drawProgressBar(remaining, 60, 40));
    displayDivider();
    console.log(`${COLORS.muted(`[Question ${i + 1}]`)} ${COLORS.highlight(q.module.toUpperCase())}`);

    const options = [...q.options].sort(() => Math.random() - 0.5);
    
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: COLORS.highlight(q.question),
        choices: options
      }
    ]);

    if (selected === q.answer) {
      score++;
      console.log(COLORS.accent(' ✔ Correct!'));
    } else {
      console.log(COLORS.error(' ✘ Incorrect!'));
    }

    if (Date.now() - startTime > timeLimit) {
      expired = true;
      break;
    }
  }

  console.clear();
  displayLogo();
  console.log(COLORS.warning.bold('⌛ TIME IS UP!'));
  displayDivider();
  console.log(`\n${COLORS.highlight('Final Score:')} ${COLORS.accent(score)} answers correct.`);
  
  const bonusXP = score * 5;
  addXP(bonusXP);
  console.log(COLORS.warning(` XP Gained: +${bonusXP}`));
  
  console.log('\n');
  await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return...' }]);
}
