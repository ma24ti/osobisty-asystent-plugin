---
name: deleguj
description: Team OS — komunikacja agent-to-agent między Tobą a członkami Twojego zespołu. Użyj gdy user prosi o delegację zadania, wysłanie czegoś do drugiej osoby w teamie, prośbę o walidację, przesłanie profilu/materiału do sprawdzenia, zadanie pytania, odpisanie na wiadomość ze Skrzynki, zamknięcie threadu. Trigger phrases — "wyślij X do Y", "deleguj Z na [imię]", "poproś [imię] o", "spytaj [imię] o", "zapytaj czy", "odpisz na thread", "zamknij wątek", "napisz do [imię]". Działa przez hub skrzynki (HTTPS, token per osoba), polling co 1 min przez job Pulsa. Akcje w tle aktualizują `Zadania/Skrzynka.md`.
---

# Skill `deleguj` — Team OS

API dla Claude do komunikacji między członkami teamu. User mówi naturalnym językiem, Ty rozpoznajesz intent (`task` / `query` / `reply` / `close`) i wywołujesz właściwą subkomendę.

## Rozpoznawanie typu z natural language

| User mówi | Typ |
|-----------|-----|
| "wyślij zadanie", "deleguj X", "poproś żeby zrobił Z", "zrób X przez Marcina", "przekaż do walidacji" | **task** |
| "spytaj X o Y", "zapytaj czy", "dowiedz się od Z", pytanie z "?" w treści | **query** |
| "odpisz na thread", "odpowiedz X że Y", "wracaj do tematu" (jest thread_id) | **reply** |
| "zamknij wątek", "skończ thread", "to już załatwione" | **close** |

Jeśli intent niejednoznaczny — zapytaj usera krótko ("task czy query?").

## Subkomendy

### `send` — nowa wiadomość (task lub query)

```
[ -n "$PULS_HOME" ] || { echo "Brak PULS_HOME — zaktualizuj Pulsa (re-run instalatora). Bez tego nie da się wysłać wiadomości komendą."; exit 1; }
node "$PULS_HOME/scripts/inbox/send.mjs" \
  --to <nick> \
  --title "<krótki tytuł>" \
  --content "<pełna treść>" \
  --type task|query
```

⚠️ **`--type` jest OBOWIĄZKOWE** — ZAWSZE przekazuj jawnie `--type task` albo `--type query`. Skrypt nie zakłada żadnego defaultu i odrzuci wywołanie bez `--type`. To zapobiega cichemu wysłaniu pytania (`query`) jako zadania (`task`) — odbiorca dostaje inny render/banner/checkbox.

**Zwraca JSON:** `{ id, thread_id, created_at, title, to_user, type }`

**Po sukcesie** Claude NIE edytuje `Skrzynka.md` ręcznie — pull-job zrobi to przy następnym runie (max 1 min). Po prostu poinformuj usera: `📤 Wysłano [task|query] do <to_user>: <title>`.

### `reply` — odpowiedź na wiadomość w threadzie

```
[ -n "$PULS_HOME" ] || { echo "Brak PULS_HOME — zaktualizuj Pulsa (re-run instalatora). Bez tego nie da się odpowiedzieć komendą."; exit 1; }
node "$PULS_HOME/scripts/inbox/reply.mjs" \
  --thread-id <uuid> \
  --content "..." \
  [--title "Re: ..."]
```

Adresata wyprowadza z wątku (oryginalny nadawca task/query; gdy wątek założyłeś sam — jego odbiorca). `thread_id` widać w `Skrzynka.md` w callouts jako Obsidian comment `%% thread:<uuid> %%` (w callout otrzymanej wiadomości pełna forma to `%% id:<id> thread:<uuid> %%`).

Gdy wątek jest już domknięty (nie ma go w skrzynce), podaj adresata jawnie: `--to <nick>`.

**Zwraca:** `{ id, thread_id, to_user, title, type: 'reply' }`

### `close` — zamknięcie threadu bez odpowiedzi

```
[ -n "$PULS_HOME" ] || { echo "Brak PULS_HOME — zaktualizuj Pulsa (re-run instalatora) albo ustaw PULS_HOME na katalog instalacji. Bez tego nie da się domknąć wątku komendą; użyj checkboxa w Skrzynce."; exit 1; }
node "$PULS_HOME/scripts/inbox/close.mjs" --thread-id <uuid>
```

⚠️ Skrypt mieszka **w repo Pulsa**, nie w vaultcie — dzięki temu domknięcie komendą archiwizuje nitkę tym samym kodem co odhaczenie checkboxa w Skrzynce. **Nie wołaj `node` bez guardu na `PULS_HOME`** — bez zmiennej dostaniesz nieczytelne `MODULE_NOT_FOUND` zamiast informacji, co naprawić.

Domyka wiadomości wątku **zaadresowane do Ciebie** (akcja `Zapoznane`). Znikną z Otrzymanych w Skrzynce, a cała nitka trafi do `Zasoby/inbox-archive/YYYY-MM.md`. Twoje wysłane delegacje zostają w Delegowanych — task zamyka odbiorca checkboxem „Zrobione", nie nadawca z drugiej strony. Idempotentne: powtórzone wywołanie zwraca `closed: 0` i **nie dopisuje drugiego wpisu do archiwum**.

**Zwraca:** `{ thread_id, closed, archived }` (albo dodatkowo `note`, gdy nie było czego domykać)

## Natural language examples

| User mówi | Subkomenda | Args |
|-----------|------------|------|
| "wyślij Marcinowi profil X do walidacji" | `send` | `--to marcin --title "Walidacja profilu X" --content "..." --type task` |
| "spytaj Marcina, czy skończył LP" | `send` | `--to marcin --title "Status LP" --content "Czy skończyłeś?" --type query` |
| "odpisz Marcinowi w threadzie abc123 że zrobione" | `reply` | `--thread-id abc123 --content "Zrobione"` |
| "zamknij wątek abc123" | `close` | `--thread-id abc123` (skrypt z `$PULS_HOME/scripts/inbox/`) |

## Wymagania środowiska

- `INBOX_HUB_URL` + `INBOX_TOKEN` — konfiguracja skrzynki zapisana przez instalator Pulsa po wklejeniu kodu zaproszenia. Skill szuka jej w tej kolejności: `INBOX_ENV_FILE` (jawna ścieżka) → `$PULS_HOME/data/inbox.env` → wskaźnik `~/.claude-cron-home` (stała nazwa pliku z katalogiem instalacji, zapisywana przez instalator) i jego `data/inbox.env` → `.env` w workspace (instalacje sprzed przeniesienia sekretu poza vault; czytany, nigdy zapisywany). `PULS_HOME` ustawia instalator w sekcji `env` pliku `{workspace}/.claude/settings.json`, więc działa w sesjach Claude Code z tego workspace'u; wskaźnik ratuje pozostałe procesy. Brak konfiguracji = **re-run instalatora Pulsa**, nigdy ręczne wpisywanie tokenu do pliku w vaulcie (agent auto-reply czyta to drzewo z niezaufanym promptem).
- **Bez `INBOX_USER`** — tożsamość wyprowadza hub z tokenu, klient jej nie deklaruje. Dlatego nie da się wysłać wiadomości „w cudzym imieniu" podmieniając zmienną.
- Zero zależności npm — klient huba (`scripts/inbox/inbox-client.mjs` w repo Pulsa) stoi na wbudowanym `fetch`. **Wszystkie trzy komendy (send/reply/close) wołają skrypty z `$PULS_HOME/scripts/inbox/`** — jedna kopia kodu, objęta `npm test` repo (lokalne kopie w vaultcie skasowane 07.08: rozjeżdżały się z repo, np. brak redakcji tokenu z PR #5).

## Co NIE robić

- Nie zgaduj treści — jeśli user nie powiedział co przekazać, zapytaj.
- Nie wysyłaj duplikatów — jeśli user potwierdza już wysłaną delegację, tylko poinformuj o statusie.
- **Nie edytuj `Skrzynka.md` ręcznie** — hub jest source of truth, pull-job renderuje plik co 1 min.
- Nie myl `task` z `query` — jeśli user pyta o coś, to query (nie zadanie do wykonania).
