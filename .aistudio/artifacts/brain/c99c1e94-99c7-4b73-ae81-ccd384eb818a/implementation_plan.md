# AVG/GDPR Compliance, Juridische Voorwaarden & Blokkerende Toestemmingsmodal (Consent Gate)

Dit implementatieplan beschrijft de realisatie van een allesomvattende juridische en beveiligingsstructuur voor GeoTrainer, conform de Europese Algemene Verordening Gegevensbescherming (AVG/GDPR), ePrivacy-richtlijn en wetgeving inzake consumenten- en auteursrechten. Kernonderdeel is een **blokkerende toestemmingsmodal (Consent Gate)**: er mag geen data, voortgang of cookie/opslag worden geregistreerd totdat de bezoeker akkoord is gegaan. Na acceptatie blijven de voorwaarden en gegevensrechten (inzage, export, verwijdering) altijd toegankelijk via het Instellingenmenu.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> De volgende besluiten zijn interactief afgestemd op basis van de antwoorden van de gebruiker:

- **Blokkerende Toestemmingsmodal**: Een niet-wegklikbare, schermvullende modal (backdrop blur + pointer event blocker) die direct bij het eerste bezoek verschijnt. Zonder acceptatie kan de website niet worden gebruikt en worden er géén gegevens geregistreerd in `localStorage`, cookies of databases.
- **Raadpleging uitsluitend via Instellingen**: Na de initiële acceptatie zijn de volledige gebruiksvoorwaarden, privacyverklaring, auteursrechtlicenties en cookie-instellingen uitsluitend raadpleegbaar via een speciale juridische sectie in het **Instellingenmenu** (`Settings.tsx`), waardoor de overige pagina's strak en afleidingsvrij blijven.
- **Gelijke Voorwaarden voor Alle Leeftijden**: De applicatie is bestemd voor alle leeftijden (scholieren, studenten, volwassenen). Er geldt één uniforme, kindvriendelijke en transparante standaard: minimale dataverzameling, strikt educatief doel, geen commerciële tracking of advertenties, en respect voor de rechten van elke gebruiker.
- **GDPR Gegevensbeheer (Inzage, Export & Recht op Vergetelheid)**: Ingebouwde functies waarmee elke gebruiker met één klik al zijn opgeslagen data (scores, sessies, leermapjes) kan exporteren als gestructureerde JSON en permanent kan verwijderen conform artikel 15 en 17 AVG.

---

## 1. Overview & Core Concept

- **Doel**: GeoTrainer juridisch 100% waterdicht maken tegen AVG/GDPR-boetes, claims over auteursrecht en onrechtmatige gegevensverwerking, terwijl de gebruikerservaring educatief en laagdrempelig blijft.
- **Wat het doet**:
  1. **Consent Gate & Zero-Data Beleid**: Controleert bij het laden of `geo_legal_consent` is geaccepteerd. Zo niet, blokkeert de modal alle quiz- en studie-interacties en wordt registratie van voortgang gepauzeerd.
  2. **Gestructureerde Juridische Tekst**: Heldere, overzichtelijke indeling in 5 kernpijlers:
     - **Privacy (AVG)**: Welke minimale data wordt verwerkt (enkel leervoortgang/scores), doel (spaced repetition en educatie), rechtsgrond (toestemming / gerechtvaardigd belang), bewaartermijnen en geen verkoop of doorgifte buiten de EU.
     - **Cookies & Opslag**: Uitsluitend strikt functionele `localStorage` voor thema, taal en leervoortgang; géén tracking cookies of marketing pixels.
     - **Gebruiksvoorwaarden & Aansprakelijkheid**: Educatief hulpmiddel, uitsluiting van aansprakelijkheid voor toetsresultaten, regels voor eigen leermateriaal.
     - **Auteursrechten & Bronvermeldingen**: Respect voor licenties (OpenStreetMap ODbL, Natural Earth Public Domain, Wikimedia Commons vlaggen onder CC BY-SA, MIT libraries). Neutraliteitsdisclaimer m.b.t. grenzen en topografische aanduidingen.
     - **Meldprocedure (Notice & Takedown)**: Duidelijk contactadres voor datalekken of auteursrechtklachten met respons binnen 72 uur.
  3. **Rechten van de Betrokkene in Instellingen**:
     - *Inzage & Export*: Download een compleet GDPR-rapport als JSON (`mijn-geotrainer-data.json`).
     - *Verwijdering (Recht op vergetelheid)*: Volledig wissen van browseropslag en Firestore cloudvoortgang.
     - *Status Toestemming*: Inzien wanneer akkoord is gegeven, met de optie om toestemming in te trekken (heropent de modal).
  4. **Beveiligingsharding**:
     - Veiligheid tegen CSV-injectie bij databackups (ontmantelen van formules die beginnen met `=`, `+`, `-`, `@`).
     - Strikte XSS-escaping van door gebruikers ingevoerde leermapjes en itemnamen.
     - Security headers en rate-limiting op de Express server.

---

## 2. User Experience & Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Consent Gate Modal                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ [ShieldCheck] Welkom bij GeoTrainer - Voorwaarden & Privacy   │   │
│   │                                                                │   │
│   │ Transparantie over jouw gegevens, privacy en leermateriaal     │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ [Tabs / Accordeon]:                                            │   │
│   │  1. Privacyverklaring & Gegevensbescherming (AVG/GDPR)        │   │
│   │  2. Cookies & Lokale Browseropslag                             │   │
│   │  3. Gebruiksvoorwaarden & Aansprakelijkheid                    │   │
│   │  4. Auteursrechten, Kaartlicenties & Bronvermelding            │   │
│   │  5. Jouw Rechten (Inzage, Verwijdering & Contact)             │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ [x] Ik begrijp de voorwaarden en ga akkoord met het gebruik    │   │
│   │                                                                │   │
│   │               [ Akkoord en doorgaan naar GeoTrainer ]         │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Aesthetic Direction**: Schoon, betrouwbaar en professioneel ontwerp met duidelijke typografie en contrasterende koppen.
- **Vormgeving Toestemmingsmodal**:
  - Backdrop blur (`bg-slate-950/80 backdrop-blur-md`) die interactie met de onderliggende app volledig vergrendelt (`pointer-events-auto` op de modal, `overflow-hidden` op de body).
  - Gestructureerde blokken met duidelijke iconen (`Shield`, `Cookie`, `FileText`, `Globe`, `Lock`).
  - Duidelijke interactieve samenvatting met scrollbare tekstpanelen.
  - Verplichte acceptatieknop die pas actief wordt wanneer het toestemmingsvinkje is geplaatst.
- **Juridisch Paneel in Instellingen (`Settings.tsx`)**:
  - Een speciale sectie "Privacy, Gegevens & Juridisch" met:
    - Bekijk volledige voorwaarden & privacyverklaring.
    - Export van alle persoonsgegevens (JSON).
    - Definitief wissen van alle gegevens (met bevestiging).
    - Intrekken van toestemming (herinitialiseert de consent gate).

---

## 3. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│  State: hasAcceptedLegalConsent (gesynchroniseerd met localStorage)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
            ▼ (Indien false)                                ▼ (Indien true)
┌───────────────────────────────┐               ┌───────────────────────┐
│     LegalConsentModal.tsx     │               │   Normale Applicatie  │
│ - Blokkeert alle interactie   │               │ - Home / Dashboard    │
│ - Toont 5 gestructureerde tabs│               │ - Mijn Leerstof       │
│ - Schrijft bij akkoord:       │               │ - Instellingen (met   │
│   geo_legal_consent: {        │               │   privacy- & export-  │
│     accepted: true,           │               │   tools)              │
│     timestamp: ISOString,     │               │ - Admin Dashboard     │
│     version: '1.0'            │               └───────────────────────┘
│   }                           │
└───────────────────────────────┘
```

### Wijzigingen per module:
1. **`src/components/legal/LegalConsentModal.tsx` (Nieuw)**:
   - Blokkerende schermvullende modal met de complete gestructureerde voorwaarden en privacyverklaring.
   - Tabbladen of inklapbare secties voor AVG, Cookies, Voorwaarden, Auteursrechten en Rechten van de betrokkene.
   - Callback `onAccept` die de timestamp en versie opslaat in `localStorage`.
2. **`src/components/legal/LegalDocumentViewer.tsx` (Nieuw)**:
   - Herbruikbare component voor het gestructureerd tonen van de volledige juridische documenten in zowel de pop-up als het instellingenmenu.
3. **`src/components/layout/Settings.tsx`**:
   - Uitbreiding met een sectie "Privacy, Voorwaarden & Gegevensbeheer".
   - Knoppen voor "Download mijn data (JSON)", "Lees juridische voorwaarden", en "Wis al mijn gegevens".
4. **`src/App.tsx`**:
   - Controle op `localStorage.getItem('geo_legal_consent')`.
   - Zolang niet geaccepteerd: rendert `LegalConsentModal` als exclusieve blokkerende view en pauzeert elke achtergrond-datasynchronisatie.
5. **`server.ts` & beveiligingsharding**:
   - Beveiligingsheaders controleren (CSP, X-Content-Type-Options, Referrer-Policy).
   - Sanitization tegen CSV-injectie in exportfuncties.

---

## 4. Stappenplan voor Implementatie

1. **Stap 1: Aanmaken van `src/components/legal/LegalDocuments.ts`**
   - Vaste, juridisch onderbouwde teksten voor Privacyverklaring (AVG), Cookiebeleid, Gebruiksvoorwaarden, Auteursrechten & Licenties, en Datalek/Notice-and-Takedown procedures.
2. **Stap 2: Bouwen van `LegalConsentModal.tsx`**
   - Schermvullende modal met gestructureerde secties, checkboxes en een acceptatieknop.
3. **Stap 3: Koppeling in `App.tsx` (Consent Gate)**
   - Waarborgen dat géén quiz-, score- of persoonlijke data wordt geregistreerd voorafgaand aan acceptatie.
4. **Stap 4: Integratie in `Settings.tsx`**
   - Juridische sectie toevoegen met inzage, export en wisfuncties conform AVG/GDPR.
5. **Stap 5: Beveiligings- & CSV-injectie harding**
   - Sanitize alle data-exports en items tegen XSS- en CSV-injecties.
6. **Stap 6: Validatie & Verificatie**
   - Controleer via `lint_applet` en `compile_applet`.
