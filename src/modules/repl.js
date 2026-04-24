import readline from 'readline';
import { startHandbook } from './handbook.js';
import { startQuiz } from './quiz.js';
import { startShift } from './shift.js';
import { COLORS, displayHeader } from '../utils/ui.js';
import { addHistory } from '../utils/progress.js';

export async function startModuleREPL(moduleName) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: COLORS.accent(`[${moduleName} mode] > `)
  });

  console.clear();
  displayHeader(`${moduleName.toUpperCase()} INTERACTIVE TRAINING`, COLORS.primary);
  console.log(COLORS.muted(' Available actions: learn, quiz, sim, exit\n'));
  
  rl.prompt();

  rl.on('line', async (line) => {
    const action = line.trim().toLowerCase();

    if (action === 'exit' || action === 'back') {
      rl.close();
      return;
    }

    if (!action) {
      rl.prompt();
      return;
    }

    addHistory(`${moduleName} ${action}`);

    try {
      if (action === 'learn') {
        rl.pause();
        await startHandbook(moduleName);
        rl.resume();
      } else if (action === 'quiz') {
        rl.pause();
        await startQuiz(moduleName);
        rl.resume();
      } else if (action === 'sim') {
        rl.pause();
        await startShift(moduleName);
        rl.resume();
      } else {
        console.log(COLORS.error(` Unknown action: "${action}". Try learn, quiz, or sim.`));
      }
    } catch (err) {
      console.error(COLORS.error('\nError:'), err.message);
    }

    console.log('\n');
    rl.prompt();
  }).on('close', () => {
    console.log(COLORS.muted('\nReturning to main menu...'));
  });
}
