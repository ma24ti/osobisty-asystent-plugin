# Prompt ekstrakcji sygnałów tygodniowych z sesji Claude Code

Przeanalizuj dialog z sesji Claude Code z **całego tygodnia** (7 dni). Masz też git diff pliku NOW.md pokazujący jak zmieniał się kontekst w ciągu tygodnia.

Twoje zadanie jest inne niż daily — nie szukasz atomowych zmian z jednego dnia. Szukasz **wzorców, trendów i sygnałów, które widać dopiero z perspektywy tygodnia.**

## Co szukasz

### 1. Wzorce cross-session
Sygnały, które w skali jednego dnia wyglądają na szum, ale powtarzają się przez tydzień:
- Ten sam typ problemu debugowany w 3+ sesjach
- Temat wracający wielokrotnie mimo że nie jest oficjalnym priorytetem
- Narzędzie/podejście konsekwentnie używane lub unikane

### 2. Stalled projekty
Projekty wymienione w NOW.md, które **nie pojawiają się w logach z całego tygodnia**. Brak aktywności to ważna informacja — oznacza że projekt stoi, nawet jeśli status mówi "aktywny".

### 3. Nieplanowane wątki
Rzeczy, które nie były w priorytetach na początku tygodnia ale zjadły znaczącą ilość czasu. Git diff pokaże co było w "Na tapecie" na początku tygodnia vs co realnie dominowało w logach.

### 4. Konsolidacja atomowych sygnałów
Daily wyciąga pojedyncze fakty — "zmienił status X", "dodał feature Y", "zdecydował o Z". Weekly łączy je w spójny obraz: "Projekt X: przeszedł od fazy A do fazy B, po drodze zmienił podejście z P na Q z powodu R."

### 5. Sygnały MEDIUM, które daily pominął
Daily odrzuca sygnały o niskiej pewności. Weekly może je podnieść, jeśli **ten sam sygnał MEDIUM pojawił się w 2+ różnych dniach** — powtarzalność podnosi pewność.

**Podniesienie pewności nie zmienia autora.** Wynik analizy asystenta powtórzony w dwóch sesjach dalej jest wynikiem analizy: zostaje `autor: "analiza asystenta"` i musi mieć `sciezka`. Autorem staje się Mateusz tylko wtedy, gdy sam go powiedział albo potwierdził w linii `[USER]`.

## Kategorie sygnałów

1. **PROJEKTY** — zbiorczy status projektu za tydzień (nie atomowe updaty)
2. **DECYZJE** — decyzje, które przetrwały tydzień (nie te podjęte i cofnięte następnego dnia)
3. **NA_TAPECIE** — co realnie dominowało w tygodniu na podstawie logów (nie deklaracji)
4. **BLOKERY** — blokery nadal otwarte na koniec tygodnia
5. **STALLED** — projekty/wątki bez aktywności w logach mimo statusu "aktywny"
6. **WZORCE** — powtarzalne zachowania potwierdzone w 2+ sesjach w tygodniu

## Format output

Zwróć JSON array sygnałów:

```json
[
  {
    "kategoria": "PROJEKTY",
    "typ": "KONSOLIDACJA",
    "tresc": "Dashboard analityczny: przeszedł z Fazy 3.1 do 3.2, dodano filtr zakresu dat i adaptacyjną granularność wykresu. Faza 3.3 (geografia) zaparkowana.",
    "zrodlo": "logi z 3 sesji + git diff",
    "autor": "Mateusz",
    "sciezka": null,
    "pewnosc": "HIGH"
  },
  {
    "kategoria": "STALLED",
    "typ": "NOWY",
    "tresc": "Czytadełko — w NOW.md jako aktywny, zero wzmianek w logach z całego tygodnia",
    "zrodlo": "brak w logach",
    "autor": "Mateusz",
    "sciezka": null,
    "pewnosc": "HIGH"
  }
]
```

Pola:
- `kategoria`: jedna z 6 powyżej
- `typ`: `KONSOLIDACJA` | `NOWY` | `UPDATE` | `ZAKONCZONE` | `USUN`
- `tresc`: zbiorczy opis, 1-3 zdania — kontekst, nie lista zmian
- `zrodlo`: skąd pochodzi sygnał (`logi`, `git diff`, `brak w logach`, `powtórzenie MEDIUM`)
- `autor`: `Mateusz` | `analiza asystenta`, według reguły z `extract.md` (sekcja „Autor i źródło”)
- `sciezka`: ścieżka raportu albo pliku, w którym asystent policzył liczbę lub wniosek; `null`, gdy `autor` to `Mateusz`
- `pewnosc`: `HIGH` | `MEDIUM`

## Autor i źródło

Obowiązuje reguła z `extract.md`, sekcja „Autor i źródło”. W skrócie:
- Liczba, kwota, procent albo wniosek z odpowiedzi asystenta, niepotwierdzony przez Mateusza, to `autor: "analiza asystenta"` i wymaga `sciezka` z linii `[PLIK ZAPISANY]` albo z tekstu asystenta. **Bez ścieżki odrzuć.**
- Wpis w NOW.md ze znacznikiem `(wynik analizy, <ścieżka>)` przy konsolidacji zachowuje `autor: "analiza asystenta"` i tę samą ścieżkę. Konsolidacja kilku takich wpisów niesie wszystkie ich ścieżki.
- Wpis w NOW.md z liczbą z analizy bez znacznika i bez ścieżki (sprzed tej reguły) nie wraca w sygnale w tej postaci: albo dostaje ścieżkę z logów tygodnia, albo wygeneruj sygnał `USUN` i merge przeniesie wpis słowo w słowo do archiwum.

## Filtr pewności — inny niż daily

- **HIGH** — explicite statement usera LUB fakt potwierdzony w 2+ sesjach
- **MEDIUM** — wynika z kontekstu jednej sesji, ale jest konkretny
- **LOW** — interpretacja, domysł → **ODRZUĆ**

Kluczowa różnica vs daily: sygnał MEDIUM z poniedziałku + MEDIUM ze środy = **HIGH** (powtarzalność podnosi pewność).

## ZAKAZANE

- Stan emocjonalny usera
- Spekulacje o intencjach
- Oceny jakości pracy
- Jednorazowe polecenia techniczne
- Informacje z persona.md / biznes.md / soul.md
- Duplikaty tego co już jest w NOW.md bez zmian (jeśli status się nie zmienił w tygodniu — nie generuj sygnału)

## Wskazówki

- Czytaj logi chronologicznie — buduj obraz jak tydzień się rozwijał
- Porównaj git diff (co daily zapisał do NOW.md) z surowymi logami (co się naprawdę działo) — szukaj rozbieżności
- Projekt wspomniany w 5 sesjach ale z krótkimi wzmiankami ≠ projekt z 1 sesji ale 4h deep work. Liczy się intensywność, nie częstotliwość
- Preferuj mniej sygnałów wysokiej jakości nad dużo szumu
