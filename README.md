# 🚀 Shellcraft

**Master the terminal. Craft your engineering skills.**

Shellcraft is an open-source, terminal-based training platform designed to take you from a terminal beginner to a Cloud Engineering professional. Experience real-world scenarios, structured learning paths, and interactive challenges directly in your command line.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)

---

## ✨ Features

- **🏗️ Structured Learning Groups:** Modules organized into Core Engineering, Cloud Basics, and Cloud Platforms.
- **📖 Interactive Handbook:** Deep-dive content with optimized readability and paragraph-based formatting.
- **🌐 Cloud Platforms:** Dedicated tracks for **AWS**, **GCP**, and **Azure**.
- **🛒 Shellcraft Marketplace:** Browse, install, and even post your own community-contributed courses.
- **🎯 Mission Maps:** Structured missions covering everything from filesystem navigation to server deployment.
- **💼 On-Duty Simulations (Google Cloud Eng Role):** Experience realistic engineering tickets with an intelligent command normalization engine that understands real-world CLI usage.
- **⚡ Slash Command System:** Navigate instantly with `/core`, `/cloud-basics`, `/cloud-platforms`, and `/community`.
- **⭐ XP & Rank System:** Earn experience points and level up as you master the craft.

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

### Direct Group Commands

| Command | Description |
| :--- | :--- |
| `shellcraft core <module>` | Access Core Engineering (linux, networking, git, etc.) |
| `shellcraft cloud-basics` | Jump into Cloud Engineering fundamentals |
| `shellcraft cloud-platforms <provider> <track>` | Start a Cloud Platform track (e.g., gcp ace) |
| `shellcraft marketplace` | Browse and install community modules |
| `shellcraft progress` | View your XP, Rank, and earned Badges |

### Examples

- `shellcraft core git learn` - Start learning Git
- `shellcraft cloud-platforms gcp ace learn` - Start the expanded GCP ACE track (320+ lessons)
- `shellcraft marketplace browse` - See what the community has built

---

## 🗺️ Learning Path

### 1. Core Engineering
The bedrock of your journey.
- **Linux:** Foundations, Command Mastery, and System Internals.
- **Networking:** DNS, Ports, SSH, and Connectivity.
- **Git & Docker:** Version control and Containerization.
- **IaC & CI/CD:** Terraform, Automation, and Pipelines.

### 2. Cloud Engineering Basics
The bridge to the cloud.
- **Fundamentals:** Shared Responsibility, IAM, VPC, and Compute.
- **Architecture:** Designing scalable and resilient systems.

### 3. Cloud Platforms (Professional Tracks)
- **GCP (Expanded):** Associate Cloud Engineer (ACE) with 8 deep-dive chapters, 100+ scenario-based questions, and 20 realistic engineering tickets.
- **AWS:** Practitioner & Solutions Architect.
- **Azure:** AZ-900 & AZ-104.

---

## ⌨️ Slash Commands (Interactive Mode)

When inside an interactive session, use these shortcuts:
- `/core <module> <action>` - Switch to a core module.
- `/cloud-basics <action>` - Switch to cloud basics.
- `/cloud-platforms <aws|gcp|azure> <track> <action>` - Switch to a specific cloud platform.
- `/community <module-id> <action>` - Access installed marketplace modules.

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
- **Marketplace:** Create your own course (JSON format) and share it.
- **Quiz Questions:** Add new challenges in `data/core/` or `data/cloud-platforms/`.
- **Missions:** Design new path-based missions in `data/missions.json`.
- **Scenarios:** Design realistic tickets in `data/shift_scenarios.json`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by **Obed gyamena okyere  (ghana)** and the open-source community.
