# 🖥️ Shellcraft UI Preview

This document showcases the interactive terminal interface of **Shellcraft**.

## 🏠 Main Menu
```bash
  _____ _          _ _                 __ _   
 / ____| |        | | |               / _| |  
| (___ | |__   ___| | | ___ _ __ __ _| |_| |_ 
 \___ \| '_ \ / _ \ | |/ __| '__/ _` |  _| __|
 ____) | | | |  __/ | | (__| | | (_| | | | |_ 
|_____/|_| |_|\___|_|_|\___|_|  \__,_|_|  \__|
                                              
             [ THE CLI TRAINING SUITE ]

? What would you like to do? (Use arrow keys)
❯ 🚀 Start Training
  🏆 View High Scores
  ⚙️ Settings
  📖 Help
  👋 Exit
```

## 🌐 Networking Module (Isolated Path)
When you select the Networking module, the entire suite adapts to the connectivity domain.

```bash
? Select a Module:
  Linux (Basic Mastery)
❯ Networking (Modern Connectivity)
  Docker (Coming Soon)
```

## 📖 Handbook Mode
```bash
------------------------------------------------------------
 NETWORKING | 01_INTRO | 1/70
------------------------------------------------------------
 What is Global Cloud Infrastructure?

 Cloud providers like AWS, Azure, and GCP operate a global
 network of data centers. These are organized into Regions,
 which are physical locations around the world where
 multiple Availability Zones (AZs) reside.

 💡 Pro Insight: Choosing the right region can reduce 
    latency and meet data residency requirements.

? Next: What is an Availability Zone?
❯ [Continue]  [Exit to Menu]
```

## 🧠 Quiz Mode (XP Rank)
```bash
? Which port is used for HTTPS?
  21
  22
  80
❯ 443

✅ CORRECT! +15 XP
Rank: [Shell Operator]  Next: [Shell Master]
------------------------------------------------------------
```

## 🚀 Shift Mode (Simulation)
```bash
------------------------------------------------------------
 🚨 TICKET #112: Website Not Loading (Firewall Issue)
------------------------------------------------------------
 PROBLEM: A user reports that your website is not loading.
 Nginx is running, but the site is unreachable from outside.

 investigations:
 $ ufw status
 Status: active
 To Action From
 -- ------ ----
 22 ALLOW Anywhere

? Enter fix command:
❯ ufw allow 80

✅ RESOLVED: Port 80 (HTTP) was blocked by the firewall. Access restored!
------------------------------------------------------------
```
