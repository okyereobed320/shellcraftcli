import chalk from 'chalk';
import { RANKS } from './progress.js';

export const COLORS = {
  primary: chalk.hex('#4285F4'),    // Gemini Blue
  secondary: chalk.hex('#9334E6'),  // Purple
  accent: chalk.hex('#34A853'),     // Green
  warning: chalk.hex('#FBBC05'),    // Yellow
  error: chalk.hex('#EA4335'),      // Red
  market: chalk.hex('#FF9800'),     // Orange/Gold
  muted: chalk.hex('#5F6368'),      // Gray
  highlight: chalk.hex('#FFFFFF').bold
};

export function displayLogo() {
  const logo = `
  ${COLORS.primary.bold('██████╗ ██╗  ██╗███████╗██╗     ██╗      ██████╗██████╗  █████╗ ███████╗████████╗')}
  ${COLORS.primary.bold('██╔════╝ ██║  ██║██╔════╝██║     ██║     ██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝')}
  ${COLORS.primary.bold('╚█████╗  ███████║█████╗  ██║     ██║     ██║     ██████╔╝███████║█████╗     ██║   ')}
  ${COLORS.primary.bold(' ╚═══██╗ ██╔══██║██╔══╝  ██║     ██║     ██║     ██╔══██╗██╔══██║██╔══╝     ██║   ')}
  ${COLORS.primary.bold('██████╔╝ ██║  ██║███████╗███████╗███████╗╚██████╗██║  ██║██║  ██║██║        ██║   ')}
  ${COLORS.primary.bold('╚═════╝  ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   ')}
  `;
  
  console.log(logo);
  console.log(COLORS.highlight('   > TERMINAL-BASED CLOUD ENGINEERING DECK_v0.1.0\n'));
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
  console.clear();
  displayLogo();
  
  const { xp, rank, name } = progress;
  const width = Math.max(process.stdout.columns || 60, 60);
  
  console.log(`  ${COLORS.primary.bold('▐')} ${COLORS.highlight('SHELLCRAFT_CLI')} ${COLORS.muted('::')} ${COLORS.secondary('CLOUD_LEARNING_DECK')}`);
  console.log(`  ${COLORS.muted('╟─')} ${COLORS.highlight('DECK_NODE:')}    ${COLORS.accent(name.toUpperCase())}`);
  console.log(`  ${COLORS.muted('╟─')} ${COLORS.highlight('CORE_MASTERY:')} ${COLORS.warning(rank.toUpperCase())}`);
  console.log(`  ${COLORS.muted('╙─')} ${COLORS.highlight('SYNC_STATUS:')}  ${drawProgressBar(xp % 100, 100, 20)} ${COLORS.muted(`[${xp} XP]`)}`);
  console.log(`  ${COLORS.muted('─'.repeat(width - 4))}\n`);
}

export function drawProgressBar(value, max, length = 30) {
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const filledLength = Math.round(length * percentage);
  const emptyLength = length - filledLength;
  
  const bar = COLORS.accent('█'.repeat(filledLength)) + COLORS.muted('░'.repeat(emptyLength));
  const percentStr = Math.round(percentage * 100) + '%';
  
  return `[${bar}] ${COLORS.highlight(percentStr)}`;
}

export function drawBox(content, title = '', color = COLORS.primary) {
  const lines = content.split('\n');
  const width = Math.max(...lines.map(l => l.length), title.length) + 4;
  
  const top = color('┌' + '─'.repeat(width - 2) + '┐');
  const bottom = color('└' + '─'.repeat(width - 2) + '┘');
  const titleLine = title ? color('│ ') + COLORS.highlight(title.padEnd(width - 4)) + color(' │\n') + color('├' + '─'.repeat(width - 2) + '┤') : '';
  
  const body = lines.map(line => color('│ ') + line.padEnd(width - 4) + color(' │')).join('\n');
  
  console.log(top);
  if (titleLine) console.log(titleLine);
  console.log(body);
  console.log(bottom);
}
