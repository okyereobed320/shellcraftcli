import inquirer from 'inquirer';
import Conf from 'conf';
import { PROVIDERS, askAI } from './ai.js';
import { COLORS, displayDivider } from '../utils/ui.js';

const config = new Conf({ projectName: 'shellcraft' });

export async function setupAI() {
  console.clear();
  console.log(COLORS.highlight('🤖 Shellcraft AI Setup'));
  displayDivider();
  console.log(COLORS.muted('Configure an AI provider to enable advanced learning features.'));

  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Choose AI Provider:',
      choices: [
        { name: PROVIDERS.gemini.name, value: 'gemini' },
        { name: PROVIDERS.openai_compatible.name, value: 'openai_compatible' },
        new inquirer.Separator(),
        { name: 'Cancel', value: 'cancel' }
      ]
    }
  ]);

  if (provider === 'cancel') return;

  const questions = [
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter API Key:',
      validate: (input) => input.length > 0 ? true : 'API Key is required.'
    }
  ];

  if (provider === 'openai_compatible') {
    questions.push({
      type: 'input',
      name: 'baseUrl',
      message: 'Base API URL (e.g. https://api.groq.com/openai):',
      default: 'https://api.groq.com/openai'
    });
    questions.push({
      type: 'input',
      name: 'model',
      message: 'Model ID (e.g. llama-3.3-70b-versatile):',
      default: PROVIDERS.openai_compatible.defaultModel
    });
  } else {
    questions.push({
      type: 'input',
      name: 'model',
      message: 'Model ID (e.g. gemini-1.5-flash):',
      default: PROVIDERS.gemini.defaultModel
    });
  }

  const answers = await inquirer.prompt(questions);
  
  config.set('ai', {
    provider,
    apiKey: answers.apiKey,
    baseUrl: answers.baseUrl,
    model: answers.model
  });

  console.log(`\n${COLORS.accent('✔ AI configuration saved!')}`);
  
  const { test } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'test',
      message: 'Would you like to test the connection?',
      default: true
    }
  ]);

  if (test) {
    console.log(COLORS.muted('\nTesting AI connection...'));
    try {
      const response = await askAI('Hello! Tell me in 1 sentence why Linux is great.');
      console.log(`\n${COLORS.highlight('AI Response:')} ${response}`);
      console.log(`\n${COLORS.accent('✔ AI is working correctly!')}`);
    } catch (error) {
      console.log(`\n${COLORS.error('✘ AI Test Failed:')} ${error.message}`);
      console.log(COLORS.muted('Please check your API key and network connection.'));
    }
    
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
  }
}
