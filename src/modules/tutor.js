import inquirer from 'inquirer';
import { askAI, isAIConfigured } from './ai.js';
import { COLORS, displayDivider, displayLogo } from '../utils/ui.js';

export async function startTutor() {
  if (!isAIConfigured()) {
    console.log(`\n${COLORS.error('✘ AI is not configured.')}`);
    console.log(COLORS.muted('Please go to "AI Settings" in the main menu to set up your free API key first.\n'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return...' }]);
    return;
  }

  console.clear();
  displayLogo();
  console.log(COLORS.secondary.bold('🤖 Welcome to the Shellcraft AI Tutor!'));
  console.log(COLORS.muted('Ask me anything about Linux, Docker, or Cloud Engineering.'));
  console.log(COLORS.muted('Type "exit" or "back" to return to the main menu.\n'));

  while (true) {
    const { question } = await inquirer.prompt([
      {
        type: 'input',
        name: 'question',
        message: COLORS.primary('You:'),
        validate: (input) => input.trim().length > 0 ? true : 'Please ask a question.'
      }
    ]);

    if (['exit', 'back', 'quit'].includes(question.toLowerCase().trim())) {
      break;
    }

    console.log(COLORS.muted('\nThinking...'));

    try {
      const systemPrompt = "You are the Shellcraft AI Tutor, an expert in Linux, Docker, and Cloud Engineering. Provide clear, educational, and concise answers. If a user asks something unrelated to tech, politely steer them back to Cloud Engineering.";
      const response = await askAI(question, systemPrompt);
      
      console.log(`\n${COLORS.secondary.bold('🤖 AI Tutor:')}`);
      console.log(COLORS.highlight(response));
      displayDivider();
      console.log('');
    } catch (error) {
      console.log(`\n${COLORS.error('✘ Error:')} ${error.message}`);
      break;
    }
  }
}
