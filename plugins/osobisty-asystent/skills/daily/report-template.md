# Szablon raportu /daily

Użyj tego szablonu do wygenerowania raportu końcowego.

---

## Format raportu

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ZADANIA — [DD.MM.YYYY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Jeśli czytadelko_unread > 0:]
📚 **Czytadełko:** [czytadelko_unread] do przeczytania

[Jeśli zakonczone_dzis > 0:]
✅ **Zarchiwizowane:** [zakonczone_dzis] zadań
   • [nazwa zadania 1]
   • [nazwa zadania 2]

[Jeśli zalegle > 0 — ZAWSZE JAKO PIERWSZE:]
⚠️ **Zaległe** ([zalegle]):
   • [nazwa] — przeterminowane (DD.MM)

📋 **Dzisiaj:** [dzisiaj] | 📅 **Tydzień:** [tydzien] | 📆 **Później:** [pozniej] | 📊 **Bez terminu:** [bez_terminu]

💡 [Jedna linia rekomendacji]

[Jeśli są ostrzeżenia:]
⚠️ OSTRZEŻENIA:
   • [lista pominiętych plików z powodu błędów]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 KALENDARZ — [DD.MM.YYYY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HH:MM]–[HH:MM]  [summary]
[HH:MM]–[HH:MM]  [summary]

[Jeśli brak eventów:]
Brak wydarzeń na dziś

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PROPOZYCJA BLOKÓW FOCUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Na podstawie zadań na dziś i wolnych slotów (9:00–14:00):

[HH:MM]–[HH:MM]  [emoji] [tytuł zadania] ([czas])
[HH:MM]–[HH:MM]  [emoji] [tytuł zadania] ([czas])

[Jeśli są niezmieszczone:]
⚠️ Nie zmieściło się: [lista tytułów]

[Jeśli brak wolnych slotów:]
Brak wolnych slotów na focus — kalendarz pełny

Chcesz dodać te bloki do kalendarza?

[Sekcja wyświetlana TYLKO gdy są zadania fokusowe na dziś]

```

---

## Logika rekomendacji

Wybierz JEDNĄ linię w zależności od stanu:

1. Jeśli są zadania ZALEGŁE:
   > "Masz [zalegle] zaległych — rozważ aktualizację terminów"

2. Jeśli są zadania DZISIAJ z priorytetem `pilne`:
   > "Zacznij od: [nazwa zadania pilnego]"

3. Jeśli brak pilnych ale są zadania z terminem:
   > "Zacznij od: [zadanie z najwcześniejszym terminem]"

4. Jeśli brak zadań z terminem:
   > "Rozważ dodanie terminów do zadań BEZ TERMINU"

---

## Formatowanie wpisów w dashboardzie

**Standardowy wpis:**
```
- [ ] [[w_trakcie/nazwa-pliku|Tytuł zadania]] — [emoji] [priorytet] — [DD.MM]
```

**Wpis zaległy:**
```
- [ ] [[w_trakcie/nazwa-pliku|Tytuł zadania]] — [emoji] [priorytet] — przeterminowane (DD.MM)
```

**Wpis bez terminu:**
```
- [ ] [[w_trakcie/nazwa-pliku|Tytuł zadania]] — [emoji] [priorytet]
```

**Wpis cykliczny:**
```
- [ ] 🔁 Nazwa zadania — [emoji] [priorytet]
```

**Wpis cykliczny z projektem:**
```
- [ ] 🔁 Nazwa zadania — [emoji] [priorytet] — 📁 [projekt]
```

**Podzadanie:**
```
- [ ] [[w_trakcie/nazwa-pliku| ↳ Tytuł podzadania (→ Nazwa rodzica)]] — [priorytet] — [DD.MM]
```

---

## Struktura `Dashboard.md` (kolejność blokow)

```
---
ostatnia_aktualizacja: YYYY-MM-DD HH:MM
czytadelko_unread: N
---
📚 **Czytadełko:** N do przeczytania      ← tylko gdy N > 0

# TODO — Dashboard Zadań

## ZALEGŁE
...
## DZISIAJ (DD.MM dzień)
...
## TEN TYDZIEŃ
...
## PÓŹNIEJ
...
## BEZ TERMINU
...
```