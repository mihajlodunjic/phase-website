# Izvori i integritet

## Skillovi

U paketu je 12 postojećih skillova iz `ATH-Organization/inl-website`, grana `front`, revizija `7ad1c652ec7690ddc80c9b6974b3947d97c313f0`.

Sadržaj svakog prenetog fajla je sačuvan bez izmena. Promenjena je samo destinacija: `.claude/skills/<ime>/` → `.agents/skills/<ime>/`. Sačuvani su uključeni README, LICENSE i reference unutar izabranih foldera. Nisu preneti kod sajta, Git metadata, environment fajlovi, pristupni podaci ili hosting konfiguracija.

Ovo je prenosivi paket za korisnikov lokalni projekat; skillovi nisu instalirani u njegov lični ChatGPT katalog i ovde nije napravljena njihova nova izvedena verzija. Originalni uslovi i autorstvo ostaju važeći.

Repo evidencija navodi:

- `frontend-design`: `anthropics/skills`, putanja `skills/frontend-design/SKILL.md`.
- `awwwards-motion`: `adamperlis/awwwards-motion`, putanja `SKILL.md`.
- Izabrani `threejs-*`: `cesartevisual/threejs-skills`, putanje `skills/<ime>/SKILL.md`.

Paket koristi kopije iz tačno navedene INLUNE revizije, ne obećava da je jednak budućim upstream verzijama. `SKILLS_MANIFEST.json` sadrži izvorni blob SHA i SHA-256 svakog prenetog fajla radi provere.

## Tehničke reference za implementaciju

- Codex skillovi, lokacije i eksplicitno pozivanje: https://learn.chatgpt.com/docs/build-skills
- Projektna pravila: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- React Three Fiber: https://r3f.docs.pmnd.rs/
- R3F performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Three.js dokumentacija: https://threejs.org/docs/
- Web Audio best practices: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- GSAP ScrollTrigger, samo ako se uvede: https://gsap.com/docs/v3/Plugins/ScrollTrigger/

Ove reference nisu verzionisani API ugovor za buduću implementaciju. Codex treba da proveri stvarno instalirane verzije i odgovarajuću dokumentaciju pre pisanja koda. Brojčani dizajnerski i performansni ciljevi u planu predstavljaju predlog za PHASE, a ne izmerene rezultate.
