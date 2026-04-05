import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { addXP } from '../utils/progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for clean UI separators
const hr = (color = 'gray') => chalk[color]('━'.repeat(60));

export async function startShift(moduleName) {
  try {
    const scenariosPath = path.join(__dirname, '../../data/shift_scenarios.json');
    const content = await fs.readFile(scenariosPath, 'utf-8');
    const scenarios = JSON.parse(content);

    let resolvedCount = 0;
    let currentTicket = null;
    let activeScenarios = [...scenarios];

    console.log(chalk.blue.bold('\n🚀 SHELLCRAFT SHIFT: ENTERING INFRASTRUCTURE CONTROL'));
    console.log(hr('blue'));
    console.log(chalk.white('  ROLE   : ') + chalk.yellow('Senior Systems Administrator'));
    console.log(chalk.white('  STATUS : ') + chalk.green('Online & Monitoring'));
    console.log(chalk.white('  HELP   : ') + chalk.gray('Type "menu" for options or "suggest" for help.'));
    console.log(hr('blue') + '\n');

    const runShell = async () => {
      // Dynamic Prompt
      const promptColor = currentTicket ? (currentTicket.severity === 'CRITICAL' ? 'red' : 'yellow') : 'green';
      const promptLabel = currentTicket ? `[Ticket #${currentTicket.id}]` : 'idle';
      
      const { command } = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: chalk[promptColor](`${promptLabel} sysadmin@shellcraft:~$`),
        }
      ]);

      const cmd = command.trim();
      if (!cmd) return runShell();

      // --- META COMMANDS ---
      
      if (['exit', 'end', 'quit'].includes(cmd)) {
        displayEndReport(resolvedCount, scenarios.length);
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
          console.log(chalk.red('\n❌ Error: Ticket ID not found or already closed.\n'));
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
          console.log(chalk.cyan.bold(`\n💡 ADVISORY: ${hint}\n`));
        } else {
          console.log(chalk.gray('\nNo active incident. Check "tickets" first.\n'));
        }
        return runShell();
      }

      // --- SIMULATION LOGIC ---

      if (currentTicket) {
        if (currentTicket.fix_commands.includes(cmd)) {
          console.log('\n' + hr('green'));
          console.log(chalk.green.bold(`✅ RESOLVED: ${currentTicket.title}`));
          console.log(chalk.white(`   ${currentTicket.resolution}`));
          console.log(hr('green'));
          console.log(chalk.yellow('✨ +40 XP Awarded for Systems Excellence\n'));
          
          addXP(40);
          activeScenarios = activeScenarios.filter(s => s.id !== currentTicket.id);
          resolvedCount++;
          currentTicket = null;
        } else if (currentTicket.investigations[cmd]) {
          console.log(chalk.black.bgWhite('\n--- Terminal Output ---'));
          console.log(chalk.white(currentTicket.investigations[cmd]));
          console.log(chalk.black.bgWhite('-----------------------\n'));
        } else {
          simulateLinuxOutput(cmd);
        }
      } else {
        console.log(chalk.gray('\nNo incident active. Use "tickets" then "open <id>" to start.\n'));
      }

      return runShell();
    };

    await runShell();

  } catch (error) {
    console.error(chalk.red('Shift Engine Error:'), error.message);
  }
}

// --- UI COMPONENTS ---

function displayMenu() {
  console.log(chalk.white.bold('\n🛠️  SYSTEM CONTROL COMMANDS:'));
  console.log(chalk.cyan('  tickets ') + chalk.gray('   - View pending incident & maintenance queue'));
  console.log(chalk.cyan('  open <id>') + chalk.gray('  - Select a ticket to start working'));
  console.log(chalk.cyan('  status  ') + chalk.gray('   - Show live infrastructure dashboard'));
  console.log(chalk.cyan('  suggest ') + chalk.gray('   - Show specific tools for current task'));
  console.log(chalk.cyan('  hint    ') + chalk.gray('   - Get a nudge from the senior team'));
  console.log(chalk.cyan('  end     ') + chalk.gray('   - Terminate shift and view report'));
  console.log(chalk.gray('\n  (You can use real Linux commands like ls, ps, systemctl, etc.)\n'));
}

function displayTicketQueue(scenarios) {
  console.log('\n' + hr('cyan'));
  console.log(chalk.cyan.bold('🎫 WORK QUEUE'));
  console.log(hr('cyan'));
  
  if (scenarios.length === 0) {
    console.log(chalk.green('   ✨ All systems operational. 0 Tickets pending.'));
  } else {
    const incidents = scenarios.filter(s => s.type === 'incident');
    const routines = scenarios.filter(s => s.type === 'routine');

    if (incidents.length > 0) {
      console.log(chalk.red.underline('INCIDENTS:'));
      incidents.forEach(s => {
        const color = s.severity === 'CRITICAL' ? 'red' : 'magenta';
        console.log(`${chalk.gray(`[${s.id}]`)} ${chalk[color](s.severity.padEnd(9))} ${chalk.white(s.title)}`);
      });
      console.log('');
    }

    if (routines.length > 0) {
      console.log(chalk.blue.underline('MAINTENANCE TASKS:'));
      routines.forEach(s => {
        console.log(`${chalk.gray(`[${s.id}]`)} ${chalk.yellow('ROUTINE'.padEnd(9))} ${chalk.white(s.title)}`);
      });
    }
  }
  console.log(hr('cyan'));
  console.log(chalk.gray('Type "open <id>" to begin working.\n'));
}

function displayIncidentBrief(ticket) {
  const isIncident = ticket.type === 'incident';
  const color = isIncident ? 'red' : 'blue';
  const label = isIncident ? 'INCIDENT BRIEF' : 'TASK BRIEF';

  console.log('\n' + hr(color));
  console.log(chalk[color].bold(`🚨 ${label}: TICKET #${ticket.id}`));
  console.log(hr(color));
  console.log(chalk.white('TITLE    : ') + chalk.bold(ticket.title));
  console.log(chalk.white('SEVERITY : ') + (ticket.severity === 'CRITICAL' ? chalk.red.bold(ticket.severity) : chalk.yellow(ticket.severity)));
  console.log(chalk.white('GOAL     : ') + chalk.italic(ticket.problem));
  console.log(hr(color));
  console.log(chalk.cyan('Type "suggest" to see the recommended diagnostic toolbox.\n'));
}

function displayLiveDashboard(scenarios) {
  const getS = (id) => scenarios.find(s => s.id === id);
  console.log('\n' + chalk.bgBlue.white.bold(' 🖥️  INFRASTRUCTURE DASHBOARD '));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  🌐 WEB LAYER     : ${getS('101') || getS('111') ? chalk.red('🔥 ERROR') : chalk.green('✅ OK')}`);
  console.log(`  💾 STORAGE       : ${getS('103') || getS('202') ? chalk.yellow('⚠️  FULL') : chalk.green('✅ OK')}`);
  console.log(`  🔐 SECURITY      : ${getS('203') ? chalk.yellow('⚠️  PATCHING') : chalk.green('✅ OK')}`);
  console.log(`  ⚙️  SERVICES      : ${scenarios.length > 5 ? chalk.yellow('⚠️  LOAD') : chalk.green('✅ OK')}`);
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

function displaySuggestedTools(ticket) {
  if (!ticket) {
    console.log(chalk.gray('\nSelect a ticket first to see suggested tools.\n'));
    return;
  }
  
  console.log(chalk.white.bold('\n🔍 DIAGNOSTIC TOOLBOX FOR THIS ' + (ticket.type === 'incident' ? 'INCIDENT' : 'TASK') + ':'));
  
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
    'mv': 'Move/Rename files'
  };

  const ticketTools = ticket.suggested_tools || ['systemctl', 'ls', 'ps'];

  ticketTools.forEach(toolName => {
    const desc = toolLibrary[toolName] || 'General Linux utility';
    console.log(chalk.cyan(`  ${toolName.padEnd(15)}`) + chalk.gray(` - ${desc}`));
  });
  console.log(chalk.gray('\n(Use these tools to investigate and resolve the ticket)\n'));
}

function simulateLinuxOutput(cmd) {
  const knownCommands = ['ls', 'ps', 'systemctl', 'cat', 'df', 'du', 'ip', 'ss', 'curl', 'chmod', 'chown', 'kill', 'ufw', 'crontab', 'nslookup', 'modprobe', 'lsmod', 'visudo', 'lsof', 'swapon', 'free', 'mysql', 'logrotate', 'date', 'truncate', 'ln', 'export', 'openssl', 'mount', 'showmount', 'git', 'redis-cli', 'add-apt-repository', 'aa-complain', 'apparmor_status', 'kubectl', 'tmux', 'screen', 'sestatus', 'getenforce', 'chcon', 'useradd', 'usermod', 'id', 'groups', 'apt', 'cp', 'mv', 'tar', 'echo'];
  
  const baseCmd = cmd.split(' ')[0];
  if (knownCommands.includes(baseCmd)) {
    console.log(chalk.white(`\n[Simulation] Result of "${cmd}":`));
    console.log(chalk.gray('  Command executed successfully, but no relevant issues found in this area.\n'));
  } else {
    console.log(chalk.red(`\n-bash: ${cmd}: command not found\n`));
  }
}

function displayEndReport(resolved, total) {
  console.log('\n' + hr('blue'));
  console.log(chalk.blue.bold('📈 SHIFT PERFORMANCE REPORT'));
  console.log(hr('blue'));
  console.log(chalk.white(`  TOTAL TICKETS    : ${total}`));
  console.log(chalk.white(`  RESOLVED         : ${resolved}`));
  console.log(chalk.white(`  SUCCESS RATE     : ${Math.round((resolved/total)*100)}%`));
  console.log(chalk.white(`  RATING           : `) + (resolved === total ? chalk.yellow('⭐⭐⭐⭐⭐ (EXPERT)') : chalk.cyan('⭐⭐⭐ (SOLID)')));
  console.log(hr('blue'));
  console.log(chalk.yellow('\nShift ended. Handing over to next rotation. 👋\n'));
}
