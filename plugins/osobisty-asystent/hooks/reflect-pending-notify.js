#!/usr/bin/env node
// SessionStart hook — sygnalizuje oczekujące propozycje reflecta (_reflect-pending.md).
//
// Raz na start sesji (nie spam per-prompt). Gating: tylko vaulty Personal OS
// (projekt ma .claude/rules/ — projekty kodowe pomijamy). Nie blokuje sesji.

const fs = require('fs');
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const pending = path.join(projectDir, '.claude', 'rules', '_reflect-pending.md');

try {
  if (fs.existsSync(pending)) {
    const content = fs.readFileSync(pending, 'utf8');
    const count = (content.match(/^## /gm) || []).length;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext:
          `[Reflect] Masz ${count} oczekujących propozycji kalibracji w ` +
          `.claude/rules/_reflect-pending.md. Gdy będzie dobry moment (nie przerywaj ` +
          `bieżącego zadania), zaproponuj userowi przegląd — zatwierdza per pozycję, ` +
          `potem usuń plik.`,
      },
    }));
  }
} catch (err) {
  process.stderr.write(`reflect-pending-notify: ${err.message}\n`);
}
