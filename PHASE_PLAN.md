# PHASE — creative direction and implementation plan

Status: faza 1 završena; PHASE Loop faze 2 dorađen kroz formu, satenski materijal, shader i zajednički kontroler. Desktop i mobilna emulacija provereni; fizički telefon preostaje. Audio engine nije dodat. Datum: 28. oktobar 2026.

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

### PHASE Loop

Početna forma je skulpturalna toroidalna petlja. Nije običan rotirajući `TorusKnot` sa podrazumevanim materijalom. Model mora imati jasnu siluetu, šupljinu, promenljivu debljinu i kontrolisanu asimetriju.

Prvo izraditi uspešnu statičnu formu. Zatim dodati vertex deformaciju pomoću nekoliko sinusnih harmonika ili ograničenog noise-a. Materijal treba da čita kao brušeni/satinirani hrom sa tamnim poljima i uskim srebrnim refleksima. Proceduralno osvetljenje i refleksioni kontekst napraviti kodom, bez HDR fajla. Sjaj ne sme postati bela plastična masa.

V1 ima jedan glavni mesh i diskretnu pomoćnu linijsku/particle strukturu. Gusta atmosfera, više refleksionih prolaza i postprocessing nisu početni uslov.

### Stanja

| Stanje | Ponašanje |
| --- | --- |
| Idle | Spora rotacija i mala promena debljine. Srednji ciklus pokreta oko 14–22 s, bez agresivnog pulsiranja. |
| Pointer | Blag tilt, približno do 6–8 stepeni, sa smirivanjem nakon izlaska. Nikakav nasilni orbit preko cele scene. |
| Hero scroll | Kontrolisano udaljavanje i pomeranje koje otvara sledeću sekciju; tekst ostaje čitljiv. |
| Study selected | Forma ili lokalni motiv prelaze na karakter studije i kada je zvuk isključen. |
| Playing | Niska, srednja i visoka frekvencijska energija utiču na jasno razdvojene parametre. |
| Motion off / reduced motion | Stabilna kompozicija; promene studije bez automatskog spina i drifta. |
| Offscreen / background tab | Zaustavlja se nepotrebno renderovanje. Audio dobija zasebno, jasno definisano ponašanje. |

Koristiti jednu centralnu mapu parametara. Shader ne treba da istovremeno dobija nekontrolisane vrednosti iz scroll eventa, pointer eventa i audio callbacka. Svaki izvor postavlja target, a frame kontroler ograničava i izglađuje izlaz.

Audio mapiranje kao početni art-direction predlog: bass → mala promena amplitude/debljine; mid → blag twist; high → svetlina uskog refleksa ili retkih tačaka. Ograničiti sve opsege tako da tekst i silueta ne postanu nestabilni.

### DOM animacije

Na učitavanju jedna kratka sekvenca naslova i scene, približno ukupno 0.8–1.2 s, bez čekanja na audio. Tranzicije UI-a oko 150–250 ms; promena studije oko 450–700 ms. To su početne vrednosti za vizuelno doterivanje, ne garancije.

Ne animirati svaku rečenicu, ne pomerati sve sekcije na isti fade-up način i ne stavljati elastic overshoot na svaki element. Kontrole treba da odgovore odmah, a velika forma može mirnije da se transformiše.

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

Već postoji semantički tekstualni tok svih sekcija i funkcionalni anchor linkovi. Različiti motivi studija, izbor, paneli i njihovo kretanje još nisu implementirani.

- [ ] FORM, ECHO i AFTERIMAGE imaju različite proceduralne motive.
- [ ] Izbor i paneli rade bez audio aktivacije.
- [ ] Statement, approach i studio sadržaj su završeni.
- [ ] Sekcije imaju jasan ritam i funkcionalne anchor linkove.

Dokaz: kompletna stranica korisna sa isključenim zvukom.

### Faza 4 — zvuk i povezivanje

- [ ] Jedan audio engine; originalni kratki synth primeri.
- [ ] Play/stop, volume, kraj studije i zamena aktivne studije.
- [ ] Stvarno audio-reaktivno mapiranje sa ograničenim intenzitetom.
- [ ] Background ponašanje i čišćenje resursa.

Dokaz: svaka studija ima različit karakter; nema automatskog zvuka, preklapanja i naglih skokova glasnoće.

### Faza 5 — završetak iskustva

Osnovni brief dijalog urađen ranije da header CTA ima stvarnu lokalnu radnju. Provereni native modal, Escape/fokus, validacija, kopiranje i ručna selekcija kada clipboard nije dostupan. To ne znači da je završni polish ili QA celog planiranog proizvoda završen.

- [x] Projektni brief, generisanje i kopiranje rade.
- [x] Footer i concept credit; nema izmišljenih kontakata.
- [ ] Finalna tipografska i responsive korekcija.
- [ ] Izvršene provere i zapisani rezultati i ograničenja.

Dokaz: lokalna production verzija spremna za korisnikov pregled. Bez objave i udaljenih Git operacija.

## 10. Završni kriterijumi

PHASE je uspešan kada se pamti kao jedinstven studio za zvuk, glavni vizual ima autorsku formu, tri studije pružaju stvarnu interakciju, a ceo sajt ostaje čitljiv i upotrebljiv na telefonu i bez audio/WebGL podrške.

Ne završavati na lepom hero-u sa nedovršenim ostatkom stranice. Ne prikrivati loše materijale prejakim bloom-om. Ne proglašavati procedurally generated demo zvuk završenim klijentskim radom. Ne tvrditi da su QA i performanse potvrđeni ako nisu zaista provereni.
