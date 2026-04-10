# 🚀 Shellcraft

**Master the terminal. Craft your engineering skills.**

Shellcraft is an open-source, terminal-based training platform designed to take you from a terminal beginner to a Cloud Engineering professional. Experience real-world scenarios, structured learning paths, and interactive challenges directly in your command line.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)

---

## ✨ Features

- **📖 Interactive Handbook:** 9+ Volumes of deep-dive Linux content, from foundations to cloud-native primitives.
- **🎯 Mission Maps:** 30+ structured missions across 9 "Worlds" covering everything from filesystem navigation to server deployment.
- **💼 On-Duty Simulations (Shellcraft Shift):** Step into the shoes of a Senior Systems Administrator. Resolve CRITICAL incidents, manage disk space, and patch security vulnerabilities in a simulated Linux environment.
- **⭐ XP & Rank System:** Earn experience points and level up from a *Shell Apprentice* to a *Shell Overlord*.
- **❤️ Survival Modes:** Test your knowledge with "Shellcraft Life" (3 lives) or race against the clock for XP.
- **🔍 Concept Search:** Instantly find explanations for Linux commands and concepts.

---

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/okyereobed320/shellcraftcli.git

# Navigate to the directory
cd shellcraft

# Install dependencies
npm install

# Link the command globally
sudo npm link
```

---

## 🚀 Quick Start

Launch the interactive dashboard:
```bash
shellcraft
```

### Direct Commands

| Command | Description |
| :--- | :--- |
| `shellcraft` | Launch the main interactive menu |
| `shellcraft start linux` | Jump straight into the Linux module |
| `shellcraft score` | View your XP, Rank, and earned Badges |
| `shellcraft list` | See all available training modules |

---

## 🗺️ Learning Path

### 1. The Handbook
Browse structured chapters to build your theoretical foundation.
- **Foundations:** Kernel, Shell, and Filesystem hierarchy.
- **Command Mastery:** Advanced piping, redirection, and text processing (`grep`, `awk`, `sed`).
- **Networking:** DNS, Ports, SSH, and troubleshooting.
- **Cloud Native:** Containers, Microservices, and Modern Infrastructure.

### 2. The Mission Map
Apply your knowledge in focused challenges.
- **World 1-3:** Filesystem & Permissions.
- **World 4-6:** Networking & User Management.
- **World 7-9:** Automation, Servers, and Advanced Ops.

### 3. Shellcraft Shift (The Simulation)
The ultimate test. Handle tickets like:
- **"The Silent Web Server":** Nginx is down, but why?
- **"Disk Full Disaster":** Find and clear 15GB of rogue logs.
- **"Permission Denied Crisis":** Fix web directory ownership for developers.

---

## 📊 Progression Ranks

- 🌱 **Shell Apprentice** (0 - 100 XP)
- 🛠️ **Shell Operator** (101 - 300 XP)
- 🎓 **Shell Master** (301 - 700 XP)
- 🛡️ **Shell Grandmaster** (701 - 1500 XP)
- 👑 **Shell Overlord** (1501+ XP)

---

## 🤝 Contributing

We welcome contributors! Help us build the best DevOps training tool.
- Add new **Quiz Questions** in `data/linux.json`.
- Design new **Missions** in `data/missions.json`.
- Create **Simulation Scenarios** in `data/shift_scenarios.json`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by **Oobed gyamena okyere  (ghana)** and the open-source community.
