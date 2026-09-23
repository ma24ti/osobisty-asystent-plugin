# Prompt ekstrakcji sygnałów z sesji Claude Code

Przeanalizuj poniższy dialog z sesji Claude Code. Wyciągnij sygnały — konkretne, faktualne informacje o tym nad czym użytkownik pracuje, co zdecydował, co go blokuje.

## Kategorie sygnałów

1. **PROJEKTY** — nowe projekty, update statusu istniejących, zakończone projekty
2. **DECYZJE** — explicite decyzje użytkownika (technologiczne, biznesowe, organizacyjne)
3. **PRIORYTETY** — co użytkownik wymienił jako ważne, pilne, deadline
4. **BLOKERY** — problemy techniczne, rzeczy które nie działają, zależności blokujące postęp
5. **STACK** — nowe narzędzia, rezygnacja z narzędzi, zmiana konfiguracji, nowe integracje
6. **WZORCE** — powtarzalne zachowania, preferencje organizacyjne (TYLKO jeśli potwierdzone w min. 2 sesjach)

## Format output

Zwróć JSON array sygnałów:

```json
[
  {
    "kategoria": "PROJEKTY",
    "typ": "NOWY",
    "tresc": "Rozpoczął budowę systemu memory-update — parser logów + ekstrakcja do NOW.md",
    "cytat": "zbuduj tego skilla",
    "autor": "Mateusz",
    "sciezka": null,
    "pewnosc": "HIGH"
  },
  {
    "kategoria": "DECYZJE",
    "typ": "NOWY",
    "tresc": "Marża na towarze 2023 do 2026: 57,5% przy pokryciu ceną zakupu 99,8%",
    "cytat": null,
    "autor": "analiza asystenta",
    "sciezka": "<ścieżka raportu z linii [PLIK ZAPISANY] albo z tekstu asystenta>",
    "pewnosc": "MEDIUM"
  }
]
```

Pola:
- `kategoria`: jedna z 6 powyżej
- `typ`: `NOWY` | `UPDATE` | `ZAKONCZONE` | `USUN`
- `tresc`: 1-2 zdania, konkret
- `cytat`: dosłowny cytat usera (jeśli jest explicite statement) lub `null`
- `autor`: `Mateusz` | `analiza asystenta` (reguła niżej)
- `sciezka`: ścieżka do raportu albo pliku, w którym asystent policzył liczbę lub wniosek; `null`, gdy `autor` to `Mateusz`
- `pewnosc`: `HIGH` | `MEDIUM`

## Autor i źródło: liczby i wnioski z analiz

Dialog ma trzy rodzaje linii: `[USER]` (Mateusz), `[ASSISTANT]` (tekst asystenta) i `[PLIK ZAPISANY]` (ścieżka pliku zapisanego przez asystenta w tej sesji).

- **`autor: "Mateusz"`**: treść powiedział albo wprost potwierdził Mateusz w linii `[USER]` („tak, 29 zł”, „zgadza się”, „przyjmuję”). Jego wypowiedź jest źródłem sama w sobie, `sciezka` zostaje `null`.
- **`autor: "analiza asystenta"`**: liczba, procent, kwota, wniosek albo diagnoza, którą policzył lub sformułował asystent, a Mateusz jej nie powtórzył ani nie potwierdził. Samo to, że Mateusz o nią poprosił albo przeczytał raport bez komentarza, to nie potwierdzenie.
- **Sygnał z `autor: "analiza asystenta"` musi mieć `sciezka`.** Weź ścieżkę raportu albo pliku wynikowego z linii `[PLIK ZAPISANY]` lub z tekstu asystenta w tej samej sesji. Ścieżka ma wskazywać plik, w którym liczbę policzono, a nie dowolny plik z sesji.
- **Brak ścieżki w logu: odrzuć sygnał.** Nie zgaduj ścieżki i nie przenoś liczby bez źródła do `tresc` innego sygnału.
- Sygnał `analiza asystenta` ma najwyżej `pewnosc: "MEDIUM"`; HIGH zostaje dla wypowiedzi Mateusza z cytatem.

## Filtr pewności

- **HIGH** — user wprost powiedział (jest cytat)
- **MEDIUM** — jasno wynika z kontekstu działań (np. pracował nad X przez całą sesję)
- **LOW** — interpretacja, domysł → **ODRZUĆ, nie zwracaj sygnałów LOW**

## ZAKAZANE — nie wyciągaj nigdy

- Stan emocjonalny usera (frustracja, radość, zmęczenie, stres)
- Spekulacje o intencjach ("planuje", "rozważa porzucenie", "chyba chce")
- Oceny jakości pracy usera
- Jednorazowe polecenia techniczne ("popraw ten błąd", "zmień kolor")
- Systemowe komendy i ich output
- Informacje które są już w persona.md / biznes.md / soul.md (nie duplikuj stałych cech)

## Wskazówki

- Skup się na FAKTACH i EXPLICITE STATEMENTS
- "User napisał: 'rezygnuję z Voiceflow'" = OK (HIGH, jest cytat)
- "User wydaje się sfrustrowany Voiceflow" = ZAKAZANE
- Gdy user pracuje nad projektem ale nie mówi o nim wprost → MEDIUM (fakt że pracował)
- Tekst `[ASSISTANT]` to opis pracy, nie fakt o firmie. Wynik obliczenia z odpowiedzi asystenta to zawsze `autor: "analiza asystenta"`
- Preferuj mniej sygnałów wysokiej jakości niż dużo niskiej
- Jeśli sesja to głównie debugging jednego buga — wyciągnij bloker, nie projekt
