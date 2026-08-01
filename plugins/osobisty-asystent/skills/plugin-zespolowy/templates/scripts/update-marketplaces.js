#!/usr/bin/env node
// Poranny update pluginów zespołowych (job typu skrypt w schedulerze).
//
// PO CO TO ISTNIEJE: sesja Claude Code ładuje plugin ze SNAPSHOTU przypiętego
// do wersji z dnia instalacji (~/.claude/plugins/cache/) — NIE z klonu
// marketplace'u. Zwykły `git pull` odświeża tylko klon, więc sesje i tak jadą
// na starym. Jedyny niezawodny mechanizm to CLI Claude Code:
//   `claude plugin marketplace update` — świeży katalog marketplace'u,
//   `claude plugin update`             — przepięcie snapshotu każdej instalacji.
// Auto-update w tle dla PRYWATNYCH repo nie działa (w tle git nie ma jak się
// uwierzytelnić po HTTPS), stąd ten job. Zmiany wchodzą od następnej sesji.
//
// Uruchamianie: dziennym jobem w schedulerze (np. rano) albo ręcznie:
//   node scripts/update-marketplaces.js

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Nazwy marketplace'ów dodanych przez `/plugin marketplace add` — tak nazywają
// się katalogi w ~/.claude/plugins/marketplaces/. Dopisz kolejne, jeśli używasz więcej.
const MARKETPLACES = ['{{PLUGIN}}'];

function claudePlugin(args, cwd) {
  return execFileSync('claude', ['plugin', ...args], { cwd, timeout: 120000 })
    .toString().trim();
}

let failed = 0;

// 1. Odśwież katalogi marketplace'ów.
for (const name of MARKETPLACES) {
  try {
    claudePlugin(['marketplace', 'update', name]);
    console.log(`${name}: katalog marketplace'u odświeżony`);
  } catch (err) {
    failed++;
    console.error(`${name}: BŁĄD marketplace update — ${String(err.message).split('\n')[0]}`);
  }
}

// 2. Przepnij snapshot KAŻDEJ instalacji pluginów z tych marketplace'ów.
// Instalacje bywają per projekt (scope local/project) — wtedy update musi
// uruchomić się z katalogu tego projektu.
try {
  const registry = JSON.parse(fs.readFileSync(
    path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json'), 'utf8'));
  for (const [pluginId, installs] of Object.entries(registry.plugins || {})) {
    const marketplace = pluginId.split('@')[1];
    if (!MARKETPLACES.includes(marketplace)) continue;
    for (const inst of installs) {
      const perProject = inst.scope === 'local' || inst.scope === 'project';
      const cwd = perProject ? inst.projectPath : undefined;
      if (cwd && !fs.existsSync(cwd)) continue; // projekt skasowany — pomiń
      try {
        const out = claudePlugin(['update', pluginId, '--scope', inst.scope], cwd);
        console.log(`${pluginId} [${inst.scope}${cwd ? ' ' + cwd : ''}]: ${out.split('\n').pop()}`);
      } catch (err) {
        failed++;
        console.error(`${pluginId} [${inst.scope}]: BŁĄD update — ${String(err.message).split('\n')[0]}`);
      }
    }
  }
} catch (err) {
  failed++;
  console.error(`rejestr instalacji: ${String(err.message).split('\n')[0]}`);
}

process.exit(failed ? 1 : 0);
