---
name: plugin-zespolowy
description: Buduje i utrzymuje plugin zespołowy Claude Code — repo git + dwa manifesty. Tryby — init (scaffold nowego repo pluginu + pierwszy push), add <skill> (przenosi skill z lokalnego .claude/skills/ do pluginu i commituje — lekarstwo na drift), check (co masz lokalnie a czego nie ma w pluginie i odwrotnie). Użyj gdy user mówi "zbuduj plugin zespołowy", "dodaj skill do pluginu", "sprawdź drift skilli", "plugin dla zespołu", "/plugin-zespolowy".
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
---

# Plugin-zespolowy

Plugin = **repo git + dwa pliki manifestu**. Nic więcej:

```
<repo>/
├── .claude-plugin/marketplace.json   ← katalog: co jest do wzięcia
├── .env.example                      ← szablon sekretów (kopiowany do workspace'a)
└── plugins/<plugin>/
    ├── .claude-plugin/plugin.json    ← manifest
    ├── requirements.json             ← czego skille wymagają i skąd to wziąć
    ├── team-config.json              ← wspólna konfiguracja zespołu (NIE sekrety)
    ├── context/                      ← kontekst firmowy + zbiornik sygnałów
    └── skills/  agents/  hooks/
```

Instalacja u kolegi = `gh auth` + 2 komendy (`/plugin marketplace add`, `/plugin install`).
Wersjonowanie = git SHA: commit do `main` → update u wszystkich przy starcie sesji.

**Rytuał, bez którego to umiera: zmiana skilla u siebie = `add` do pluginu w tym samym
ruchu.** Bez tego po miesiącu każdy w zespole ma inną wersję toolkitu.

Wymaganie: zalogowany GitHub CLI (`gh auth status`; jak brak — `gh auth login` + `gh auth setup-git`).

## 0. Zlokalizuj repo pluginu (tryby add/check)

Odczytaj z `.env` workspace'u (Bash NIE dostaje tej zmiennej sam z siebie):
```bash
ENV_FILE="${CLAUDE_PROJECT_DIR:-$PWD}/.env"
TEAM_PLUGIN_DIR=$(grep -E '^TEAM_PLUGIN_DIR=' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2-)
```
Brak lub pusty → zapytaj usera o ścieżkę klonu (zaproponuj `gh repo clone`, jeśli nie ma
go lokalnie) i **dopisz `TEAM_PLUGIN_DIR=<ścieżka>` do `$ENV_FILE` sam** — pytanie pada
tylko raz. Na start pracy: `git -C "$TEAM_PLUGIN_DIR" pull`.

## 1. Wykryj tryb

- `init` → scaffold nowego repo.
- `add <nazwa-skilla>` → przeniesienie skilla do pluginu.
- `check` (też bez argumentów) → raport driftu.

---

## Tryb INIT — nowy plugin od zera

### 2i. Zbierz dane (jedno pytanie, wszystkie pola)
- org/user na GitHubie (np. `acme-co`)
- nazwa pluginu (kebab-case, np. `acme-team`) — repo nazwij `<plugin>-plugin`
- opis jednym zdaniem + nazwa właściciela (firma/osoba)
- prywatne czy publiczne (default: **prywatne** — plugin firmowy zawiera wiedzę o firmie)
- **katalog na dysku**, w którym założyć repo (default: `~/Documents/Kodowanie`) —
  NIGDY w środku vaulta/workspace'a Obsidian (repo w repo = problemy z syncem i backupem)

### 3i. Scaffold z szablonów

Szablony leżą w `{baseDir}/templates/`. Skopiuj KAŻDY z nich pod docelową nazwę z tabeli
niżej (część szablonów ma nazwę celowo „nieaktywną" — `gitignore`, `env.example`,
`SKILL.md.template` — żeby nie działały w repo pluginu kursu; przy kopiowaniu nadajesz
im właściwą nazwę).

| Szablon w `{baseDir}/templates/` | Ląduje w repo jako |
|---|---|
| `marketplace.json` | `<repo>/.claude-plugin/marketplace.json` |
| `env.example` | `<repo>/.env.example` |
| `gitignore` | `<repo>/.gitignore` |
| `README.md` | `<repo>/README.md` |
| `plugin.json` | `<repo>/plugins/<plugin>/.claude-plugin/plugin.json` |
| `requirements.json` | `<repo>/plugins/<plugin>/requirements.json` |
| `team-config.json` | `<repo>/plugins/<plugin>/team-config.json` |
| `hooks.json` | `<repo>/plugins/<plugin>/hooks/hooks.json` |
| `check-skill-requirements.js` | `<repo>/plugins/<plugin>/hooks/check-skill-requirements.js` |
| `hooks/sync-company-context.js` | `<repo>/plugins/<plugin>/hooks/sync-company-context.js` |
| `context/company-context.md` | `<repo>/plugins/<plugin>/context/company-context.md` |
| `context/inbox/README.md` | `<repo>/plugins/<plugin>/context/inbox/README.md` |
| `skills/kontekst-sygnaly/SKILL.md.template` | `<repo>/plugins/<plugin>/skills/kontekst-sygnaly/SKILL.md` |
| `skills/kontekst-sygnaly/scripts/parse_sessions.py` | `<repo>/plugins/<plugin>/skills/kontekst-sygnaly/scripts/parse_sessions.py` |
| `skills/kontekst-firmowy/SKILL.md.template` | `<repo>/plugins/<plugin>/skills/kontekst-firmowy/SKILL.md` |
| `skills/kontekst-firmowy/scripts/parse_sessions.py` | `<repo>/plugins/<plugin>/skills/kontekst-firmowy/scripts/parse_sessions.py` |
| `scripts/update-marketplaces.js` | `<repo>/scripts/update-marketplaces.js` |

Pozostałe skille dojdą przez `/plugin-zespolowy add`.

**Podmiana placeholderów — we WSZYSTKICH skopiowanych plikach, także w `.js`, `.json`,
`.md` i `.py`.** Zestaw jest zamknięty:

| Placeholder | Czym podmieniasz |
|---|---|
| `{{ORG}}` | org/user na GitHubie z 2i |
| `{{REPO}}` | nazwa repo (`<plugin>-plugin`) |
| `{{PLUGIN}}` | nazwa pluginu (kebab-case) |
| `{{DISPLAY_NAME}}` | ładna nazwa do wyświetlania |
| `{{OPIS}}` | opis jednym zdaniem |
| `{{WLASCICIEL}}` | firma/osoba (właściciel) |
| `{{LISTA_SKILLI}}` | na start: „(jeszcze pusto — dodawaj przez `/plugin-zespolowy add`)" |

Po podmianie sprawdź, że nigdzie nie został `{{`:
```bash
grep -rn '{{' "$DIR" && echo "⚠️ zostały niepodmienione placeholdery" || echo "OK"
```
Uwaga na dwa miejsca, w których placeholder siedzi w kodzie, nie w tekście:
`check-skill-requirements.js` (porównanie prefiksu `{{PLUGIN}}:` — hook pilnuje wyłącznie
skilli własnego pluginu) i `scripts/update-marketplaces.js` (lista `MARKETPLACES`).

### 4i. Repo + pierwszy push
```bash
DIR="<katalog>/<repo>"    # katalog z 2i, np. ~/Documents/Kodowanie/acme-team-plugin
git -C "$DIR" init -b main
git -C "$DIR" add -A
git -C "$DIR" commit -m "feat: scaffold pluginu zespołowego <plugin>"
gh repo create <org>/<repo> --private --source="$DIR" --remote=origin --push
```

### 5i. Zaproś zespół do repo (bez tego plugin jest tylko Twój)

Repo prywatne widzi wyłącznie właściciel — u kolegi `/plugin marketplace add` kończy się
`repository not found`, co wygląda jak literówka, a jest brakiem dostępu. **Powiedz to
właścicielowi wprost zaraz po pushu** i pokaż trzy warianty (opisane też w wygenerowanym
README, sekcja „Udostępnij repo zespołowi"):

1. **Collaborators** — imiennie, do 2-3 osób:
   ```bash
   gh api -X PUT repos/<org>/<repo>/collaborators/<login-githuba> -f permission=push
   ```
   (zaproszenie trzeba jeszcze przyjąć na github.com/notifications)
2. **Organizacja na GitHubie** — dostęp raz na osobę, nie raz na repo; docelowe przy rosnącym zespole.
3. **Wspólne konto techniczne** — najszybsze, ale historia gita nie pokazuje, kto co zrobił.

Zaproponuj wariant 1 jako domyślny i zaoferuj, że odpalisz komendę — potrzebujesz tylko loginów.

### 6i. Podsumuj
Instrukcja instalacji dla zespołu (skopiowana z wygenerowanego README) + przypomnij
o `TEAM_PLUGIN_DIR` w `.env` i o rytuale `add`. Powiedz też, co plugin ma już w środku
poza skillami: kontekst firmowy (`context/company-context.md` — do wypełnienia przez admina)
rozdawany hookiem `SessionStart` i pętlę sygnałów (`kontekst-sygnaly` w piątek u każdego,
`kontekst-firmowy review` w poniedziałek u admina — dwa joby w schedulerze).
Zaproponuj od razu pierwszy `/plugin-zespolowy add <skill>`.

---

## Tryb ADD — skill z lokalnego do pluginu

### 2a. Znajdź źródło
Szukaj `<nazwa>` w kolejności: `<workspace>/.claude/skills/` → `~/.claude/skills/`.
Brak → wylistuj dostępne i zakończ. Jest w obu → zapytaj którą wersję.

### 3a. Audyt self-containment (PRZED kopiowaniem)

Skill działający u Ciebie ≠ skill działający z pluginu. Sprawdź źródło (Grep):

1. **Sekrety w treści** — wzorce kluczy (`sk-`, `AKIA`, `ghp_`, `xox`, długie tokeny,
   `API_KEY=<wartość>`), pliki `.env` w katalogu skilla → **STOP, pokaż co znalazłeś**,
   sekret nie może trafić do repo. Wartości mają iść do `.env` usera, do skilla — nazwa zmiennej.
2. **Ścieżki bezwzględne** (`/Users/...`, `C:\...`, `~/Documents/...`) → zaproponuj
   parametryzację: zmienna env z defaultem albo pytanie do usera w treści skilla.
3. **Odwołania do `.claude/skills/...`** → zamień na `{baseDir}/...` (w pluginie skill
   mieszka w cache pluginów, nie w `.claude/skills/`).
4. **Zależności lokalne** (CLI, vendorowane biblioteki, pliki spoza katalogu skilla) →
   dopisz do README pluginu sekcję zależności / skopiuj do katalogu skilla.

**Raport audytu = obowiązkowy przystanek.** Po audycie, PRZED kopiowaniem i jakimkolwiek
commitem, pokaż zwięzły raport znalezisk i CZEKAJ na zgodę usera:
```
🔍 Audyt <skill>: N znalezisk
1. [SEKRET]  SKILL.md:16 — API_KEY=9f8e… → kopia będzie czytać OPENWEATHER_API_KEY z .env
2. [ŚCIEŻKA] SKILL.md:15 — /Users/tomek/Desktop → "$HOME/Desktop"
3. [ŚCIEŻKA] SKILL.md:20 — .claude/skills/<skill>/szablon.md → {baseDir}/szablon.md
```
Dopiero po „ok" nanoś poprawki na KOPIĘ w pluginie (źródło usera zostaje nietknięte,
chyba że user poprosi o sync w obie strony) i przechodź do 4a/5a.
Zero znalezisk → powiedz to jednym zdaniem i jedź dalej bez pytania.

### 4a. Wymagania skilla
Zapytaj (albo wyczytaj ze skryptów skilla — `env_loader`, `os.environ`, `process.env`),
jakich zmiennych env wymaga. Dopisz wpis do `plugins/<plugin>/requirements.json`
(`env` / `skad` / `typ: firmowy|osobisty`) i nazwy kluczy do `.env.example` repo.

### 5a. Kopiuj + commit
```bash
DST="$TEAM_PLUGIN_DIR/plugins/<plugin>/skills/<nazwa>"
rm -rf "$DST" && cp -R <źródło> "$DST"   # czysta podmiana — cp -R NA istniejący katalog zagnieżdża źródło w środku
```
Wytnij śmieci (`__pycache__`, `.DS_Store`). Dopisz skill do listy w README (jeśli go tam nie ma).
```bash
git -C "$TEAM_PLUGIN_DIR" status --short   # pokaż userowi, CO dokładnie się zmienia
git -C "$TEAM_PLUGIN_DIR" add -A && git -C "$TEAM_PLUGIN_DIR" commit -m "feat(<nazwa>): skill z lokalnego do pluginu"
```
Push: zapytaj (push = dystrybucja do całego zespołu przy najbliższym starcie ich sesji).

### 6a. Podsumuj
Co przeniesione, jakie poprawki self-containment, jaki wpis w requirements, status pusha.
Przypomnij: od teraz zmiany tego skilla robi się w pluginie (albo `add` ponownie po zmianie lokalnej).

---

## Tryb CHECK — raport driftu

### 2c. Porównaj trzy zbiory
Lokalne: `<workspace>/.claude/skills/*` + `~/.claude/skills/*`. Plugin:
`$TEAM_PLUGIN_DIR/plugins/<plugin>/skills/*`. Dla nazw obecnych po obu stronach:
```bash
git diff --no-index --stat <lokalny-skill> <plugin-skill>
```
(Exit 1 = SĄ różnice — to wynik, nie błąd. Exit 0 = identyczne.)

### 3c. Raport (trzy grupy)
```
📦 Drift skilli — <plugin>

TYLKO LOKALNIE (kandydaci do add):        <nazwa> · <nazwa>
ROZJECHANE (lokalny ≠ plugin):            <nazwa> — N plików się różni
TYLKO W PLUGINIE (ok — masz z pluginu):   <nazwa> · <nazwa>
```
Dla rozjechanych pokaż, które pliki się różnią, i zaproponuj kierunek syncu
(zwykle lokalny → plugin przez `add`; jeśli plugin nowszy — skasuj lokalną kopię,
skill i tak dojeżdża z pluginu). Niczego nie zmieniaj bez zgody — check jest read-only.

---

## Zasady

- Sekrety NIE jadą w repo — nigdy. Jedzie `requirements.json`: czego brakuje i skąd to wziąć.
- Konfiguracja wspólna → `team-config.json` w pluginie; osobista → `.env` usera.
- `check` jest read-only; `add` zmienia tylko repo pluginu, nie źródło usera.
- Kryterium podziału na pluginy: **firmowe = bezwartościowe poza firmą (prywatne);
  narzędziowe = działa u każdego (może być publiczne)**. Nie mieszaj — łatwiej dzielić dostępy.
- Commit message po polsku, konwencja `feat/fix(<skill>): ...` jak w repo pluginu.
