import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { addXP } from '../utils/progress.js';
import { COLORS, displayHeader, displayDivider } from '../utils/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startShift(moduleName = 'linux') {
  try {
    const scenariosPath = path.join(__dirname, '../../data/shift_scenarios.json');
    const scenarios = JSON.parse(await fs.readFile(scenariosPath, 'utf-8'))
      .filter(s => s.module === moduleName);

    if (scenarios.length === 0) {
      console.log(COLORS.error(`\n No tickets found for module: ${moduleName}`));
      return;
    }

    console.clear();
    if (moduleName === 'gcp/ace') {
      displayHeader('GOOGLE CLOUD ENGINEER', COLORS.primary);
      console.log(COLORS.highlight(' Active Context: Terminal [gcloud v450.0.0]\n'));
    } else {
      displayHeader(`${moduleName.toUpperCase()} SIMULATION`, COLORS.secondary);
    }

    for (const scenario of scenarios) {
      const resolved = await runScenario(scenario);
      if (!resolved) break;
      
      const { next } = await inquirer.prompt([{
        type: 'confirm',
        name: 'next',
        message: 'Proceed to next ticket?',
        default: true
      }]);
      if (!next) break;
    }

    console.log(COLORS.success('\n Shift completed. Handing over to next rotation. 👋\n'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return to menu...' }]);

  } catch (error) {
    console.error(COLORS.error(' Shift Error:'), error);
  }
}

/**
 * Normalizes a command string for comparison.
 * Removes leading $, quotes, extra spaces, and converts to lowercase.
 */
function normalize(cmd) {
  if (!cmd) return '';
  return cmd.trim()
    .toLowerCase()
    .replace(/^[\$\s]+/, '')      // Remove leading $ and leading spaces
    .replace(/['"]/g, '')         // Remove all single and double quotes
    .replace(/\s+/g, ' ')        // Collapse multiple spaces into one
    .replace(/--([a-z0-9-]+)=/g, '--$1 '); // Treat --flag=val and --flag val as same
}

async function runScenario(scenario) {
  console.clear();
  displayDivider(COLORS.muted);
  console.log(` ${COLORS.warning.bold(`🚨 TICKET #${scenario.id}: ${scenario.title}`)}`);
  displayDivider(COLORS.muted);
  
  console.log(` ${COLORS.highlight('PROBLEM:')} ${scenario.problem}\n`);

  if (scenario.investigations && Object.keys(scenario.investigations).length > 0) {
    console.log(` ${COLORS.secondary('investigations:')}`);
    for (const [cmd, output] of Object.entries(scenario.investigations)) {
      console.log(` ${COLORS.primary('$')} ${COLORS.highlight(cmd)}`);
      console.log(COLORS.muted(output.split('\n').map(line => ` ${line}`).join('\n')));
    }
    console.log("");
  }

  let resolved = false;
  let attempts = 0;

  while (!resolved) {
    const { fixCmd } = await inquirer.prompt([{
      type: 'input',
      name: 'fixCmd',
      message: 'Enter fix command:',
      prefix: '?'
    }]);

    const input = normalize(fixCmd);
    
    if (input === 'skip' || input === 'exit' || input === 'back') {
      return false;
    }

    if (input === 'hint' || input === 'help') {
      console.log(`\n ${COLORS.accent('HINT / REQUIRED COMMAND(S):')}`);
      console.log(COLORS.muted(' ----------------------------------------'));
      scenario.fix_commands.forEach(cmd => {
        console.log(` ${COLORS.highlight(cmd)}`);
      });
      console.log(COLORS.muted(' ----------------------------------------'));
      console.log(` ${COLORS.muted('Tip: Copy and paste the command(s) exactly.')}\n`);
      continue;
    }

    // Check against any valid command in the list
    const isCorrect = scenario.fix_commands.some(targetCmd => {
      const normalizedTarget = normalize(targetCmd);
      return input === normalizedTarget;
    });

    if (isCorrect) {
      resolved = true;
      console.log(`\n ${COLORS.success(`✅ RESOLVED: ${scenario.resolution}`)}`);
      displayDivider(COLORS.muted);
      addXP(scenario.severity === 'CRITICAL' ? 50 : 30);
      return true;
    } else {
      attempts++;
      console.log(`\n ${COLORS.error('✘ INCORRECT:')} Command failed or invalid parameters.`);
      if (attempts >= 1) {
        console.log(COLORS.muted(` Type 'hint' to see the expected command or 'skip' to move on.\n`));
      }
    }
  }
  return true;
}
