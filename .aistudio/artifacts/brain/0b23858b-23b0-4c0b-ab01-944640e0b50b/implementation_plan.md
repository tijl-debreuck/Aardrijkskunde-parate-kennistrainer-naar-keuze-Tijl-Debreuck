# Account-gebonden Leermapjes & Authenticatie Gate voor "Mijn Leerstof"

Zorg ervoor dat het aanmaken, inzien en oefenen van persoonlijke studiemapjes strikt voorbehouden is aan ingelogde gebruikers, terwijl gastgebruikers onbeperkt alle standaardoefeningen via het Dashboard kunnen blijven maken. Opgeslagen mappen worden per individueel account geïsoleerd en bewaard via de database-adapter.

## Gebruikerskeuzes & Bevestigde Beslissingen

> [!IMPORTANT]
> Conform de verduidelijkende vragen:
> - **Informatief slotscherm voor gasten**: Wie niet is ingelogd en naar "Mijn Leerstof" navigeert, krijgt een duidelijk en motiverend slotscherm te zien met een directe knop om in te loggen of een account aan te maken.
> - **Open Dashboard voor iedereen**: Niet-ingelogde gasten behouden volledige toegang tot alle standaardoefeningen op het Dashboard (België, Europa, Wereld, provincies, hoofdsteden, vlaggen, rivieren, bergen).
> - **Automatische voorbeeldmappen voor nieuwe accounts**: Zodra een gebruiker voor de eerste keer inlogt of registreert, worden automatisch de standaard leermapjes (*Belgische Gewesten* en *Belgische Provincies*) klaargezet als startpunt.
> - **Strikte account-isolatie**: Bij uitloggen worden alle mappen direct uit de actieve weergave gewist. Pas wanneer dezelfde gebruiker weer inlogt, worden diens persoonlijke mappen opnieuw ingeladen via de database-adapter (`geo_folders_${userId}`).

---

## 1. Overzicht & Doelstelling

### Wat het doet
- **Toegangscontrole op "Mijn Leerstof"**: Bezoekers die niet zijn ingelogd kunnen geen persoonlijke mappen aanmaken of aanpassen. Zij zien een uitnodigend slotscherm met uitleg over de voordelen van een account en een knop die direct het inlogmenu opent.
- **Accountgebonden dataopslag**: Studiemapjes worden niet langer als één algemene browserlijst opgeslagen, maar strikt gekoppeld aan het unieke account-ID (`user.uid`).
- **Voorbereid op externe database**: De methoden in `src/lib/dbAdapter.ts` worden uitgebreid met duidelijke, typed functies (`getUserStudyFolders`, `saveUserStudyFolders`) die nu werken via veilige lokale opslag en later 1-op-1 kunnen worden overgezet naar een SQL-tabel (`user_id`, `folder_id`, `name`, `items`) of document-collectie.

---

## 2. Gebruikerservaring & Visuele Weergave

### A. Niet-ingelogde Gebruiker (Gast)
1. **Navigatie**: De gebruiker kan gewoon door de hele website navigeren en alle quizzen in het Dashboard spelen.
2. **Tabblad "Mijn Leerstof"**:
   - Toont een fraai ontworpen slotscherm (Lock icon, duidelijke titel: *Persoonlijke Leermapjes zijn gekoppeld aan je account*).
   - Drie voordelen in opsomming: *Eigen leermateriaal samenstellen*, *Automatisch bewaard over sessies heen*, *Geheugensteuntje per onderwerp*.
   - Primaire actieknop: **"Inloggen of Account Aanmaken"** die direct het Login-venster triggert.

### B. Ingelogde Gebruiker
1. **Eerste Login**: Ontvangt direct de 2 standaard voorbeeldmappen en kan onmiddellijk eigen mappen aanmaken, bewerken of verwijderen.
2. **Sessiebehoud**: Alle toevoegingen of wijzigingen worden direct opgeslagen onder het account van de gebruiker.
3. **Bij Uitloggen**: De actieve mappenlijst in de applicatie-state wordt direct geleegd naar `[]`.
4. **Bij Opnieuw Inloggen**: Het account haalt exact zijn eigen mappen weer op uit de opslag.

---

## 3. Technische Architectuur & Data Strategie

```
┌─────────────────────────────────────────────────────────────┐
│                       GeoTrainer App                        │
│               (Beheert actieve 'user' state)                │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│      Dashboard & Quizzen     │ │      Mijn Leerstof View     │
│   (Vrij toegankelijk voor    │ │  (Als user == null: toon    │
│     gasten en leden)         │ │   slotscherm met login knop;│
└──────────────────────────────┘ │   als user != null: toon    │
                                 │   account-gebonden mappen)  │
                                 └─────────────┬───────────────┘
                                               │
                                               ▼
                                 ┌─────────────────────────────┐
                                 │    src/lib/dbAdapter.ts     │
                                 │  getUserStudyFolders(uid)   │
                                 │  saveUserStudyFolders(uid)  │
                                 └─────────────┬───────────────┘
                                               │
                                               ▼
                                 ┌─────────────────────────────┐
                                 │ Opslag (Database Blueprint) │
                                 │  Sleutel: geo_user_folders_ │
                                 │  met userId isolatie        │
                                 └─────────────────────────────┘
```

### Wijzigingen per module:
1. **`src/lib/dbAdapter.ts`**:
   - Toevoegen van `getUserStudyFolders(userId: string): Promise<StudyFolder[]>`
   - Toevoegen van `saveUserStudyFolders(userId: string, folders: StudyFolder[]): Promise<void>`
   - Bevat automatische initiatie met de 2 voorbeeldmappen indien een account nog geen opgeslagen mappen heeft.
2. **`src/components/study/MyLearningPage.tsx`**:
   - Ontvangt `user: User | null` en een callback `onOpenLogin: () => void`.
   - Indien `!user`: rendert een modern slotscherm met login-knop.
   - Indien `user`: laadt en muteert uitsluitend de mappen van deze specifieke gebruiker via de adapter.
3. **`src/App.tsx`**:
   - Geeft `user` door aan `MyLearningPage`.
   - Zorgt dat bij wisselen van `user` (inloggen/uitloggen) de mappen dynamisch herladen of gewist worden.
