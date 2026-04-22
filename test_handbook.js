import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  for (const moduleName of ['docker', 'linux', 'networking']) {
    try {
      const chaptersDir = path.join(__dirname, `./data/handbook/${moduleName}`);
      console.log(`\nChecking directory: ${chaptersDir}`);
      const files = await fs.readdir(chaptersDir);
      const chapterFiles = files.filter(f => f.endsWith('.json')).sort();
      console.log('Files:', chapterFiles);
      for (const f of chapterFiles) {
        const filePath = path.join(chaptersDir, f);
        const content = await fs.readFile(filePath, 'utf-8');
        try {
          const lessons = JSON.parse(content);
          console.log(`Loaded ${f}: ${lessons.length} lessons`);
          if (lessons.length === 0) console.error(`  [${f}] HAS ZERO LESSONS!`);
          if (lessons.length === 1) console.error(`  [${f}] HAS ONLY ONE LESSON! (Division by zero risk)`);
          lessons.forEach((lesson, index) => {
            if (!lesson.title) console.error(`  [${f}] Lesson ${index} missing title`);
            if (!lesson.content) console.error(`  [${f}] Lesson ${index} missing content`);
            if (!lesson.insight) console.error(`  [${f}] Lesson ${index} missing insight`);
          });
        } catch (parseError) {
          console.error(`FAILED to parse ${f}:`, parseError.message);
        }
      }
    } catch (err) {
      console.error(`Error processing module ${moduleName}:`, err.message);
    }
  }
}
test();
