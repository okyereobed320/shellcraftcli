import { COLORS, drawBox, drawProgressBar, displayLogo, displayDivider } from '../utils/ui.js';
import { getProgress, RANKS } from '../utils/progress.js';
import inquirer from 'inquirer';

export async function showDashboard() {
  console.clear();
  displayLogo();
  
  const progress = getProgress();
  const currentRankIndex = RANKS.findIndex(r => r.name === progress.rank);
  const nextRank = RANKS[currentRankIndex + 1] || null;
  
  let rankProgress = '';
  if (nextRank) {
    const xpNeeded = nextRank.min - progress.xp;
    const progressInCurrentRank = progress.xp - RANKS[currentRankIndex].min;
    const totalXpInRank = nextRank.min - RANKS[currentRankIndex].min;
    rankProgress = `Next Rank: ${COLORS.secondary(nextRank.name)} (${xpNeeded} XP more)\n${drawProgressBar(progressInCurrentRank, totalXpInRank)}`;
  } else {
    rankProgress = COLORS.warning('YOU ARE A SHELL OVERLORD! MAX RANK REACHED.');
  }

  const stats = [
    `${COLORS.muted('Rank:')} ${COLORS.warning(progress.rank)}`,
    `${COLORS.muted('XP:')}   ${COLORS.accent(progress.xp)}`,
    `${COLORS.muted('Missions:')} ${COLORS.highlight(progress.completedMissions.length)}`,
    `${COLORS.muted('Badges:')}   ${COLORS.highlight(progress.badges.length)}`,
  ].join('\n');

  drawBox(stats, '📊 PERSONAL STATS', COLORS.primary);
  console.log('');
  drawBox(rankProgress, '📈 RANK PROGRESS', COLORS.secondary);

  console.log(`\n${COLORS.highlight('🚀 Skill Mastery:')}`);
  const modules = ['linux', 'networking', 'docker', 'git', 'cicd', 'terraform'];
  modules.forEach(m => {
    const chaptersStarted = Object.keys(progress.handbookProgress).filter(k => k.startsWith(m)).length;
    const totalChapters = 10; // Approximate
    console.log(`${COLORS.muted(' • ' + m.padEnd(12))} ${drawProgressBar(chaptersStarted, totalChapters, 20)}`);
  });

  displayDivider();
  console.log('');
  
  await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return to menu...' }]);
}
