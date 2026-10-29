# PHASE / provere prve lokalne verzije

Datum: 28. oktobar 2026. Obim: faza 1 i početak faze 2. Dodat je osnovni
lokalni brief da CTA bude funkcionalan. Studije imaju tekstualni sadržaj;
posebni vizuali, izbor, paneli i audio još nisu implementirani.

## Izvršeno

- `npm.cmd install`: 65 paketa, 0 prijavljenih ranjivosti.
- `npm.cmd ls --depth=0`: bez nevažećih peer zavisnosti. React i DOM 19.3.1,
  Fiber 9.8.2 (peer React >=19 <19.4, Three >=0.156), Three 0.186.1.
  Node 24.13.0 zadovoljava izabrane alate. Verzije su zaključane lockfile-om.
- `npm.cmd run build`: typecheck i Vite production build prošli.
- `npm.cmd test`: 2 test fajla, svih 6 testova prošlo. Provereni ograničeni
  pointer/scroll ulazi, stabilan motion-off kadar, frame-independent damping,
  delta posle povratka u tab, neispravni ulazi i generisanje briefa.
- Dev server: http://127.0.0.1:5173/ . Production preview: http://127.0.0.1:4173/ .
- Browser: Playwright, Chrome 155 na Windowsu. Scene pregledane kao stvarni
  WebGL prikaz na Intel UHD Graphics 620 / ANGLE Direct3D11.

## Browser provere

| Provera | Rezultat |
| --- | --- |
| 1440×900, 1280×720, 768×1024, 390×844, 320×568 | Bez horizontalnog skrola; naslov ostaje u viewport-u. |
| Statičan desktop i mobilni hero | Screenshotovi pregledani; ublaženi nabori/refleksije i korigovana visina desktop hero-a. |
| Tastatura | Skip link prvi, vidljiv fokus; Enter otvara brief; Space upravlja motion kontrolom. |
| Mobilni meni | Otvaranje, anchor navigacija, zatvaranje; Escape vraća fokus na Menu. |
| Brief | Generisanje, prazni i whitespace unosi, zatvaranje i povratak fokusa rade. |
| Clipboard | Stvarno kopiranje uspešno. Simulirano odbijanje bira ceo tekst i daje uputstvo za ručno kopiranje. |
| Motion off | Brojač frame-ova stabilan na 29 tokom 20 browser RAF opažanja. |
| Idle i pointer | Idle renderuje; pointer menja ograničenu pozu; izlazak vraća target u centar. |
| Offscreen | Brojač ostao 80→80; povratak 84→100. |
| Skriven dokument | Simuliran document.hidden + visibilitychange: 102→102; povratak 104→120. |
| Reduced motion od učitavanja | Poza [0,0,0], frame count 1→1, kontrola disabled i jasno označena; scroll auto. |
| WebGL nedostupan | GetContext blokiran pre učitavanja: SVG vidljiv, Canvas uklonjen, naslov/navigacija/brief rade. |
| Gubitak WebGL konteksta | WEBGL_lose_context: SVG preuzima prikaz; naslov i CTA ostaju. |
| Touch emulacija | DPR 3, touch points 1; tap meni/anchor rade; render DPR ograničen na oko 1.25. |
| 320 px brief | clientWidth i scrollWidth dijaloga oba 280 px. |
| Resize i portrait/landscape | Canvas prati kontejner; 1 geometrija i 2 interne teksture nakon više resize-ova. |
| Production mreža | Samo lokalni JS, CSS i autorski SVG favicon; bez media, font, model ili udaljenih zahteva. |
| Audio | Nema audio engine-a, audio/video elemenata ni audio zahteva. |
| Production greške | Nema neobrađenih pageerror događaja. |

Prvi offscreen test je proverio brojač dok je smooth scroll još trajao.
Ponovljen je sa instant test skrolom i čekanjem na stvarno IntersectionObserver
stanje; konačna provera prolazi. Pozadinsko ponašanje je testirano simuliranjem
visibility stanja, ne stvarnim OS prebacivanjem taba.

## Prvo merenje

120 page requestAnimationFrame intervala nakon 10 uvodnih frame-ova, miran
pointer i aktivan idle. Ovo su intervali browser frame-ova, ne GPU timer rezultati.

| Viewport | DPR / drawing buffer | p50 / p95 / max | Render |
| --- | --- | --- | --- |
| 1440×900 | DPR 1 / 662×626 | 16.7 / 17.0 / 17.2 ms | 1 call, 30,720 trouglova |
| 390×844, desktop resize | DPR 1 / 351×343 | 16.7 / 17.0 / 17.2 ms | 1 call, 15,360 trouglova |

Oba merenja su isti Intel UHD 620 i Chrome 155. Ovim nije potvrđen cilj na
fizičkom telefonu, na integrisanim GPU-ovima drugih klasa ili u drugim browserima.
Nema tvrdnje o izmerenoj GPU potrošnji ili stvarnoj GPU memoriji.

## Poznate napomene i sledeći rad

- Vite upozorava na lazy scene chunk: 916.46 kB minified / 243.60 kB gzip.
  HTML/tekst i SVG ne čekaju učitavanje Three/R3F. Glavni JS je oko 235 kB /
  74 kB gzip. Optimizacija scene bundle-a je otvorena; upozorenje nije sakriveno.
- Three r186 prijavljuje deprecation warning za Clock koji interno kreira Fiber
  9.8.2 (proveren instalirani source). Aplikacija ne kreira svoj Clock. U prvom
  dev učitavanju primećen je i ANGLE shader precision warning pri PMREM compile;
  nije bilo render greške. Normalan production pregled daje Clock upozorenje.
- Screenshotovi su browser dokazi u `artifacts/qa/`, nisu asseti sajta. Glavni:
  `desktop-static.png`, `mobile-static.png`, `mobile-hero.png`,
  `no-webgl-desktop.png`, `context-lost-mobile.png`, `touch-dpr3.png`.
- Još nisu provereni stvarni telefon, iOS/Safari, Android Chrome, screen reader,
  OS browser zoom i pravi background-tab lifecycle. Potreban je duži performance
  profil i GPU merenje. Sistemski fontovi treba da se pregledaju na drugim OS-ovima.
- Sledeće: art-direction prolaz forme/materijala/deformacije; stvarni mobilni
  test; faza 3 sa različitim proceduralnim motivima i panelima studija.
- Audio, njegova reprodukcija/stop/prebacivanje i audio testovi ostaju faza 4.
- Sačuvana je postojeća dokumentacija i svi skill fajlovi. Izmenjen je samo
  status/checklist plana; nije kreiran repo niti izvršena Git ili deployment akcija.

## Dorada PHASE Loop-a / faza 2

Najnoviji prolaz: 28. oktobar 2026. Prethodni rezultati iznad pripadaju prvoj
verziji. Ovaj prolaz zamenjuje broj testova, podatke o sceni i otvorene stavke
za glavni vizual; audio i studije ostaju izvan ovog zahteva.

### Vizuelna dorada i arhitektura

- Pregledani statični pre/posle kadrovi na desktopu i mobilnom viewport-u.
  Spljoštena uvijena forma zamenjuje naduven presek; uklonjeno sitno rebranje.
  Naslov, HTML sadržaj i postojeći raspored nisu menjani.
- Blaga anisotropija 0.22 i proceduralna hrapavost daju satenski refleks.
  Prelazak na glatke vertex tangente uklonio je vidljivu triangulaciju pri
  probnom anisotropnom osvetljenju. Pozicije, normale i tangente dobijaju
  odgovarajuću shader transformaciju; završna konverzija boje ostaje Three-ova.
- Svetlosne trake i tamne zastavice generišu se kodom. PMREM se pravi jednom
  na 256 px. Bez novih paketa, medija, HDRI, čestica ili postprocessing-a.
- Kontroler poseduje vreme, targete, smirivanje quaternion-a i uniform vrednosti.
  Ukupni nagib je ograničen na oko 7°; 18 s idle; mali canvas ima 55% intenziteta
  i blaži scroll. Aktivna motion putanja ažurira refs/uniforms bez React state promena i novih objekata; inspect dijagnostika je izdvojena.
- Uhvaćen i ispravljen problem ponovnog GPU upload-a geometrije tokom resize
  cleanup-a. Vlasnik površine sada se odvaja pre oslobađanja resursa. Brojači
  ostaju 1 geometrija / 2 teksture / 1 program kroz svih 10 promena kvaliteta.

### Šta je prošlo

- `npm.cmd test`: **17/17**, 3 fajla. Pored brief testova: kombinovani tilt i
  uniform opsezi kroz ceo ciklus, compact budžeti, periodičnost, quaternion,
  paused/background vreme, resume delta i malformed input; zatvoreni šavovi,
  otvorena šupljina, normale, tangente i culling margina u oba kvaliteta.
- `npm.cmd run build`: typecheck i production build prošli; 43 modula.
- `qa/scene-checks.js` je izvršen kao Playwright browser funkcija protiv preview-a
  na portu 4173. Proverava svih 5 viewport-a, reduced-motion pozu, 10 resize
  ciklusa, namerno pokvaren custom shader i nedostupan WebGL. Ceo fixture prolazi.
- Keyboard Space uključuje/isključuje motion; motion off ostaje na frame-u 6,
  sa nultim shader uniforms i neutralnom orijentacijom. Reduced motion od prvog
  učitavanja ostaje 1→1. Pointer daje ograničen nagib; izlazak briše pointer target.
- Hero scroll zaista pomera scenu unazad; kontroler ga ograničava i smiruje.
  Offscreen je ostao 64→64, povratak 69→85; simulirani hidden dokument 86→86,
  bez napretka vremena. Na povratku se ne obrađuje veliki vremenski skok.
- Touch kontekst DPR 3: render DPR oko 1.25, tap ne dodaje pointer tilt,
  mobilni meni se otvara. Direktni CDP touchStart/move/end potez preko Canvas-a
  skroluje stranicu 275.2 px, jednako referentnoj običnoj HTML stranici.
- Namerno neispravan custom vertex shader aktivira običan metalni materijal,
  bez neobrađenog pageerror-a. Očekivani compile log postoji u izolovanom testu.
- Nedostupan WebGL i WEBGL_lose_context daju ažurirani SVG fallback; naslov i
  Explore CTA ostaju dostupni. Normalni shader prikaz nema compile/link grešku.

### Merenje posle dorade

Chrome 155 / Windows / Intel UHD Graphics 620 / ANGLE Direct3D11. Miran pointer,
aktivan idle, isti viewport i DPR kao pre dorade. Po 120 uzoraka posle 10 uvodnih.
GPU: EXT_disjoint_timer_query_webgl2 oko glavnog drawElements poziva; svi query
objekti oslobođeni, GPU_DISJOINT=false. To meri GPU draw, bez clear/resolve,
kompajliranja i inicijalnog PMREM hvatanja. RAF intervali su odvojeno opažanje.

| Viewport | Drawing buffer | RAF p50 / p95 / max | GPU draw p50 / p95 / max |
| --- | --- | --- | --- |
| 1440×900, DPR 1 | 662×626 | 16.7 / 17.1 / 17.9 ms | 3.72 / 3.76 / 3.79 ms |
| 390×844, desktop resize, DPR 1 | 351×343 | 16.7 / 16.8 / 16.9 ms | 1.41 / 2.10 / 4.86 ms |

Scena ima **1 draw call**, **23,296 / 11,520 trouglova**, **1 geometriju**,
**2 interne teksture**, **1 program**. Pre dorade: 30,720 / 15,360 trouglova;
desktop RAF p95 17.0 ms, GPU draw p50 3.23 / p95 3.24 ms u kraćem uzorku od
35 frame-ova. Novi materijal i shader imaju dodatni trošak. Iz ovih uzoraka
ne zaključuje se GPU ubrzanje niti univerzalno ispunjen 60 fps cilj.

### Dokazi, reprodukcija i ograničenja

- `artifacts/qa/phase2-before-desktop.png`, `phase2-before-mobile.png` čuvaju
  prethodnu verziju. Završni prikazi: `phase2-desktop-static.png`,
  `phase2-mobile-static.png`, `phase2-pointer-desktop.png`, `phase2-no-webgl.png`.
- Stabilan fixture: `qa/scene-checks.js` može se ponovo izvršiti browser alatom
  sa filename parametrom; potreban je pokrenut production preview na 4173.
  On nije deo npm unit test komande. `?surface=standard` bira običan materijal
  za ručnu proveru; `?inspect=1` izlaže brojače i pose bez drugog render loop-a.
- Pokušaj stvarnog prebacivanja taba u ovom browser alatu zadržao je
  document.hidden=false. Zato je background ponašanje potvrđeno simulacijom
  visibilitychange, a pravi browser/OS lifecycle ostaje ručna provera.
- Nema fizičkog telefona, Safari/Android provere, dugog termalnog profila niti
  tvrdnje o tačnoj VRAM potrošnji. Mali viewport i touch emulacija koriste isti
  desktop GPU. Potrebna je stvarna mobilna potvrda.
- Lazy scena 921.85 kB / 245.56 kB gzip; glavni JS 235.36 kB / 74.00 kB gzip.
  Vite chunk-size i Three/Fiber Clock deprecation upozorenja ostaju zabeležena.
- Sledeće su proceduralni motivi i izbor studija iz faze 3. Audio nije dodat;
  nema Git, remote, commit, push ili deployment akcija.

## Faza 3 / studije i tok stranice

Najnoviji prolaz: 28. oktobar 2026. Završene studije, izbor, paneli, statement,
approach, studio i navigacija. Audio engine nije uveden; nema Play/Stop zvuka
ili vizuelnih kontrola koje se lažno predstavljaju kao audio reprodukcija.

### Izvršene provere

- `npm.cmd run build`: typecheck i production build prošli, 57 modula.
- `npm.cmd test`: **28/28**, 6 fajlova. Dodati su testovi stable-ID tab navigacije,
  form impulsa, bounded signala i deformacije, process mapiranja, determinističke
  geometrije, zajedničkog RAF vlasništva i oslobađanja završene sekvence.
- `qa/studies-checks.js` izvršen protiv production preview-a na 4173, ceo prolaz
  uspešan. Sačuvan je kao ponovljiv Playwright browser fixture.
- Sva tri panela proverena na **1440, 768, 390 i 320 px** (12 kombinacija).
  Uvek jedan vidljiv tabpanel; sva tri motiva su različita i svaki ima svoj opis.
  Nema horizontalnog skrola stranice ili dijaloga.
- Tabovi: Left/Right wrapping, Home/End, aktivacija, pravilan selected/tabindex.
  Početni fokus na Close; Tab i Shift+Tab ostaju u dijalogu; Escape zatvara i
  vraća fokus originalnom opener-u, čak i posle izbora druge studije.
- Deljeni focus helper je provereno primenjen i na postojeći Project brief.
  Shift+Tab sa Close vraća fokus na Generate brief; standardno zatvaranje ostaje.
- Na 390 i 320 px provereni su Menu, početni fokus na Work, Escape/fokus na Menu,
  sva tri anchor URL-a, zatvaranje menija i fokus na ciljnim sekcijama.
- Reduced motion od učitavanja: sve studije i izbori rade, replay je disabled,
  vizuali su stabilni. Prošla je i živa promena OS preference posle učitavanja.
- FORM se skupi u jedan impuls i vrati; zatim `data-running=false` i frame count
  prestaje da raste. Replay zaista ponovo pokreće sekvencu. Motivi iza panela
  ostaju zaustavljeni. Izbor ECHO radi i dok je Motion off.
- AudioContext/webkitAudioContext konstruktori su nadgledani: **0 kreiranja**
  tokom svih study izbora, tabova, replay-a i zatvaranja. Bez audio zahteva.
- Bez WebGL-a: hero koristi SVG fallback, a sve tri studije i paneli rade.
- Rapid Listen → Shape → Refine → Listen → Refine završava na očekivanoj formi;
  glavna forma se smiruje na scale ~0.37. Sav tekst procesa ostaje vidljiv.
- Simulirani document.hidden zaustavio je SVG brojač na 3→3; povratak nastavlja
  kretanje bez velikog delta skoka. Pravi OS/tab lifecycle ostaje ranije ograničenje.
- Ponovljen `qa/scene-checks.js`: prethodni hero, sva 5 viewport-a, shader fallback,
  WebGL fallback i 10 resize ciklusa prolaze; resursi ostaju 1/2/1.

### Touch i vizuelni pregled

- Chrome touch emulacija 390×844 / DPR 3: tap otvara ECHO i bira AFTERIMAGE.
  Touch potez skroluje dijalog 116 px, pozadinski scroll ostaje 2156.8→2156.8.
  Close je vidljiv pri y≈24 px i vraća fokus na View ECHO study.
- Pregledani desktop FORM, ECHO i AFTERIMAGE, panel, statement/approach/studio
  tok, 390 px i 320 px prikazi. Ispravljeni su preveliki mobilni razmak iz
  kaskadne kolizije i četvoropikselni horizontalni preliv u 320 px tabovima.
- Materijal i paleta ostaju charcoal/silver/acid. FORM je dominantan širok prikaz,
  ECHO red sa manjim signalima, AFTERIMAGE suprotno postavljena široka površina.
  Nisu uvedene tri jednake kartice, spoljni mediji, logoi klijenata ili testimonials.
- Dokazi: `phase3-work-1440.png`, `phase3-work-390.png`, `phase3-work-320.png`,
  `phase3-panel-320.png`, `phase3-form-pulse.png`, `phase3-approach-desktop.png`,
  `phase3-touch-panel.png` u `artifacts/qa/`.

### Opterećenje i granice

Jedan postojeći WebGL Canvas. Studije i process forme su inline SVG, sa jednim
zajedničkim update raspoređivačem ograničenim na najviše 30 update-a/s. On prestaje
kada nema vidljivih aktivnih motiva; završene panel sekvence se odjavljuju.

Na Chrome 155 / Windows / Intel UHD 620, viewport 1440×900, posle spremnosti
hero scene i 30 uvodnih RAF-ova: 120 page RAF intervala, p50 16.7 / p95 17.0 /
max 17.1 ms, bez long task događaja u uzorku. Vidljiv aktivan FORM imao je 44
update-a tokom 1999 ms. To su browser intervali i SVG update brojači, ne GPU
frame time ili potvrda cilja na fizičkom telefonu.

Prvi uzorak započet pre završetka inicijalizacije zabeležio je long task 223 ms
(p95 33.3 ms, max 249.7 ms). Ne pripisuje se precizan uzrok bez CPU trace-a;
startup i zagrejani uzorak su odvojeni. Optimizacija učitavanja velike lazy 3D
scene ostaje otvorena. Glavni JS sada 248.75 kB / 78.15 kB gzip, CSS 17.77 kB /
4.39 kB gzip; Three scena 921.85 kB / 245.56 kB gzip.

Normalni production pregled: 0 page/console grešaka; poznat Three/Fiber Clock
warning i Vite chunk-size upozorenje ostaju. Mreža sadrži lokalni JS/CSS i SVG
favicon; nema novih zavisnosti ili udaljenih medija. Još nisu provereni fizički
telefon, Safari/Android i screen reader; sistemske fontove treba pregledati na
njihovim stvarnim OS-ovima. Sledeća funkcionalna faza je Web Audio engine.

## Faza 4 — proceduralni audio (2026-10-28)

### Implementacija i automatske provere

- Bez novih zavisnosti. Postojeće verzije/peer dependencies ostaju iste.
- `npm.cmd run typecheck`, `npm.cmd test` i `npm.cmd run build` prolaze.
  **43 unit testa / 8 fajlova**: dodati lifecycle/consent/cancellation, serijska
  zamena jedne voice, završetak, hidden/interruption, Strict Mode cleanup,
  gain ramp/clamp, konačni score, stvarni RMS/band separation i bounded mapping.
- Production preview je na 4173, dev na 5173. Svi browser fixture-i su izvršeni
  protiv production build-a, osim source-level offline signal fixture-a na dev-u.
- Prošli `qa/audio-checks.js`, `qa/audio-endings-checks.js`,
  `qa/audio-edge-checks.js`, `qa/audio-signal-checks.js` i `qa/audio-load-checks.js`.
- Ponovljeni `qa/studies-checks.js` i `qa/scene-checks.js` prolaze. Selector za
  pozadinske SVG motive je preciziran jer Play dugmad sada takođe imaju SVG ikone.

### Stvarni browser audio i UI

Chrome 155 / Windows, 1440×900, sa postojećim sistemskim fontovima:

- Početno učitavanje i visual-only izbori: **0 AudioContexts, 0 voices**.
- Enable sound: jedan kontekst, ready, bez zvuka. Play i svi naredni startovi
  ponovo koriste taj kontekst. Default volume 20%.
- FORM → mute preko Home → 100% preko End → ECHO: stvarni RMS prvo >0,
  zatim RMS/bass/mid/high =0 pri volume 0, pa opet >0. Najviše jedna aktivna voice.
- Stop, zamena studije, izbor drugog taba, otvaranje briefa i Turn sound off
  prekidaju zvuk. Posle fade-a ostaju četiri zajednička graph čvora, bez voice-a.
- Stop dok je resume promise odložen sprečava kasni start. Odbijeni resume
  prikazuje error i dozvoljava novi eksplicitni pokušaj u istom kontekstu.
- Spoljni `context.suspend()` izaziva interrupted stanje; novi Play radi.
- Simulirani `document.hidden`/visibilitychange zaustavlja zvuk i suspenduje
  kontekst. Vraćanje taba ne nastavlja reprodukciju. Novi Play koristi isti kontekst.
- Simulirani persisted pagehide/pageshow (BFCache) ostavlja stopped stanje;
  novi Play radi. Finalni pagehide zatvara kontekst. Unit test proverava i
  finalni provider detach: 0 owned nodes/voices, jedan close, bez Strict Mode curenja.
- Escape zatvara study panel dok zvuk nastavlja; globalni Stop tada ostaje vidljiv.
  Promena taba sama ne pokreće sledeći zvuk. Replay motion se isključuje tokom
  audio vođenog motiva, da dva vremena ne upravljaju istom formom.
- Reduced motion: audio radi, SVG ostaje stabilan i frame brojač ne raste.
  Bez WebGL-a audio radi uz SVG fallback. Bez AudioContext podrške Play je
  disabled i vizuelni sadržaj/paneli ostaju upotrebljivi.
- Play/Stop, volume i status pregledani na 1440, 390×844 i 320×568. Nema
  horizontalnog preliva. Kontrole u fiksnom footer-u dijaloga ostaju u ekranu;
  sadržaj panela se skroluje posebno. Fokus ostaje u modalu.
- Screenshot dokazi: `phase4-player-{1440,390,320}.png`,
  `phase4-panel-{1440,390,320}.png`, `phase4-audio-hero.png` u `artifacts/qa/`.
- Normalni audio prolaz: 0 page errors. Fallback fixture namerno izaziva
  WebGL grešku; prethodno poznati Three/Fiber Clock warning ostaje.

### Završetak i sintetisani signal

Real-time prirodan završetak je sačekan za sva četiri score-a, bez preskakanja
vremena: PHASE 4 s, FORM 8 s, ECHO 9 s, AFTERIMAGE 12 s. Svaki je završio kao
stopped/ended, progress=duration, 0 voices, 4 zajednička čvora, sva energija 0.
Wall vreme uključuje Playwright klik/skrol/polling i nije audio timing merenje.
Audio-time completion određuje kraj, bez intervala koji bi petljao studiju.

OfflineAudioContext, mono 48 kHz, volume 100%, sa istim synth/routing kodom:

| Score | Peak (linear) | RMS celog rendera | Peak posle kraja |
| --- | ---: | ---: | ---: |
| PHASE 4 s | 0.09828 | 0.01639 | 0 |
| FORM 8 s | 0.09828 | 0.01571 | 0 |
| ECHO 9 s | 0.09506 | 0.00722 | 0 |
| AFTERIMAGE 12 s | 0.08507 | 0.01350 | 0 |

Provereni su konačnost svakog sample-a, različite score strukture i nulti tail.
Dodatni offline renderi za sva četiri score-a sa zakazanim Stop/fade usred fraze
imaju nulti izlaz posle fade/tail granice. Nema snimljenih audio fajlova.
Live browser najviši zabeleženi peak pri brzom volume/switch testu bio je ~0.1705,
a pri punim studijama na podrazumevanih 20% ~0.01966. Različiti real-time graf
history/kompresor i uzorkovanje znače da to nije identično offline peak-u.

Ovo potvrđuje signal, granice i state/lifecycle, **ne subjektivan kvalitet zvuka**
na slušalicama ili zvučnicima. Takvo slušanje nije izvršeno preko ovog alata.

### Opterećenje

Isto okruženje, 1440×900 / DPR1, spremna scena + 30 warm-up RAF-ova. Instrumentisani
uzorci po 120 page RAF intervala, sa čitanjem energije/poze svakog frame-a:

| Stanje | p50 | p95 | max | Long tasks |
| --- | ---: | ---: | ---: | ---: |
| Idle | 23.6 ms | 25.8 ms | 29.6 ms | 0 |
| FORM playing | 23.9 ms | 25.9 ms | 26.3 ms | 0 |

Ovi page RAF intervali sa instrumentacijom nisu GPU frame time i nisu direktno
uporedivi sa ranijim jednostavnijim fixture-om. Ne predstavljaju potvrdu FPS cilja.
Idle max audio energy =0; playing max ~0.1858. Izmereni playing pose u granicama:
max breath ~0.00917, twist ~0.01688, shine ~1.0000003 za tonalni FORM uzorak.
Unit testovi proveravaju i zasićene ulaze do ukupnih ±0.021/±0.04/+12% granica.

Posle **15** start/stop ciklusa: contexts=1, maxVoices=1, activeVoices=0,
ownedNodes=4 u svakom mirovanju. Hero renderer ostaje 1 geometry / 2 textures /
1 program, 1 draw call, 23,296 triangles. Audio graph ima 4 zajednička čvora;
aktivna voice dodaje PHASE 10, FORM 16, ECHO 58 ili AFTERIMAGE 26, koji se
odspajaju pri završetku/Stop. Native browser internu GC/GPU memoriju ovo ne meri.

Build: glavni JS ~267.32 kB / 83.84 kB gzip; CSS 22.64 kB / 5.28 kB gzip;
lazy Three scena 922.11 kB / 245.65 kB gzip. Vite chunk-size warning ostaje.
Nema mrežnog audio sadržaja, remote fontova, sampled fajlova ili mikrofon API-ja.

### Preostala ograničenja

Pravi OS background/tab i BFCache lifecycle nisu dokazani simulacijom događaja;
fizički telefon (posebno iOS Safari audio activation/interruption), Android,
slušanje zvuka na stvarnom izlazu i screen reader ostaju za ručni pregled.
Faza 5 treba da obuhvati završni polish i ove ciljne uređaje. Nijedan performance
cilj na mobilnom GPU-u nije proglašen potvrđenim. Rad nije objavljen.

Dodatna touch provera faze 4: Chrome emulacija 390×844 / DPR3, tap Play PHASE →
Turn sound off daje off/0 voices/4 nodes/1 context. Sledeći Enable sound daje
ready/0 voices u istom kontekstu, bez autoplay-a. Tap Play/Stop AFTERIMAGE u
panelu radi. Zabeleženo 0 page/console errors i 5 lokalnih resource URL-ova,
bez udaljenih zahteva. Ovo je emulacija, ne fizički telefon.

## Faza 5 — završni brief, polish i QA (2026-10-29)

### Završeni rad

- Brief je native modal sa zasebnim unosom i rezultatom. Close i Generate/Copy
  ostaju u fiksnim delovima dijaloga; samo telo se skroluje. Nema backend-a,
  izmišljenog kontakta, slanja ili “Message sent” stanja.
- Required project/description validacija odbacuje i whitespace. Svaka greška je
  povezana aria-describedby/aria-invalid, fokus prelazi na prvo pogrešno polje.
  Generate fokusira naslov rezultata; Edit details čuva unesene detalje i sledeće
  generisanje menja rezultat. Escape vraća fokus pravom opener-u.
- Clipboard API stvarno kopira tekst. Read-back upoređivanje prolazi na svih pet
  širina. Windows clipboard vraća CRLF, pa poređenje normalizuje samo te prelome
  reda; sadržaj i redosled su isti. Odbijen API i potpuno odsutan API selektuju
  kompletan output za ručno kopiranje i daju iskrenu poruku.
- Footer sada ima Work / Approach / Studio / Back to top anchor linkove. Skip i
  anchor radnje pomeraju i fokus. Mobilni meni ima Start a project i vraća fokus
  na Menu posle zatvaranja briefa. Native skrol i zoom nisu blokirani.
- Sitne oznake su najmanje 12 px, form border/placeholder kontrast je pojačan,
  range i Motion kontrole imaju 44 px visinu. Hero pri 1280×720 koristi malo manji
  display type i razmake: hero actions bottom sada ~689.8 px (pre ~742.8 px).
- Zadržani charcoal/silver/acid, masivan condensed sistemski font i različite
  FORM/ECHO/AFTERIMAGE kompozicije. Nema dodatih medija, fontova ili zavisnosti.
  Postojeći 18 s idle i ograničena deformacija su zadržani nakon pregleda u radu.
- Jedan deljeni activity observer/listener pauzira hero i pozadinske SVG motive
  iza otvorenog dijaloga. Studija unutar aktivnog dijaloga ostaje funkcionalna.

### Izvršene provere

- `npm.cmd run typecheck`, `npm.cmd test` (**45 testova, 8 fajlova**) i
  `npm.cmd run build` prolaze. Dodatni brief testovi proveravaju pojedinačne
  field errors i potpun multiline output sa unetim opcionalnim detaljima.
- Prošli novi fixture-i `qa/phase5-checks.js`, `qa/phase5-access-checks.js` i
  `qa/phase5-performance-checks.js` protiv lokalnog production preview-a na 4173.
- Ponovljeni `qa/scene-checks.js`, `qa/studies-checks.js`, `qa/audio-checks.js`
  i `qa/audio-endings-checks.js` prolaze. Scene resursi su stabilni u 10 resize
  ciklusa; shader i WebGL fallback rade. Vizuelni izbori stvaraju 0 konteksta.
- Ponovo su sačekani prirodni krajevi PHASE/FORM/ECHO/AFTERIMAGE (4/8/9/12 s):
  stopped/ended, progress=duration, 0 voices, 4 shared nodes, 1 context, energija 0.
- Normalni phase-5 i audio-state browser prolazi: **0 page/console errors**.
  Namerni WebGL fallback fixture proizvodi očekivanu grešku; poznati Three/Fiber
  Clock warning i Vite chunk-size warning ostaju, nisu sakriveni.

### Prikazi i pristupačnost

Testirano u **Chrome 155 / Windows / Intel UHD Graphics 620, ANGLE D3D11**.
Nije test na fizičkom telefonu.

| CSS viewport | Nalaz |
| --- | --- |
| 1440×900 | Ceo tok, sve sekcije i brief; bez horizontalnog preliva. |
| 1280×720 | CTA u prvom ekranu, brief Close/Copy dostupni. |
| 768×1024 | Tablet raspored, studije, brief i navigacija. |
| 390×844 | Mobilni meni/brief, sve kontrole i clipboard. |
| 320×568 | Naslov, studije, brief unos/rezultat i manual copy. |
| 640×360 | Reflow ekvivalent 1280×720 na 200%; bez horizontalnog preliva. |

640×360 je **emulacija reflow viewport-a**, nije dokaz izvršenog browser zoom
ili pinch testa. Meta viewport ne ograničava maximum-scale/user-scalable.

- Native Tab/Shift+Tab kruže unutar modala; Close ima početni fokus, rezultat
  dobija programski fokus, Escape vraća opener. Header/mobile/footer anchor-i
  menjaju hash i fokus. Meni i brief iz menija imaju pravilan povratak fokusa.
- Aktivni player ne prekriva proverene fokusirane View FORM / Play ECHO / Start
  a project / footer Back to top kontrole na 390 px.
- Targeted DOM contrast uzorak: 78 tekstualnih elemenata na stranici, minimalni
  kontrast ~8.11:1; 17 u formi sa greškama, minimum ~7.25:1. Minimum font-size
  u oba uzorka 12 px. Obuhvaćene su CSS podloge/opacity; SVG/PBR pikseli, native
  popup kontrole i svaki mogući browser state nisu certifikovani tim skriptom.
- Decorative Canvas/SVG je aria-hidden; tekst, opisi, kontrole i status ostaju
  HTML. Jedan main/H1. Reduced motion od učitavanja i živa promena preference,
  Motion off, izbor studije i audio ostaju provereni kroz regresije.
- Touch emulacija **390×844 / DPR3**: stvaran browser touch potez skroluje brief
  body 0→34.4 px, dok page scroll ostaje 0→0. Close top ~18.8 px, Generate footer
  bottom ~835.2 px. Tap Generate radi i Escape vraća Menu. Zoom nije zabranjen.

Screenshot dokazi su u `artifacts/qa/`: `phase5-page-{1440,1280,768,390,320}.png`,
`phase5-brief-{1440,1280,768,390,320}.png`, `phase5-copy-fallback-320.png`,
`phase5-reflow-640x360.png`, `phase5-touch-390.png` i zasebni statement/approach/
studio/contact/footer desktop prikazi. Pregledani su stvarni screenshotovi, ne
samo DOM dimenzije. Desktop 1280 i mobilni rezultat korigovani su posle pregleda.

### Performanse i vlasništvo resursa

Metod: novi browser context po 1440×900 DPR1 i 390×844 emulaciji DPR3; sačekana
scene-ready oznaka, 30 warm-up RAF-ova, zatim 120 RAF intervala. Browser proces i
shader cache mogu već biti zagrejani: startup nije hladno pokretanje uređaja.

| Uzorak | 1440×900 | 390×844 / DPR3 emulacija |
| --- | ---: | ---: |
| Scene-ready, približno od navigacije | 1016 ms | 1222 ms |
| Najduži startup long task | 268 ms | 379 ms |
| Warm RAF p50 / p95 / max | 23.5 / 24.7 / 25.5 ms | 24.3 / 26.1 / 27.4 ms |
| Warm long tasks | 0 | 0 |
| GPU mesh draw p50 / p95 | 3.68 / 3.72 ms | 1.79 / 1.81 ms |
| Drawing buffer / CSS canvas | 663×621 / 663×621 | 457×429 / 366×344 |
| Triangles / draw calls | 23,296 / 1 | 11,520 / 1 |

GPU uzorak koristi EXT_disjoint_timer_query_webgl2 oko gl.drawElements: 60 završenih
query-ja u oba slučaja, disjoint=false; query-ji se brišu i originalna funkcija
vraća. To je **vreme jednog mesh draw-a**, ne kompletno vreme frame-a, JavaScript,
compositing ili prezentacija. Niži GPU draw od RAF intervala ne dokazuje precizan
CPU bottleneck bez CPU trace-a; ceo ritam i startup ostaju važni. Cilj stabilnih
60 fps nije potvrđen, a emulirani telefon koristi isti desktop GPU.

Isti otkriveni renderer je ANGLE Intel UHD 620 / Direct3D11. Mobilni renderer DPR
je ograničen na 1.25 iako emulirani ekran ima DPR3; geometrija je manja. Nisu
menjani shader/materijal radi brojki niti je smanjen kvalitet bez poređenja.

Modal closed→open uzorak: desktop render counter 260→260 tokom 30 page RAF-ova,
mobilni 270→270, bez aktivnih background SVG motiva. Motion off: 266→266 /
276→276. Hidden/return event simulacija radi; renderer se vraća bez velikog delta.
U svim mirovanjima i resize regresiji ostaju **1 geometry / 2 textures / 1 program**.
Shared activity observer i visibility listener se odjavljuju kada nema korisnika;
svaki vizual odjavljuje svoj IntersectionObserver. Postojeći environment target,
geometry/material i audio cleanup ostaju na vlasniku. Ovi brojači nisu native
GC, tačna GPU memorija ili dokaz odsustva svih vrsta curenja.

Finalni bundle približno: glavni JS 270.73 kB / 84.77 kB gzip, CSS 27.11 kB /
6.08 kB gzip, lazy Three scena 922.11 kB / 245.65 kB gzip. Veliki scene chunk i
startup long tasks ostaju konkretni kandidati za naredno profilisanje; nisu
zamaskirani samo deljenjem vendor fajlova da nestane upozorenje.

### Preostale granice

Nisu izvršeni: fizički iPhone/Android, Safari, screen reader, pravi browser zoom,
pravi OS background/BFCache lifecycle ili subjektivno slušanje na audio izlazu.
Sistemske fontove treba pregledati na ciljnim OS-ovima; code-only verzija nema
skrivene font fajlove. Simulacije i Windows browser proveravaju ponašanje u ovom
okruženju, ne zamenu za te uređaje. Ne tvrdi se WCAG certifikat ili mobile FPS.

Lokalni preview je ostavljen sa Sound off. Nema novog repoa, remota, commit-a,
push-a, deployment-a ili eksternih servisa.

Dopunska završna provera: brief Generate i ručna selekcija prolaze i sa potpuno
isključenim WebGL-om (`briefWithoutWebGL=true` u phase5 fixture-u). Ponovljeni su
finalni typecheck, svih 45 testova i production build, bez novih grešaka.
