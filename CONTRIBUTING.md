# Contributing to Shellcraft

First off, thank you for considering contributing to Shellcraft! It's people like you who make it such a great tool for the DevOps community.

## How Can I Contribute?

### 1. Adding Quiz Questions
Questions are stored in `data/linux.json`. Each question follows this format:
```json
{
  "question": "What command is used to display the current working directory?",
  "options": ["ls", "cd", "pwd", "dir"],
  "answer": "pwd",
  "difficulty": "easy",
  "explanation": "pwd stands for 'print working directory'."
}
```

### 2. Creating Missions
Missions are defined in `data/missions.json`. A mission groups related commands into a challenge.
```json
{
  "id": "m1",
  "name": "Mission Name",
  "commands": ["command1", "command2"]
}
```

### 3. Designing Shift Scenarios
Scenarios are the "boss level" of Shellcraft, found in `data/shift_scenarios.json`.
- **Incident:** A problem that needs fixing (e.g., service down).
- **Routine:** A maintenance task (e.g., adding a user).

### 4. Code Improvements
We use Node.js (ES Modules).
- **Modules:** Located in `src/modules/`.
- **Utilities:** Located in `src/utils/`.

## Development Setup

1. Fork the repo and clone it.
2. Run `npm install`.
3. Use `node bin/shellcraft.js` to test your changes.
4. Ensure your code follows the existing style (we love `chalk` and `inquirer` for UI).

## Pull Request Process

1. Create a new branch for your feature or fix.
2. Commit your changes with clear, descriptive messages.
3. Push to your fork and submit a PR.
4. Provide a brief description of what you've added or changed.

## Community & Support
If you have questions or need help, feel free to open an issue!

---

Happy Crafting! 🚀
