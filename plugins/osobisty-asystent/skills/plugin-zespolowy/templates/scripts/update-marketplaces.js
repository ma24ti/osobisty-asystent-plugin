#!/usr/bin/env node
// Poranny update marketplace'ów pluginów (job typu skrypt w schedulerze).
//
// PO CO TO ISTNIEJE: auto-update Claude Code w tle nie dociąga PRYWATNYCH repo przez
// HTTPS — w tle wyłącza credential helpers, więc git nie ma jak się uwierzytelnić
// i zaciągnięcie po cichu nie dochodzi do skutku. Zespół siedzi na starym toolkicie,
// nie wiedząc o tym. Ten job robi zwykły `git pull`, który korzysta z helpera `gh`
// i po prostu działa. Zmiany wchodzą od następnej sesji.
//
// Uruchamianie: dziennym jobem w schedulerze (np. rano) albo ręcznie:
//   node scripts/update-marketplaces.js

const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');

// Nazwy marketplace'ów dodanych przez `/plugin marketplace add` — tak nazywają się
// katalogi w ~/.claude/plugins/marketplaces/. Dopisz kolejne, jeśli używasz więcej.
const MARKETPLACES = ['{{PLUGIN}}'];
const BASE = path.join(os.homedir(), '.claude', 'plugins', 'marketplaces');

let failed = 0;
for (const name of MARKETPLACES) {
  const dir = path.join(BASE, name);
  try {
    const before = execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD']).toString().trim();
    execFileSync('git', ['-C', dir, 'pull', '--ff-only', '--quiet'], { timeout: 60000 });
    const after = execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD']).toString().trim();
    console.log(before === after ? `${name}: bez zmian (${after})` : `${name}: ${before} -> ${after} ✅`);
  } catch (err) {
    failed++;
    console.error(`${name}: BŁĄD — ${String(err.message).split('\n')[0]}`);
  }
}
process.exit(failed ? 1 : 0);
