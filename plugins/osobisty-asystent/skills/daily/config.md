# Konfiguracja /daily

## Ścieżki

Wszystkie ścieżki względne do workspace (`$CLAUDE_PROJECT_DIR`).

| Klucz | Ścieżka |
|-------|---------|
| aktywne | `Zadania/w_trakcie/` |
| archiwum | `Zadania/zrobione/` |
| dashboard | `Zadania/Dashboard.md` (starsze instalacje: `Zadania/to_do.md` — użyj istniejącego) |
| cykliczne | `Zadania/cykliczne/recurring.md` |
| czytadelko | `Zasoby/Czytadełko/` |

## Okno focus

| Parametr | Wartość |
|----------|---------|
| start | 09:00 |
| end | 14:00 |
| min_slot | 30 min |

## Słowa kluczowe → czas bloku

| Słowa kluczowe | Czas | Emoji |
|----------------|------|-------|
| wpis, post, content | 30 min | 📝 |
| scenariusz, lekcja | 1h | 🎬 |
| nagranie, nagrywanie, live | 1h | 🎙️ |
| projekt, kod, implementacja, budowa | 1.5h | 💻 |

Dopasowanie case-insensitive. Pierwszy match wygrywa.

## Emoji priorytetów

| Priorytet | Emoji |
|-----------|-------|
| pilne | 🔴 |
| wazne | 🟡 |
| normalne | 🟢 |

## Sortowanie priorytetów

| Priorytet | Kolejność |
|-----------|-----------|
| pilne | 1 (pierwszy) |
| wazne | 2 |
| normalne | 3 (ostatni) |

## Kalendarz

| Parametr | Wartość |
|----------|---------|
| account | $GOG_ACCOUNT (env var) |
| focus_color | 9 (blueberry) |

## Środowisko — detekcja VPS vs lokalne

Przed KAŻDYM wywołaniem `gog` użyj tego prefixu:

```bash
GOG_PREFIX=""; if [[ "$(uname)" == "Linux" ]]; then GOG_PREFIX='export PATH="$HOME/.npm-global/bin:$PATH"'; fi; eval "$GOG_PREFIX gog ..."
```

**Dlaczego:** Na VPS `.bashrc` ma guard na non-interactive shell (`case $- in *i*`), więc `PATH` i `GOG_KEYRING_PASSWORD` się nie ładują w Bash tool. Na Macu prefix jest pusty = zero zmian.
