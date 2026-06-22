# Instrukcja generacji persona.md

Na podstawie odpowiedzi z wywiadu (kroki 2-6) wygeneruj plik w poniższej strukturze.

## Struktura pliku

```markdown
# PERSONA — [IMIĘ I NAZWISKO]

---

## 1. TOŻSAMOŚĆ

| Pole | Wartość |
|------|---------|
| Imię i nazwisko | ... |
| Firma / Projekt | ... |
| Rola | ... |
| Język komunikacji | ... |

---

## 2. TŁO ZAWODOWE

[Skąd, dokąd, co po drodze — narracyjnie, nie punktowo]

---

## 3. STYL KOMUNIKACJI

- **Formalność:** X/5 — [opis co to oznacza w praktyce]
- **Analityczność:** X/5 — [opis]
- **Preferowany format:** [jak chce dostawać info]
- **Feedback:** [bezpośredni/owinięty, styl]

---

## 4. WARTOŚCI I ZASADY

### ZAWSZE ✓
- ✓ ...

### NIGDY ✗
- ✗ ...

### Stosunek do AI/technologii
[Krótko — partner, narzędzie, mentor?]

---

## 5. PRACA NA CO DZIEŃ

### Typowy dzień
[Opis]

### Rytm i organizacja pracy
[Bloki czasowe jeśli user je podał — kiedy zaczyna, kiedy deep work, kiedy przerwa.
Ile godzin dziennie realnie pracuje. Kiedy ma najwięcej energii.
Format tabeli jeśli ma wyraźne bloki, inaczej proza. Pomiń jeśli nie wspomniał.]

### Narzędzia
[Lista]

### Aktualne projekty
[Co teraz robi]

---

## 6. BLOKERY I NAPIĘCIA

[Frustracje, wady, sprzeczności — bez lukru. Co go drenuje w pracy,
jakie ma blokery (perfekcjonizm? prokrastynacja? shiny object syndrome?
za dużo zadań równolegle?). Bez owijania — to zostaje między userem a AI.]

---

## 7. WSKAZÓWKI DLA AI

### Rób ✓
[Konkretne, operacyjne zachowania których user oczekuje. Wyciągnij z wywiadu.
Przykłady typu sygnałów: proaktywnie używaj dostępnych narzędzi/skilli;
przy długich tekstach zapisuj do pliku zamiast wyświetlać; pokazuj listę zmian/diff
przed zapisem; oceniaj prace w skali 1-10 z konkretami. Pisz to co REALNIE
powiedział user, nie generyczne porady.]

### Nie rób ✗
[Czego user nie znosi w AI — z "co wkurza" (krok 5). Konkretnie, bez owijania.
Przykłady typu: nie zaczynaj od "Świetne pytanie!"; nie pisz za długo; nie hedguj
gdy znasz lepszą opcję; nie tłumacz oczywistości.]

---

## 8. MOCNE STRONY I MOTYWATORY

### W czym jest dobry
[Mocne strony z SAMOOPISU usera (krok 6) — w czym czuje się silny, co przychodzi
mu naturalnie. NIE wymagaj wyników płatnych testów (Gallup itp.). Jeśli user
SAM wkleił wyniki jakiegoś testu — uwzględnij je tutaj jako dodatek, nie jako podstawę.]

### Nakręca mnie
[Sytuacje/typy zadań które dają flow i energię — min. to co podał w kroku 6]

### Drenuje mnie
[Co zabiera energię — busy work, zbyt proste zadania, brak "dlaczego" itp.]

---

*Wygenerowane: [data]*
```

## Zasady generacji

1. **Cytuj słowa usera** tam gdzie to wzbogaca profil — dosłowne wyrażenia w cudzysłowie
2. **Nie wymyślaj** niczego czego user nie powiedział — zero ekstrapolacji
3. **Puste sekcje zostaw puste** — lepiej puste niż wyssane z palca
4. **Bądź konkretny** — "zorientowany na dane, myśli liczbami" > "inteligentny"
5. **Mocne strony = samoopis, nie testy** — NIE zakładaj, że user zrobił Gallup/MBTI/DISC
   (to bywa płatne). Buduj sekcję 8 z tego, co sam powiedział o sobie. Wyniki testów
   uwzględnij TYLKO jeśli user je jawnie wkleił.
6. **Sekcja 7 ma być operacyjna** — konkretne "rób X / nie rób Y", nie ogólniki.
   To z niej AI realnie korzysta przy każdej interakcji.
7. **Mapuj odpowiedzi na sekcje:**
   - Krok 2 (kim jesteś) → sekcja 1 + 2
   - Krok 3 (styl) → sekcja 3
   - Krok 4 (wartości + narzędzia + projekty) → sekcja 4 + 5
   - Krok 5 (AI + frustracje) → sekcja 4 (stosunek do AI) + sekcja 7
   - Krok 6 (motywatory, flow, blokery, rytm pracy) → sekcja 5 (rytm) + 6 + 8
8. **Język:** pisz w języku wywiadu (jeśli user mówi po polsku → persona po polsku)
9. **Długość:** 80-200 linii — tyle ile wymaga treść, nie więcej
