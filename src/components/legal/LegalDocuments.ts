export interface LegalSection {
  id: string;
  title: string;
  icon: string;
  summary: string;
  content: string[];
}

export const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: 'privacy',
    title: '1. Privacyverklaring & Gegevensbescherming (AVG / GDPR)',
    icon: 'Shield',
    summary: 'Minimale gegevensverzameling, strikt educatief doel en volledige AVG-bescherming.',
    content: [
      'GeoTrainer verwerkt uitsluitend persoonsgegevens en leervoortgang conform de Europese Algemene Verordening Gegevensbescherming (AVG / GDPR, Verordening (EU) 2016/679).',
      'Welke gegevens worden verwerkt: Lokale oefenscores, beantwoorde quizvragen, precisiepercentages, reactietijden en zelf samengestelde studiemapjes. Er worden geen onnodige identificerende persoonsgegevens verzameld; alle leervoortgang wordt veilig en lokaal opgeslagen in de browser.',
      'Doeleinden van verwerking: De gegevens worden uitsluitend verwerkt voor educatieve doeleinden, gepersonaliseerde leertraining en de spaced repetition leercyclus.',
      'Rechtsgrond van verwerking: Toestemming van de gebruiker (Art. 6 lid 1 sub a AVG) en het gerechtvaardigd belang van het leveren van een functioneel educatief leerplatform (Art. 6 lid 1 sub f AVG).',
      'Bewaartermijn: Gegevens blijven opgeslagen in je lokale browser (en optioneel gekoppelde toekomstige database) totdat je deze zelf wist of de browseropslag leegmaakt.',
      'Ontvangers & Doorgifte buiten de EU: GeoTrainer verkoopt, verhuurt of deelt NOOIT gegevens met commerciële advertentienetwerken. Alle leervoortgang blijft lokaal binnen de browser van de gebruiker.',
      'Datalekprocedure: In het geval van een beveiligingsincident of datalek wordt dit gedocumenteerd en binnen 72 uur gemeld bij de toezichthoudende autoriteit (de Belgische Gegevensbeschermingsautoriteit / GBA of Nederlandse AP).',
      'Jonge gebruikers & scholieren: GeoTrainer is ontworpen als veilige leeromgeving voor alle leeftijden. We verzamelen geen overbodige identificerende gegevens en hanteren universeel de hoogste privacystandaarden.'
    ]
  },
  {
    id: 'cookies',
    title: '2. Cookies & Lokale Browseropslag',
    icon: 'Cookie',
    summary: 'Alleen strikt noodzakelijke lokale browseropslag; geen advertentiecookies of tracking pixels.',
    content: [
      'GeoTrainer maakt conform de ePrivacy-richtlijn uitsluitend gebruik van strikt noodzakelijke functionele browseropslag (HTML5 localStorage).',
      'Overzicht van opgeslagen sleutels:',
      '• geo_legal_consent: Onthoudt jouw acceptatie van deze juridische voorwaarden.',
      '• geo_theme: Onthoudt jouw kleurvoorkeur (donker of licht thema).',
      '• geo_language: Onthoudt jouw taalvoorkeur voor geografische namen (Nederlands of Engels).',
      '• geo_trainer_progress: Bevat de spaced repetition leerkaartstatus en foutenanalyse.',
      '• geo_study_folders: Bevat jouw zelf aangemaakte studiemapjes met geselecteerde leerelementen.',
      'Geen tracking van derden: We gebruiken geen tracking cookies van derden, geen marketing pixels en geen fingerprinting.',
      'Lokale fonts & assets: Alle lettertypen en iconen worden lokaal vanuit de applicatie gebundeld en geserveerd, zonder externe verzoeken naar servers van derden.'
    ]
  },
  {
    id: 'terms',
    title: '3. Gebruiksvoorwaarden & Aansprakelijkheid',
    icon: 'FileText',
    summary: 'Duidelijke regels voor het gebruik van het platform en uitsluiting van aansprakelijkheid.',
    content: [
      'Doel van de website: GeoTrainer is een onafhankelijk educatief trainingsprogramma bedoeld om topografische en geografische kennis te bevorderen.',
      'Aansprakelijkheid: Hoewel de geografische datasets en coördinaten met de grootst mogelijke zorgvuldigheid worden samengesteld en gevalideerd, wordt de website aangeboden op "as is" basis. GeoTrainer aanvaardt geen aansprakelijkheid voor eventuele onnauwkeurigheden, onderbrekingen of voor behaalde resultaten bij officiële schooltoetsen of examens.',
      'Regels voor eigen leermateriaal: Gebruikers kunnen eigen studiemapjes samenstellen. Het is ten strengste verboden om onrechtmatige, kwetsende, discriminerende of auteursrechtelijk beschermde gegevens in de applicatie in te voeren.',
      'Meld- en verwijderprocedure (Notice & Takedown): Indien je meent dat bepaalde inhoud inbreuk maakt op jouw rechten of intellectueel eigendom, kun je een gemotiveerde melding sturen naar privacy@geotrainer.app. Meldingen worden binnen 48 uur in behandeling genomen.'
    ]
  },
  {
    id: 'copyright',
    title: '4. Auteursrechten, Kaartdata & Open Source Licenties',
    icon: 'Globe',
    summary: 'Volledig respect voor open data licenties en intellectueel eigendom.',
    content: [
      'Kaartmateriaal: De topografische basiskaarten en vector-coördinaten maken gebruik van open geodata afkomstig van OpenStreetMap (Open Database License - ODbL, © OpenStreetMap contributors) en Natural Earth (Public Domain).',
      'Vlaggen & Media: Nationale en regionale vlagafbeeldingen zijn afkomstig uit het publieke domein of beschikbaar gesteld onder Creative Commons licenties (CC BY-SA) via Wikimedia Commons met bronvermelding.',
      'Softwarebibliotheken: De broncode van de interface is gebouwd met gerenommeerde open-source componenten onder de MIT-licentie (waaronder React, Lucide Icons, Tailwind CSS en Motion).',
      'Geopolitieke neutraliteit: De aanduiding van landsgrenzen, betwiste gebieden en hoofdsteden volgt de internationaal gangbare standaarden van de Verenigde Naties en de ISO-3166 normering, zonder politiek standpunt in te nemen.'
    ]
  },
  {
    id: 'rights',
    title: '5. Jouw Rechten als Betrokkene (Inzage, Export & Wissen)',
    icon: 'Key',
    summary: 'Directe controle over jouw gegevens: download een JSON-export of wis alles definitief.',
    content: [
      'Conform hoofdstuk III van de AVG heb je te allen tijde de volgende onvoorwaardelijke rechten:',
      '• Recht op inzage (Art. 15 AVG): Je hebt het recht om te zien welke data over jou is geregistreerd.',
      '• Recht op gegevensoverdraagbaarheid (Art. 20 AVG): Je kunt al je opgeslagen scores, leermapjes en voorkeuren direct downloaden als een gestructureerd JSON-bestand via het Instellingenmenu.',
      '• Recht op vergetelheid / gegevenswissing (Art. 17 AVG): Je kunt al je gegevens, voortgang en instellingen op elk moment permanent wissen met één druk op de knop via het Instellingenmenu.',
      '• Recht op intrekking van toestemming: Je kunt je toestemming voor deze voorwaarden op ieder moment intrekken in Instellingen, waardoor de consent gate opnieuw geactiveerd wordt.',
      'Contactadres voor privacyvragen en rechtenverzoeken: privacy@geotrainer.app.'
    ]
  }
];

export interface ConsentRecord {
  accepted: boolean;
  timestamp: string;
  version: string;
  userAgent: string;
}

export const CURRENT_LEGAL_VERSION = '1.0';

export function getStoredConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem('geo_legal_consent');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.accepted === true) {
      return parsed;
    }
    return null;
  } catch (_e) {
    return null;
  }
}

export function saveConsent(): ConsentRecord {
  const record: ConsentRecord = {
    accepted: true,
    timestamp: new Date().toISOString(),
    version: CURRENT_LEGAL_VERSION,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };
  localStorage.setItem('geo_legal_consent', JSON.stringify(record));
  return record;
}

export function revokeConsent(): void {
  localStorage.removeItem('geo_legal_consent');
}

/**
 * Builds a complete GDPR data export object for the user.
 */
export function buildUserDataExport(userEmail?: string | null): Record<string, any> {
  const statsRaw = localStorage.getItem('geo_trainer_stats');
  const progressRaw = localStorage.getItem('geo_trainer_progress');
  const foldersRaw = localStorage.getItem('geo_study_folders');
  const customItemsRaw = localStorage.getItem('geo_trainer_custom_items');
  const consent = getStoredConsent();

  return {
    exportMetadata: {
      type: "GeoTrainer AVG/GDPR Persoonsgegevens Export",
      exportDate: new Date().toISOString(),
      userEmail: userEmail || "Gastgebruiker (lokale opslag)",
      rechtenInformatie: "Gegenereerd conform artikel 15 en 20 AVG (Recht op inzage en gegevensoverdraagbaarheid)"
    },
    toestemming: consent || { accepted: false, status: "Niet geregistreerd" },
    voorkeuren: {
      thema: localStorage.getItem('geo_theme') || 'light',
      taal: localStorage.getItem('geo_language') || 'nl',
      wrongAnswerDelay: localStorage.getItem('geo_wrong_answer_delay') || '3.0',
      highContrastMap: localStorage.getItem('geo_map_contrast') || 'false'
    },
    statistieken: statsRaw ? JSON.parse(statsRaw) : {},
    leervoortgangSpacedRepetition: progressRaw ? JSON.parse(progressRaw) : {},
    aangemaakteLeermapjes: foldersRaw ? JSON.parse(foldersRaw) : [],
    aangepasteDatabankItems: customItemsRaw ? JSON.parse(customItemsRaw) : []
  };
}
