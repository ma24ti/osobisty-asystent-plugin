#!/usr/bin/env node
// SessionStart hook — synchronizuje wspólny kontekst firmowy do PROJECT-level rules.
//
// DLACZEGO hook, skoro chcemy "tylko plik w rules":
// Plugin Claude Code nie ma w spec katalogu rules/context — fizycznie nie potrafi sam
// wstawić pliku do .claude/rules/. Hook jest jedynym cross-platform mostem plugin -> rules
// (symlink wymaga developer mode na Windows; ścieżka cache pluginu bywa hashowana).
// To NIE jest ciągła operacja — działa raz na start sesji i pisze tylko gdy treść się zmieniła.
//
// PROJECT-LEVEL, nie user-level: plik ląduje w <vault>/.claude/rules/, więc kontekst firmowy
// jest TYLKO w vaultach asystenta — nie zaśmieca projektów kodowych, nad którymi ktoś
// pracuje na tej samej maszynie.
//
// GATING: kopiujemy tylko, gdy projekt ma katalog .claude/rules/ (= jest vaultem asystenta).
// Projekty kodowe go nie mają -> hook ich nie dotyka.
//
// WERSJONOWANIE: porównujemy treść (wykrywa KAŻDĄ zmianę, nie tylko podbicie wersji) i przy
// aktualizacji logujemy numer `version` ze źródła -> widać w logach, że nowa wersja wjechała.
//
// Read-only w praktyce: lokalna edycja kopii jest nadpisywana ze źródła przy starcie sesji.

const fs = require('fs');
const path = require('path');

// CLAUDE_PLUGIN_ROOT wskazuje katalog pluginu w cache; __dirname (hooks/) to fallback,
// gdyby hook odpalono poza kontekstem pluginu.
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.join(__dirname, '..');
const source = path.join(pluginRoot, 'context', 'company-context.md');
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rulesDir = path.join(projectDir, '.claude', 'rules');
const target = path.join(rulesDir, '{{PLUGIN}}-company-context.md');

function readVersion(text) {
  const m = text && text.match(/<!--\s*version:\s*(\S+)\s*-->/);
  return m ? m[1] : 'unknown';
}

try {
  // Gating — tylko vaulty asystenta (mają .claude/rules/). Inaczej cicho nic nie rób.
  if (fs.existsSync(rulesDir)) {
    const content = fs.readFileSync(source, 'utf8');
    const existed = fs.existsSync(target);
    const current = existed ? fs.readFileSync(target, 'utf8') : null;

    if (current !== content) {
      fs.writeFileSync(target, content);
      const from = existed ? `v${readVersion(current)}` : 'brak';
      process.stderr.write(
        `sync-company-context: zaktualizowano ${from} -> v${readVersion(content)}\n`
      );
    }

    // Pierwsza instalacja: rules zostały wczytane zanim plik powstał — wstrzyknij treść
    // do BIEŻĄCEJ sesji, żeby nie czekać na kolejną. Od następnej sesji plik jest już
    // w rules i ładuje się natywnie (bez wstrzykiwania — zero duplikacji w kontekście).
    if (!existed) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: content,
        },
      }));
    }
  }
} catch (err) {
  // Nie blokuj startu sesji — zasygnalizuj błąd na stderr i zakończ cicho.
  process.stderr.write(`sync-company-context: ${err.message}\n`);
}
// Brak process.exit() — proces kończy się po flushu stdout (exit() ucina additionalContext).
