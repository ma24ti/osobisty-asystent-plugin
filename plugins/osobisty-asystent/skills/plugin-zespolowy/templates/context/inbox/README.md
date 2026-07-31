# Zbiornik sygnałów do kontekstu firmowego

Tu lądują sygnały od zespołu do `context/company-context.md` — plik per osoba per tydzień:

```
<osoba>-<rok>-W<numer tygodnia>.md     np. ania-2026-W31.md
```

**Jak to działa:**
1. Piątek (job schedulera): `/{{PLUGIN}}:kontekst-sygnaly` skanuje TWOJE logi z 7 dni i proponuje sygnały z checkboxami.
2. Zaznaczasz, co jest warte wysłania → `/{{PLUGIN}}:kontekst-sygnaly wyslij` commituje plik tutaj.
3. Poniedziałek: admin robi `/{{PLUGIN}}:kontekst-firmowy review` — czyta wszystko, nanosi na kontekst, **kasuje przetworzone pliki**.

Sygnał wart wysłania jest **prawdą o firmie, nie o projekcie**. „Acme-flow startuje we wrześniu" — tak. „Kampania B ma ROAS 2,03" — nie.

Nie edytuj cudzych plików — każdy odpowiada za swój. Nie wpisuj sekretów (kluczy, haseł, tokenów) ani danych osobowych spoza zespołu: to repo widzi cały zespół, a sekret w historii gita oznacza rotację klucza dla wszystkich.
