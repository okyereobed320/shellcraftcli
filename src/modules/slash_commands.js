import { startHandbook } from './handbook.js';
import { startQuiz } from './quiz.js';
import { startShift } from './shift.js';
import { COLORS } from '../utils/ui.js';

export async function handleSlashCommand(command) {
  const parts = command.slice(1).split(' ');
  const group = parts[0];
  const module = parts[1];
  const action = parts[2];

  const handleAction = async (mod, act) => {
    if (act === 'learn') return await startHandbook(mod);
    if (act === 'quiz') return await startQuiz(mod);
    if (act === 'sim' || act === 'simulation') return await startShift(mod);
    console.log(COLORS.error(`\n Unknown action: "${act}". Try learn, quiz, or sim.`));
  };

  if (group === 'core') {
    if (!module) {
      console.log(COLORS.info('\nCore Engineering Modules: linux, networking, git, docker, cicd, terraform'));
      return;
    }
    await handleAction(module, action || 'learn');
  } else if (group === 'cloud-basics') {
    await handleAction('cloud', module || 'learn');
  } else if (group === 'cloud-platforms') {
    if (!module || !parts[2]) {
      console.log(COLORS.info('\nCloud Platforms: /cloud-platforms aws practitioner [learn/quiz/sim]'));
      return;
    }
    const fullMod = `${module}/${parts[2]}`;
    await handleAction(fullMod, parts[3] || 'learn');
  } else {
    console.log(COLORS.error(`\n Unknown slash command: /${group}`));
  }
}
