/**
 * Self-contained .env loader — kopia w każdym skillu (NIE importuje z `_shared/`).
 *
 * Działa lokalnie i na VPS (odporne na symlink .claude → vault-git/.claude).
 * Plugin AIBIZ celowo trzyma kopie per skill — patrz `feedback_skills_selfcontained`.
 *
 * Usage (z `scripts/your_script.js`):
 *   const { findWorkspace, loadEnv } = require('./env_loader');
 *   loadEnv(__dirname);
 */

const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

function findWorkspace(scriptDir) {
  scriptDir = scriptDir || __dirname;

  // 1 & 2: walkup od cwd i script dir
  const starts = [process.cwd(), scriptDir];
  for (const start of starts) {
    let current = start;
    while (true) {
      if (fs.existsSync(path.join(current, '.obsidian')) || fs.existsSync(path.join(current, '.env'))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }

  // 3: symlink detection
  const pathStr = scriptDir;
  const claudeIdx = pathStr.indexOf(`${path.sep}.claude${path.sep}`);
  if (claudeIdx !== -1) {
    const gitRoot = pathStr.slice(0, claudeIdx);
    const home = os.homedir();
    try {
      for (const entry of fs.readdirSync(home)) {
        const claudeLink = path.join(home, entry, '.claude');
        try {
          const stat = fs.lstatSync(claudeLink);
          if (stat.isSymbolicLink()) {
            const target = fs.realpathSync(claudeLink);
            if (target === path.join(gitRoot, '.claude')) {
              const candidate = path.join(home, entry);
              if (fs.existsSync(path.join(candidate, '.env')) || fs.existsSync(path.join(candidate, '.obsidian'))) {
                return candidate;
              }
            }
          }
        } catch {}
      }
    } catch {}
  }

  // 4: fallback — 4x parent
  return path.resolve(scriptDir, '..', '..', '..', '..');
}

function loadEnv(scriptDir) {
  const workspace = findWorkspace(scriptDir);
  const envPath = path.join(workspace, '.env');
  if (!fs.existsSync(envPath)) return workspace;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
  return workspace;
}

module.exports = { findWorkspace, loadEnv };
