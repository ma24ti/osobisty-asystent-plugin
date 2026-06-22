---
name: onboarding
description: Jednorazowy wizard setup Osobistego Asystenta AI — wywiad, generacja persona.md, soul.md, opcjonalnie biznes.md i content/voice-of-tone.md, zawsze content/ai-writing-patterns.md, struktura folderów, CLAUDE.md
disable-model-invocation: true
allowed-tools: ["Read", "Write", "Edit", "Glob", "Bash", "AskUserQuestion"]
---

# Onboarding — Setup Osobistego Asystenta AI

Jednorazowy wizard, który prowadzi usera przez konfigurację Personal OS. Wywiad → generacja plików kontekstowych → struktura folderów → CLAUDE.md.

**Czas:** ~15-20 minut
**Wynik:** persona.md, soul.md, opcjonalnie biznes.md, CLAUDE.md, struktura folderów

### Wspólny pattern: generacja → review → zapis

Kroki 7, 8, 9 używają tego samego workflow:
1. Wygeneruj plik na podstawie zebranych danych
2. Wyświetl pełną zawartość userowi
3. Zapytaj: "Przeczytaj i powiedz co zmienić."
4. Jeśli user chce zmiany → popraw i pokaż ponownie (bez limitu iteracji)
5. Jeśli user akceptuje → zapisz do docelowej ścieżki (utwórz folder jeśli nie istnieje)

---

## KROK 0: GATEWAY CHECK

1. Sprawdź czy istnieje `.claude/.onboarded`
2. Jeśli **TAK** → wyświetl i STOP:

```
System już skonfigurowany ✅

Pliki kontekstowe: .claude/rules/persona.md, soul.md
Jeśli chcesz zresetować i przejść onboarding od nowa → usuń plik .claude/.onboarded
```

3. Jeśli **NIE** → kontynuuj do kroku 0.5

---

## KROK 0.5: WYKRYCIE ŚRODOWISKA

Wykryj środowisko maszyny RAZ i zapisz wynik — skille korzystają z tego pliku zamiast wykrywać środowisko od nowa w każdej sesji (i od nowa się mylić).

1. Uruchom (Bash):

```bash
UNAME=$(uname -s 2>/dev/null || echo unknown)
case "$UNAME" in
  Darwin) OS="macOS";;
  Linux) OS="Linux";;
  MINGW*|MSYS*|CYGWIN*) OS="Windows";;
  *) OS="$UNAME";;
esac
# Python — pomiń stub MS Store (WindowsApps)
PYTHON=""
for cand in python3 python; do
  p=$(command -v "$cand" 2>/dev/null) || continue
  case "$p" in *WindowsApps*) continue;; esac
  PYTHON="$p"; break
done
PY_VER=$([ -n "$PYTHON" ] && "$PYTHON" --version 2>&1 || echo BRAK)
NODE=$(command -v node 2>/dev/null || echo BRAK)
NODE_VER=$(node --version 2>/dev/null || echo "-")
echo "OS: $OS"
echo "PYTHON: ${PYTHON:-BRAK} ($PY_VER)"
echo "NODE: $NODE ($NODE_VER)"
```

2. Zapisz wynik do `.claude/rules/environment.md` (utwórz folder jeśli trzeba):

```markdown
# Środowisko — wykryte przez /onboarding ([dzisiejsza data YYYY-MM-DD])

- **System:** [OS]
- **Python:** `[pełna ścieżka]` ([wersja]) — do skryptów używaj TEJ ścieżki
- **Node:** `[ścieżka]` ([wersja])
```

Jeśli OS = Windows, dopisz na końcu:

```markdown
- ⚠️ **Windows:** `python3` ze Sklepu Microsoft to stub — NIE używaj. Pliki tymczasowe
  zapisuj w `.claude/tmp/` (NIE w `/tmp` — ścieżka MSYS, niewidoczna dla narzędzia Read).
```

3. Jeśli Python = BRAK → poinformuj usera, że część skilli wymaga Pythona (instalacja: https://python.org, na Windows zaznaczyć "Add to PATH") — ale **kontynuuj onboarding**, nie blokuj.

---

## KROK 1: POWITANIE

Wyświetl tekst (NIE AskUserQuestion — to intro):

```
👋 Cześć! Zaraz skonfigurujemy Twojego AI pod Ciebie.

Co się stanie:
1. Pogadamy — poznam Cię (kilka pytań, ~15-20 min)
2. Wygeneruję persona.md — Twój profil, który AI czyta na starcie
3. Wygeneruję soul.md — osobowość AI dopasowaną do Ciebie
4. Postawię strukturę folderów i system zadań
5. Wygeneruję CLAUDE.md — "mózg" systemu

Na końcu będziesz mieć działający Personal OS. Lecimy 🚀
```

---

## KROK 2: KIM JESTEŚ

**Pytanie otwarte** (zwykły tekst, NIE AskUserQuestion — potrzebna rozbudowana odpowiedź):

> Opowiedz o sobie — kim jesteś, czym się zajmujesz, jaka firma/projekt?
> I skąd przyszedłeś zawodowo — chcę znać Twoją drogę, nie jednozdaniowiec.

Czekaj na odpowiedź. Jeśli zbyt krótka → dopytaj: "Możesz rozwinąć? Co robiłeś wcześniej?"

Zapisz odpowiedź do kontekstu (użyjesz w kroku 7).

---

## KROK 3: STYL KOMUNIKACJI

**AskUserQuestion — 4 pytania na raz:**

| # | Pytanie | Header | Opcje (label · description) |
|---|---------|--------|-----------------------------|
| 1 | Jak formalnie ma gadać AI? | Formalność | **Luźno (1-2/5)** · Jak z kumplem, humor, zero dystansu · **Pośrodku (3/5)** · Naturalnie, bez sztywności ale bez wulgaryzmów · **Profesjonalnie (4-5/5)** · Biznesowo, precyzyjnie, z dystansem |
| 2 | Jak podejmujesz decyzje? | Analityczność | **Intuicja** · Czuję co jest dobre, nie potrzebuję danych · **Mix** · Dane tam gdzie ważne, intuicja w reszcie · **Dane i liczby** · Fakty, metryki, porównania — bez tego nie ruszam |
| 3 | Jak wolisz dostawać odpowiedzi? | Format | **Krótko** · Mięso, zero wody · **Z opcjami do wyboru** · 3-5 wariantów z trade-offami · **Z przykładami** · Pokaż na przykładzie, potem teoria · **Szczegółowo** · Pełen kontekst, wyjaśnienia |
| 4 | Jak chcesz feedback od AI? | Feedback | **Prosto w twarz** · Bez owijania, jeśli słabe to słabe · **Konstruktywnie** · Wskaż problem i zaproponuj rozwiązanie · **Delikatnie** · Sugestie zamiast krytyki |

Wszystkie pytania: `multiSelect: false`

Zapisz odpowiedzi do kontekstu.

---

## KROK 4: WARTOŚCI I PRACA

**Pytanie otwarte** (jedno, wieloczęściowe):

> Teraz kilka pytań o to jak pracujesz:
>
> 1. Jakie masz twarde zasady w pracy? Czego ZAWSZE się trzymasz?
> 2. Czego NIGDY nie akceptujesz?
> 3. Jakich narzędzi/technologii używasz na co dzień?
> 4. Nad czym teraz pracujesz? Główne projekty?

Jeśli odpowiedź ogólnikowa → dopytaj: "Możesz dać konkretny przykład?"

Zapisz do kontekstu.

---

## KROK 5: RELACJA Z AI + FRUSTRACJE

**AskUserQuestion — 1 pytanie:**

| # | Pytanie | Header | Opcje (label · description) |
|---|---------|--------|-----------------------------|
| 1 | Jak widzisz AI? | Relacja z AI | **Partner** · Współpracownik na równi, ma opinię, calloutuje błędy · **Narzędzie** · Robisz co mówię, bez inicjatywy · **Mentor** · Prowadzi, uczy, podpowiada kierunek · **Asystent** · Pomaga, wspiera, wykonuje polecenia |

`multiSelect: false`

**Potem pytanie otwarte:**

> Dwa ważne pytania — im szczerzej, tym lepiej AI się do Ciebie dostosuje:
>
> 1. Co Cię WKURZA w AI / chatbotach? Co robią, czego nie znosisz?
>    (np. "zaczyna od Świetne pytanie!", "pisze za dużo", "nie ma opinii")
>
> 2. Jak chcesz żeby TWOJE AI z Tobą rozmawiało? Jaki ton, jaki styl?
>    (np. "jak kumpel", "bez bullshitu", "z humorem", "profesjonalnie ale luźno")

Zapisz do kontekstu.

---

## KROK 6: MOTYWATORY + BLOKERY

**Pytanie otwarte:**

> Ostatnia runda — o Twoją energię:
>
> 1. Kiedy czujesz flow? Co Cię nakręca? (podaj min. 3 sytuacje)
> 2. Co Cię drenuje? Co zabiera energię?
> 3. Jakie masz wady/blokery? (perfekcjonizm? prokrastynacja? shiny object syndrome?)
>    — bądź szczery, to zostaje między Tobą a AI

**Potem AskUserQuestion — 1 pytanie:**

| # | Pytanie | Header | Opcje (label · description) |
|---|---------|--------|-----------------------------|
| 1 | Masz wyniki testów osobowości? | Testy | **Tak, wkleję** · Gallup, MBTI, DISC, cokolwiek — wklej w następnej wiadomości · **Nie mam** · Pomijamy — nie jest wymagane |

`multiSelect: false`

Jeśli "Tak, wkleję" → czekaj na wklejenie wyników. Potem kontynuuj.
Jeśli "Nie mam" → kontynuuj od razu.

---

## KROK 7: GENERACJA persona.md

1. Przeczytaj `prompt-persona.md` z tego skilla (ten sam folder co SKILL.md)
2. Na podstawie WSZYSTKICH odpowiedzi z kroków 2-6 wygeneruj persona.md zgodnie z instrukcjami z prompt-persona.md
3. Zastosuj pattern: generacja → review → zapis (ścieżka: `.claude/rules/persona.md`)

---

## KROK 8: KONTEKST BIZNESOWY (opcjonalny)

**AskUserQuestion — 1 pytanie:**

| # | Pytanie | Header | Opcje (label · description) |
|---|---------|--------|-----------------------------|
| 1 | Chcesz dodać kontekst biznesowy? AI lepiej zrozumie Twój świat zawodowy. | Biznes | **Tak** · Opowiem o firmie/projekcie — AI będzie lepiej dopasowane · **Nie, pomiń** · Dodasz później jeśli będziesz chcieć |

`multiSelect: false`

**Jeśli TAK:**

Pytanie otwarte:

> Opowiedz o swoim biznesie/pracy:
>
> 1. Czym się zajmujesz zawodowo? (firma, branża, model)
> 2. Kto jest Twoim klientem/odbiorcą?
> 3. Na jakich platformach/kanałach działasz?
> 4. Jaki masz stack technologiczny?

Wygeneruj `biznes.md` z sekcjami:
- Działalność (firma, branża, model, skala)
- Grupa docelowa
- Platformy i kanały
- Stack technologiczny
- Aktualne projekty (jeśli wspomniał)

Zastosuj pattern: generacja → review → zapis (ścieżka: `.claude/rules/biznes.md`)

**Jeśli NIE** → pomiń, kontynuuj do kroku 9. Zapamiętaj że biznes.md nie powstał (potrzebne w krokach 12 i 14).

---

## KROK 9: GENERACJA soul.md

**AskUserQuestion — 2 pytania:**

| # | Pytanie | Header | Opcje (label · description) |
|---|---------|--------|-----------------------------|
| 1 | Humor i przeklinanie w AI? | Humor | **Pełen luz** · Humor + przeklinanie kiedy pasuje · **Humor tak, przeklinanie nie** · Luźny ton, ale bez wulgaryzmów · **Profesjonalnie** · Zero humoru w pracy, rzeczowo i na temat |
| 2 | AI ma mieć mocne opinie? | Opinie | **Mocne** · Calloutuje błędy, nie jest yes-manem, mówi wprost · **Wyważone** · Wskazuje lepszą opcję, ale nie narzuca · **Neutralne** · Fakty na stole, user decyduje |

Wszystkie: `multiSelect: false`

**Potem pytanie otwarte:**

> Ostatnie pytanie: opisz swoimi słowami jakiego "charakteru" ma mieć Twoje AI.
>
> Np. "jak kumpel developer z którym siedzisz do 2 w nocy nad projektem"
> albo "jak senior mentor który nie oszczędza krytyki ale zawsze ma rozwiązanie"
> albo cokolwiek innego — tu nie ma złej odpowiedzi.

**Generacja:**

1. Przeczytaj `prompt-soul.md` z tego skilla
2. Wygeneruj soul.md na podstawie:
   - persona.md (cały profil wygenerowany w kroku 7)
   - biznes.md (jeśli utworzony w kroku 8)
   - Odpowiedzi z tego kroku (humor, opinie, charakter)
3. Zastosuj pattern: generacja → review → zapis (ścieżka: `.claude/rules/soul.md`)

---

## KROK 9B: VOICE OF TONE (opcjonalny — wymaga próbek)

Plik `content/voice-of-tone.md` opisuje JAK user pisze treści. Tworzymy go **TYLKO** jeśli
user pisze content **I dostarczy próbki** — bez realnych tekstów byłby zmyślony i bezużyteczny.

**AskUserQuestion — 1 pytanie:**

| # | Pytanie | Header | Opcje (label · description) |
|---|---------|--------|-----------------------------|
| 1 | Tworzysz treści (posty, maile, wpisy) i chcesz, żeby AI pisało Twoim głosem? | Voice | **Tak, mam próbki** · Wkleję 5-15 swoich tekstów — AI wyłapie styl · **Tak, ale później** · Tworzę content, dorzucę próbki kiedy indziej · **Nie tworzę treści** · Pomiń — nie dotyczy mnie |

`multiSelect: false`

**Jeśli "Tak, mam próbki":**
1. Poproś: *"Wklej 5-15 swoich tekstów (posty/maile/wpisy) — im więcej, tym lepiej AI złapie styl."*
2. Czekaj na wklejenie. Jeśli <5 próbek → poproś o więcej albo zaproponuj wariant "później".
3. Przeczytaj `prompt-voice-of-tone.md` z tego skilla.
4. Wygeneruj `content/voice-of-tone.md` zgodnie z instrukcją z prompta.
5. Pattern: generacja → review → zapis (ścieżka: `.claude/rules/content/voice-of-tone.md`).

**Jeśli "Tak, ale później" lub "Nie tworzę treści":**
Pomiń. Zapamiętaj, że voice-of-tone NIE powstał (potrzebne w kroku 12). Jeśli "później" →
powiedz: *"Spoko — skille `/reflect` i `/x-weekly-analysis` zbudują go z czasem z Twoich tekstów."*

**NIEZALEŻNIE od odpowiedzi (zawsze, bez pytania):**
Skopiuj `templates/ai-writing-patterns.md` z tego skilla do `.claude/rules/content/ai-writing-patterns.md`
(`mkdir -p` na folder). To uniwersalny, statyczny dokument referencyjny (wzorce usuwania artefaktów AI
z polskich tekstów) — NIE jest personalizowany i NIE zależy od voice-of-tone. Przyda się przy każdej
pracy z tekstem (posty, maile, wpisy). *(Plik zasiewa też hook `seed-base-files` przy starcie sesji,
gdyby onboarding był pomijany.)*

---

## KROK 10: STRUKTURA FOLDERÓW

**Utwórz automatycznie (bez pytania):**

```
Zadania/
├── to_do.md              ← skopiuj z templates/to_do.md, zamień {{DATE}} na dzisiejszą datę YYYY-MM-DD
├── projekty/
├── w_trakcie/
├── zrobione/
├── cykliczne/
│   └── recurring.md      ← skopiuj z templates/recurring.md
└── .szablony/
    └── szablon-zadania.md  ← skopiuj z templates/szablon-zadania.md

Zasoby/
```

Pliki template'ów: przeczytaj z folderu `templates/` w tym skillu i skopiuj do docelowych lokalizacji.

**AskUserQuestion — 1 pytanie, multiSelect:**

| # | Pytanie | Header | multiSelect | Opcje (label · description) |
|---|---------|--------|-------------|-----|
| 1 | Jakie dodatkowe foldery chcesz? | Foldery | true | **Marketing/** · Wpisy, media, pomysły — do contentu i social media · **Notatki/** · Spotkania, rozmowy, braindumpy · **Brudnopis.md** · Szybkie notatki, scratch pad — jeden plik na wszystko |

Utwórz wybrane:
- `Marketing/` → utwórz subfoldery: `wpisy/`, `media/`, i plik `pomysły.md` (pusty z nagłówkiem)
- `Notatki/` → utwórz subfoldery: `spotkania/`
- `Brudnopis.md` → pusty plik z nagłówkiem `# Brudnopis`

Zapamiętaj co zostało utworzone (potrzebne w kroku 12).

---

## KROK 11: PRZEGLĄD SKILLI

**Wyświetl tekst (bez pytań):**

```
📦 Twój system ma 4 wbudowane skille — działają od razu:

/daily            — codzienne porządki: archiwizacja zrobionych zadań,
                    regeneracja dashboardu, raport co nowego
/memory-update    — aktualizuje NOW.md (bieżący kontekst pracy) z logów
                    sesji — dzięki temu AI wie nad czym pracujesz
/reflect          — odpal po sesji, AI analizuje rozmowę i kalibruje
                    Twoje pliki kontekstowe (persona.md, soul.md, voice-of-tone.md)
/utworz-zadanie   — tworzy zadanie w systemie Obsidian z priorytetem,
                    terminem i projektem

Wszystkie działają od razu — wystarczy wpisać /nazwa w Claude Code.
Dodatkowe skille (email, social media, generowanie grafik...) to osobny
materiał — możesz je doinstalować w dowolnym momencie.
```

---

## KROK 12: GENERACJA CLAUDE.md

1. Przeczytaj `template-claude.md` z tego skilla
2. Wypełnij placeholder'y:

**{{RULES_LIST}}** — tabela z plikami w `.claude/rules/`:

| Plik | Opis | Kiedy się ładuje |
|------|------|-----------------|
| `rules/persona.md` | Profil użytkownika, styl komunikacji, wartości | Zawsze |
| `rules/soul.md` | Osobowość AI, charakter, styl myślenia | Zawsze |
| `rules/environment.md` | Wykryte środowisko maszyny (OS, Python, node) | Zawsze |
| `rules/NOW.md` | Bieżący kontekst pracy (tworzy i aktualizuje `/memory-update`) | Zawsze |
| `rules/biznes.md` | Kontekst biznesowy (firma, branża, stack, platformy) | Zawsze |
| `rules/content/voice-of-tone.md` | Styl pisania treści (posty, maile) | Przy pracy z contentem |
| `rules/content/ai-writing-patterns.md` | Wzorce usuwania artefaktów AI z tekstów | Przy pracy z contentem |

Wiersz NOW.md wpisuj ZAWSZE, nawet jeśli plik jeszcze nie istnieje —
powstanie przy pierwszym `/memory-update`.
Pomiń wiersz `rules/biznes.md` jeśli user nie utworzył go w kroku 8.
Pomiń `content/voice-of-tone.md` jeśli nie został utworzony w kroku 9B.
Wiersz `content/ai-writing-patterns.md` wpisuj ZAWSZE (plik kopiowany bezwarunkowo w kroku 9B / seed hookiem).

**{{SKILLS_LIST}}** — lista 4 skilli core:

```
**Workflow / Zarządzanie:**
- `daily` - codzienna aktualizacja systemu zadań (archiwizacja, regeneracja dashboardu, raport)
- `memory-update` - aktualizacja NOW.md (bieżący kontekst pracy) z logów sesji
- `reflect` - walidacja obserwacji o użytkowniku → aktualizacja plików kontekstowych
- `utworz-zadanie` - tworzenie nowego zadania w systemie Obsidian
```

**{{FOLDER_STRUCTURE}}** — mapa workspace na podstawie FAKTYCZNIE utworzonych folderów:

```
- `.claude/` - konfiguracja Claude Code
- `Zadania/` - system zarządzania zadaniami
  - `to_do.md` - główna lista zadań
  - `projekty/` - aktywne projekty
  - `w_trakcie/` - zadania w toku
  - `zrobione/` - ukończone zadania
  - `cykliczne/recurring.md` - zadania cykliczne
  - `.szablony/szablon-zadania.md` - szablon zadania
- `Zasoby/` - materiały zewnętrzne
```

Dodaj `Marketing/`, `Notatki/`, `Brudnopis.md` jeśli zostały wybrane w kroku 10.

**{{CONVENTIONS}}** — konwencje systemu:

```
- Pliki markdown w formacie Obsidian
- Checkboxy w formacie `- [ ]` / `- [x]`

### System zadań

- **Tworzenie zadań:** ZAWSZE używaj komendy `/utworz-zadanie` — nigdy nie twórz plików zadań ręcznie
- **Nazwy zadań:** kebab-case (np. `moje-nowe-zadanie.md`)
- **Podzadania:** prefiks `_` w nazwie pliku (np. `_podzadanie.md`)
- **Emoji priorytetów w dashboard:** 🔴 pilne | 🟡 wazne | 🟢 normalne
```

3. Zapisz do `.claude/CLAUDE.md`
4. Wyświetl krótkie podsumowanie: "CLAUDE.md wygenerowany — zawiera rules, skille, strukturę folderów i konwencje."

---

## KROK 13: WALIDACJA SPÓJNOŚCI

Przeczytaj wygenerowane pliki i sprawdź:

| Check | Co sprawdzam | Jak naprawić |
|-------|-------------|-------------|
| persona ↔ soul | Czy soul.md odzwierciedla preferencje z persona.md? | Automatycznie dopasuj soul.md |
| Anty-wzorce | Czy "czego nie robię" w soul.md pokrywa "co wkurza w AI" z persona? | Dodaj brakujące punkty do soul.md |
| Formalność | Czy ton soul.md pasuje do formalności z persona? | Dostosuj język soul.md |
| CLAUDE.md kompletność | Czy router wskazuje na wszystkie utworzone pliki? | Dodaj brakujące wpisy |
| Struktura | Czy wszystkie foldery wymienione w CLAUDE.md istnieją? | Utwórz brakujące lub usuń z listy |

**Drobne poprawki** → napraw automatycznie bez pytania.
**Duże niespójności** → zgłoś userowi i zapytaj co zrobić.

**Ślad walidacji jest OBOWIĄZKOWY** — po wykonaniu checków wypisz userowi wynik,
jedna linia per check (`✅ persona ↔ soul — spójne` / `⚠️ Anty-wzorce — dopisałem 2 punkty do soul.md`).
Bez wypisanego śladu NIE przechodź do kroku 14.

---

## KROK 14: FINALIZACJA

1. Zapisz flagę `.claude/.onboarded`:

```
onboarded: true
date: [dzisiejsza data YYYY-MM-DD]
version: 1.0
```

2. Wyświetl podsumowanie:

```
✅ Personal OS skonfigurowany!

Utworzone pliki:
📄 .claude/rules/persona.md — Twój profil
📄 .claude/rules/soul.md — osobowość AI
📄 .claude/rules/environment.md — środowisko maszyny (OS, Python, node)
📄 .claude/rules/biznes.md — kontekst biznesowy [TYLKO jeśli utworzony]
📄 .claude/rules/content/voice-of-tone.md — styl pisania treści [TYLKO jeśli utworzony]
📄 .claude/rules/content/ai-writing-patterns.md — wzorce unikania "AI voice" w tekstach
📄 .claude/CLAUDE.md — router systemu
📁 Zadania/ — system zadań (z dashboardem, cyklicznymi, szablonami)
📁 Zasoby/ — materiały
📁 [dodatkowe foldery jeśli wybrane]

Co dalej:
1. Pogadaj z AI o czymkolwiek — poczuj różnicę w stylu
2. Po kilku sesjach odpal /reflect — AI się skalibruje
3. Wpisz /daily rano — system posprząta i pokaże co na dziś
```

Pomiń linijkę z biznes.md jeśli nie został utworzony.

---

## Constraints

- **Jednorazowy** — po zapisaniu `.onboarded` skill się blokuje (krok 0)
- **Nie wymyślaj** — persona i soul bazują TYLKO na odpowiedziach usera
- **Review obowiązkowy** — persona.md i soul.md MUSZĄ być pokazane userowi do akceptacji przed zapisem
- **Iteracja** — jeśli user chce zmiany → popraw i pokaż ponownie, bez limitu iteracji
- **Templates z tego skilla** — pliki do Zadania/ kopiuj z `templates/` w tym skillu, NIE twórz od zera
- **Foldery** — twórz wszystkie potrzebne foldery automatycznie (mkdir -p)
- **Język** — pisz w języku w jakim mówi user (jeśli po polsku → wszystko po polsku)
