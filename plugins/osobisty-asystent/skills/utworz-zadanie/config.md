# Config: Utwórz Zadanie

## Ścieżki

Wszystkie ścieżki są względne do workspace (`$CLAUDE_PROJECT_DIR`).

| Element | Ścieżka |
|---------|---------|
| Szablon (workspace) | `Zadania/.szablony/szablon-zadania.md` |
| Szablon (fallback) | `{baseDir}/templates/szablon-zadania.md` |
| Folder docelowy | `Zadania/w_trakcie/` |
| Dashboard | `Zadania/Dashboard.md` (starsze instalacje: `Zadania/to_do.md` — użyj istniejącego) |
| Wpisy | `Marketing/wpisy/YYYY/` |

## Domyślne wartości

Używaj gdy user nie podał:

| Parametr | Default |
|----------|---------|
| priorytet | normalne |
| termin | (puste) |
| projekt | (puste) |

## Sygnały z kontekstu

| User mówi | Parametr | Wartość |
|-----------|----------|---------|
| pilne, asap, krytyczne, blokuje | priorytet | pilne |
| ważne, strategiczne | priorytet | wazne |
| na dzisiaj, do końca dnia | termin | dzisiaj |
| na jutro | termin | jutro |
| do [dzień tygodnia] | termin | najbliższy ten dzień |
| [DD.MM] lub [YYYY-MM-DD] | termin | ta data |
| claude, infrastruktura, narzędzia | projekt | claude-infra |
| osobiste, prywatne | projekt | osobiste |

## Priorytety

| Wartość | Emoji | Kiedy używać |
|---------|-------|--------------|
| pilne | 🔴 | Krytyczne dla biznesu, blokuje innych, revenue-impacting |
| wazne | 🟡 | Ważne strategicznie, ale nie blokujące |
| normalne | 🟢 | Maintenance, research, nice-to-have |

## Projekty

| Wartość | Opis |
|---------|------|
| claude-infra | Infrastruktura techniczna, narzędzia AI |
| osobiste | Projekty osobiste |
| inne | Nieskategoryzowane |
| (puste) | Bez projektu - w frontmatter zostaw `projekt:` puste |

> Projekty to lista otwarta — user dodaje własne pod swoje potrzeby (folder `Zadania/projekty/`).

## Terminy - konwersja

| Input | Output |
|-------|--------|
| dzisiaj | YYYY-MM-DD (bieżąca data) |
| jutro | YYYY-MM-DD (+1 dzień) |
| pojutrze | YYYY-MM-DD (+2 dni) |
| YYYY-MM-DD | bez zmian |
| brak / puste | zostaw puste w frontmatter |

## Sekcje dashboardu

| Sekcja | Warunek |
|--------|---------|
| DZISIAJ | termin = dzisiaj |
| TEN TYDZIEŃ | termin 1-7 dni od dzisiaj |
| PÓŹNIEJ | termin > 7 dni |
| BEZ TERMINU | brak terminu |

## Format wpisu w dashboardzie

```
- [ ] [[w_trakcie/nazwa-pliku|Tytuł zadania]] - [emoji] [priorytet] - [DD.MM]
```

Podzadanie (ma rodzica):
```
- [ ] [[w_trakcie/_nazwa|↳ Tytuł podzadania]] - [emoji] [priorytet] - [DD.MM]
```

Sortowanie w sekcji: termin (rosnąco) → priorytet (pilne > wazne > normalne)