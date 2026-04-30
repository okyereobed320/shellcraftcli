import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { addXP } from '../utils/progress.js';
import { COLORS, displayHeader, displayDivider } from '../utils/ui.js';
import { getDataPath } from '../utils/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startShift(moduleName) {
  try {
    const scenariosPath = path.join(__dirname, '../../data/shift_scenarios.json');
    const content = await fs.readFile(scenariosPath, 'utf-8');
    const allScenarios = JSON.parse(content);
    const scenarios = allScenarios.filter(s => s.module === moduleName);

    if (scenarios.length === 0) {
      console.log(COLORS.error(`\n❌ No simulation scenarios found for module: ${moduleName.toUpperCase()}\n`));
      return;
    }

    let resolvedCount = 0;
    let currentTicket = null;
    let activeScenarios = [...scenarios];

    displayHeader('🚀 SHELLCRAFT SHIFT: ENTERING INFRASTRUCTURE CONTROL', COLORS.primary);
    console.log(`${COLORS.highlight('  ROLE   : ')}${COLORS.warning('Senior Systems Administrator')}`);
    console.log(`${COLORS.highlight('  STATUS : ')}${COLORS.accent('Online & Monitoring')}`);
    console.log(`${COLORS.highlight('  HELP   : ')}${COLORS.muted('Type "menu" for options or "suggest" for help.')}\n`);
    displayDivider(COLORS.primary);
    console.log('');

    const runShell = async () => {
      // Dynamic Prompt
      const promptColor = currentTicket ? (currentTicket.severity === 'CRITICAL' ? 'error' : 'warning') : 'accent';
      const promptLabel = currentTicket ? `[Ticket #${currentTicket.id}]` : 'idle';
      
      const { command } = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: COLORS[promptColor](`${promptLabel} sysadmin@shellcraft:~$`),
        }
      ]);

      const cmd = command.trim();
      if (!cmd) return runShell();

      // Command Logic
      if (['exit', 'end', 'quit'].includes(cmd)) {
        await displayEndReport(resolvedCount, scenarios.length);
        return;
      }

      if (['menu', 'help', 'ls commands'].includes(cmd)) {
        displayMenu();
        return runShell();
      }

      if (['tickets', 'list'].includes(cmd)) {
        displayTicketQueue(activeScenarios);
        return runShell();
      }

      if (cmd.startsWith('open ')) {
        const id = cmd.split(' ')[1];
        const ticket = activeScenarios.find(s => s.id === id);
        if (ticket) {
          currentTicket = ticket;
          displayIncidentBrief(currentTicket);
        } else {
          console.log(COLORS.error('\n❌ Error: Ticket ID not found or already closed.\n'));
        }
        return runShell();
      }

      if (['status', 'dash'].includes(cmd)) {
        displayLiveDashboard(activeScenarios);
        return runShell();
      }

      if (['suggest', 'tools', '?'].includes(cmd)) {
        displaySuggestedTools(currentTicket);
        return runShell();
      }

      if (['hint', 'tip'].includes(cmd)) {
        if (currentTicket) {
          const hint = currentTicket.hints[Math.floor(Math.random() * currentTicket.hints.length)];
          console.log(`\n ${COLORS.secondary.bold('💡 ADVISORY:')} ${COLORS.highlight(hint)}\n`);
        } else {
          console.log(COLORS.muted('\nNo active ticket. Type "tickets" then "open <id>".\n'));
        }
        return runShell();
      }

      // --- SIMULATION LOGIC ---

      if (currentTicket) {
        if (currentTicket.fix_commands.includes(cmd)) {
          console.log('\n');
          displayDivider(COLORS.accent);
          console.log(COLORS.accent.bold(`✅ RESOLVED: ${currentTicket.title}`));
          console.log(COLORS.highlight(`   ${currentTicket.resolution}`));
          displayDivider(COLORS.accent);
          console.log(COLORS.warning(' ✨ +40 XP Awarded for Systems Excellence\n'));
          
          addXP(40);
          activeScenarios = activeScenarios.filter(s => s.id !== currentTicket.id);
          resolvedCount++;
          currentTicket = null;
        } else if (currentTicket.investigations[cmd]) {
          console.log(COLORS.highlight.bgBlack('\n--- Terminal Output ---'));
          console.log(COLORS.highlight(currentTicket.investigations[cmd]));
          console.log(COLORS.highlight.bgBlack('----------------------- \n'));
        } else {
          simulateLinuxOutput(cmd);
        }
      } else {
        console.log(COLORS.muted('\nNo ticket active. Type "tickets" then "open <id>" to begin.\n'));
      }

      return runShell();
    };

    await runShell();

  } catch (error) {
    console.error(COLORS.error('Error starting simulation:'), error.message);
  }
}

// --- UI COMPONENTS ---

function displayMenu() {
  console.log(COLORS.highlight('\n🛠️  SYSTEM CONTROL COMMANDS:'));
  console.log(`${COLORS.primary('  tickets ')}${COLORS.muted('   - View pending incident & maintenance queue')}`);
  console.log(`${COLORS.primary('  open <id>')}${COLORS.muted('  - Select a ticket to start working')}`);
  console.log(`${COLORS.primary('  status  ')}${COLORS.muted('   - Show live infrastructure dashboard')}`);
  console.log(`${COLORS.primary('  suggest ')}${COLORS.muted('   - Show specific tools for current task')}`);
  console.log(`${COLORS.primary('  hint    ')}${COLORS.muted('   - Get a nudge from the senior team')}`);
  console.log(`${COLORS.primary('  end     ')}${COLORS.muted('   - Terminate shift and view report')}`);
  console.log(COLORS.muted('\n  (You can use real Linux commands like ls, ps, systemctl, etc.)\n'));
}

function displayTicketQueue(scenarios) {
  console.log('\n');
  displayDivider(COLORS.primary);
  console.log(COLORS.primary.bold('🎫 WORK QUEUE'));
  displayDivider(COLORS.primary);
  
  if (scenarios.length === 0) {
    console.log(COLORS.accent('   ✨ All systems operational. 0 Tickets pending.'));
  } else {
    const incidents = scenarios.filter(s => s.type === 'incident');
    const routines = scenarios.filter(s => s.type === 'routine');

    if (incidents.length > 0) {
      console.log(COLORS.error.underline('INCIDENTS:'));
      incidents.forEach(s => {
        const color = s.severity === 'CRITICAL' ? 'error' : 'secondary';
        console.log(`${COLORS.muted(`[${s.id}]`)} ${COLORS[color](s.severity.padEnd(9))} ${COLORS.highlight(s.title)}`);
      });
      console.log('');
    }

    if (routines.length > 0) {
      console.log(COLORS.primary.underline('MAINTENANCE TASKS:'));
      routines.forEach(s => {
        console.log(`${COLORS.muted(`[${s.id}]`)} ${COLORS.warning('ROUTINE'.padEnd(9))} ${COLORS.highlight(s.title)}`);
      });
    }
  }
  displayDivider(COLORS.primary);
  console.log(COLORS.muted('Type "open <id>" to begin working.\n'));
}

function displayIncidentBrief(ticket) {
  const isIncident = ticket.type === 'incident';
  const color = isIncident ? 'error' : 'primary';
  const label = isIncident ? 'INCIDENT BRIEF' : 'TASK BRIEF';

  console.log('\n');
  displayDivider(COLORS[color]);
  console.log(COLORS[color].bold(`🚨 ${label}: TICKET #${ticket.id}`));
  displayDivider(COLORS[color]);
  console.log(`${COLORS.highlight('TITLE    : ')}${COLORS.highlight.bold(ticket.title)}`);
  console.log(`${COLORS.highlight('SEVERITY : ')}${(ticket.severity === 'CRITICAL' ? COLORS.error.bold(ticket.severity) : COLORS.warning(ticket.severity))}`);
  console.log(`${COLORS.highlight('GOAL     : ')}${COLORS.muted.italic(ticket.problem)}`);
  displayDivider(COLORS[color]);
  console.log(COLORS.primary('Type "suggest" to see the recommended diagnostic toolbox.\n'));
}

function displayLiveDashboard(scenarios) {
  const getS = (id) => scenarios.find(s => s.id === id);
  console.log('\n' + COLORS.highlight.bgBlue(' 🖥️  INFRASTRUCTURE DASHBOARD '));
  displayDivider(COLORS.primary);
  console.log(`  🌐 WEB LAYER     : ${getS('101') || getS('111') ? COLORS.error('🔥 ERROR') : COLORS.accent('✅ OK')}`);
  console.log(`  💾 STORAGE       : ${getS('103') || getS('202') ? COLORS.warning('⚠️  FULL') : COLORS.accent('✅ OK')}`);
  console.log(`  🔐 SECURITY      : ${getS('203') ? COLORS.warning('⚠️  PATCHING') : COLORS.accent('✅ OK')}`);
  console.log(`  🐳 DOCKER HUB    : ${getS('301') || getS('302') ? COLORS.error('🔥 DOWN') : COLORS.accent('✅ OK')}`);
  console.log(`  ⚙️  SERVICES      : ${scenarios.length > 5 ? COLORS.warning('⚠️  LOAD') : COLORS.accent('✅ OK')}`);
  displayDivider(COLORS.primary);
  console.log('');
}

function displaySuggestedTools(ticket) {
  if (!ticket) {
    console.log(COLORS.muted('\nSelect a ticket first to see suggested tools.\n'));
    return;
  }
  
  console.log(`${COLORS.highlight('\n🔍 DIAGNOSTIC TOOLBOX FOR THIS ')}${COLORS.highlight(ticket.type === 'incident' ? 'INCIDENT' : 'TASK')}:`);
  
  const toolLibrary = {
    'systemctl': 'Manage system services (status, start, restart)',
    'journalctl': 'Examine system logs',
    'ls': 'List directory contents and check permissions',
    'ps': 'Report current processes',
    'df': 'Report file system disk space usage',
    'du': 'Estimate file space usage',
    'ss': 'Investigate network ports',
    'curl': 'Test web connectivity',
    'chown': 'Change file owner/group',
    'chmod': 'Change file permissions',
    'whoami': 'Print current user name',
    'useradd': 'Create a new user',
    'usermod': 'Modify user account/groups',
    'apt': 'Update/Install software packages',
    'crontab': 'Schedule recurring tasks',
    'tar': 'Archive or extract files',
    'mysql': 'Database management',
    'tail': 'Output last part of logs',
    'id': 'Print user and group IDs',
    'cp': 'Copy files and directories',
    'mv': 'Move/Rename files',
    'docker': 'Manage containers, images, and volumes',
    'docker ps': 'List containers',
    'docker images': 'List images',
    'docker run': 'Run a container',
    'docker stop': 'Stop a container',
    'docker rm': 'Remove a container',
    'docker rmi': 'Remove an image'
  };

  const ticketTools = ticket.suggested_tools || ['systemctl', 'ls', 'ps'];

  ticketTools.forEach(toolName => {
    const desc = toolLibrary[toolName] || 'General Linux utility';
    console.log(`${COLORS.primary(`  ${toolName.padEnd(15)}`)}${COLORS.muted(` - ${desc}`)}`);
  });
  console.log(COLORS.muted('\n(Use these tools to investigate and resolve the ticket)\n'));
}

function simulateLinuxOutput(cmd) {
  const knownCommands = ['ls', 'ps', 'systemctl', 'cat', 'df', 'du', 'ip', 'ss', 'curl', 'chmod', 'chown', 'kill', 'ufw', 'crontab', 'nslookup', 'modprobe', 'lsmod', 'visudo', 'lsof', 'swapon', 'free', 'mysql', 'logrotate', 'date', 'truncate', 'ln', 'export', 'openssl', 'mount', 'showmount', 'git', 'redis-cli', 'add-apt-repository', 'aa-complain', 'apparmor_status', 'kubectl', 'tmux', 'screen', 'sestatus', 'getenforce', 'chcon', 'useradd', 'usermod', 'id', 'groups', 'apt', 'cp', 'mv', 'tar', 'echo', 'docker'];
  
  const baseCmd = cmd.split(' ')[0];
  if (knownCommands.includes(baseCmd)) {
    console.log(`${COLORS.highlight(`\n[Simulation] Result of "${cmd}":`)}`);
    console.log(COLORS.muted('  Command executed successfully, but no relevant issues found in this area.\n'));
  } else {
    console.log(COLORS.error(`\n-bash: ${cmd}: command not found\n`));
  }
}

async function displayEndReport(resolved, total) {
  console.log('\n');
  displayDivider(COLORS.primary);
  console.log(COLORS.primary.bold('📈 SHIFT PERFORMANCE REPORT'));
  displayDivider(COLORS.primary);
  console.log(`${COLORS.highlight('  TOTAL TICKETS    : ')}${total}`);
  console.log(`${COLORS.highlight('  RESOLVED         : ')}${resolved}`);
  console.log(`${COLORS.highlight('  SUCCESS RATE     : ')}${Math.round((resolved/total)*100)}%`);
  console.log(`${COLORS.highlight('  RATING           : ')}${(resolved === total ? COLORS.warning('⭐⭐⭐⭐⭐ (EXPERT)') : COLORS.primary('⭐⭐⭐ (SOLID)'))}`);
  displayDivider(COLORS.primary);
  console.log(COLORS.warning('\nShift ended. Handing over to next rotation. 👋\n'));
  await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to return to menu...' }]);
}
