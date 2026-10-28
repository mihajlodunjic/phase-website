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
