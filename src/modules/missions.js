import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { startQuiz } from './quiz.js';
import { getProgress, completeMission } from '../utils/progress.js';
import { COLORS, displayHeader } from '../utils/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startMissions(moduleName) {
  try {
    const missionsPath = path.join(__dirname, '../../data/missions.json');
    const missionsContent = await fs.readFile(missionsPath, 'utf-8');
    const worlds = JSON.parse(missionsContent);

    const progress = getProgress();

    displayHeader('🗺️  SHELLCRAFT MISSION MAP', COLORS.primary);
    console.log(COLORS.muted(' Complete missions to conquer the Linux World!\n'));

    const { worldId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'worldId',
        message: COLORS.highlight('Select a World:'),
        choices: worlds.map(w => ({
          name: `${w.name} - ${w.description}`,
          value: w.id
        }))
      }
    ]);

    const selectedWorld = worlds.find(w => w.id === worldId);
    
    const { missionId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'missionId',
        message: COLORS.highlight('Select a Mission:'),
        choices: selectedWorld.missions.map(m => {
          const isDone = progress.completedMissions.includes(m.id);
          return {
            name: `${isDone ? '✅' : '⭕'} ${m.name}`,
            value: m.id
          };
        })
      }
    ]);

    const selectedMission = selectedWorld.missions.find(m => m.id === missionId);

    console.log(`\n🚀 ${COLORS.secondary.bold(`Starting: ${selectedMission.name}`)}`);
    console.log(`${COLORS.muted('Commands: ')}${COLORS.highlight(selectedMission.commands.join(', '))}\n`);

    // Filter questions based on mission commands
    const dataPath = path.join(__dirname, '../../data', moduleName + '.json');
    const content = await fs.readFile(dataPath, 'utf-8');
    const allQuestions = JSON.parse(content);

    // Heuristic: filter by commands
    let missionQuestions = allQuestions.filter(q => {
      const qLower = (q.question + ' ' + (q.explanation || '') + ' ' + q.answer).toLowerCase();
      return selectedMission.commands.some(cmd => {
        const regex = new RegExp(`\\b${cmd}\\b`, 'i');
        return regex.test(qLower);
      });
    });

    // Fallback: If not enough questions, add related ones from the same WORLD
    if (missionQuestions.length < 20) {
      const allWorldCommands = selectedWorld.missions.flatMap(m => m.commands);
      const worldQuestions = allQuestions.filter(q => {
        const qLower = (q.question + ' ' + (q.explanation || '') + ' ' + q.answer).toLowerCase();
        return allWorldCommands.some(cmd => {
          const regex = new RegExp(`\\b${cmd}\\b`, 'i');
          return regex.test(qLower);
        }) && !missionQuestions.includes(q);
      });
      
      missionQuestions = [...missionQuestions, ...worldQuestions];
    }

    // Secondary Fallback: If still not enough, add random questions
    if (missionQuestions.length < 20) {
      const randomFill = allQuestions
        .filter(q => !missionQuestions.includes(q))
        .sort(() => 0.5 - Math.random())
        .slice(0, 20 - missionQuestions.length);
      missionQuestions = [...missionQuestions, ...randomFill];
    }
    
    const targetCount = Math.min(missionQuestions.length, Math.floor(Math.random() * 11) + 20); // 20 to 30
    missionQuestions = missionQuestions.sort(() => 0.5 - Math.random()).slice(0, targetCount);

    if (missionQuestions.length === 0) {
      console.log(COLORS.error('\nError: No specific questions found for this mission yet.'));
      return;
    }

    await startQuiz(moduleName, 'xp_rank', missionQuestions, async (score, total) => {
      const percentage = (score / total) * 100;
      if (percentage >= 90) {
        console.log(COLORS.accent.bold(`\n🎉 Mission Accomplished: ${selectedMission.name}! (${score}/${total})`));
        completeMission(missionId);
      } else {
        console.log(COLORS.warning(`\nMission failed. You got ${score}/${total} (${percentage.toFixed(1)}%).`));
        console.log(COLORS.muted('You need at least 90% to complete a mission. Keep practicing!'));
      }
    });

  } catch (error) {
    console.error(COLORS.error('Error in Mission Mode:'), error.message);
  }
}
