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

export async function startQuiz(moduleName) {
  try {
    const dataPath = path.join(__dirname, '../../data', moduleName + '.json');
    const content = await fs.readFile(dataPath, 'utf-8');
    let questions = JSON.parse(content);

    // UX: Randomize questions and pick a sample of 10
    shuffle(questions);
    if (questions.length > 10) questions = questions.slice(0, 10);

    let score = 0;
    
    for (const [index, q] of questions.entries()) {
      console.log(chalk.yellow('\n[Question ' + (index + 1) + '/' + questions.length + ']'));
      
      // UX: Shuffle options for each question
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
        } else {
          console.log(chalk.red.bold('✘ Wrong. The correct answer was: ' + q.answer));
        }
        
        if (q.explanation) {
          console.log(chalk.italic('💡 ' + q.explanation));
        }
      } catch (promptError) {
        // Handle Ctrl+C or other prompt issues gracefully
        console.log(chalk.gray('\nQuiz session ended. Bye! 👋'));
        return;
      }
    }

    console.log(chalk.cyan.bold('\n🎉 Module complete! Your score: ' + score + '/' + questions.length + '\n'));
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(chalk.red('Error: Module ' + moduleName + ' not found.'));
    } else {
      console.error(chalk.red('Error starting quiz:'), error.message);
    }
  }
}
