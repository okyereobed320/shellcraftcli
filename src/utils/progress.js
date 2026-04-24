import Conf from 'conf';

const config = new Conf({ projectName: 'shellcraft' });

export const RANKS = [
  { name: 'Shell Apprentice', min: 0, max: 100, description: 'Beginner level. Users learn basic commands like ls, cd, and pwd.' },
  { name: 'Shell Operator', min: 101, max: 300, description: 'Users become comfortable navigating the terminal and using command options.' },
  { name: 'Shell Master', min: 301, max: 700, description: 'Users gain confidence and begin combining commands efficiently.' },
  { name: 'Shell Grandmaster', min: 701, max: 1500, description: 'Advanced users who understand system processes, permissions, and debugging.' },
  { name: 'Shell Overlord', min: 1501, max: Infinity, description: 'Elite level. Users can automate tasks, write scripts, and manage real systems.' }
];

export const XP_VALUES = {
  easy: 10,
  medium: 20,
  hard: 40
};

export function getProgress() {
  return {
    name: config.get('name', 'Operator'),
    xp: config.get('xp', 0),
    rank: config.get('rank', 'Shell Apprentice'),
    completedMissions: config.get('completedMissions', []),
    handbookProgress: config.get('handbookProgress', {}),
    badges: config.get('badges', []),
    history: config.get('history', []),
    isFirstRun: config.get('firstRun', true)
  };
}

export function addHistory(command) {
  const history = config.get('history', []);
  history.push({ id: history.length + 1, command, timestamp: new Date().toISOString() });
  if (history.length > 50) history.shift();
  config.set('history', history);
}

export function getHistory() {
  return config.get('history', []);
}

export function clearHistory() {
  config.set('history', []);
}

export function setName(name) {
  config.set('name', name);
}

export function updateHandbookProgress(volumeId, lessonIndex) {
  const progress = config.get('handbookProgress', {});
  // Update progress, but if they finished (index >= length), we keep it there 
  // or allow resetting. For now, just record the furthest reached.
  if (!progress[volumeId] || lessonIndex > progress[volumeId]) {
    progress[volumeId] = lessonIndex;
    config.set('handbookProgress', progress);
  }
}

export function earnBadge(chapterId) {
  const badges = config.get('badges', []);
  if (!badges.includes(chapterId)) {
    badges.push(chapterId);
    config.set('badges', badges);
    addXP(100); // Mastery bonus
    return true;
  }
  return false;
}

export function setFirstRunComplete() {
  config.set('firstRun', false);
}

export function completeMission(missionId) {
  const completed = config.get('completedMissions', []);
  if (!completed.includes(missionId)) {
    completed.push(missionId);
    config.set('completedMissions', completed);
  }
}

export function calculateRank(xp) {
  return RANKS.find(r => xp >= r.min && xp <= r.max) || RANKS[RANKS.length - 1];
}

export function addXP(amount) {
  const currentXP = config.get('xp', 0);
  const newXP = currentXP + amount;
  
  const oldRank = calculateRank(currentXP);
  const newRank = calculateRank(newXP);
  
  config.set('xp', newXP);
  config.set('rank', newRank.name);
  
  return {
    totalXP: newXP,
    gainedXP: amount,
    oldRank: oldRank.name,
    newRank: newRank.name,
    rankUp: newRank.name !== oldRank.name
  };
}
