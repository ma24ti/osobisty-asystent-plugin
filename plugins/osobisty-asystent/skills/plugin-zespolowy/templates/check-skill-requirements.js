#!/usr/bin/env node
// PreToolUse hook (matcher: Skill) — strażnik wymagań skilli.
//
// Czyta requirements.json z katalogu pluginu i sprawdza, czy skill ma swoje
// klucze ZANIM wystartuje. Brak klucza -> exit 2 (blokada) + komunikat na
// stderr mówiący, czego brakuje i skąd to wziąć. Lepsze niż skill padający
// w połowie roboty z gołym błędem API.
//
// Wartości szukamy w kolejności: process.env -> pliki env skilla
// (requirements[skill].env_files, ze zmiennymi $NAZWA) -> .env w workspace.
// Pusta wartość (KLUCZ=) liczy się jako brak.
//
// Skill spoza manifestu -> exit 0 (hook nie dotyka cudzych skilli).

const fs = require('fs');
const path = require('path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function parseEnvFile(file) {
  // Składnia CELOWO identyczna z loaderami skilli (env_loader.py, env.mjs):
  // `KLUCZ=wartość`, bez `export` — hook nie może być liberalniejszy niż to,
  // co potem realnie czyta skill (inaczej: hook przepuszcza, skill pada).
  const out = {};
  try {
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m || line.trim().startsWith('#')) continue;
      out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // brak pliku = po prostu nie ma wartości z tego źródła
  }
  return out;
}

function walkUpFindEnv(startDir) {
  // Ten sam walk-up co env.mjs / env_loader.py: Claude odpalony z podkatalogu
  // vaulta ma znaleźć .env workspace'u, nie dostać blokadę.
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function resolvePath(template, workspace) {
  // "$MOJ_ENV_FILE" / "$MOJE_NARZEDZIE_HOME/data/klucze.env" / "$WORKSPACE/.env"
  let incomplete = false;
  const resolved = template.replace(/\$([A-Z_]+)/g, (_, name) => {
    const value = name === 'WORKSPACE' ? workspace : process.env[name];
    if (!value) incomplete = true;
    return value || '';
  });
  // Szablon odwoływał się do niesetowanej zmiennej -> ścieżka niekompletna, pomiń
  return incomplete ? null : resolved;
}

try {
  const input = JSON.parse(readStdin() || '{}');
  // Dwie ścieżki wywołania skilla, ten sam strażnik:
  // - model przez narzędzie Skill  -> PreToolUse,   nazwa w tool_input.skill
  // - user wpisuje /plugin:skill   -> UserPromptExpansion, nazwa w command_name
  const rawName = (input.tool_input && input.tool_input.skill) || input.command_name || '';
  // Pilnujemy WYŁĄCZNIE skilli tego pluginu: "{{PLUGIN}}:raport" albo goła nazwa
  // (skill lokalny/legacy). Cudzy plugin z tak samo nazwanym skillem
  // ("foo:raport") ma przejść bez kontroli.
  const parts = rawName.split(':');
  if (parts.length > 1 && parts[0] !== '{{PLUGIN}}') process.exit(0);
  const skill = parts.pop();
  if (!skill) process.exit(0);

  const reqFile = path.join(__dirname, '..', 'requirements.json');
  const requirements = JSON.parse(fs.readFileSync(reqFile, 'utf8'));
  const req = requirements[skill];
  if (!req || !Array.isArray(req.env) || req.env.length === 0) process.exit(0);

  const workspace = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // Zbierz wartości: process.env -> env_files skilla -> .env (walk-up od workspace'u)
  const values = { ...process.env };
  const files = [];
  for (const template of req.env_files || []) {
    if (template === '$WORKSPACE/.env') continue; // i tak dojdzie z walk-upu niżej
    const file = resolvePath(template, workspace);
    if (file) files.push(file);
  }
  const workspaceEnv = walkUpFindEnv(workspace);
  if (workspaceEnv) files.push(workspaceEnv);
  for (const file of files) {
    const parsed = parseEnvFile(file);
    for (const [k, v] of Object.entries(parsed)) {
      if (!values[k]) values[k] = v;
    }
  }

  const missing = req.env.filter((k) => !values[k]);
  if (missing.length === 0) process.exit(0);

  process.stderr.write(
    [
      `Skill /${skill} zablokowany — brak: ${missing.join(', ')}.`,
      `Skąd wziąć: ${req.skad || 'zapytaj admina zespołu.'}`,
      `Wartość wklej do pliku .env w root workspace'u (linia: ${missing[0]}=twoj_klucz) — stamtąd czytają ją skille, NIE do ~/.zshrc.`,
      `Przekaż userowi ten komunikat i NIE próbuj uruchamiać skilla ponownie, dopóki user nie uzupełni klucza.`,
    ].join('\n')
  );
  process.exit(2);
} catch (err) {
  // Awaria hooka nie może blokować pracy — przepuść i zasygnalizuj na stderr.
  process.stderr.write(`check-skill-requirements: ${err.message}\n`);
  process.exit(0);
}
