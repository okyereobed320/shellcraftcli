import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS, displayHeader, displayDivider, displayLogo } from '../utils/ui.js';
import { getProgress, updateHandbookProgress, earnBadge } from '../utils/progress.js';
import { getHandbookPath } from '../utils/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startHandbook(moduleName = 'linux') {
  try {
    const chaptersDir = getHandbookPath(moduleName);
    await fs.mkdir(chaptersDir, { recursive: true });
    
    const files = await fs.readdir(chaptersDir);
    const chapterFiles = files.filter(f => f.endsWith('.json')).sort();

    if (chapterFiles.length === 0) {
      console.log(COLORS.error(' No chapters found for this module.'));
      return;
    }

    const progress = getProgress();

    console.clear();
    displayHeader(`📖 ${moduleName.toUpperCase()} HANDBOOK CHAPTERS`, COLORS.primary);
    
    const choices = await Promise.all(chapterFiles.map(async (f) => {
      const content = await fs.readFile(path.join(chaptersDir, f), 'utf-8');
      const lessons = JSON.parse(content);
      const chapterId = `${moduleName}:${f.replace('.json', '')}`;
      const currentIdx = progress.handbookProgress[chapterId] || 0;
      
      // Fix potential division by zero and index out of bounds
      const safeTotal = Math.max(1, lessons.length - 1);
      const percent = Math.min(100, Math.round((currentIdx / safeTotal) * 100));
      
      const barWidth = 10;
      const filled = Math.round((percent / 100) * barWidth);
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
      
      const hasBadge = progress.badges.includes(chapterId);
      const badgeIcon = hasBadge ? COLORS.accent('🛡️ ') : COLORS.muted('  ');
      const status = `[${bar}] ${percent}%`;

      return {
        name: `${badgeIcon} ${f.replace('.json', '').replace(/^\d+_/, '').replace(/_/g, ' ').toUpperCase().padEnd(25)} ${status}`,
        value: { file: f, id: chapterId, lessons }
      };
    }));

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select a Chapter to Study:',
        choices: [...choices, new inquirer.Separator(), { name: '🏠 Back to Main Menu', value: 'exit' }]
      }
    ]);

    if (selected === 'exit') return;

    // Handle Resume vs Restart
    let startIndex = progress.handbookProgress[selected.id] || 0;
    if (startIndex > 0) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: `You've already started this chapter (${startIndex} lessons in).`,
          choices: [
            { name: '⏩ Resume where I left off', value: 'resume' },
            { name: '🔄 Restart from the beginning', value: 'restart' }
          ]
        }
      ]);
      if (action === 'restart') startIndex = 0;
    }

    await runChapter(path.join(chaptersDir, selected.file), selected.id, startIndex);

  } catch (error) {
    console.error(COLORS.error(' Error loading handbook:'), error);
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
  }
}

async function runChapter(filePath, chapterId, startIndex = 0) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lessons = JSON.parse(content);
  let currentIndex = startIndex;

  while (currentIndex < lessons.length) {
    console.clear();
    const lesson = lessons[currentIndex];
    
    updateHandbookProgress(chapterId, currentIndex);
    
    displayHeader(`📖 CHAPTER: ${chapterId.replace(/^\d+_/, '').toUpperCase()} | ${currentIndex + 1}/${lessons.length}`, COLORS.primary);
    console.log(` ${COLORS.highlight.bold(lesson.title)}\n`);
    
    const paragraphs = lesson.content.split('. ');
    paragraphs.forEach(p => {
      if (p.trim()) console.log(` ${COLORS.highlight(p.trim() + '.')}\n`);
    });
    
    displayDivider(COLORS.muted);
    console.log(`\n ${COLORS.secondary.bold('💡 PRO INSIGHT:')}`);
    console.log(` ${COLORS.accent(lesson.insight)}`);
    
    if (lesson.lab) {
      console.log(`\n ${COLORS.warning.bold('🧪 INTERACTIVE LAB: ')}${COLORS.muted('Type the command to see output')}`);
      console.log(` ${COLORS.primary(`$ ${lesson.lab.command}`)}`);
    }

    console.log(`\n ${COLORS.muted('Next topic: ')}${COLORS.secondary.bold(lesson.next || 'Chapter Complete')}`);
    
    console.log('\n');
    displayDivider();
    
    const choices = [
      { name: `→ ${COLORS.highlight('Next')}`, value: 'next' },
      { name: `← ${COLORS.muted('Back')}`, value: 'prev', disabled: currentIndex === 0 },
      { name: `📔 ${COLORS.muted('Contents')}`, value: 'topics' }
    ];

    if (lesson.lab) choices.unshift({ name: `🧪 ${COLORS.warning('Try Command')}`, value: 'lab' });

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Navigation:',
        choices: [...choices, { name: `🏠 ${COLORS.muted('Chapters')}`, value: 'chapters' }, { name: `👋 ${COLORS.muted('Exit')}`, value: 'exit' }]
      }
    ]);

    if (action === 'exit') return;
    if (action === 'chapters') return startHandbook();
    if (action === 'topics') {
      currentIndex = await showTopics(lessons);
      continue;
    }
    if (action === 'lab') {
      console.log(`\n${COLORS.primary('$')} ${COLORS.highlight(lesson.lab.command)}`);
      console.log(COLORS.muted(lesson.lab.output));
      await inquirer.prompt([{ type: 'input', name: 'c', message: '\nPress Enter to continue...' }]);
      continue;
    }
    if (action === 'next') {
      if ((currentIndex + 1) % 5 === 0 && currentIndex < lessons.length - 1) {
        await runKnowledgeCheck(lesson);
      }
      currentIndex++;
    }
    if (action === 'prev') currentIndex--;
  }

  if (currentIndex >= lessons.length) {
    const newlyEarned = earnBadge(chapterId);
    console.clear();
    displayLogo();
    console.log(COLORS.accent.bold(' 🎉 Chapter Mastery Attained!'));
    if (newlyEarned) {
      console.log(COLORS.warning.bold(` 🛡️ NEW BADGE EARNED: ${chapterId.replace(/^\d+_/, '').toUpperCase()}`));
      console.log(COLORS.warning(' +100 XP Mastery Bonus!\n'));
    }
    console.log(COLORS.highlight(' You have successfully completed this section of the handbook.\n'));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return to chapters...' }]);
    return startHandbook();
  }
}

async function runKnowledgeCheck(lesson) {
  console.clear();
  displayHeader('🧠 QUICK KNOWLEDGE CHECK', COLORS.warning);
  console.log(`\n ${COLORS.highlight(`Based on your study of '${lesson.title}'...`)}\n`);
  
  const { correct } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'correct',
      message: 'Are you confident in your understanding of this concept?',
      default: true
    }
  ]);
  
  if (!correct) {
    console.log(COLORS.muted('\n Reviewing complex topics is a sign of a great engineer.'));
    await inquirer.prompt([{ type: 'input', name: 'c', message: 'Press Enter to resume...' }]);
  }
}

async function showTopics(lessons) {
  console.clear();
  displayHeader('📔 TABLE OF CONTENTS', COLORS.primary);
  
  const { selectedIndex } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedIndex',
      message: 'Jump to a section:',
      choices: lessons.map((l, index) => ({
        name: `${(index + 1).toString().padStart(3, '0')}. ${l.title}`,
        value: index
      }))
    }
  ]);
  
  return selectedIndex;
}
