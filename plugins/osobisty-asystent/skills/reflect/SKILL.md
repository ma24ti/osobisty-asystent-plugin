---
name: reflect
description: Analizuje sesje i proponuje kalibrację plików tożsamości — persona.md, soul.md, content/voice-of-tone.md. Trzy tryby — interactive (bieżąca sesja, zatwierdzasz od razu), weekly (parser 7-dniowych logów → propozycje z checkboxami do _reflect-pending.md, cron-friendly) i apply (nanosi zaznaczone checkboxami propozycje na pliki docelowe). Użyj `/reflect weekly` dla tygodniowego, `/reflect apply` po zaznaczeniu propozycji.
allowed-tools: ["Read", "Edit", "Write", "Bash", "Glob"]
---

# Reflect

Kalibruje pliki **tożsamości i preferencji** na podstawie sesji: `persona.md`, `soul.md`,
`content/voice-of-tone.md`. Bliźniak `memory-update` (ten sam wzorzec: sesje → sygnały →
pliki w `rules/`), ale z polityką **HUMAN APPROVAL** — zmiana tożsamości/charakteru AI to
wysokie ryzyko driftu, więc reflect NIGDY nie zapisuje plików docelowych bez zgody człowieka.

Podział ról (nie wchodź w cudze):
- `memory-update` → `NOW.md` (bieżący stan, auto).
- `biznes.md` → fakty o firmie/pracy (stabilne, edytuje user).
- **reflect → persona / soul / voice-of-tone** (preferencje i styl, approval).

Trzy tryby:
- **interactive** (domyślny) — analizuje BIEŻĄCĄ sesję, pokazuje propozycje od razu, pyta o zgodę.
- **weekly** — parser 7-dniowych logów, zapisuje propozycje z checkboxami do `_reflect-pending.md`
  (bez interakcji, do crona), tworzy zadanie-przypomnienie. NIE edytuje plików docelowych.
- **apply** — czyta `_reflect-pending.md`, nanosi na pliki docelowe TYLKO propozycje zaznaczone
  checkboxem (`- [x]`), resztę zostawia. Selekcja idzie przez checkboxy w pliku, nie przez argument.

---

## 1. Wykryj tryb

- `/reflect weekly` → tryb **weekly**.
- `/reflect apply` → tryb **apply**.
- W przeciwnym razie → **interactive**.

---

## Tryb INTERACTIVE (domyślny)

### 2i. Załaduj pliki kontekstowe
```
.claude/rules/persona.md
.claude/rules/soul.md
.claude/rules/content/voice-of-tone.md   (jeśli istnieje)
```
Zapamiętaj strukturę sekcji każdego pliku.

### 3i. Przeczytaj mapping
Otwórz `mapping.md` w tym skillu — mapuje sygnały na sekcje i pliki.

### 4i. Przeskanuj BIEŻĄCĄ sesję
Szukaj sygnałów z mappingu. Dla każdego trafienia:
- **Jawne** (user wprost powiedział) → kandydat
- **Powtórzone** (min. 2x w tej sesji) → kandydat
- **Jednorazowe + ukryte** → SKIP

### 5i. Pokaż propozycje
```
📝 Obserwacje z sesji:

| # | Sygnał | Plik | Sekcja | Typ |
|---|--------|------|--------|-----|
| 1 | [cytat/opis] | persona.md | § 7 (Nie rób) | ADD |

Proponowane zmiany (diff):

**persona.md → § 7 (Nie rób)**
+ [nowy tekst]

Zatwierdzić? (możesz wybrać które)
```
Jeśli brak → "Brak nowych obserwacji. Sesja zgodna z profilem."

### 6i. Po zatwierdzeniu
- Edytuj wskazane pliki (tylko zatwierdzone pozycje)
- Zaktualizuj datę na końcu pliku (`*Ostatnia edycja: DD.MM.YYYY*`)

---

## Tryb WEEKLY (cron-friendly, bez interakcji)

Weekly NIE edytuje plików docelowych — tylko zapisuje propozycje do przeglądu.

### 2w. Setup (cross-platform — Windows-safe)
> ⚠️ Na Windows `command -v python3` zwraca stub ze Sklepu Microsoft (`...WindowsApps/python3`),
> który NIE jest realnym interpreterem. Poniższy blok go pomija. Uruchamiaj z roota vaulta —
> **NIE rób `cd`** (skrypt liczy katalog sesji z workspace; `MEMORY_UPDATE_WORKSPACE` przypina go na sztywno).
> ```bash
> # Interpreter Python — pomiń stub MS Store (WindowsApps)
> PYTHON=""
> for cand in python3 python; do
>   p=$(command -v "$cand" 2>/dev/null) || continue
>   case "$p" in *WindowsApps*) continue;; esac
>   PYTHON="$p"; break
> done
> [ -z "$PYTHON" ] && PYTHON=python
> # Przypnij vault (odporne na cd) + katalog tmp widoczny dla Read (nie /tmp — niewidoczne na Win)
> export MEMORY_UPDATE_WORKSPACE="${CLAUDE_PROJECT_DIR:-$PWD}"
> mkdir -p .claude/tmp
> ```

### 3w. Parsuj 7-dniowe logi
```bash
$PYTHON .claude/skills/reflect/scripts/parse_sessions.py --days 7 2>.claude/tmp/reflect-stats.txt > .claude/tmp/reflect-dialog.txt
cat .claude/tmp/reflect-stats.txt
```
Jeśli 0 sesji → "Brak sesji z ostatniego tygodnia" i zakończ.

### 4w. Załaduj pliki + mapping
Jak w 2i/3i: persona, soul, content/voice-of-tone, `mapping.md`.

### 5w. Ekstrakcja sygnałów (mocniejszy filtr)
Przeskanuj dialog z 7 dni. Filtr **ostrzejszy** niż interactive:
- Dodawaj tylko sygnały **jawne** LUB **powtórzone min. 2x w różnych sesjach** tygodnia.
- Jednorazowa intensywna sesja ≠ wzorzec → SKIP.
- `soul.md` = **najwyższy próg**: tylko gdy user JAWNIE prosił o zmianę charakteru (nie inference).
- Pomiń stabilne fakty o firmie/pracy (→ biznes.md) i bieżące projekty (→ NOW.md).

### 6w. Zapisz propozycje do `_reflect-pending.md` (NIE edytuj plików!)
Zapisz `.claude/rules/_reflect-pending.md` w formacie niżej. **Każda propozycja MUSI mieć
checkbox `- [ ] ✅ Zatwierdź tę zmianę`** bezpośrednio pod jej blokiem diff — to przez ten
checkbox user wybiera, co naniesie tryb `apply`. Jeśli zero sygnałów — NIE twórz pliku
(i nie twórz zadania w 7w). Sekcje pomocnicze (np. „Odrzucone") dawaj jako `###` (H3), nie `##`,
żeby nie liczyły się jako propozycje.

### 7w. Utwórz zadanie-przypomnienie
Jeśli powstały propozycje — wywołaj skill `utworz-zadanie`:
> tytuł: `🧠 Przejrzyj N propozycji reflect (persona/soul/voice-of-tone)`
> termin: dziś, priorytet: normalny
Dzięki temu pamiętasz wrócić — zadanie ląduje w `Dashboard.md` (przy `/daily` je zobaczysz).
Hook `SessionStart` (`reflect-pending-notify.js`) dodatkowo zasygnalizuje istnienie
`_reflect-pending.md` przy starcie sesji.

### 8w. Podsumuj
Krótko: ile propozycji, do których plików, gdzie czekają. Przypomnij userowi flow:
zaznacz checkboxy przy zmianach, które chcesz → odpal `/reflect apply`.

---

## Tryb APPLY (nanosi zaznaczone propozycje)

Materializuje decyzję usera: nanosi na pliki docelowe TYLKO propozycje, które user zaznaczył
checkboxem `- [x]` w `_reflect-pending.md`. Niezaznaczone zostają nietknięte w pliku.

### 2a. Wczytaj pending
Przeczytaj `.claude/rules/_reflect-pending.md`. Jeśli nie istnieje →
"Brak propozycji do naniesienia (`_reflect-pending.md` nie istnieje). Odpal `/reflect weekly`." i zakończ.

### 3a. Sparsuj propozycje + stan checkboxów
Każda propozycja to sekcja `## <plik> → <sekcja>` z blokiem ```diff``` i checkboxem
`- [ ]`/`- [x]` pod spodem. Zbierz:
- **zaznaczone** (`- [x]`) → do naniesienia,
- **niezaznaczone** (`- [ ]`) → zostają.

Jeśli zero zaznaczonych → "Nic nie zaznaczone w `_reflect-pending.md` — zaznacz checkboxy
przy zmianach, które chcesz nanieść, i odpal ponownie." i zakończ (nic nie ruszaj).

### 4a. Załaduj pliki docelowe
Przeczytaj pliki, których dotyczą zaznaczone propozycje (`persona.md` / `soul.md` /
`content/voice-of-tone.md`). Zapamiętaj strukturę sekcji.

### 5a. Nanieś zaznaczone (pokaż diff PRZED zapisem)
Dla każdej zaznaczonej propozycji:
- ADD → dodaj linię `+` do wskazanej sekcji (na końcu listy sekcji).
- UPDATE → zamień linię `-` na `+` (Edit z dokładnym dopasowaniem starego fragmentu).
- Zachowaj idiom pliku (wcięcia, myślniki, styl sąsiednich linii).
Pokaż userowi finalny diff każdej zmiany. Po naniesieniu wszystkich — zaktualizuj
`*Ostatnia edycja: DD.MM.YYYY*` (lub `*Ostatnia aktualizacja:*`) na końcu każdego ruszonego pliku.

### 6a. Posprzątaj pending
Usuń z `_reflect-pending.md` sekcje, które naniosłeś. Niezaznaczone zostają.
- Jeśli po usunięciu nie ma już żadnej propozycji (`##`) → **skasuj cały plik** (`_reflect-pending.md`)
  i domknij zadanie-przypomnienie: w `Zadania/Dashboard.md` (u starszych instalacji: `to_do.md`) zmień `- [ ]` na `- [x]` przy
  `przejrzyj-propozycje-reflect`, ustaw `status: zrobione` w pliku zadania.
- Jeśli zostały niezaznaczone propozycje → plik zostaje (alert hooka dalej będzie je pokazywał).

### 7a. Podsumuj
Co naniesione (które pliki/sekcje), co zostało w pending, czy zadanie domknięte.

---

## Format `_reflect-pending.md`

```markdown
# Reflect — propozycje do przeglądu

*Wygenerowane: YYYY-MM-DD | Zakres: 7 dni | Sesje: N*

> Zaznacz checkbox `- [x]` przy zmianach, które chcesz nanieść, potem odpal `/reflect apply`.
> Niezaznaczone zostają. Gdy plik się opróżni — znika sam.

## persona.md → § 7 (Nie rób)
**Typ:** ADD · **Powód:** 2x w sesjach (12.06, 14.06)
```diff
+ "game-changer" — brzmi jak AI (user: "nie pisz game-changer")
```
- [ ] ✅ Zatwierdź tę zmianę

## soul.md → JAK PRACUJĘ Z TOBĄ
**Typ:** UPDATE · **Powód:** jawna prośba (user: "za bardzo yes-man, challenguj mnie")
```diff
- [stary fragment]
+ [propozycja]
```
- [ ] ✅ Zatwierdź tę zmianę

### Odrzucone w tym przebiegu (świadomie)
- [opis czemu pominięte] — H3, nie liczy się jako propozycja
```

---

## Zasady

- **interactive:** human approval inline — pokaż diff, czekaj na zgodę.
- **weekly:** NIGDY nie edytuj `persona/soul/voice-of-tone` — zapisuj WYŁĄCZNIE do `_reflect-pending.md`, każda propozycja z checkboxem.
- **apply:** nanoś TYLKO zaznaczone (`- [x]`); pokaż diff PRZED zapisem; niezaznaczone zostają.
- Tylko sygnały **jawne** lub **powtórzone ≥2x**. Jednorazowe → SKIP.
- `soul.md` = najwyższy próg (zmiana charakteru tylko na wyraźną prośbę usera).
- **NIE rusz**: NOW.md (memory-update), biznes.md (fakty o firmie/pracy).
- **NIE duplikuj** informacji już obecnych w plikach.
- Pokaż diff PRZED każdą edycją.
- Cleanup: po weekly usuń pliki tymczasowe (`rm -f .claude/tmp/reflect-*.txt`).
