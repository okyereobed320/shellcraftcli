import inquirer from 'inquirer';
import { askAI, isAIConfigured } from './ai.js';
import { COLORS, displayDivider, displayLogo, drawBox } from '../utils/ui.js';

export async function startDynamicScenario() {
  if (!isAIConfigured()) {
    console.log(COLORS.error('\n AI is not configured. Please run "shellcraft ai-setup".'));
    return;
  }

  console.clear();
  displayLogo();
  console.log(COLORS.secondary.bold('🤖 AI SCENARIO GENERATOR'));
  console.log(COLORS.muted('Describe a topic, and I will create a custom engineering ticket for you.\n'));

  const { topic } = await inquirer.prompt([
    {
      type: 'input',
      name: 'topic',
      message: 'What topic should the scenario cover? (e.g., K8s ingress, AWS S3 permissions)',
      validate: (input) => input.trim().length > 0 ? true : 'Please enter a topic.'
    }
  ]);

  console.log(COLORS.muted('\nGenerating custom scenario... this may take a moment...'));

  const systemPrompt = "You are a Cloud Engineering Lead. Generate a realistic 'ticket' or 'scenario' for a junior engineer. Include a Title, Background, Objective, and 3-4 specific Steps to solve it. Keep the tone professional.";
  const userPrompt = `Create a custom engineering scenario about: ${topic}. Format it clearly with sections.`;

  try {
    const scenario = await askAI(userPrompt, systemPrompt);
    
    console.clear();
    displayLogo();
    console.log(COLORS.highlight(`🎫 TICKET: CUSTOM DYNAMIC SCENARIO - ${topic.toUpperCase()}`));
    displayDivider();
    
    console.log(COLORS.highlight(scenario));
    
    displayDivider();
    console.log(COLORS.accent('\nMISSION INSTRUCTIONS:'));
    console.log(COLORS.muted('1. Research the steps mentioned above.'));
    console.log(COLORS.muted('2. Attempt to simulate the solution in your own environment.'));
    console.log(COLORS.muted('3. When finished, you can generate another scenario.'));

    console.log('\n');
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return...' }]);
  } catch (error) {
    console.error(COLORS.error('Error generating scenario:'), error.message);
  }
}
