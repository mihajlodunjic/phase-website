# PHASE — creative direction and implementation plan

Status: faze 1?5 i kompletna lokalna motion dorada implementirane i pregledane. Stvarni WebGL2 renderer potvr?en; audio, studije i brief provereni. Fizi?ki telefon, Safari/Android, screen reader i subjektivno slu?anje ostaju za ru?nu proveru. Datum: 29. oktobar 2026. Detalji: ANIMATION_REWORK.md.

## Sadržaj

1. Cilj i karakter brenda
2. Vizuelni identitet
3. Struktura i gotov sadržaj
4. Glavna scena i motion sistem
5. Proceduralni zvuk
6. Tehnička arhitektura
7. Telefon, pristupačnost i fallback
8. Budžeti i provere
9. Faze implementacije
10. Završni kriterijumi

## 1. Cilj i karakter brenda

PHASE je izmišljeni nezavisni studio za sonic branding, zvuk digitalnih proizvoda i originalnu kompoziciju. Sajt je portfolio demonstracija koja pokazuje autorski dizajn, real-time grafiku, interakciju i kvalitet frontend implementacije.

Posetilac treba u prvih nekoliko sekundi da razume delatnost i zapamti glavni vizual. Potom može da istraži tri konkretne zvučne studije, čuje kratak primer ako to želi i sastavi projektni brief. Osnovna priča mora biti razumljiva i bez zvuka.

**Ideja brenda:** zvuk kao materijal koji dobija oblik. Ista vizuelna gramatika vodi od glavne skulpture do studija i sitnih detalja. Kretanje ima veze sa frekvencijom, fazom, rezonancijom i ritmom.

**Karakter:** precizan, eksperimentalan, senzoran i samouveren. Ton teksta je kratak i konkretan. Izbegavati opisivanje studija neproverljivim superlativima.

**Pozicioniranje:** “Independent sound studio.”

**Glavna poruka:** “Sound, made visible.”

**Tri oblasti rada:** Sonic identity / Product sound / Original composition.

Studio i studije su koncepti. Nema tvrdnji o stvarnim klijentima, nagradama, godinama poslovanja, broju projekata ili rezultatima. U footeru diskretno naznačiti “Independent studio concept. Design & development by Mihajlo Dunjić.”

## 2. Vizuelni identitet

### Paleta

| Token | Vrednost | Upotreba |
| --- | --- | --- |
| Background | `#101211` | Glavna podloga, približno 80% stranice. |
| Deep | `#080A09` | Dubina glavnog vizuala i zatvoreni player. |
| Surface | `#1B1E1B` | Polja, aktivne kontrole i diskretne odvojene površine. |
| Foreground | `#ECEDE6` | Naslovi i primarni tekst. |
| Muted | `#A6ACA3` | Sekundarne informacije; proveriti kontrast na stvarnoj podlozi. |
| Accent | `#D8FF57` | Aktivni zvuk, odabrano stanje, ključna reč i glavni CTA. |
| Silver | `#BAC2BC` | Svetliji delovi proceduralnog materijala. |
| Rule | `rgba(236,237,230,0.16)` | Linije koje odvajaju sadržaj. |

Akcent treba da ostane redak. Ne bojiti svaki naslov ili okvir. Srebrna skulptura je centralni vizuelni materijal; ostatak je disciplinovan i čitljiv.

### Tipografija

Stroga verzija bez asseta koristi sistemske fontove:

- Display: `Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif`, normal weight. Proveriti izgled na uređaju korisnika; ne pretpostavljati identičnu dostupnost na svim sistemima.
- Body: `Arial, Helvetica, sans-serif`.
- Tehničke oznake: `Consolas, 'Liberation Mono', monospace`.

Opcioni kasniji izbor za ujednačeniji izgled je lokalno hostovan, pravilno licenciran condensed font, uz dogovor da font fajl predstavlja dozvoljeni asset. Ne dodavati ga tiho u code-only verziju.

Desktop hero: približno 150–190 px na 1440 px širine, line-height 0.84–0.9, zbijen tracking. Mobilni hero: približno 64–92 px prema stvarnoj širini. Ne koristiti fiksnu veličinu koja prelama “VISIBLE.” izvan ekrana. Sekcijski naslovi 48–80 px desktop / 34–46 px mobile. Body 17–19 px desktop / 16–18 px mobile. Sitne oznake najmanje 12 px.

### Logo i grafički sistem

Wordmark je `PHASE/`: velika uska slova i kosi završni rez. Može biti HTML tekst ili autorski SVG od jednostavnih geometrijskih oblika. Simbol predstavlja dve pomerene faze talasa; koristi se za favicon i mali potpis.

Tankim linijama odvajati stvarne celine. Tehničke oznake koristiti samo uz zvuk, parametre i studije. Ne dodavati koordinatne mreže, pseudoslučajne brojeve i oznake svakom delu stranice.

### Kompozicija

- Na 1440 px: spoljne margine približno 64–80 px, sadržaj do 1440 px, unutrašnji grid od 12 kolona.
- Hero tekst zauzima levih 5–6 kolona. Skulptura dominira desnim delom i može izaći van vidljivog polja.
- Pozadina iza slova ostaje mirna. Ne sakrivati oblik naslova pod sjajem ili česticama.
- Sekcije imaju različitu ulogu i ritam. Izbegavati niz jednakih kartica.
- Dugački tekst ograničiti na oko 50–65 karaktera u redu.
- Radius 0–4 px za većinu površina; za male audio kontrole može kružni oblik.
- Bez glassmorphism kartica, jakog glow-a preko cele scene i custom cursora koji otežava korišćenje.

## 3. Struktura i gotov sadržaj

### A. Navigation

Levo `PHASE/`. Linkovi `Work`, `Approach`, `Studio`. Desno dugme `Sound off` i CTA `Start a project`. Na telefonu mali meni sa istim pravim anchor linkovima. Escape zatvara meni i vraća fokus. CTA otvara projektni brief.

Audio dugme je stvarna kontrola i ne sme biti dekoracija. Aktiviranje zvuka omogućava audio engine; samo po sebi ne mora pokrenuti studiju. Tekst dugmeta mora jasno razlikovati omogućavanje zvuka od reprodukcije.

### B. Hero — prvo saopštenje

H1 u tri reda:

> SOUND,
> MADE
> VISIBLE.

“VISIBLE.” je jedini veliki akcenat u kiseložutoj. Prateći tekst:

> We shape how brands are heard. Sonic identities, product sounds and original compositions with a character of their own.

Primarni CTA: `Explore the studies` → section Work.

Sekundarna radnja: `Hear PHASE` → eksplicitno pokreće kratak originalni sintetizovan sonic logo, uz vidljivi stop. Sajt se učitava bez zvuka.

U desnom delu je PHASE Loop, srebrna živa skulptura sa tamnim šupljinama i nekoliko oštrih refleksa. Ispod hero-a sitno `Independent sound studio` i smirena naznaka skrola. Bez fullscreen loadera i prinudnog čekanja.

### C. Studio statement — promena tempa

Velika izjava u mirnijoj, širokoj kompoziciji:

> A brand is felt before it is explained.

Prateći tekst:

> A tone. A rhythm. A moment of recognition. We explore the details that make a sound unmistakably its own.

Ovo je kratak predah između hero-a i studija. Ne ponavljati sve tri usluge niti praviti tri feature kartice.

### D. Selected studies — glavni dokaz ideje

Naslov: `Three ways to be heard.` Podnaslov: `Self-initiated studies in sound and motion.`

Svaka studija ima naziv, oblast, kratak opis, proceduralni vizual i `Play study` / `Stop study`. Oznaka “Self-initiated study” sprečava da izgledaju kao izmišljene klijentske reference.

| Studija | Oblast | Tekst | Vizuelni motiv |
| --- | --- | --- | --- |
| FORM | Sonic identity | “A compact sonic signature built on clarity, tension and release.” | Koncentrična forma koja se uredno skupi u jedan impuls. |
| ECHO | Product sound | “Small signals that make digital interactions feel considered.” | Precizne tačke i kratke putanje koje se pale uz zvučne događaje. |
| AFTERIMAGE | Original composition | “A slow-moving atmosphere that leaves a trace.” | Šira deformisana površina i izduženi tragovi, mirnijeg tempa. |

Prvi rad je širok i dominantan. Druga dva imaju drugačiju, urednu kompoziciju ispod ili kao vertikalne redove; ne tri identične male kartice. Vizuali dele isti materijal i paletu, ali imaju različitu geometriju i kretanje.

Klik na naslov ili posebnu radnju može otvoriti pristupačan panel sa detaljem studije, 2–3 rečenice koncepta i istim player kontrolama. Izbor vizuala bez Play ne pokreće zvuk.

### E. Approach — proces prikazan promenom forme

Naslov: `From intention to resonance.` Tri koraka:

1. `Listen` — “We start with context: the people, the feeling and the role sound needs to play.”
2. `Shape` — “We explore a focused palette, finding the rhythm and texture that belong to the idea.”
3. `Refine` — “We test the details across real moments, keeping what makes the sound clear and recognisable.”

Desktop: tekst pored jedne scene koja menja stanje. Na telefonu običan tok sa svakim korakom i pojednostavljenim vizualom. Ako se dodaje sticky scena, zadržavanje najviše oko jednog dodatnog ekrana skrola; bez zaključavanja skrola i praznih višestrukih ekrana.

### F. Studio — kratka filozofija

Naslov: `A practice built around listening.`

> PHASE is an independent studio concept exploring the space between sound, identity and interaction. The work moves from the smallest interface signal to a complete sonic world.

Tri oblasti rada u tipografskoj listi: Sonic identities / Digital product sound / Original composition. Ova sekcija nema izmišljeni tim, adresu ili klijente.

### G. Project brief i footer

Naslov: `What should your brand sound like?` Dugme: `Start a project`.

U prvoj lokalnoj verziji otvara se dijalog za sastavljanje briefa, sa poljima: projekat, vrsta rada, kratak opis, okvirni rok. Budžet je opcion i može biti “Not sure yet”. Dugme `Generate brief` prikazuje tekst; `Copy brief` stvarno kopira sadržaj. Ako clipboard nije dostupan, prikazati tekst koji može ručno da se selektuje.

Bez backend-a ne prikazivati “Message sent”. Ne slati podatke na izmišljenu email adresu. Pravi kontakt i slanje dodaju se tek kada korisnik pruži tačne podatke i zatraži povezivanje.

Footer: wordmark, anchor linkovi i jasan portfolio concept credit.

## 4. Glavna scena i motion sistem

### PHASE Resonance Loop ? aktuelna specifikacija

Motion brief od 29.10.2026. zamenjuje raniju izrazitu suptilnost. Geometrija je zatvorena zategnuta traka sa zaobljenim tankim presekom, otvorom i kontrolisanom asimetrijom. Stati?na silueta mora ostati dobra; vidljiva promena povr?ine po?inje u prve 2?3 sekunde. Nema TorusKnot-a, bloom-a, magle niti preuzetih materijala.

Parametarski talas putuje du? same petlje u ciklusu od **8 s**: lokalno menja ?irinu, radijalnu napetost, dubinu i roll preseka. U-harmonici su celobrojni radi kontinuiteta na spoju. CPU rest mesh i shader koriste istu povr?inu. Normale i tangente se ra?unaju iz parcijalnih izvoda deformisane povr?ine, umesto osvetljenja nepokretne geometrije. Testovi proveravaju spoj, otvor, kona?nost i saturirane ulaze.

Satinirani srebrni PBR materijal deli proceduralno studijsko okru?enje sa FORM/AFTERIMAGE motivima: ?iroki srebrni paneli, uski akcenti i crne kartice. Bez HDRI/texture fajlova. Fina bru?ena komponenta je vrlo slaba i derivative-filtered. Geometrija, a ne beli sjaj, nosi pokret.

| Stanje | Zavr?eno pona?anje |
| --- | --- |
| Idle | 8 s travelling surface wave; sekundarna promena orijentacije 16 s. Ne predstavlja audio playback. |
| Pointer | Sekundarni nagib, desktop doprinos do .06 rad po osi / mali canvas .025; kona?na quaternion orijentacija ograni?ena na 12?. |
| Hero scroll | Mali lift/retreat/scale iz istog kontrolera; tekst ostaje nepomi?an i ?itljiv. |
| Playing | Bass ? lokalna napetost do .5; mid ? twist do .32; high ? refleks do +18%; zasebni attack/release prelazi. |
| Motion off / reduced motion | Rest phase 0, bez talasa, pomeranja i audio deformacije. Audio kontrole ostaju funkcionalne. |
| Offscreen / modal / background | Nepotrebno renderovanje miruje. Skriven tab zaustavlja audio; povratak ne pokre?e zvuk. |

Jedan sceneController poseduje hero vreme, pointer, scroll i audio targete. Telefon ima .82 amplitude talasa, .72 intenziteta rotacije, manje segmenata i DPR do 1.25. Full mesh je 160?32 (10,240 trouglova), mali 112?24 (5,376).

### Studije i Approach

- **FORM:** devet instanciranih metalnih prstenova/traka. Doga?aj se prenosi u dubinu sa .095 s ka?njenja po sloju; lokalni prevoj i radijalna promena zamenjuju globalni kolaps. Audio i preview koriste FORM_EVENTS. Silent panel sekvenca 4.2 s, audio 8 s; kraj se smiruje i staje.
- **ECHO:** sedam namerno komponovanih putanja povezuje osam ?vorova. Svetlosna glava i kratak trag putuju do slede?eg ?vora, koji reaguje pri dolasku. Synth i vizual dele ECHO_EVENTS; playback koristi stvarni AudioContext sat, preview traje 9 s.
- **AFTERIMAGE:** 19 metalnih talasnih traka (13 na malom canvasu), stvarna deformacija polo?aja i normala kroz vreme. Dve diskretne istorije na ?.55 / ?1.1 s koriste i istorijsku audio energiju; postepeno nastaju i blede na kraju. Nema punog postprocessing lanca. Silent panel 8 s, audio 12 s.
- **Approach:** istih pet traka kontinuirano prelazi iz Listen (razli?ite faze/otvorene linije), preko Shape (poravnata otvorena petlja), u Refine (precizna zatvorena struktura). Ru?ni izbor i keyboard kontrole ostaju autoritet; viewport ne preuzima izbor.

Hero ima jedan lazy R3F renderer. FORM/AFTERIMAGE dele jedan lazy Three renderer, fiksni framebuffer i proceduralno okru?enje; rezultat se prikazuje kroz 2D canvase, uklju?uju?i native dialog top-layer. Najvi?e dva stvarna WebGL konteksta po stranici, bez konteksta po kartici. Studije dele jedan scheduler od oko 30 a?uriranja/s sa o?uvanjem vremenskog ostatka. SVG je fallback, ne dokaz 3D rendera. Vlasnik stranice ?uva pool do finalnog unmount-a; pojedina?ni prikazi odla?u svoje geometrije/materijale.

### Ulazak i prelazi

Jedna hero ulazna koreografija traje 1.15 s uz mali pomeraj; tekst ostaje vidljiv i bez uspeha animacije. Motion off je prekida trajno za taj ulazak. Nema ponovnog intro-a na toggle, identi?nog fade-up-a svakom tekstu, zaklju?avanja skrola ili velike prazne sticky sekcije. Velika povr?ina prelazi mirnije od trenutnog odgovora HTML kontrola.

Ovaj odeljak je aktuelna motion specifikacija. Ranije brojke u fazama implementacije ispod ostaju istorija prethodnog rezultata. Stvarni dokazi i ograni?enja su u ANIMATION_REWORK.md i zavr?nom dodatku QA.md.

## 5. Proceduralni zvuk

Sve studije se sintetišu u browseru preko Web Audio API-ja. Nema MP3/WAV fajlova, sampleova, mikrofona niti preuzimanja muzike. To su kratke demonstracije generativnog zvuka, a ne tvrdnja da zamenjuju završnu studijsku muzičku produkciju.

| Studija | Predlog zvuka | Okvirno trajanje |
| --- | --- | --- |
| PHASE sonic logo / FORM | Kratak tonalni motiv, kontrolisani harmonici i čista završnica. | 3–5 s / proširena studija 8 s. |
| ECHO | Sekvenca sintetičkih UI signala, klikova od filtriranog noise-a i kratkih tonalnih odgovora. | 8–10 s. |
| AFTERIMAGE | Blag pad od nekoliko oscilatora, filtriran proceduralni noise, spori envelope i jednostavan delay. | 10–12 s. |

Jedan AudioContext kreirati/resume-ovati posle klika. Dozvoljena je samo jedna aktivna studija; pokretanje druge gasi prethodnu uz kratak fade. Nivo kreće tiho, približno 20%, sa vidljivim volume i stop kontrolama. Promene gain-a zakazivati glatko kako bi se izbegli klikovi. Ograničiti izlaz da slojevi ne klipuju.

Ne vrteti beskonačnu muziku kao podrazumevano ponašanje. Studija završava i UI se vraća u stopped stanje. `Stop` radi tokom celog trajanja; `Escape` može zatvoriti panel ali se ne oslanjati samo na njega za kontrolu zvuka.

Vizuelni analyser koristi stvarno generisani signal dok studija svira. Idle pokret ne prikazivati kao lažnu reprodukciju. Na skrivanje taba pauzirati/zaustaviti studiju i ažurirati kontrolu; na povratku ne nastavljati automatski zvuk.

## 6. Tehnička arhitektura

### Izbor stacka

Nova lokalna v1: Vite + React + TypeScript + Three.js + React Three Fiber + običan CSS. To je statičan frontend sa browser-local funkcijama. Nisu potrebni Next.js, server, baza, CMS ili autentifikacija za ovaj obim.

Codex pre instalacije proverava međusobno podržane verzije React-a, React DOM-a, Fiber-a i Three.js-a. Ne prepisivati brojeve verzija iz nekog starijeg projekta. Ako projekat već ima kompatibilan drugačiji stack, prvo proceniti očuvanje postojeće postavke.

Drei je opcioni helper paket za konkretne potrebe. GSAP/ScrollTrigger uvoditi tek ako je neophodna složenija scroll koreografija; ne dodavati Framer Motion, Lenis i GSAP zajedno po navici. Native skrol ostaje osnovno ponašanje.

### Podela odgovornosti

| Predloženi modul | Odgovornost |
| --- | --- |
| `src/app/App.tsx` | Struktura stranice i granice sekcija. |
| `src/components/Header.tsx` | Navigacija i mobilni meni. |
| `src/components/ProjectBrief.tsx` | Dijalog, validacija i kopiranje briefa. |
| `src/sections/` | Hero, statement, studies, approach, studio, contact. |
| `src/scene/PhaseCanvas.tsx` | Canvas, kamera, error boundary i fallback. |
| `src/scene/PhaseSculpture.tsx` | Glavna proceduralna geometrija. |
| `src/scene/shaders/` | Shader izvori i jasno dokumentovani uniforms. |
| `src/scene/sceneController.ts` | Mapiranje skrola, pokazivača, studije i audio energije. |
| `src/audio/audioEngine.ts` | AudioContext, synth, routing, start/stop/dispose. |
| `src/audio/studies.ts` | Deklarativni parametri pojedinačnih studija. |
| `src/data/content.ts` | Tekstovi i podaci studija. |
| `src/styles/` | Tokeni, globalne postavke i stilovi sekcija. |

Ovo je predlog granica, ne zahtev za pravljenje praznih fajlova unapred. Ne stavljati ceo sajt, shader, audio engine i sve stilove u jedan ogroman fajl.

Dinamiku ažurirati kroz refs/uniforms, bez React rendera svake frame. HTML ostaje izvor teksta i interaktivnih kontrola. R3F ima vlasništvo nad render loop-om; ne kreirati paralelni nezavisni Three renderer.

### Granica code-only verzije

Dozvoljeni su source kod, npm paketi, shader stringovi, inline SVG, proceduralne teksture/bufferi generisani u memoriji i originalni synth. Nema medija, font fajlova ni modela koje treba zasebno preuzeti. Mrežni zahtevi tokom posete treba da se svode na fajlove same aplikacije.

## 7. Telefon, pristupačnost i fallback

Na 390 px širine hero prelazi u vertikalan raspored: naslov gore, skulptura u donjem/srednjem delu; kontrola zvuka i CTA ostaju dohvatljivi. Ne praviti umanjenu desktop scenu sa sitnim tekstom. Studies postaju vertikalni redovi. Navigacija i dijalog moraju stati i na 320 px.

Koristiti stvarni raspoloživi prostor (`svh` / razumna minimalna visina), uz proveru browser chrome-a. Ne praviti više ogromnih praznih ekrana da bi izgled delovao filmski. CTA ne sme biti odsečen na kraćem telefonu.

Sve kontrole su native button/link elementi sa vidljivim fokusom. Targeti za dodir približno 44×44 px. Paneli i brief dijalog imaju naslov, pravilno upravljanje fokusom i vraćanje fokusa na dugme koje ih je otvorilo.

`prefers-reduced-motion` poštovati od prvog rendera. Dodatna kontrola Motion on/off omogućava zaustavljanje ambijentalnog kretanja. U reduced režimu bez automatskog spina, pulsiranja, parallax-a i sticky scroll efekata. Smisao sadržaja ostaje isti.

Ako WebGL ne postoji ili scena padne: autorski inline SVG prikaz petlje ili jednostavan CSS/SVG talas, zadržani naslovi i iste audio kontrole. Nema belog ekrana i beskonačnog loadera. Canvas je `aria-hidden` kada je čisto dekorativan; semantički opis studije pripada HTML-u.

## 8. Budžeti i provere

Ovo su početni projektni ciljevi koje treba izmeriti, ne rezultati koji su već postignuti.

| Oblast | Početni cilj |
| --- | --- |
| Mreža | 0 zahteva za slike, video, modele, audio ili udaljene fontove. |
| Desktop scena | Jedan glavni mesh, nekoliko kontrolisanih pomoćnih objekata; početi sa oko 4–8 hiljada pomoćnih tačaka samo ako su vidljivo potrebne. |
| Mobile scena | Manje segmenata, oko 0.5–1.5 hiljada pomoćnih tačaka ili bez njih; bez skupih višestrukih pass-ova. |
| Pixel ratio | Početno ograničenje 1.5 desktop i 1.0–1.25 mobile; prilagoditi prema merenju i jasnoći. |
| Fluidnost | Težiti stabilnom kretanju oko 60 fps na odabranom desktopu i prihvatljivom ritmu na realnom telefonu. Navesti uređaj i uslove. |
| Prvi prikaz | HTML tekst i osnovni izgled se pojavljuju pre spremnosti zahtevne scene. |
| Raspored | Bez horizontalnog skrola i vidljivog skakanja rasporeda. |

Kontrolni viewport-i: 1440×900, 1280×720, 768×1024, 390×844 i 320×568. Ne zaključivati o stvarnom telefonu isključivo iz desktop resize-a.

Obavezno: production build i typecheck; console bez neobjašnjenih grešaka; keyboard prolaz; zvuk podrazumevano isključen; jedna aktivna studija; stop i završetak reprodukcije; reduced motion; WebGL fallback; mobilni meni; dijalog i kopiranje; povratak iz background taba.

Pisati smislene testove za promenu audio stanja, zaustavljanje prethodne studije, matematičko ograničavanje parametara i generisanje briefa. Vizuelni kvalitet proveravati stvarnim screenshotovima i pregledom u pokretu. Ne trošiti testove na trivijalno preslikavanje CSS klasa ili implementacije.

## 9. Faze implementacije

### Faza 1 — osnova i statičan art direction

- [x] Pregledan lokalni folder; sačuvani dokumenti i veštine.
- [x] Postavljen kompatibilan projekat, typecheck i build.
- [x] Definisani tokeni, tipografija, header i semantička struktura.
- [x] Hero statički dobro izgleda na desktopu i telefonu.

Dokaz: dva stvarna prikaza hero-a. Ako kompozicija nije dobra bez animacije, ispraviti je pre dodavanja efekata.

Implementacija 28.10.2026: Vite 8.3.5, React/DOM 19.3.1, R3F 9.8.2, Three 0.186.1, TypeScript 7.0.2. Peer zavisnosti proverene pre instalacije; lockfile sačuvan. Prošli typecheck, production build i 6 testova. Statični prikazi: `artifacts/qa/desktop-static.png` i `artifacts/qa/mobile-static.png`. Širine 1440, 1280, 768, 390 i 320 px bez horizontalnog skrola. Detalji i ograničenja: `QA.md`.

### Faza 2 — PHASE Loop

- [x] Autorska proceduralna forma i materijal bez eksternih asseta.
- [x] Idle, pointer i ograničen hero scroll.
- [x] Motion off, reduced motion i fallback.
- [x] Shader deformacija sa korigovanim normalama i tangentama; kontrolisan satenski refleks.
- [x] Jedan kontroler za targete, vreme, quaternion settling, poziciju i uniforms.
- [x] Prvo merenje desktop GPU-a i mobilnog viewport-a u dostupnom okruženju.
- [x] Proverena stabilnost resursa kroz 10 promena kvaliteta/širine.
- [ ] Merenje i vizuelna potvrda na fizičkom telefonu.

Dokaz: čitljiva silueta i naslov, vidljiva reakcija na pokazivač, stabilan telefon. Ne prihvatiti default torus kao završni vizual.

Dorada 28.10.2026: spljošteni, zaobljeni preseci uvijene neplanarne petlje;
uklonjeno sitno geometrijsko rebranje. Satenski MeshPhysicalMaterial koristi
blagu anisotropiju 0.22, glatke tangente, proceduralnu hrapavost i uske studijske
svetlosne trake. Osvetljenje se jednom hvata u PMREM 256, bez HDRI fajla.
Naslov, paleta i raspored su sačuvani. Čestice, bloom i dodatni pass-ovi nisu dodati.

Kontroler ograničava zbir nagiba na oko 7°, sve idle kanale na ciklus od 18 s,
shader spread na ±0.009 i twist na ±0.018. Mali canvas dobija 55% idle/deformacije
i manji pointer/scroll opseg. Motion off i reduced motion odmah daju neutralnu
pozu; offscreen i skriven dokument ne napreduju u vremenu i ne održavaju loop.

Prošli typecheck, production build, 17 testova i ponovljiv browser fixture
`qa/scene-checks.js`. Pet planiranih viewport-a nema horizontalni skrol. Provereni
shader compile fallback na običan metalni materijal, nedostupan WebGL, gubitak
konteksta i touch scroll preko Canvas-a. Resursi posle 10 desktop/mobile ciklusa:
1 geometrija, 2 interne teksture, 1 program. Statični dokazi su
`artifacts/qa/phase2-desktop-static.png` i `artifacts/qa/phase2-mobile-static.png`.

Chrome 155 / Windows / Intel UHD 620 / ANGLE D3D11 / DPR 1: 120 RAF intervala,
desktop p95 17.1 ms; 120 validnih GPU draw uzoraka p95 3.76 ms. Viewport 390×844
na istom desktopu: RAF p95 16.8 ms, GPU draw p95 2.10 ms. Jedan draw call,
23,296 / 11,520 trouglova. To nisu merenja fizičkog telefona niti cele GPU frame.
Poređenje, uslovi, tradeoff i ograničenja su u `QA.md`.

Preostaje fizički telefon / Safari / Android, stvarni background-tab lifecycle
(alat nije promenio document.hidden pri otvaranju drugog taba) i duži termalni
profil. Lazy 3D chunk je oko 922 kB / 246 kB gzip i build i dalje prijavljuje
veličinu. Three/Fiber Clock deprecation ostaje poznato upozorenje. Sledeća
funkcionalna faza je izbor i različiti proceduralni motivi studija.

### Faza 3 — studije i tok stranice

- [x] FORM, ECHO i AFTERIMAGE imaju različite proceduralne motive.
- [x] Izbor i paneli rade bez audio aktivacije.
- [x] Statement, approach i studio sadržaj su završeni.
- [x] Sekcije imaju jasan ritam i funkcionalne anchor linkove.
- [x] Mobilni meni, početni/povratni fokus i Tab/Shift+Tab kruženje provereni.
- [x] Provereni 390 px i 320 px, uključujući sva tri panela i touch emulaciju.

Dokaz: kompletna stranica korisna sa isključenim zvukom.

Implementacija 28.10.2026: FORM je široka dominantna kompozicija sa koncentričnim
metalnim površinama; ECHO prati precizne tačke i putanje; AFTERIMAGE je talasasta
površina sa izduženim tragovima. Studije su parametarski inline SVG, uz postojeći
jedan Three/Fiber renderer za hero. Nema novih medija, zavisnosti ili WebGL konteksta.

Izbor koristi stabilne study ID-jeve. Native dijalog ima tri pristupačna taba,
koncept i opis svakog motiva, vizuelni Replay motion i zajednički Motion toggle.
ArrowLeft/Right, Home/End, Tab/Shift+Tab i Escape rade; zatvaranje vraća fokus na
originalni opener. Play/Stop zvuka ostaje faza 4. AudioContext guard je tokom
browser testa ostao na nuli. Paneli i motivi rade i kada WebGL nije dostupan.

Approach koristi jednu formu sa smirivanjem između Listen, Shape i Refine stanja;
na telefonu su sva tri koraka i njihove pojednostavljene forme u običnom toku.
Mobilni meni otvara prvi link; anchor linkovi menjaju hash i fokusiraju sekciju.
Sadržaj ostaje engleski i jasno označen kao konceptualan, bez klijenata ili nagrada.

Prošli production build/typecheck, 28 unit testova i `qa/studies-checks.js`:
sva tri panela na 1440, 768, 390 i 320 px, tabovi/fokus, reduced motion, završetak
sekvence, replay, pozadinsko pauziranje i WebGL fallback. Prošao je i prethodni
`qa/scene-checks.js`. Glavni dokazi: `artifacts/qa/phase3-work-1440.png`,
`phase3-work-390.png`, `phase3-work-320.png`, `phase3-panel-320.png`.

Uklonjeni su 320 px horizontalni preliv tabova i mobilna padding kolizija.
Touch panel se skroluje unutar dijaloga, Close ostaje dostupan, pozadinska stranica
miruje. Replay na telefonu vraća vizual u vidljivo polje. SVG update raspoređivač
se deli između vidljivih motiva; pozadina se pauzira dok je panel otvoren, a
panel sekvence se završavaju i oslobađaju aktivnu pretplatu. Ostaju fizički
telefon, screen reader i Safari/Android provera. Rezultati i ograničenja: `QA.md`.

### Faza 4 — zvuk i povezivanje

- [x] Jedan audio engine; originalni kratki synth primeri.
- [x] Play/stop, volume, kraj studije i zamena aktivne studije.
- [x] Stvarno audio-reaktivno mapiranje sa ograničenim intenzitetom.
- [x] Background ponašanje i čišćenje resursa.

Dokaz: implementirani PHASE 4 s, FORM 8 s, ECHO 9 s i AFTERIMAGE 12 s, bez fajlova,
mikrofona i autoplay-a. Jedan kontekst nastaje na eksplicitni klik; zamena studije
čeka fade/dispose prethodne. Stvarni post-volume analyser vodi ograničene vizuale;
idle ima nultu audio energiju. Motion off/reduced motion ostavlja stabilnu formu.

Prošli typecheck, production build i 43 unit testa, pet novih audio browser fixture-a
i ponovljene scene/studies regresije. Sačekani prirodni krajevi sva četiri score-a.
Pravi OfflineAudioContext proverava sample-ove i fade/tail; ništa nije snimljeno u
medijske fajlove. Posle 15 ciklusa jedan kontekst, najviše jedna voice, četiri
zajednička čvora u mirovanju. Kontrole pregledane na 1440, 390 i 320 px.

Hidden/return, interrupted i BFCache event putevi su provereni simulacijom; fizički
OS lifecycle, iOS Safari/Android, screen reader i slušanje na stvarnom izlazu još
nisu provereni. To ostaje konkretan QA zadatak za fazu 5, zajedno sa velikim lazy
3D chunk-om. Merenja, dokazi i granice: `QA.md`, `qa/audio-*.js`.

### Faza 5 — završetak iskustva

Projektni brief ima zasebne unos/result prikaze, obavezna polja sa povezanim greškama, fokus na rezultat, povratak na sačuvane detalje i stalno dostupne Close/Generate/Copy kontrole. Native clipboard write/read je proverio stvarni tekst, a odbijena dozvola i odsutan API selektuju ceo brief za ručni copy. Nema slanja, backend-a ili lažne poruke o uspešnom slanju.

- [x] Projektni brief, generisanje i kopiranje rade.
- [x] Footer i concept credit; nema izmišljenih kontakata.
- [x] Finalna tipografska i responsive korekcija.
- [x] Izvršene provere i zapisani rezultati i ograničenja.

Dokaz: prošli typecheck, production build i 45 unit testova. Novi production
fixture-i: `qa/phase5-checks.js`, `qa/phase5-access-checks.js` i
`qa/phase5-performance-checks.js`. Ponovljeni scene/studies/audio-state fixture-i
i prirodni krajevi sva četiri score-a. Pregledani 1440×900, 1280×720, 768×1024,
390×844, 320×568 i reflow 640×360, plus Chrome touch emulacija 390 px / DPR3.

Sačuvani originalni karakter, sistemski fontovi i srebrna forma. Sitne oznake su
najmanje 12 px; footer ima prave anchor linkove, mobilni meni otvara i brief;
kratki desktop hero zadržava CTA u prvom ekranu. Fiksni audio player ne prekriva
proverene fokusirane kontrole. Zajednički activity observer pauzira WebGL i
pozadinske SVG motive iza modala; modalni motiv može da radi.

Merenja i ograničenja su u `QA.md`. GPU draw p50 ~3.68 ms desktop / 1.79 ms u
mobilnoj emulaciji na Intel UHD 620; ukupni RAF p95 ~24.7 / 26.1 ms. Startup long
tasks i veliki lazy Three chunk ostaju otvoreni, cilj 60 fps nije potvrđen.
Fizički telefoni, Safari/Android, pravi OS background/BFCache, screen reader i
slušanje na stvarnom izlazu nisu zamenjeni desktop emulacijom. Lokalna verzija je
spremna za korisnikov pregled; nije objavljena, commitovana niti pushovana.

### Lokalna revizija posle faze 5 — 29.10.2026.

- [x] Sound off vraća fokus umesto prelaska na BODY i početak tab redosleda.
- [x] Native i Arial display fallback ne stvaraju horizontalni scroll na 320 px.
- [x] Oznaka motiva odgovara stvarnom playback/motion stanju.
- [x] Pending audio poruke imaju ispravan Unicode tekst; regresije su dodate.

Dokaz: `REVIEW.md`, `qa/review-checks.js`, 46 unit testova i ponovljene relevantne
production browser provere. Pregledane su stvarne slike 1440/390/320 px i
prikazi sa zamenskim fontom. Sačuvani su smer, sadržaj i postojeći proceduralni
vizuali. Startup long tasks, veliki 3D chunk i neprovereni fizički uređaji ostaju
jasno navedena ograničenja; ne tvrdi se stabilnih 60 fps ili WCAG certifikacija.

## 10. Završni kriterijumi

PHASE je uspešan kada se pamti kao jedinstven studio za zvuk, glavni vizual ima autorsku formu, tri studije pružaju stvarnu interakciju, a ceo sajt ostaje čitljiv i upotrebljiv na telefonu i bez audio/WebGL podrške.

Ne završavati na lepom hero-u sa nedovršenim ostatkom stranice. Ne prikrivati loše materijale prejakim bloom-om. Ne proglašavati procedurally generated demo zvuk završenim klijentskim radom. Ne tvrditi da su QA i performanse potvrđeni ako nisu zaista provereni.



