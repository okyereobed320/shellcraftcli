import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { COLORS, displayHeader } from '../utils/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function searchHandbook(query, moduleName = 'linux') {
  const chaptersDir = path.join(__dirname, `../../data/handbook/${moduleName}`);
  const files = await fs.readdir(chaptersDir);
  const results = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const content = await fs.readFile(path.join(chaptersDir, file), 'utf-8');
    const lessons = JSON.parse(content);
    
    lessons.forEach((lesson, index) => {
      if (lesson.title.toLowerCase().includes(query.toLowerCase()) || 
          lesson.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          title: lesson.title,
          volume: file.replace('.json', '').replace(/_/g, ' ').toUpperCase(),
          index,
          lesson
        });
      }
    });
  }

  if (results.length === 0) {
    console.log(COLORS.error(`\n No lessons found matching "${query}".`));
    return;
  }

  console.clear();
  displayHeader(`🔍 SEARCH RESULTS FOR: ${query.toUpperCase()}`, COLORS.primary);
  
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Select a lesson to read:',
      choices: results.map((r, i) => ({
        name: `${r.volume} > ${r.title}`,
        value: i
      }))
    }
  ]);

  // Logic to jump to this lesson would go here, 
  // but for now we'll just display it simply.
  const match = results[selected].lesson;
  console.clear();
  displayHeader(`📖 ${match.title}`, COLORS.primary);
  console.log(`\n ${COLORS.highlight(match.content)}\n`);
  displayHeader(`From Volume: ${results[selected].volume}`, COLORS.muted);
  await inquirer.prompt([{ type: 'input', name: 'c', message: '\nPress Enter to return...' }]);
}
