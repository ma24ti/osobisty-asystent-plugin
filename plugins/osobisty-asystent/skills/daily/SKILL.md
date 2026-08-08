---
name: daily
description: Codzienna aktualizacja systemu zadań - archiwizacja zakończonych, regeneracja dashboardu, raport
disable-model-invocation: true
allowed-tools: ["Read", "Write", "Bash", "Edit", "Glob", "Bash(gog:*)"]
---

# Daily — Codzienna aktualizacja systemu zadań

Wykonujesz codzienną aktualizację systemu zarządzania zadaniami w Obsidian.

**Konfiguracja:** Zobacz [config.md](config.md) dla ścieżek, słów kluczowych i ustawień.
**Szablon raportu:** Zobacz [report-template.md](report-template.md) dla formatu wyjściowego.

---

## SEKCJA 1: Archiwizacja zakończonych (AUTO)

**ŹRÓDŁO PRAWDY:** Checkbox `[x]` w dashboardzie = zadanie wykonane.

1. Przeczytaj `Zadania/Dashboard.md` *(u starszych instalacji plik nazywa się `Zadania/to_do.md` — wtedy czytaj i zapisuj TEN istniejący plik, nie twórz drugiego)*
2. Znajdź wszystkie linie `- [x] [[w_trakcie/nazwa-pliku|`
3. Dla każdego zaznaczonego pliku:
   - Zmień `status: w_trakcie` → `status: zrobione` w frontmatter
   - Przenieś do `Zadania/zrobione/YYYY-MM/` (utwórz folder jeśli nie istnieje)
   - Zapisz nazwę do listy zarchiwizowanych

**Bez pytania o potwierdzenie** — checkbox to decyzja.

---

## SEKCJA 2.5: Wstrzykiwanie zadań cyklicznych (AUTO)

1. Przeczytaj `Zadania/cykliczne/recurring.md` (ścieżka w config.md)
2. Sparsuj tabelę markdown — wyciągnij kolumny: **Nazwa**, **Harmonogram**, **Priorytet**, **Projekt**
3. Dla każdego wiersza sprawdź czy harmonogram pasuje do **dzisiejszej daty**:
   - `co [dzień tygodnia]` → porównaj z aktualnym dniem tygodnia (poniedziałek–niedziela)
   - `co dzień` → zawsze pasuje
   - `[N]. dnia miesiąca` → porównaj N z dniem miesiąca (np. `10. dnia miesiąca` pasuje gdy dziś jest 10.)
   - `ostatni dzień miesiąca` → sprawdź czy jutro jest 1. dzień następnego miesiąca
4. Sprawdź czy zadanie **już istnieje** w dashboardzie (`Dashboard.md`) po nazwie — żeby nie duplikować
5. Pasujące zadania → zapisz do listy `cykliczne_dzis` (użyte w SEKCJI 4)

**Bez pytania o potwierdzenie** — harmonogram to decyzja.

---

## SEKCJA 3: Skanowanie zadań

1. Znajdź wszystkie `.md` w `Zadania/w_trakcie/`
2. Dla każdego pliku wyciągnij z frontmatter:
   - status, priorytet, termin, projekt, rodzic, nazwa (z nagłówka #)
3. Jeśli ma pole `rodzic:` → pobierz nazwę rodzica z nagłówka pliku rodzica

**Edge cases:**
- Brak pliku → pomiń sekcję
- Pusty folder → "📭 Brak zadań" + pusty dashboard
- Brak frontmatter/błędny YAML → pomiń, dodaj ostrzeżenie
- Brak nagłówka # → użyj nazwy pliku
- Rodzic nie istnieje → wyświetl bez prefixu ↳, dodaj ostrzeżenie

---

## SEKCJA 4: Regeneracja Dashboard.md

1. Pobierz dzisiejszą datę **i dzień tygodnia z systemu** (nie licz sam!):
   ```bash
   date +%Y-%m-%d  # data
   date +%A        # dzień tygodnia po angielsku — zmapuj na PL (Friday → piątek)
   ```
   Mapowanie: Monday→poniedziałek, Tuesday→wtorek, Wednesday→środa, Thursday→czwartek, Friday→piątek, Saturday→sobota, Sunday→niedziela
2. Nagłówek sekcji DZISIAJ musi mieć format: `## DZISIAJ (DD.MM [dzień_tygodnia])` — np. `## DZISIAJ (17.04 piątek)`
3. Kategoryzuj zadania do sekcji:
   - **ZALEGŁE** — termin w przeszłości (ZAWSZE na górze!)
   - **DZISIAJ** — termin = dziś + zadania z `cykliczne_dzis` (SEKCJA 2.5)
   - **TEN TYDZIEŃ** — termin w ciągu 7 dni (nie dziś)
   - **PÓŹNIEJ** — termin > 7 dni
   - **BEZ TERMINU** — brak terminu

3. Sortuj: najpierw termin (najwcześniejszy), potem priorytet (pilne → wazne → normalne)

4. Formatuj wpisy — WSZYSTKIE jako `- [ ]` (zobacz [report-template.md](report-template.md))
   - Wpisy cykliczne: `- [ ] 🔁 Nazwa zadania — [emoji] [priorytet]`
   - Jeśli zadanie cykliczne ma Projekt: `- [ ] 🔁 Nazwa zadania — [emoji] [priorytet] — 📁 [projekt]`

5. **Skomponuj zawartość** `Zadania/Dashboard.md` w tej kolejności (jako jedna operacja zapisu):

   a) **Frontmatter:**
      ```yaml
      ---
      ostatnia_aktualizacja: YYYY-MM-DD HH:MM
      ---
      ```
   b) **Linia Czytadełka** (tylko jeśli `czytadelko_unread > 0`, dodawana w SEKCJI 4.5 — ale w tej samej operacji zapisu):
      `📚 **Czytadełko:** N do przeczytania`
   c) **Sekcje zadań** w kolejności: `# TODO — Dashboard Zadań` → ZALEGŁE → DZISIAJ → TEN TYDZIEŃ → PÓŹNIEJ → BEZ TERMINU

---

## SEKCJA 4.5: Czytadełko counter (AUTO)

**Najpierw posprzątaj** — przenieś przeczytane notatki:
1. Glob `Zasoby/Czytadełko/*.md`
2. Dla każdego pliku z `read: true` w frontmatter:
   - Przenieś do `Zasoby/Czytadełko/przeczytane/YYYY-MM/` (miesiąc z `date_added`)
   - Utwórz folder jeśli nie istnieje (`mkdir -p`)

**Potem policz:**
3. Glob `Zasoby/Czytadełko/*.md` (zostały tylko nieprzeczytane)
4. Policz unread
5. W `Dashboard.md`:
   - Frontmatter: ustaw `czytadelko_unread: N`
   - Po frontmatter, przed nagłówkiem `# TODO`: dodaj lub zaktualizuj linię `📚 **Czytadełko:** N do przeczytania`
   - Jeśli N == 0: nie dodawaj linii Czytadełko

---

## SEKCJA 5: Kalendarz + wolne sloty (OPCJONALNA — wymaga skilla `gog`)

> **Graceful fallback:** kalendarz działa tylko jeśli user ma skonfigurowany skill `gog`
> (Google Calendar) i konto w env `GOG_ACCOUNT` / opcji pluginu. Jeśli ani `GOG_ACCOUNT`,
> ani `CLAUDE_PLUGIN_OPTION_GOG_ACCOUNT` nie jest ustawione, albo komenda `gog` nie istnieje
> → **POMIŃ SEKCJE 5 i 6** (kalendarz + bloki focus), przejdź prosto do raportu (SEKCJA 7).
> W raporcie zamiast kalendarza pokaż jedną linię: `📅 Kalendarz: niepodłączony (opcjonalny)`.

1. Sprawdź dostępność, potem pobierz wydarzenia:
   ```bash
   ACC="${GOG_ACCOUNT:-$CLAUDE_PLUGIN_OPTION_GOG_ACCOUNT}"
   if [ -z "$ACC" ] || ! command -v gog >/dev/null 2>&1; then echo "CALENDAR_SKIP"; else
     GOG_PREFIX=""; if [[ "$(uname)" == "Linux" ]]; then GOG_PREFIX='export PATH="$HOME/.npm-global/bin:$PATH" '; fi; eval "${GOG_PREFIX}gog calendar events --today --all --json --account \"$ACC\""
   fi
   ```
   Jeśli wynik = `CALENDAR_SKIP` → pomiń resztę tej sekcji i SEKCJĘ 6.

2. Pobierz aktualną godzinę: `date +%H:%M`

3. Oblicz wolne sloty w oknie focus (z config.md):
   - Start okna = `max(09:00, current_time)` — nigdy sloty w przeszłości
   - Minimum 30 min żeby uznać za slot

---

## SEKCJA 6: Propozycja bloków focus

1. Weź zadania z sekcji DZISIAJ
2. Dopasuj do słów kluczowych z config.md → przypisz czas i emoji
3. Sortuj wg priorytetu
4. Wpasuj w wolne sloty
5. Zapisz: `zaplanowane_bloki`, `niezmieszczone`

**Sekcja wyświetlana TYLKO gdy są zadania fokusowe.**

---

## SEKCJA 7: Wyświetl raport

Użyj szablonu z [report-template.md](report-template.md).

Kolejność sekcji w raporcie:
1. 📋 ZADANIA
2. 📅 KALENDARZ
3. 🎯 PROPOZYCJA BLOKÓW FOCUS (jeśli są)
---

## SEKCJA 8: Tworzenie bloków w kalendarzu

**Tylko po potwierdzeniu użytkownika.**

1. Pobierz timezone dynamicznie: `date +%z`
2. Dla każdego bloku (z detekcją środowiska VPS — patrz config.md):
   ```bash
   GOG_PREFIX=""; if [[ "$(uname)" == "Linux" ]]; then GOG_PREFIX='export PATH="$HOME/.npm-global/bin:$PATH" '; fi; eval "${GOG_PREFIX}gog calendar create primary \
     --summary '[emoji] [tytuł]' \
     --from '[YYYY-MM-DD]T[HH:MM]:00[timezone]' \
     --to '[YYYY-MM-DD]T[HH:MM]:00[timezone]' \
     --event-color 9 \
     --account "${GOG_ACCOUNT:-$CLAUDE_PLUGIN_OPTION_GOG_ACCOUNT}" \
     --no-input"
   ```
3. Potwierdź: "✅ Dodano [n] bloków focus do kalendarza"

---

## Constraints

- Po regeneracji dashboardu wszystkie zadania mają `- [ ]`
- ZAWSZE twórz folder w zrobione/ jeśli nie istnieje
- Timestamp w raporcie: DD.MM.YYYY
- Frontmatter `ostatnia_aktualizacja`: YYYY-MM-DD HH:MM
- Używaj `—` (em dash) nie `--` w nagłówkach sekcji

---

## Przepływ

```
[Start] 
   ↓
📦 Archiwizacja [x] → zrobione/
   ↓
🔁 Cykliczne (recurring.md → cykliczne_dzis)
   ↓
📋 Skan zadań w_trakcie/
   ↓
📝 Regeneracja Dashboard.md
   ↓
📅 Kalendarz + sloty
   ↓
🎯 Bloki focus (propozycja)
   ↓
📊 RAPORT
   ↓
[Pytanie o bloki] → dodaj do kalendarza
   ↓
[Koniec]
```