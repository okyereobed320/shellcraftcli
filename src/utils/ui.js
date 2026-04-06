import chalk from 'chalk';

export const COLORS = {
  primary: chalk.hex('#4285F4'),    // Gemini Blue
  secondary: chalk.hex('#9334E6'),  // Purple
  accent: chalk.hex('#34A853'),     // Green
  warning: chalk.hex('#FBBC05'),    // Yellow
  error: chalk.hex('#EA4335'),      // Red
  muted: chalk.hex('#5F6368'),      // Gray
  highlight: chalk.hex('#FFFFFF').bold
};

export function displayLogo() {
  const logo = `
   _____ __         ____                 ________ 
  / ___// /_  ___  / / /__________  ____/ __/ /_ 
  \\__ \\\\/ __ \\\\/ _ \\\\/ / / ___/ ___/ __ \`/ /_/ __/ 
 ___/ / / / /  __/ / / /__/ /  / /_/ / __/ /_   
/____/_/ /_/\\___/_/_/\\___/_/   \\__,_/_/  \\__/   
  `;
  
  console.log(COLORS.primary.bold(logo));
  console.log(COLORS.highlight(' The terminal-based training platform for Cloud Engineering\n'));
}

export function displayDivider(color = COLORS.muted) {
  console.log(color('─'.repeat(process.stdout.columns || 60)));
}

export function displayHeader(text, color = COLORS.primary) {
  displayDivider(color);
  console.log(color.bold(` ${text}`));
  displayDivider(color);
}

export function displayWelcome(progress) {
  displayLogo();
  
  const { xp, rank, name } = progress;
  console.log(`${COLORS.highlight('Welcome back,')} ${COLORS.secondary.bold(name)}`);
  console.log(`${COLORS.muted('Rank:')} ${COLORS.warning(rank)}   ${COLORS.muted('XP:')} ${COLORS.accent(xp)}\n`);
  
  displayDivider();
  console.log('');
}
