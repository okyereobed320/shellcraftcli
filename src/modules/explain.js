import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { askAI, isAIConfigured } from './ai.js';
import { COLORS } from '../utils/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function explainCommand(command) {
  if (!isAIConfigured()) {
    console.log(COLORS.error('\n AI is not configured. Please run "shellcraft ai-setup".'));
    return;
  }

  console.log(COLORS.muted(`\n Analyzing command: "${command}"...`));

  const prompt = `Explain the following CLI command or tool: "${command}". 
  Break down its main purpose, common flags, and provide an example usage. 
  Keep the explanation professional and concise (Cloud Engineering context).`;

  try {
    const explanation = await askAI(prompt);
    console.log(`\n${COLORS.primary.bold('--- COMMAND EXPLANATION ---')}`);
    console.log(COLORS.highlight(explanation));
    console.log(COLORS.primary.bold('---------------------------\n'));
  } catch (error) {
    console.error(COLORS.error('Error fetching explanation:'), error.message);
  }
}
