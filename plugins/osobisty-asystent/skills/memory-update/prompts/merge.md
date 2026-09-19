# Prompt merge sygnałów do NOW.md

Zaktualizuj NOW.md na podstawie nowych sygnałów z sesji. NOW.md to dynamiczny kontekst pracy — co teraz robię, jakie mam priorytety, co zdecydowałem.

## Input

1. Aktualny NOW.md (może być pusty template)
2. Lista sygnałów JSON z ekstrakcji

## Zasady merge

### Dodawanie (typ: NOWY)
- Dodaj do odpowiedniej sekcji NOW.md
- Projekty → tabela "Aktywne projekty"
- Decyzje → sekcja "Ostatnie ustalenia" (z datą)
- Priorytety → sekcja "Na tapecie" (max 5 pozycji)
- Blokery → sekcja "Blokery"
- Stack → uwagi przy projekcie lub osobny wpis w "Ostatnie ustalenia"

### Aktualizacja (typ: UPDATE)
- Znajdź istniejący wpis i zaktualizuj status/uwagi
- NIE duplikuj — jeśli projekt już jest w tabeli, zmień status

### Usuwanie (typ: ZAKONCZONE/USUN + reguły stale data)

| Typ | Reguła |
|-----|--------|
| Projekt zakończony | Usuń z tabeli po 7 dniach od zakończenia |
| Decyzja podjęta [x] | Usuń po 14 dniach |
| Bloker rozwiązany | Usuń natychmiast |
| Pozycja z "Na tapecie" nieaktualna | Usuń jeśli nie pojawił się ponownie |
| Wzorzec pracy | Zostaw (trwale, chyba że zmiana) |
| Wpis w „Ostatnie ustalenia” starszy niż 7 dni | Przenieś słowo w słowo do `.claude/referencje/ustalenia-archiwum.md`, pod nagłówek `## Zdjęte RRRR-MM-DD` na górze pliku. Nigdy nie kasuj bez archiwum |

### Conflict resolution
- Nowsze fakty nadpisują starsze (dodaj datę)
- Nowsza decyzja nadpisuje starą
- Priorytety: zamień, nie kumuluj (max 5)

## Format NOW.md

```markdown
# NOW — Bieżący kontekst

*Ostatni update: YYYY-MM-DD HH:MM*

## Aktywne projekty
| Projekt | Status | Deadline | Uwagi |
|---------|--------|----------|-------|
| ... | ... | ... | ... |

## Na tapecie
1. ...

## Otwarte decyzje
- [ ] ...

## Ostatnie ustalenia
- YYYY-MM-DD: ...

## Blokery
- ...
```

## Ograniczenia

- **Max 10 000 znaków na cały plik** (ok. 3 tys. tokenów; plik ładuje się w każdej sesji). Limit linii nie wystarcza, bo wiersze tabeli rosną wszerz. Przy przekroczeniu najpierw przenieś najstarsze ustalenia do `ustalenia-archiwum.md`, potem skracaj uwagi
- **Kolumna „Uwagi” w tabeli projektów: max 200 znaków.** Ścieżka do notatki (Warsztat, plan, przekazanie) plus jedno zdanie o następnym kroku albo ostrzeżeniu. Aktualizacja projektu podmienia uwagę, nie dokleja do niej. Treść, której nie ma w żadnej notatce, przenieś słowo w słowo do `ustalenia-archiwum.md`
- **NIE duplikuj** info z persona.md (styl komunikacji), biznes.md (model biznesowy, stack, platformy), soul.md (charakter AI)
- **Zaktualizuj timestamp** "Ostatni update" na bieżącą datę i godzinę
- **Sekcje mogą być puste** — nie usuwaj nagłówków, zostaw `- (brak)` jeśli sekcja jest pusta

## Output

Zwróć pełny, zaktualizowany NOW.md jako markdown. Gotowy do zapisania.
