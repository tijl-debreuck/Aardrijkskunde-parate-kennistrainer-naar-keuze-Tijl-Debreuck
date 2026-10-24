import { Language, translateName } from './language';

interface ClueMap {
  [key: string]: string;
}

const CLUES: ClueMap = {
  // --- EUROPE SEAS & CHANNELS ---
  "eu-s-noordzee": "Welke zee grenst aan de westkust van Nederland en België?",
  "eu-s-oostzee": "Welke zee, ook wel bekend als de Baltische Zee, ligt ten oosten van Zweden en ten noorden van Polen?",
  "eu-s-middellandse": "Welke grote, warme zee ligt tussen Zuid-Europa en Noord-Afrika?",
  "eu-s-zwarte": "Welke grote binnenzee ligt ten noorden van Turkije en ten oosten van Roemenië?",
  "eu-s-kaspische": "Welk gigantisch waterlichaam op de grens van Europa en Azië is feitelijk 's werelds grootste ingesloten zoutwatermeer?",
  "eu-s-ijszee": "Welke koudste zee/oceaan omringt de geografische Noordpool?",
  "eu-s-adriatische": "Welke langwerpige zee scheidt het Italiaanse schiereiland van de Balkanstaten?",
  "eu-s-ionische": "Welke zee ligt ten westen van Griekenland en ten zuiden van de Adriatische Zee?",
  "eu-s-egeische": "Welke eilandrijke zee ligt ingesloten tussen het Griekse vasteland en Turkije?",
  "eu-s-tyrreense": "Welke zee ligt ten westen van de Italiaanse laars, begrensd door Corsica, Sardinië en Sicilië?",
  "eu-s-ierse": "Welke zee scheidt het eiland Ierland van het eiland Groot-Brittannië?",
  "eu-s-atlantische": "Welke enorme oceaan ligt ten westen van Europa en verbindt het continent met Amerika?",
  "eu-s-bosporus": "Welke wereldberoemde zeestraat loopt dwars door de Turkse metropool Istanbul?",
  "eu-s-gibraltar": "Welke strategische zeestraat scheidt Spanje van Marokko en verbindt de Middellandse Zee met de Atlantische Oceaan?",
  "eu-s-kanaal": "Welke smalle zeestraat scheidt het zuiden van Engeland van het noorden van Frankrijk?",

  // --- EUROPE RIVERS ---
  "eu-r-rijn": "Welke vitale rivier ontspringt in Zwitserland, loopt door Duitsland en mondt bij Rotterdam uit in de Noordzee?",
  "eu-r-don": "Welke grote rivier in het zuidwesten van Rusland mondt uit in de Zee van Azov?",
  "eu-r-oder": "Welke rivier vormt een cruciaal deel van de staatsgrens tussen Duitsland en Polen?",
  "eu-r-wolga": "Wat is de langste rivier van Europa, die uitsluitend door Rusland stroomt en uitmondt in de Kaspische Zee?",
  "eu-r-loire": "Welke langste rivier van Frankrijk staat wereldwijd bekend om haar oogverblindende kasteelvalleien?",
  "eu-r-seine": "Welke iconische rivier stroomt door het hart van de Franse hoofdstad Parijs?",
  "eu-r-dnjepr": "Welke rivier stroomt vanuit Rusland door Wit-Rusland en dwars door Oekraïne (langs Kiev) naar de Zwarte Zee?",
  "eu-r-theems": "Welke beroemde rivier stroomt dwars door de Britse hoofdstad Londen?",
  "eu-r-garonne": "Welke Zuid-Franse rivier stroomt door Toulouse en Bordeaux alvorens uit te monden in de Atlantische Oceaan?",
  "eu-r-po": "Wat is de langste en meest waterrijke rivier van Italië, die de noordelijke Povlakte doorkruist?",
  "eu-r-weichsel": "Welke langste en belangrijkste rivier van Polen stroomt onder andere door Krakau en Warschau?",
  "eu-r-ebro": "Welke grote rivier in het noordoosten van Spanje mondt uit in de Middellandse Zee?",
  "eu-r-rhone": "Welke rivier ontspringt in Zwitserland, stroomt door het Meer van Genève en stroomt dan zuidwaarts door Frankrijk naar de Middellandse Zee?",
  "eu-r-oeral": "Welke rivier vormt de traditionele oostgrens tussen Europa en Azië en mondt uit in de Kaspische Zee?",
  "eu-r-taag": "Wat is de langste rivier van het Iberisch Schiereiland, die uitmondt in de Atlantische Oceaan bij Lissabon?",
  "eu-r-elbe": "Welke belangrijke rivier ontspringt in Tsjechië en stroomt door Duitsland, langs Dresden en Hamburg, naar de Noordzee?",
  "eu-r-donau": "Welke op één na langste rivier van Europa passeert maar liefst vier Europese hoofdsteden, waaronder Wenen en Boedapest?",

  // --- EUROPE MOUNTAINS & ISLANDS & PENINSULAS ---
  "eu-m-pyreneen": "Welke bergketen vormt de natuurlijke grens tussen Frankrijk en Spanje?",
  "eu-m-alpen": "Welke enorme, hoge bergketen strekt zich uit over onder andere Frankrijk, Zwitserland, Oostenrijk en Noord-Italië?",
  "eu-m-karpaten": "Welke boogvormige bergketen strekt zich hoofdzakelijk uit over Centraal- en Oost-Europa, voornamelijk in Roemenië en Slowakije?",
  "eu-m-oeral": "Welke bergketen in Rusland vormt de traditionele geografische scheidingslijn tussen de continenten Europa en Azië?",
  "eu-m-kaukasus": "Welke bergketen tussen de Zwarte en Kaspische Zee herbergt de hoogste berg van Europa (de Elbroes)?",
  "eu-m-scandinavisch": "Welk bergland strekt zich uit over de lengte van het Scandinavisch schiereiland, voornamelijk in Noorwegen?",
  "eu-i-corsica": "Welk bergachtig Frans eiland in de Middellandse Zee ligt direct ten noorden van Sardinië en is de geboorteplaats van Napoleon?",
  "eu-i-sardinie": "Welk grote Italiaanse eiland ligt ten zuiden van Corsica in de Westelijke Middellandse Zee?",
  "eu-i-sicilie": "Wat is het grootste eiland in de Middellandse Zee, gelegen aan de 'punt van de Italiaanse laars' en bekend om de vulkaan Etna?",
  "eu-i-kreta": "Wat is het grootste en meest zuidelijke eiland van Griekenland, bekend uit de Griekse mythologie van de Minotaurus?",
  "eu-i-cyprus": "Welk eiland in de uiterste oosthoek van de Middellandse Zee is verdeeld in een Grieks en Turks deel?",
  "eu-i-britseeilanden": "Welke eilandengroep in de Atlantische Oceaan omvat onder andere Groot-Brittannië, Ierland en duizenden minimale eilanden?",
  "eu-i-ijsland": "Welk vulkanisch eiland in de verre noordelijke Atlantische Oceaan staat bekend om gletsjers, geisers en warmwaterbronnen?",
  "eu-p-scandinavie": "Welk groot noordelijk schiereiland omvat hoofdzakelijk de landen Noorwegen en Zweden?",
  "eu-p-balkan": "Welk Zuidoost-Europees schiereiland wordt begrensd door de Adriatische, Ionische en Egeïsche Zee?",
  "eu-p-italie": "Welk laarsvormig schiereiland steekt centraal uit in de Middellandse Zee?",
  "eu-p-iberisch": "Welk schiereiland in het zuidwesten van Europa herbergt de landen Spanje en Portugal?",

  // --- WORLD CONTINENTS & OCEANS ---
  "wd-co-eur": "Wat is de gecombineerde landmassa van de continenten Europa en Azië?",
  "wd-co-afr": "Welk continent wordt doorsneden door de evenaar en herbergt de Sahara-woestijn?",
  "wd-co-nam": "Welk continent herbergt landen als Canada, de Verenigde Staten en Mexico?",
  "wd-co-zam": "Welk continent herbergt de Amazone en strekt zich uit tot aan Vuurland in het zuiden?",
  "wd-co-ant": "Welk onbewoonde, ijskoude continent bevindt zich rond de geografische Zuidpool?",
  "wd-co-aus": "Welk continent is tevens 's werelds kleinste continent en omvat voornamelijk Australië en Oceanië?",
  "wd-wd-eur": "Welk werelddeel grenst in het oosten aan Azië en heeft een rijke geschiedenis van de oudheid en de EU?",
  "wd-wd-azi": "Wat is qua landoppervlakte en inwonersaantal het grootste werelddeel op aarde?",
  "wd-wd-ame": "Welk reusachtige werelddeel strekt zich bijna volledig van noord naar zuid uit over het westelijk halfrond?",
  "wd-wd-oce": "Welk werelddeel bestaat uit duizenden eilanden in de Stille Oceaan, waaronder Australië en Nieuw-Zeeland?",
  "wd-wd-afr": "Welk werelddeel herbergt de rivieren de Nijl en de Kongo, evenals de Serengeti-vlaktes?",
  "wd-wd-ant": "Welk extreem koude werelddeel ligt gecentreerd rondom de Zuidpool van de aarde?",
  "wd-oc-gro": "Wat is de grootste en diepste oceaan op aarde, gelegen tussen Azië en Amerika?",
  "wd-oc-atl": "Welke oceaan scheidt de Oude Wereld (Europa en Afrika) van de Nieuwe Wereld (Amerika)?",
  "wd-oc-ind": "Welke oceaan ligt voornamelijk ten zuiden van Azië en tussen Afrika en Australië?",
  "wd-oc-nij": "Welk kleinste waterlichaam omringt het gehele noordpoolgebied?",

  // --- WORLD REFERENCE LINES ---
  "wd-rl-nul": "Welke meridiaan (lengtegraad 0°) loopt onder andere door de sterrenwacht van Greenwich in Londen?",
  "wd-rl-eve": "Welke denkbeeldige breedtecirkel verdeelt de aarde precies in een noordelijk en zuidelijk halfrond?",
  "wd-rl-kre": "Welke bijzondere breedtegraad op ongeveer 23,5° noorderbreedte markeert de meest noordelijke positie waar de zon in de zenit staat?",
  "wd-rl-ste": "Welke bijzondere breedtegraad op ongeveer 23,5° zuiderbreedte markeert de meest zuidelijke positie waar de zon loodrecht boven de aarde staat?",
  "wd-rl-npo": "Welke poolcirkel markeert de grens van het noordelijke gebied waar de poolnacht en pooldag optreden?",
  "wd-rl-zpo": "Welke poolcirkel markeert de breedtegraad in het zuiden waar de zon minstens één dag per jaar niet opkomt?",

  // --- WORLD RIVERS ---
  "wd-r-nijl": "Wat is de langste rivier ter wereld, stroomend door het noordoosten van Afrika naar de Middellandse Zee?",
  "wd-r-amazone": "Wat is de meest waterrijke rivier ter wereld, die door het Zuid-Amerikaanse regenwoud stroomt?",
  "wd-r-mississippi": "Welke gigantische rivier stroomt van noord naar zuid door de Verenigde Staten naar de Golf van Mexico?",
  "wd-r-parana": "Welke rivier in Zuid-Amerika stroomt door Brazilië en Argentinië en vormt de monding van de Río de la Plata?",
  "wd-r-niger": "Welke cruciale West-Afrikaanse rivier maakt een opvallende bocht door de Sahel alvorens uit te monden in Nigeria?",
  "wd-r-kongo": "Welke diepste rivier ter wereld stroomt door Centraal-Afrika en kruist tweemaal de evenaar?",
  "wd-r-ob": "Welke grote rivier in West-Siberië stroomt noordwaarts naar de Noordelijke IJszee?",
  "wd-r-jenisej": "Welke enorme Siberische rivier vormt het grootste stroomgebied dat uitmondt in de Noordelijke IJszee?",
  "wd-r-lena": "Welke grote Russische rivier in Oost-Siberië stroomt door koud permafrostgebied en mondt uit in de Laptevzee?",
  "wd-r-huanghe": "Welke rivier in China staat bekend als de 'Gele Rivier' vanwege de specifieke loess-kleur van haar slib?",
  "wd-r-jangtsekiang": "Wat is de langste rivier van Azië, die volledig door China stroomt en ook wel de 'Blauwe Rivier' wordt genoemd?",
  "wd-r-ganges": "Welke heilige rivier in India stroomt van de Himalaya naar de Golf van Bengalen?",
  "wd-r-darling": "Welke rivier vormt samen met de Murray het belangrijkste riviersysteem van het droge Australië?",

  // --- WORLD MOUNTAINS ---
  "wd-m-himalaya": "Welk hoogste plooiingsgebergte ter wereld herbergt de Mount Everest en de K2?",
  "wd-m-andes": "Wat is de langste bergketen ter wereld, gesitueerd over de gehele westkust van Zuid-Amerika?",
  "wd-m-rocky": "Welke bekende, woeste bergketen strekt zich uit over het westen van Canada en de VS?",
  "wd-m-atlas": "Welke bergketen in Noord-Afrika herbergt de hoogste toppen van Marokko?",
  "wd-m-madre": "Welk omvangrijke bergstelsel strekt zich uit over het grootste deel van Mexico?",
  "wd-m-kunlun": "Welke enorme bergketen in Azië bepaalt de noordgrens van het Tibetaanse hoogland?",
  "wd-m-taurus": "Welke bergketen siert de gehele zuidkust van Turkije?",
  "wd-m-oeral": "Welk oud gebergte in Rusland vormt de formele scheidingslijn tussen Europa en Azië?",
  "wd-m-coast": "Welke bergketen strekt zich uit direct langs de Pacifische kust van Noord-Amerika?",
  "wd-m-tibet": "Welke gigantische, extreem hooggelegen hoogvlakte in Azië wordt ook wel 'het dak van de wereld' genoemd?",
  "wd-m-iran": "Welk grootschalig, bergachtig plateau beslaat het grootste deel van het moderne Iran?",
  "wd-m-ethiopisch": "Welke uitgestrekte, vruchtbare hoogvlakte in de Hoorn van Afrika staat bekend om zijn grote hoogte?",
  "wd-m-oostafrikaans": "Welk hooglandgebied in het oosten van Afrika ligt langs de bekende Grote Slenk?",

  // --- WORLD CITIES ---
  "wd-s-nyo": "Welke Amerikaanse metropool wordt ook wel 'The Big Apple' genoemd?",
  "wd-s-was": "Wat is de bondsrepublikeinse hoofdstad van de Verenigde Staten?",
  "wd-s-nor": "Welke historische jazzstad in Louisiana ligt aan de monding van de Mississippi?",
  "wd-s-mia": "Welke zonovergoten kuststad in Florida staat bekend om z'n pastelkleurige art deco?",
  "wd-s-chi": "Welke grote stad aan het Michiganmeer staat bekend als 'The Windy City'?",
  "wd-s-los": "Welke metropool in Californië is wereldberoemd om Hollywood en Beverly Hills?",
  "wd-s-mex": "Wat is de gigantische hoofdstad van Mexico, gebouwd in de oude vallei van Tenochtitlan?",
  "wd-s-car": "Wat is de hoofdstad van Venezuela, verscholen achter dichte kustbergen?",
  "wd-s-rio": "Welke adembenemende kuststad in Brazilië staat bekend om het gigantische standbeeld van Christus de Verlosser?",
  "wd-s-sao": "Wat is de volkrijkste stad van Brazilië en geldt als het financiële hart van Zuid-Amerika?",
  "wd-s-lim": "Wat is de aan de Stille Oceaan gelegen hoofdstad van Peru?",
  "wd-s-bue": "Wat is de hoofdstad van Argentinië en geldt als het 'Parijs van Zuid-Amerika'?",
  "wd-s-bog": "Wat is de hooggelegen hoofdstad van Colombia, gelegen in de Andes?",
  "wd-s-cai": "Welke reusachtige metropool aan de Nijl is de hoofdstad van Egypte?",
  "wd-s-kin": "Wat is de hoofdstad van de Democratische Republiek Congo, gelegen aan de Kongostroom?",
  "wd-s-kaa": "Welke idyllische stad aan de Kaap de Goede Hoop herbergt het parlement van Zuid-Afrika?",
  "wd-s-lag": "Wat is de megastad en economische motor van Nigeria, oorspronkelijk gebouwd op eilanden?",
  "wd-s-nai": "Wat is de moderne hoofdstad van Kenia, bekend om haar nationale park vlak naast het centrum?",
  "wd-s-dak": "Wat is de havenhoofdstad van Senegal, gelegen op het schiereiland met Kaap Verde?",
  "wd-s-mos": "Wat is de hoofdstad van Rusland, bekend van het majestueuze Kremlin?",
  "wd-s-bei": "Wat is de millennia-oude hoofdstad van de Volksrepubliek China?",
  "wd-s-ist": "Welke iconische Turkse stad ligt op twee continenten tegelijk?",
  "wd-s-kar": "Wat is de enorme havenmetropool en voormalige hoofdstad van Pakistan?",
  "wd-s-teh": "Wat is de drukbevolkte hoofdstad van de Islamitische Republiek Iran?",
  "wd-s-mum": "Welke Indiase megapool aan de Arabische Zee herbergt de omvangrijke Bollywood-filmindustrie?",
  "wd-s-del": "Welke stad vormt de historische en dichtbevolkte kern direct naast New Delhi?",
  "wd-s-kol": "Welke beroemde kuststad aan de Hooghly was de hoofdstad van Brits-Indië tot 1911?",
  "wd-s-dha": "Wat is de hoofdstad van Bangladesh, en tevens het centrum van de wereldwijde juteteelt?",
  "wd-s-sha": "Welke hypermoderne Chinese wolkenkrabbermetropool ligt aan de monding van de Yangtze?",
  "wd-s-seo": "Wat is de bruisende, hypertechnologische hoofdstad van Zuid-Korea?",
  "wd-s-tok": "Wat is de hoofdstad van Japan en het hart van het meest bevolkte metropolitaans gebied ter wereld?",
  "wd-s-sin": "Welke welvarende stadstaat op het puntje van het Maleisisch schiereiland is uiterst schoon?",
  "wd-s-man": "Wat is de dichtbevolkte hoofdstad van de eilandstaat de Filipijnen?",
  "wd-s-jak": "Wat is de zinkende megapool op Java die fungeert als de hoofdstad van Indonesië?",
  "wd-s-syd": "Wat is de grootste stad van Australië, beroemd om haar prachtige baai en Opera House?",
  "wd-s-mel": "Welke sfeervolle, victoriaanse stad geldt als de culturele hoofdstad van Australië?",

  // --- BELGIUM RIVERS ---
  "be-r-ijz": "Welke Belgische rivier stroomt door de Westhoek en mondt bij Nieuwpoort uit in de Noordzee?",
  "be-r-sch": "Welke grote rivier stroomt door Gent en Antwerpen naar de Westerschelde?",
  "be-r-maa": "Welke rivier komt vanuit Frankrijk België binnen via Dinant, stroomt door Luik en stroomt door naar Nederland?",
  "be-r-lei": "Welke rivier, historisch belangrijk voor de vlasindustrie en bekend als 'Gouden Rivier', mondt in Gent uit in de Schelde?",
  "be-r-sam": "Welke zijrivier stroomt door Charleroi en mondt bij de Citadel van Namen uit in de Maas?",

  // --- BELGIUM PORTS ---
  "be-po-ant": "Welke enorme haven aan de Schelde is de grootste haven van België en de op een na grootste van heel Europa?",
  "be-po-zee": "Welke moderne diepzeehaven direct aan de Noordzee blinkt uit in de logistiek van nieuwe auto's en vloeibaar gas?",
  "be-po-gen": "Welke belangrijke kanaalhaven in Oost-Vlaanderen maakt deel uit van het grensoverschrijvende North Sea Port-gebied?",

  // --- BELGIUM HIGHWAYS ---
  "be-h-e40": "Welke langste Belgische autosnelweg verbindt de Belgische kust (Adinkerke) via Brussel met de Duitse grens?",
  "be-h-e403": "Welke snelweg verbindt de haven van Zeebrugge en Brugge in rechte lijn met Kortrijk en Doornik?",
  "be-h-e17": "Welke vitale verkeersas loopt van de Franse grens bij Rekkem via Gent naar Antwerpen?",
  "be-h-e19": "Welke drukke autosnelweg loopt van de Nederlandse grens via Antwerpen en Brussel naar Mons en Frankrijk?",
  "be-h-e411": "Welke bekende snelweg verbindt het Brusselse ringgewest rechtstreeks met de steden Namen, Aarlen en het land Luxemburg?",
  "be-h-e42": "Welke Waalse snelweg, ook wel 'La Wallonne' genoemd, loopt van de Franse grens bij Doornik naar Luik en de Duitse grens?",
  "be-h-e313": "Welke snelweg verbindt de havenstad Antwerpen in diagonale lijn met de industriestad Luik?",
  "be-h-e314": "Welke snelweg splitst van de E40 bij Leuven af en loopt via de Limburgse as (Genk, Maasmechelen) naar Nederland?",

  // --- BELGIUM SPECIALS ---
  "be-hp-botrange": "Wat is het allerhoogste geografische punt van België (694 meter), gelegen in de Hoge Venen?"
};

/**
 * Returns a translated category term for user prompts
 */
export function getCategoryName(category: string, lang: Language = 'nl'): string {
  if (lang === 'en') {
    switch (category?.toLowerCase()) {
      case 'country':
      case 'land en hoofdstad':
      case 'rijkslanden':
        return 'the country';
      case 'capital':
        return 'the capital';
      case 'province':
      case 'provincies':
        return 'the province or region';
      case 'river':
      case 'mondingen & rivieren':
      case 'wereldrivieren':
        return 'the river';
      case 'mountain':
      case 'gebergten':
      case 'gebergteketens':
        return 'the mountain range or island';
      case 'sea':
      case 'zeeën en kanalen':
        return 'the sea or strait';
      case 'highway':
      case 'autosnelwegen':
        return 'the highway';
      case 'port':
      case 'havens':
        return 'the port';
      case 'continent':
      case 'werelddelen':
        return 'the continent';
      case 'ocean':
      case 'oceanen':
        return 'the ocean';
      case 'line':
      case 'referentielijnen':
        return 'the reference line';
      case 'city':
      case 'wereldsteden':
        return 'the city';
      default:
        return 'the geographic object';
    }
  }

  switch (category?.toLowerCase()) {
    case 'country':
    case 'land en hoofdstad':
    case 'rijkslanden':
      return 'het land';
    case 'capital':
      return 'de hoofdstad';
    case 'province':
    case 'provincies':
      return 'de provincie of het gewest';
    case 'river':
    case 'mondingen & rivieren':
    case 'wereldrivieren':
      return 'de rivier';
    case 'mountain':
    case 'gebergten':
    case 'gebergteketens':
      return 'het gebergte of eiland';
    case 'sea':
    case 'zeeën en kanalen':
      return 'de zee of zeestraat';
    case 'highway':
    case 'autosnelwegen':
      return 'de autosnelweg';
    case 'port':
    case 'havens':
      return 'de haven';
    case 'continent':
    case 'werelddelen':
      return 'het werelddeel';
    case 'ocean':
    case 'oceanen':
      return 'de oceaan';
    case 'line':
    case 'referentielijnen':
      return 'de referentielijn';
    case 'city':
    case 'wereldsteden':
      return 'de stad';
    default:
      return 'het geografische object';
  }
}

export function getDutchCategoryName(category: string): string {
  return getCategoryName(category, 'nl');
}

/**
 * Returns a customized question clue for a specific geographic item in Dutch or English.
 */
export function getClueForGeoItem(itemId: string, itemName: string, category: string, lang: Language = 'nl'): string {
  const translatedName = translateName(itemName, lang);

  if (lang === 'en') {
    if (category === 'country') {
      return `Which country is this?`;
    }
    if (category === 'city') {
      return `Which well-known city is named "${translatedName}"?`;
    }
    if (category === 'province') {
      return `Which province/region is named or identified as "${translatedName}"?`;
    }
    const categoryTerm = getCategoryName(category, 'en');
    return `Identify ${categoryTerm}: "${translatedName}"`;
  }

  const customClue = CLUES[itemId];
  if (customClue) {
    return customClue;
  }

  const dutchCategory = getCategoryName(category, 'nl');
  if (category === 'country') {
    return `Welk land wordt hier gezocht?`;
  }
  if (category === 'city') {
    return `Welke bekende nationale of internationale stad heeft als naam "${translatedName}"?`;
  }
  if (category === 'province') {
    return `Welke Belgische of Europese provincie/regio heeft als naam of alternatieve benaming "${translatedName}"?`;
  }

  return `Vul de naam of aanduiding in van ${dutchCategory}: "${translatedName}"`;
}

/**
 * Returns a capitalized category label for UI display badges in Dutch or English.
 */
export function getCategoryLabel(category: string, lang: Language = 'nl'): string {
  if (lang === 'en') {
    switch (category?.toLowerCase()) {
      case 'country':
      case 'landen':
        return 'Country';
      case 'capital':
        return 'Capital';
      case 'province':
      case 'provincies':
      case 'regio\'s':
        return 'Province / Region';
      case 'river':
      case 'mondingen & rivieren':
      case 'wereldrivieren':
        return 'River';
      case 'mountain':
      case 'gebergten':
      case 'gebergteketens':
        return 'Mountain / Island';
      case 'sea':
      case 'zeeën en kanalen':
      case 'zeeen':
      case 'zeeen_engtes':
        return 'Sea / Strait';
      case 'highway':
      case 'autosnelwegen':
        return 'Highway';
      case 'port':
      case 'havens':
        return 'Port';
      case 'continent':
      case 'werelddelen':
        return 'Continent';
      case 'ocean':
      case 'oceanen':
        return 'Ocean';
      case 'line':
      case 'referentielijnen':
        return 'Reference Line';
      case 'city':
      case 'wereldsteden':
        return 'City';
      default:
        return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Object';
    }
  }

  switch (category?.toLowerCase()) {
    case 'country':
    case 'landen':
      return 'Land';
    case 'capital':
      return 'Hoofdstad';
    case 'province':
    case 'provincies':
    case 'regio\'s':
      return 'Provincie / Gewest';
    case 'river':
    case 'mondingen & rivieren':
    case 'wereldrivieren':
      return 'Rivier';
    case 'mountain':
    case 'gebergten':
    case 'gebergteketens':
      return 'Gebergte / Eiland';
    case 'sea':
    case 'zeeën en kanalen':
    case 'zeeen':
    case 'zeeen_engtes':
      return 'Zee / Zeestraat';
    case 'highway':
    case 'autosnelwegen':
      return 'Autosnelweg';
    case 'port':
    case 'havens':
      return 'Haven';
    case 'continent':
    case 'werelddelen':
      return 'Werelddeel';
    case 'ocean':
    case 'oceanen':
      return 'Oceaan';
    case 'line':
    case 'referentielijnen':
      return 'Referentielijn';
    case 'city':
    case 'wereldsteden':
      return 'Stad';
    default:
      return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Object';
  }
}

export function getDutchCategoryLabel(category: string): string {
  return getCategoryLabel(category, 'nl');
}
