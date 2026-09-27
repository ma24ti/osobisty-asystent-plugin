---
name: skill-scout
description: Przegląda Twoje logi sesji z Claude Code i wykrywa powtarzalną, żmudną ręczną robotę (te same prośby ≥3× w oknie), którą warto opakować w skill albo dopisać do istniejącego. Generuje krótki raport HTML z kandydatami posortowanymi po zwrocie z czasu. Użyj gdy mówisz "skill scout", "co warto opakować w skill", "przegląd powtarzalnej roboty", "co zautomatyzować", "tygodniowy przegląd skilli", "/skill-scout", albo gdy chcesz wiedzieć które ręczne czynności zżerają Ci czas i nadają się na automatyzację. To skaut Twojej pracy — odpalaj go regularnie, bo sam tych wzorców nie wyłapujesz na bieżąco.
allowed-tools: ["Read", "Write", "Bash", "Glob"]
disable-model-invocation: true
argument-hint: "[dni: 7 (domyślnie) | 14 | 21 | 30]"
---

# Skill Scout 🔍

Skaut Twojej własnej pracy. Czyta prośby, które wielokrotnie zlecasz asystentowi, i wyłapuje
**powtarzalną ręczną robotę nadającą się na skill**. Bliźniak `reflect`/`memory-update` (ten sam
wzorzec: logi sesji → sygnały → wynik), ale zamiast kalibrować osobowość czy stan projektów,
szuka **żmudnych procesów do automatyzacji**.

**Po co to istnieje:** każdy ręczny proces powtarzany kilka razy w tygodniu to kandydat na skill,
który oszczędza czas. Robisz je z rozpędu i sam ich nie wyłapujesz — scout robi to za Ciebie raz
w tygodniu i podaje gotową listę „to warto opakować", posortowaną po zwrocie.

**Zasada nadrzędna:** scout **niczego nie buduje i nie zmienia** — tylko czyta logi i pisze raport
+ plik stanu w `Zasoby/raporty/skill-scout/`. Decyzję, co faktycznie opakować, podejmujesz Ty.

---

## Krok 1 — Okno czasowe

Domyślnie **7 dni**. Jeśli user poda argument (`14`, `21`, `30`) — użyj go. Bez argumentu = 7.

```bash
PYTHON=$(command -v python3 || command -v python)
DAYS=7   # nadpisz wartością z argumentu, jeśli podana
$PYTHON .claude/skills/skill-scout/scripts/parse_intents.py --days "$DAYS" --out /tmp/scout-intents.json
```

Skrypt wypisuje na stderr ile sesji i próśb znalazł. Jeśli `count: 0` → powiedz, że w tym oknie
nie ma materiału, i zakończ.

## Krok 2 — Wczytaj kontekst

Trzy rzeczy, równolegle:

1. **Prośby usera** — `/tmp/scout-intents.json` (lista `{date, time, text}`). To jest materiał do analizy.
2. **Inwentarz istniejących rozwiązań** — żeby ocenić *nowy skill* vs *update istniejącego* i żeby
   Krok 2a wiedział, co już wdrożono. Trzy źródła: skille vaulta, skille z pluginów, skrypty pomocnicze.
   ```bash
   for f in .claude/skills/*/SKILL.md "$HOME"/.claude/plugins/marketplaces/*/plugins/*/skills/*/SKILL.md; do
     [ -f "$f" ] || continue
     name=$(basename "$(dirname "$f")")
     desc=$(grep -m1 '^description:' "$f" 2>/dev/null | sed 's/^description: *//' | cut -c1-300)
     echo "skill $name — $desc"
   done
   for f in .claude/skrypty/*.py; do
     [ -f "$f" ] || continue
     echo "skrypt $(basename "$f") — $(grep -m1 -E '^\s*("""|#)' "$f" | sed -E 's/^\s*("""|#) *//' | cut -c1-200)"
   done
   ```
3. **Plik stanu** — `Zasoby/raporty/skill-scout/_proposed.json` (jeśli istnieje). Lista już zaproponowanych
   kandydatów. Polityka: **zaproponuj raz, nigdy więcej** — kandydat, którego slug już tam jest,
   NIE wraca do raportu, nawet jeśli dalej się powtarza. Każdy rekord ma pole `status`:
   `otwarty` (brak pola = otwarty), `wdrozony` albo `odrzucony`. Raport pokazuje tylko otwarte.

## Krok 2a — Przegląd statusów (każdy przebieg, przed klasteryzacją)

Dla **każdego otwartego** rekordu z `_proposed.json` sprawdź w inwentarzu z Kroku 2, czy proces ma już
rozwiązanie. Wdrożony jest, gdy:
- istnieje skill o tej nazwie albo skill, którego description obejmuje ten proces (np. kandydat
  `commit-tygodnia` pokryty przez `porzadki-repo`),
- dla `type: update`: description skilla z `update_target` opisuje już dodaną funkcję,
- istnieje skrypt w `.claude/skrypty/`, który robi tę robotę (kandydat nie musiał skończyć jako skill).

Trafienie → ustaw w rekordzie `status: "wdrozony"`, `status_date` (dziś), `status_note`
(czym pokryty, np. `skill porzadki-repo`). Wątpliwe dopasowanie zostaw otwarte i wymień w Kroku 9.
Rekordów `odrzucony` nie ruszaj: ten status ustawia wyłącznie user („odrzuć X”, „nie robimy X”),
z `status_note` podającym powód i datę decyzji. Pole `status_note` przy otwartym rekordzie to
uwaga usera (np. „czeka na rejestr nazw”); nie kasuj jej.

Zapisz `_proposed.json` od razu po przeglądzie, **przed** generowaniem raportu, żeby generator
ukrył zamknięte już w tym przebiegu.

## Krok 3 — Wykryj kandydatów (klasteryzacja)

Przeczytaj wszystkie prośby i pogrupuj je w **procesy** — powtarzające się typy ręcznej roboty.
Szukasz **intencji**, nie dosłownie identycznych zdań: „wrzuć X na Drive i daj link",
„dodaj zadanie Y", „zrób grafikę do posta Z" to ten sam proces nawet przy różnych słowach.

**Próg:** ten sam proces musi pojawić się **≥3 razy** w oknie. Mniej = pomiń (szum).

**Co kwalifikuje się na kandydata** (żmudna, mechaniczna, powtarzalna robota):
- wieloetapowe sekwencje, które robisz tak samo za każdym razem (pobierz → przetwórz → zapisz → wrzuć),
- ten sam typ przygotowania/konwersji/uploadu/raportu,
- ręczne czynności, które mają jasny input i output.

**Co NIE jest kandydatem** (odsiej):
- jednorazowa robota projektowa, kreatywne decyzje, dyskusje, pisanie konkretnego contentu,
- procesy, których slug albo sens pokrywa się z rekordem `wdrozony` lub `odrzucony` w `_proposed.json`,
- rzeczy, które już masz jako skill **i wołasz przez `/nazwa`** (to nie ręczna robota — chyba że
  sygnał mówi, że robisz to *obok* skilla, ręcznie → wtedy kandydat na **update**).

Dla każdego kandydata, który przeszedł próg, ustal:
- **title** — krótka nazwa procesu po polsku (np. „Upload materiału na Drive + link do udostępnienia").
- **slug** — proponowana nazwa skilla, kebab-case (np. `drive-upload`).
- **type** — `new` (nowy skill) albo `update` (rozbudowa istniejącego; podaj `update_target` = nazwa skilla).
- **freq** — ile razy proces pojawił się w oknie (liczba).
- **minutes_per_run** — ile minut zżera jeden przebieg ręcznie (rozsądny szacunek; to ma być z grubsza).
- **what** — 1–2 zdania: co to za proces i czemu nadaje się na skill.
- **evidence** — 2–4 krótkie cytaty z dat (np. `"upload material-3 na Drive" (28.06)`) jako dowód powtarzalności.

## Krok 4 — Rozdziel nowe od wcześniej wytypowanych

Porównaj kandydatów z tego przebiegu z `_proposed.json`:
- **Nowe** (slug NIE występuje w `_proposed.json`) → trafiają do `candidates` w danych raportu (sekcja na górze).
- **Już wytypowane** (slug jest w `_proposed.json`) → NIE dodawaj ich do `candidates`. Generator sam
  zaciągnie je z `_proposed.json` i pokaże w sekcji „Wcześniej wytypowane" poniżej — nic nie znika,
  ale na górze ląduje tylko to, czego scout jeszcze nie zgłaszał.

## Krok 5 — Priorytet i sortowanie

Dla każdego kandydata policz:
```
saved_per_week_min = freq × minutes_per_run        (potencjał oszczędności w oknie)
priority           = round(freq × minutes_per_run) (ta sama liczba — steruje kolejnością i kolorem badge'a)
```
Sortuj malejąco po `priority` — najpierw to, co da najwięcej zwrotu. Jeśli **nowych** kandydatów
jest dużo, zostaw **maks. 7 najmocniejszych** (resztę pomiń — sekcja „nowe" ma być czytelna).
Limit dotyczy tylko nowych; historia poniżej pokazuje się w całości.

## Krok 6 — Zapisz dane i wygeneruj raport HTML

Zapisz JSON i odpal generator:

```bash
# zapisz dane do Zasoby/raporty/skill-scout/data/YYYY-MM-DD.json (struktura niżej), potem:
node .claude/skills/skill-scout/scripts/generate-raport.mjs Zasoby/raporty/skill-scout/data/$(date +%F).json
```

Struktura JSON wejściowego dla generatora:
```json
{
  "date": "YYYY-MM-DD",
  "window_days": 7,
  "stats": { "intents": 546, "sessions": 94 },
  "candidates": [
    {
      "slug": "drive-upload",
      "title": "Upload materiału na Drive + link do udostępnienia",
      "type": "new",
      "update_target": null,
      "freq": 4,
      "minutes_per_run": 6,
      "saved_per_week_min": 24,
      "priority": 24,
      "what": "Powtarzasz: wgraj plik na Drive, ustaw udostępnianie, zwróć link. Stały input/output.",
      "evidence": ["upload material-3 na Drive (28.06)", "wrzuć na dysk i daj link (24.06)"]
    }
  ]
}
```
W `candidates` wstawiasz **tylko nowych** kandydatów z tego przebiegu (Krok 4). Generator sam doczyta
sekcję „Wcześniej wytypowane" z `_proposed.json` — dlatego raport generuj **przed** Krokiem 7
(dopisaniem nowych do stanu), inaczej nowe zdublują się w historii.

Raport ląduje w `Zasoby/raporty/skill-scout/Raporty/raport-aktualny.html` + `YYYY-MM-DD.html`.
Układ: **🆕 Nowe w tym tygodniu** na górze, **📋 Wcześniej wytypowane** poniżej.

## Krok 7 — Zaktualizuj plik stanu

Dopisz **nowych** kandydatów z tego przebiegu (sekcja „nowe" z Kroku 4) do
`Zasoby/raporty/skill-scout/_proposed.json`. Zapisuj **pełne rekordy** (te same pola co w danych raportu)
+ `first_proposed`, bo generator renderuje z nich karty historii:
```json
{ "proposed": [
  { "slug": "drive-upload", "title": "…", "type": "new", "update_target": null,
    "freq": 4, "minutes_per_run": 6, "saved_per_week_min": 24, "priority": 24,
    "what": "…", "evidence": ["…"], "first_proposed": "YYYY-MM-DD" }
] }
```
Jeśli plik istnieje — **dołącz** do `proposed`, nie nadpisuj. Slug już obecny → nie duplikuj.

## Krok 8: zadanie-przypomnienie w Skrzynce Todoista (gdy są nowi kandydaci)

Gdy w tym przebiegu pojawił się co najmniej jeden nowy kandydat, dodaj zadanie do Skrzynki Todoista:
`POST https://api.todoist.com/api/v1/tasks` bez `project_id`, token z `.env` vaulta przez `wczytaj_env`
z `.claude/skrypty/todoist_today.py`.
- `content`: `Przejrzyj N nowych kandydatów na skille (skill-scout)`
- `due_string`: `today`, `priority`: 1
- `description`: ścieżka do raportu `Zasoby/raporty/skill-scout/Raporty/raport-aktualny.html`

Raport leży w Zasobach i bez przypomnienia łatwo o nim zapomnieć; dashboard vaulta nie przyjmuje zadań,
a Todoist jest na telefonie. Pomiń krok, gdy nowych kandydatów jest zero. Gdy API nie odpowiada, napisz
to w podsumowaniu (Krok 9) zamiast zakładać zadanie gdzie indziej.

## Krok 9 — Podsumowanie w czacie

Krótko (nie ściana tekstu):
- ile próśb przeskanowane, z ilu sesji, w jakim oknie,
- ilu kandydatów (ile nowych), top 1–2 z priorytetem,
- które rekordy Krok 2a zamknął w tym przebiegu jako wdrożone (slug i czym pokryte) oraz wątpliwe dopasowania,
- ścieżka do raportu HTML,
- łączny potencjał oszczędności / tydzień.

---

## Zasady

- **Tylko prośby usera** — sygnałem jest to, co Kacper ZLECA, nie sekwencje narzędzi ani skill-usage.log.
- **Próg ≥3×** — mniej to szum, nie wzorzec.
- **Nowe na górze, historia poniżej** — kandydat zgłoszony raz nie wraca na górę, ale zostaje widoczny
  w sekcji „Wcześniej wytypowane", dopóki jest otwarty (`_proposed.json` to pamięć scouta).
- **Wdrożone i odrzucone znikają z raportu** — rekord zostaje w `_proposed.json` ze statusem, żeby
  nie wrócił jako nowy; w raporcie widać tylko ich liczbę w stopce.
- **Maks. 7 NOWYCH** w sekcji górnej — zwrot z czasu > kompletność. Historia bez limitu.
- **Zadanie zawsze** gdy ≥1 nowy kandydat — siatka bezpieczeństwa, żeby nie zapomnieć o raporcie.
- **Nic nie buduj** — scout tylko czyta i raportuje; budowę skilla robisz osobno (np. `/skill-creator`).
- **Cross-platform** — `PYTHON=$(command -v python3 || command -v python)`, kotwica w żywym vaulcie
  (`.obsidian`) — gotowe pod uruchamianie z Pulsa (claude-cron).
- **Cleanup** — usuń `/tmp/scout-intents.json` po przebiegu.

---

## Uruchamianie z Pulsa (headless / claude-cron)

Skill jest gotowy pod cron — cały flow to jeden **claude-job** (parsowanie jest szybkie, klasteryzacja
to zadanie LLM w tym samym przebiegu, nie długi sub-proces). Zasady headless:

- **Okno = 7 dni** w cronie (default). Szersze okna (14/21/30) to tryb ręczny do okazjonalnego audytu —
  7 dni trzyma liczbę próśb na poziomie, który mieści się w kontekście bez subagenta.
- **CWD musi być rootem vaulta.** Skrypty używają ścieżek względnych (`.claude/...`, `Zasoby/...`).
  W cronie ustaw `CLAUDE_CRON_WORKSPACE` (parser i generator czytają tę zmienną i kotwiczą w nim) —
  tak samo jak `reddit-news`.
- **Zadanie-przypomnienie (Krok 8)** działa headless: idzie przez API Todoista, więc raport zobaczysz
  w Todoiście i w `/daily` nawet po nocnym przebiegu. Wymaga tokenu Todoista w `.env` vaulta.
