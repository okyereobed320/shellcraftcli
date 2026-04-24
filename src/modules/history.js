import { getHistory } from '../utils/progress.js';
import { COLORS, displayHeader } from '../utils/ui.js';

export function showHistory() {
  const history = getHistory();
  displayHeader('📜 SHELLCRAFT COMMAND HISTORY', COLORS.primary);
  
  if (history.length === 0) {
    console.log(COLORS.muted(' No history found.\n'));
    return;
  }

  history.forEach(h => {
    console.log(`${COLORS.muted(`[ID: ${h.id}]`)} ${COLORS.highlight(h.command.padEnd(20))} ${COLORS.muted(`(${new Date(h.timestamp).toLocaleString()})`)}`);
  });
  console.log('');
}
