# PHASE — promptovi za lokalni Codex

Koristi prompt po fazi. Oni se odnose na lokalni projekat u kom su raspakovani `AGENTS.md`, `PHASE_PLAN.md` i `.agents/skills/`. Nisu komande za izmene INLUNE repoa.

## 1. Početak i prvi hero

```text
Radimo lokalno na PHASE portfolio konceptu.
Pročitaj AGENTS.md i PHASE_PLAN.md. Koristi $frontend-design.

Najpre pregledaj postojeće fajlove i dostupne skillove. Zadrži postojeći
rad. Ne kreiraj repo, Git remote, commit, push ili deployment.

Implementiraj fazu 1 i zatim početnu verziju glavnog vizuala iz faze 2.
Default stack je Vite + React + TypeScript + Three.js/R3F + običan CSS.
Proveri kompatibilnost zavisnosti pre instalacije. Nemoj koristiti
generator koji briše ovaj neprazan folder ili dokumentaciju.

Hero treba da izgleda kao autorski studio za zvuk: masivna condensed
tipografija, crna/srebrna/kiseložuta i jedna proceduralna skulptura.
Nemoj dodavati fotografije, video, modele, teksture, audio ili font fajlove.

Za scenu koristi relevantne $threejs-scene, $threejs-r3f i
$threejs-materials instrukcije. Najpre doteraj statičnu siluetu i materijal,
pa dodaj kontrolisan idle i pointer pokret. Obezbedi reduced motion i fallback.

Pokreni dostupne provere i lokalni preview. Ako imaš browser alat,
pregledaj desktop i telefon i popravi vidljive probleme. Ako ga nemaš,
navedi šta treba ručno proveriti. Na kraju opiši šta je završeno,
koje provere su stvarno prošle i šta sledi. Još ne dodaj audio engine.
```

## 2. Dorada glavnog vizuala

```text
Pročitaj PHASE_PLAN.md, sekcije 2 i 4. Koristi $awwwards-motion,
$threejs-shaders i po potrebi $threejs-particles.

Doradi PHASE Loop u postojeće kompozicije. Sačuvaj čitljivost naslova.
Tražim srebrnu skulpturalnu petlju sa kontrolisanom asimetrijom,
tamnim šupljinama i uskim refleksima. Default TorusKnot, jaka neon
magla i glass kartice ne ispunjavaju brief.

Uspostavi jedan kontroler za idle, pointer i scroll targete.
Kretanje treba da bude smireno, ograničeno i prilagođeno telefonu.
Pregledaj stvarni rezultat i ispravi najveće vizuelne slabosti pre
dodavanja novih efekata. Izmeri opterećenje koliko okruženje dopušta.
```

## 3. Studije i ostatak stranice

```text
Nastavi fazu 3 iz PHASE_PLAN.md. Koristi $frontend-design i relevantne
$threejs-interaction / $threejs-animation instrukcije.

Napravi FORM, ECHO i AFTERIMAGE sa različitim proceduralnim motivima,
ali istim grafičkim jezikom. Prati sadržaj i ritam stranice iz briefa.
Implementiraj statement, approach, studio i funkcionalne anchor linkove.
Sadržaj je konceptualan: bez izmišljenih klijenata i testimonials.

Izbor studije i paneli treba da rade dok je zvuk isključen.
Ne uvodi tri identične generičke kartice. Proveri mobilni meni,
upravljanje fokusom i prikaz na 390 px i 320 px.
```

## 4. Proceduralni audio

```text
Implementiraj fazu 4 i audio specifikaciju iz PHASE_PLAN.md.
Koristi Web Audio API, bez audio fajlova i bez mikrofona.

Jedan AudioContext, eksplicitni korisnikov klik, jedan aktivni zvuk,
vidljivi Play/Stop i volume, glatki gain prelazi i kraj studije.
FORM, ECHO i AFTERIMAGE treba da imaju različite kratke originalne
synth karaktere. Bez autoplay-a i beskonačnog podrazumevanog loop-a.

Poveži stvarnu audio energiju sa ograničenim parametrima vizuala.
Idle pokret ne sme glumiti playback. Testiraj promenu studije,
zaustavljanje, završetak, background tab i ponovni ulazak.
```

## 5. Brief i završni polish

```text
Završi fazu 5 iz PHASE_PLAN.md. Napravi pristupačan projektni brief
dijalog sa Generate brief i stvarnim Copy brief ponašanjem.
Bez backend-a nema poruke Message sent niti slanja izmišljenom kontaktu.

Pregledaj celu stranicu i popravi tipografiju, razmake, intenzitet motion-a,
kontrast i responsive detalje. Koristi $threejs-accessibility i
$threejs-performance za relevantne provere.

Pokreni typecheck, production build i smislene testove. Zabeleži
stvarno proverene uređaje/viewporte i preostala ograničenja.
Rad ostaje lokalni; ništa ne objavljuj niti pushuj.
```

## 6. Nezavisna završna provera u novom lokalnom razgovoru

```text
Pregledaj postojeći PHASE prema PHASE_PLAN.md i AGENTS.md.
Koristi $frontend-design, $threejs-testing i po potrebi
$threejs-performance / $threejs-accessibility.

Proveri da li se ponašanje i izgled slažu sa briefom. Najpre navedi
konkretne probleme sa dokazima i njihovim uticajem. Ispravi pronađene
probleme u okviru lokalnog projekta i ponovi odgovarajuće provere.
Ne tvrdi da vizuelni kvalitet ili performanse prolaze bez stvarne provere.
Ne kreiraj remote, ne commituj, ne pushuj i ne objavljuj.
```
