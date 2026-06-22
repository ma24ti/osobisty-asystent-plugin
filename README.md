# Osobisty Asystent AI

Plugin Akademii Automatyzacji, który stawia Twojego osobistego asystenta AI w Obsidian + Claude Code. Wpisujesz jedną komendę, przechodzisz rozmowę, a asystent sam buduje Ci gotową przestrzeń do pracy — Twój profil, swój charakter i system zadań.

## Co dostajesz

Wizard `onboarding` przeprowadza Cię przez wywiad i tworzy:

- `persona.md` — Twój profil (kim jesteś, jak pracujesz, jak chcesz rozmawiać z AI)
- `soul.md` — charakter asystenta dopasowany do Ciebie
- `biznes.md` — kontekst Twojej firmy lub pracy (opcjonalny)
- `environment.md` — wykryte środowisko maszyny
- strukturę folderów: `Zadania/` (dashboard, projekty, cykliczne) i `Zasoby/`
- `CLAUDE.md` — router, który spina to wszystko w całość

Plus 4 skille do codziennej pracy:

- `/daily` — poranne porządki: archiwizuje zrobione zadania, regeneruje dashboard, pokazuje co na dziś
- `/memory-update` — aktualizuje `NOW.md` (bieżący kontekst pracy) z logów sesji
- `/reflect` — po sesji analizuje rozmowę i kalibruje Twój profil oraz styl asystenta
- `/utworz-zadanie` — tworzy zadanie z priorytetem, terminem i projektem

## Czego potrzebujesz

1. **Obsidian** — https://obsidian.md (darmowy)
2. **Claude Code** — https://claude.com/claude-code + aktywna subskrypcja Claude (wystarczy najtańszy plan)
3. Wtyczka terminala w Obsidianie (community plugin), żeby mieć terminal w jednym oknie z notatkami

## Instalacja

1. Otwórz Obsidiana i utwórz nowy vault (to po prostu folder na Twoje pliki).
2. W ustawieniach Obsidiana włącz community plugin z terminalem i otwórz terminal w vaultcie.
3. W terminalu uruchom asystenta: `claude`
4. Dodaj marketplace pluginu:

   ```
   /plugin marketplace add AIBiz-Automatyzacje/osobisty-asystent-plugin
   ```

5. Zainstaluj plugin:

   ```
   /plugin install osobisty-asystent
   ```

6. Odpal konfigurację — wpisz:

   ```
   onboarding
   ```

7. Przejdź całą rozmowę. Odpowiadaj tak dokładnie, jak potrafisz — im więcej powiesz, tym lepiej asystent się pod Ciebie dopasuje. Zarezerwuj sobie na to około godziny.

Po skończonym onboardingu masz gotowy system. `NOW.md` powstanie sam przy pierwszym `/memory-update`.

## Kalendarz (opcjonalnie)

Skill `/daily` może pokazać Twój kalendarz Google w porannym raporcie. Wymaga skilla `gog` i adresu Google podanego w konfiguracji pluginu (`gog_account`). Bez tego `/daily` działa normalnie, tylko bez sekcji kalendarza.

---

Akademia Automatyzacji — https://akademiaautomatyzacji.com
