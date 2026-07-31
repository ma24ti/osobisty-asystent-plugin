# {{DISPLAY_NAME}}

Plugin zespołowy Claude Code — wspólne skille zespołu {{WLASCICIEL}}.

## Co dostajesz

{{LISTA_SKILLI}}

Plus mechanika wspólnego kontekstu: skille `kontekst-sygnaly` i `kontekst-firmowy`
oraz hook, który rozdaje kontekst firmowy każdej osobie (patrz niżej).

## Instalacja

Repo jest prywatne — jednorazowo:

```bash
gh auth login          # konto z dostępem do org {{ORG}}
gh auth setup-git      # wpina gh jako credential helper gita
```

Potem w Claude Code (w katalogu swojego workspace'a):

```
/plugin marketplace add {{ORG}}/{{REPO}}
/plugin install {{PLUGIN}}@{{PLUGIN}}
/reload-plugins
```

## Udostępnij repo zespołowi

Prywatne repo widzi tylko właściciel. Dopóki nie dasz komuś dostępu, jego
`/plugin marketplace add` kończy się `repository not found` — komunikat wygląda jak
literówka w nazwie, a to brak uprawnień. Trzy warianty, od najprostszego:

1. **Współpracownicy (Collaborators)** — repo na Twoim koncie, zapraszasz imiennie.
   Settings → Collaborators → Add people, albo z terminala:
   ```bash
   gh api -X PUT repos/{{ORG}}/{{REPO}}/collaborators/<login-githuba> -f permission=push
   ```
   Każda osoba musi przyjąć zaproszenie (mail albo github.com/notifications).
   Dobre do 2-3 osób.
2. **Organizacja na GitHubie** — zakładasz darmową organizację, przenosisz do niej repo,
   dodajesz ludzi do zespołu. Dostęp nadajesz raz na osobę, nie raz na repo. To docelowy
   wariant, gdy zespół rośnie albo dochodzą kolejne repo.
3. **Wspólne konto techniczne** — jedno konto GitHuba, z którego wszyscy robią
   `gh auth login`. Najszybsze, ale w historii gita nie widać, kto co zrobił,
   a rotacja hasła dotyka wszystkich. Traktuj jako rozwiązanie na chwilę.

## Aktualizacje

Wersją jest git SHA — commit do `main` trafia do zespołu przy starcie sesji.

Żeby update naprawdę się dociągał, w `~/.claude/settings.json` przy wpisie tego
marketplace'u w `extraKnownMarketplaces` musi być flaga `autoUpdate`:

```json
{
  "extraKnownMarketplaces": {
    "{{PLUGIN}}": {
      "source": { "source": "github", "repo": "{{ORG}}/{{REPO}}" },
      "autoUpdate": true
    }
  }
}
```

Dla repo prywatnych auto-update jest domyślnie WYŁĄCZONY. Ręcznie w każdej chwili:
`/plugin` → Update marketplace, potem `/reload-plugins`.

Auto-update w tle i tak potrafi nie dociągnąć prywatnego repo przez HTTPS (w tle
wyłącza credential helpery gita). Pewny sposób: dzienny job w schedulerze uruchamiający
`scripts/update-marketplaces.js` z tego repo — to zwykły `git pull`, który korzysta
z helpera `gh` i po prostu działa.

## Kontekst firmowy i pętla sygnałów

W repo żyje `plugins/{{PLUGIN}}/context/company-context.md` — jeden plik z wiedzą o firmie,
który ma znać każda sesja każdej osoby. Hook `SessionStart` kopiuje go do
`.claude/rules/company-context.md` w vaultach asystenta (projekty kodowe pomija).
Nikt nie edytuje swojej kopii — nadpisze się przy następnym starcie.

Dwa skille domykają pętlę:

- **`kontekst-sygnaly`** (każdy) — skanuje TWOJE logi z 7 dni i proponuje fakty o firmie
  z checkboxami. Zaznaczone wysyłasz (`wyslij`) do `context/inbox/` w tym repo.
- **`kontekst-firmowy`** (tylko admin kontekstu) — czyta zbiornik, nanosi uzgodnione zmiany
  na `company-context.md`, podbija wersję i czyści zbiornik.

Rytm: **piątek — skan sygnałów u każdego, poniedziałek — review u admina.** Oba jako joby
w schedulerze. Skan sam z siebie niczego nie wysyła; wysyłka to zawsze decyzja człowieka.

## Sekrety

Sekrety NIE jadą w repo. Skopiuj `.env.example` do `.env` w swoim workspace i uzupełnij
klucze skilli, których używasz — skąd wziąć każdy, mówi `plugins/{{PLUGIN}}/requirements.json`.

## Wersjonowanie

Git SHA jako wersja — commit do `main` = automatyczny update u wszystkich przy starcie sesji.

**Rytuał: zmiana skilla u siebie = commit do pluginu w tym samym ruchu.** Bez tego zespół
jedzie na starym toolkicie. Drift sprawdzisz przez `/plugin-zespolowy check`.
