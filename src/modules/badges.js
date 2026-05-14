import { COLORS, displayDivider, displayLogo, drawBox } from '../utils/ui.js';
import { getProgress } from '../utils/progress.js';
import inquirer from 'inquirer';

const BADGE_ICONS = {
  linux: '🐧',
  networking: '🌐',
  docker: '🐋',
  git: '🌿',
  cicd: '♾️',
  terraform: '🏗️',
  cloud: '☁️',
  default: '🛡️'
};

export async function showBadges() {
  console.clear();
  displayLogo();
  console.log(COLORS.secondary.bold('🛡️  THE HALL OF MASTERY 🛡️'));
  console.log(COLORS.muted('Displaying your hard-earned credentials.\n'));

  const { badges } = getProgress();

  if (badges.length === 0) {
    console.log(COLORS.warning(' You haven\'t earned any badges yet. Start training!'));
  } else {
    const badgeGrid = badges.map(b => {
      const icon = BADGE_ICONS[b.toLowerCase()] || BADGE_ICONS.default;
      return `${icon} ${COLORS.highlight(b.toUpperCase())}`;
    });

    // Display in a grid-like way
    for (let i = 0; i < badgeGrid.length; i += 2) {
      const row = badgeGrid.slice(i, i + 2).join('   |   ');
      console.log(`   ${row}`);
    }
  }

  console.log('');
  displayDivider();
  
  const allModules = ['linux', 'networking', 'docker', 'git', 'cicd', 'terraform'];
  const locked = allModules.filter(m => !badges.includes(m));

  if (locked.length > 0) {
    console.log(COLORS.muted('\n🔒 LOCKED MASTERY:'));
    console.log(COLORS.muted(' ' + locked.map(m => m.toUpperCase()).join(', ')));
  }

  console.log('\n');
  await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return...' }]);
}
