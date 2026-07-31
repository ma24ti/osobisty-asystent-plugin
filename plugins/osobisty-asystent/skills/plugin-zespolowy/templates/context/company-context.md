<!--
  READ-ONLY — wspólny kontekst firmowy, ładowany w każdej sesji każdej osoby w zespole.
  Źródło prawdy: to repo → plugins/{{PLUGIN}}/context/company-context.md (edytuje tylko admin
  kontekstu, przez skill kontekst-firmowy).
  Dystrybucja: hook SessionStart kopiuje ten plik do <vault>/.claude/rules/company-context.md
  TYLKO w vaultach asystenta (te, które mają .claude/rules/) — projekty kodowe są pomijane.
  Claude Code ładuje go natywnie jak każdy plik w project-level rules/.
  NIE edytuj kopii lokalnie — przy najbliższym starcie sesji zostanie nadpisana ze źródła.
  Przy zmianie treści PODBIJ pole version poniżej (data) — hook zaloguje aktualizację.
  TWARDY LIMIT: < 150 linii. Ten plik wchodzi do kontekstu przy każdym starcie sesji
  u każdej osoby — każda zbędna linia kosztuje cały zespół, codziennie. Domyślna
  operacja przy aktualizacji to CIĘCIE, nie dopisywanie. Wiedza o pojedynczym projekcie
  należy do NOW.md właściciela projektu, nie tutaj.
-->
<!-- version: 2026-01-01 -->

# Kontekst firmowy — {{WLASCICIEL}}

> Wypełnij sekcje poniżej. Zostaw tylko to, co realnie zmienia decyzje asystenta —
> puste sekcje skasuj, nie zostawiaj nagłówków „do uzupełnienia".

## Firma

- Pełna nazwa, forma prawna, siedziba
- Kto założył / kto prowadzi
- Adresy kontaktowe używane w pracy

## Produkty

- Nazwa produktu — jednym zdaniem: co to jest, dla kogo, w jakim modelu sprzedaży
- Nazewnictwo, które łatwo przekręcić (pisownia, wielkość liter) — zapisz je wprost

## Zespół

- Imię — za co odpowiada (jedna linia na osobę)
- Kto jest administratorem kontekstu (jedyna osoba edytująca ten plik)

## Jak pracujemy

- Zasady i wartości, które mają wpływ na to, co asystent proponuje
- Rzeczy przesądzone raz na zawsze („nie robimy X", „zawsze Y")

## Kanały

- Strona, sklep, platformy sprzedażowe
- Social media i społeczności, którymi realnie się zajmujecie
