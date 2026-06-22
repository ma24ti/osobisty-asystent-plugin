#!/usr/bin/env node
// SessionStart hook — zasiewa pliki bazowe Osobistego Asystenta do PROJECT-level rules.
//
// PO CO: niektóre pliki referencyjne (np. content/ai-writing-patterns.md) muszą istnieć,
// żeby inne skille miały na czym pracować — reflect dotyka content/voice-of-tone obok nich,
// a skille pracujące z tekstem zakładają, że ai-writing-patterns jest na miejscu. Onboarding
// kopiuje je raz, ale user, który już ma `.onboarded`, nigdy onboardingu nie odpali ponownie
// (gateway w kroku 0) — i wtedy świeżego pliku by nie dostał. Hook to domyka.
//
// SEMANTYKA: seed-if-missing. Kopiujemy TYLKO gdy targetu nie ma — NIE nadpisujemy. Jeśli user
// dostosował plik pod siebie, jego wersja zostaje. (To różnica względem sync firmowego kontekstu,
// który był read-only i nadpisywany.)
//
// GATING: działamy tylko gdy projekt ma katalog .claude/rules/ (= jest vaultem Personal OS).
// Projekty kodowe go nie mają -> hook ich nie dotyka.
//
// SINGLE SOURCE: źródła czytamy z templates skilla onboarding — zero duplikatów w pluginie.

const fs = require('fs');
const path = require('path');

const pluginRoot = path.join(__dirname, '..');
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rulesDir = path.join(projectDir, '.claude', 'rules');

// Lista plików bazowych do zasiania. Rozszerzalna — dodaj kolejną parę {src, dest}.
const SEED_FILES = [
  {
    src: path.join(pluginRoot, 'skills', 'onboarding', 'templates', 'ai-writing-patterns.md'),
    dest: path.join(rulesDir, 'content', 'ai-writing-patterns.md'),
  },
];

try {
  // Gating — tylko vaulty Personal OS (mają .claude/rules/). Inaczej cicho nic nie rób.
  if (fs.existsSync(rulesDir)) {
    for (const { src, dest } of SEED_FILES) {
      if (fs.existsSync(dest)) continue;          // seed-if-missing: nie nadpisuj
      if (!fs.existsSync(src)) continue;          // brak źródła -> pomiń (nie blokuj)
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      process.stderr.write(`seed-base-files: zasiano ${path.relative(projectDir, dest)}\n`);
    }
  }
} catch (err) {
  // Nie blokuj startu sesji — zasygnalizuj błąd na stderr i zakończ cicho.
  process.stderr.write(`seed-base-files: ${err.message}\n`);
}
