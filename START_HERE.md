# PHASE — paket za lokalni Codex

Ovo je plan i skup postojećih skillova za izradu PHASE portfolio koncepta. Paket ne sadrži implementaciju sajta, instalirane zavisnosti, Git istoriju ili hosting konfiguraciju. Ne kreira se niti objavljuje repozitorijum.

## Šta dobijaš

| Fajl / putanja | Namena |
| --- | --- |
| `PHASE_PLAN.md` | Glavni brief: brend, sadržaj, dizajn, scene, zvuk, stack, faze i kriterijumi prihvatanja. |
| `CODEX_PROMPTS.md` | Promptovi za postepen lokalni rad. Počni prvim promptom. |
| `AGENTS.md` | Trajna pravila koja Codex čita u projektu. |
| `.agents/skills/` | Dvanaest postojećih skillova, kopiranih bez promene sadržaja iz INLUNE repoa. |
| `SKILLS_MANIFEST.json` | Poreklo, tačna izvorna revizija i provere integriteta skillova. |
| `SOURCES.md` | Izvori, napomene o upotrebi i tehničke reference. |

## Postavljanje

1. Napravi lokalni folder za PHASE ili otvori njegov postojeći lokalni repo.
2. Raspakuj sadržaj ovog paketa u **koren projekta**. U korenu treba da se nalaze `AGENTS.md`, `PHASE_PLAN.md` i `.agents/skills/`. Nemoj ostaviti još jedan nepotreban nivo `phase-local-kit/` između korena i `.agents`.
3. Ako već postoji `AGENTS.md`, prvo spoji pravila. Nemoj slepo prepisati postojeći fajl. Za ovaj projekat koristi zaseban folder, a INLUNE sačuvaj kao read-only referencu.
4. Otvori taj folder u VS Code-u sa Codex ekstenzijom ili pokreni Codex CLI iz njega.
5. Proveri dostupne skillove kroz `/skills` ili izbor nakon znaka `$`. Očekuj, između ostalih, `frontend-design`, `awwwards-motion` i `threejs-shaders`.
6. Pošalji prvi prompt iz `CODEX_PROMPTS.md`. On pokriva početnu implementaciju i prvi hero; ostale promptove koristi za naredne faze.

Windows: `.agents` je folder čije ime počinje tačkom, ali nije isto što i `.git`. ZIP ga sadrži. Prilikom kopiranja proveri da je zaista prenet i da nisi kopirao samo vidljive `.md` fajlove.

## Šta skillovi rade

Skillovi su instrukcije, a ne instalirane JavaScript biblioteke. Dostupnost `threejs-r3f` skilla ne znači da je paket `@react-three/fiber` instaliran. Codex treba da pripremi zavisnosti prema planu i proveri njihove međusobno kompatibilne verzije.

| Skill | Kada je najkorisniji |
| --- | --- |
| `frontend-design` | Vizuelni pravac, kompozicija, tipografija i kritika izgleda. |
| `awwwards-motion` | Kreativne motion tehnike i kvalitet izvedbe. |
| `threejs-scene` | Organizacija 3D scene i kamere. |
| `threejs-r3f` | React Three Fiber, životni ciklus i React integracija. |
| `threejs-shaders` | Deformacije, uniform vrednosti i GLSL efekti. |
| `threejs-particles` | Kontrolisana atmosfera i prikazi zvučnih studija. |
| `threejs-animation` | Kontinuirano kretanje i promene stanja scene. |
| `threejs-interaction` | Pokazivač, dodir i povezivanje scene sa UI kontrolama. |
| `threejs-materials` | Materijal glavne forme i način osvetljavanja. |
| `threejs-performance` | Merenje i optimizacija. Ima uključenu referencu za profilisanje. |
| `threejs-accessibility` | HTML kontrole i alternative vizuelnom prikazu. |
| `threejs-testing` | Provera grafičkog ponašanja i regresija. |

Codex bira relevantne skillove za konkretnu fazu. Ne treba u svakom promptu nabrajati svih dvanaest.

## Važna projektna odluka

`awwwards-motion` sadrži jake estetske preporuke, uključujući glass površine i spring animacije. PHASE koristi vizuelni pravac iz `PHASE_PLAN.md`: crna, srebrna i kiseložuta, kontrolisano kretanje i malo dekoracije. Ne treba dodavati glass kartice ili elastičnost svakom elementu samo zato što skill to predlaže.

## Rad u etapama

Najpre usaglasi hero. Zatim razvij studije, zvuk, preostale sekcije i finalni polish. Posle svake veće faze pogledaj stvarni sajt u browseru. Daj konkretne korekcije: proporcije, tempo, kontrast, intenzitet i čitljivost.

Paket nije dokaz da je sajt pokrenut ili vizuelno verifikovan. To se radi tokom lokalne implementacije. Prva verzija treba da bude u potpunosti lokalna; registracija domena, objava, Git remote i povezivanje eksternih servisa zahtevaju tvoj poseban zahtev.
