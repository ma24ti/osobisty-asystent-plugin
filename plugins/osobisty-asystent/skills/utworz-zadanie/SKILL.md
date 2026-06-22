---
name: utworz-zadanie
description: Tworzy nowe zadanie w systemie Obsidian. Użyj gdy user prosi o dodanie/utworzenie zadania, zapisanie czegoś do zrobienia, lub wspomina o task/todo.
argument-hint: "[nazwa] | [priorytet] | [termin] | [projekt]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "Glob"]
---

# Utwórz Zadanie

Tworzysz nowe zadanie w systemie Obsidian.

## Workflow

### 1. Załaduj config

Przeczytaj `config.md` w tym skillu - zawiera ścieżki, priorytety, projekty.

### 2. Parsuj argumenty

**Format:** `nazwa | priorytet | termin | projekt`

Delimiter: `|` (przecinki mogą być w nazwach zadań)

Przykłady:
- `Przygotowanie materiałów Make` → tylko nazwa
- `Scenariusz live | pilne | 2026-01-14` → nazwa, priorytet, termin
- `Refaktoryzacja kodu, logiki | wazne | brak | claude-infra` → pełne

### 3. Uzupełnij brakujące

**Domyślne wartości** (NIE pytaj - użyj defaults):
- priorytet → `normalne`
- termin → brak (puste)
- projekt → brak (puste)

**Wyciągaj z kontekstu** jeśli user wspomniał:
- "pilne", "ważne", "asap" → priorytet
- "na jutro", "do piątku", "15.01" → termin
- "do akademii", "claude", "osobiste" → projekt

**Wyjątek - rodzic/podzadanie:**
- NIE pytaj o rodzica
- Tylko jeśli user SAM wspomni → wylistuj pliki w `w_trakcie/` i zapytaj

### 4. Generuj nazwę pliku

Kebab-case:
- Spacje → myślniki
- Usuń polskie znaki (ą→a, ę→e, ć→c, ł→l, ń→n, ó→o, ś→s, ź→z, ż→z)
- Lowercase, usuń znaki specjalne

**Wpisy/posty:** "wpis na dzisiaj" → "Wpis DD.MM" (data w nazwie)

**Podzadania:** prefiks `_` → `_nazwa-zadania.md`

### 5. Utwórz plik

1. Przeczytaj szablon — **najpierw** spróbuj `Zadania/.szablony/szablon-zadania.md` w workspace. Jeśli plik nie istnieje (świeży workspace bez konfigu), użyj fallbacku `{baseDir}/templates/szablon-zadania.md`.
2. Uzupełnij frontmatter:
   ```yaml
   status: w_trakcie
   priorytet: [priorytet]
   termin: [YYYY-MM-DD lub puste]
   utworzone: [dzisiaj YYYY-MM-DD]
   projekt: [[Zadania/projekty/nazwa]] lub puste
   rodzic: [[w_trakcie/nazwa]] lub puste
   ```
3. Zamień `# [Nazwa zadania]` na właściwą nazwę
4. Zamień `*Utworzono: YYYY-MM-DD*` na dzisiaj
5. Zapisz do `Zadania/w_trakcie/[nazwa].md`

**Edge case - termin w przeszłości:**
→ Ostrzeżenie: "⚠️ Termin [data] jest w przeszłości." (nie blokuj)

**Edge case - plik istnieje:**
→ Dodaj suffix: `-2`, `-3`, etc.

### 6. Notatka dla wpisu/postu (opcjonalnie)

Jeśli zadanie dotyczy wpisu (słowa: wpis, post, content, publikacja + data):

1. Sprawdź/utwórz folder `Marketing/wpisy/YYYY/`
2. Jeśli `Marketing/wpisy/YYYY/YYYY-MM-DD.md` nie istnieje → utwórz pusty
3. W zadaniu dodaj: `#### Content\n[[Marketing/wpisy/YYYY/YYYY-MM-DD]]`

### 7. Dodaj do dashboardu

1. Przeczytaj `Zadania/to_do.md`
2. Określ sekcję:
   - **DZISIAJ** → termin = dzisiaj
   - **TEN TYDZIEŃ** → termin 1-7 dni
   - **PÓŹNIEJ** → termin > 7 dni
   - **BEZ TERMINU** → brak terminu
3. Sformatuj wpis:
   ```
   - [ ] [[w_trakcie/nazwa|Tytuł]] - 🔴 pilne - DD.MM
   ```
   Podzadanie: `[[w_trakcie/nazwa|↳ Tytuł]]`
4. Dodaj do sekcji (sortuj: termin → priorytet)
5. Zaktualizuj `ostatnia_aktualizacja` w frontmatter

### 8. Potwierdzenie

```
✅ Zadanie utworzone!

📄 Plik: Zadania/w_trakcie/[nazwa].md
📊 Priorytet: [priorytet]
📅 Termin: [DD.MM.YYYY lub brak]
📁 Projekt: [projekt lub brak]
👆 Rodzic: [rodzic] (jeśli podzadanie)
📝 Notatka: Marketing/wpisy/... (jeśli wpis)
```

## Constraints

- NIE twórz bez nazwy
- NIE nadpisuj istniejących plików
- ZAWSZE dodaj do to_do.md
- ZAWSZE ISO format w frontmatter (YYYY-MM-DD)
- Projekt: link `[[Zadania/projekty/nazwa]]` lub PUSTE (nigdy tekst "brak")