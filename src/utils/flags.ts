const flagMapping: Record<string, string> = {
  // Europe Countries from europe.json
  'eu-l-isl': 'is',
  'eu-l-nor': 'no',
  'eu-l-swe': 'se',
  'eu-l-fin': 'fi',
  'eu-l-den': 'dk',
  'eu-l-bel': 'be',
  'eu-l-ned': 'nl',
  'eu-l-lux': 'lu',
  'eu-l-gbr': 'gb',
  'eu-l-ier': 'ie',
  'eu-l-fra': 'fr',
  'eu-l-dui': 'de',
  'eu-l-oos': 'at',
  'eu-l-zwi': 'ch',
  'eu-l-ita': 'it',
  'eu-l-por': 'pt',
  'eu-l-spa': 'es',
  'eu-l-pol': 'pl',
  'eu-l-tsj': 'cz',
  'eu-l-slo': 'sk',
  'eu-l-hon': 'hu',
  'eu-l-kro': 'hr',
  'eu-l-slv': 'si',
  'eu-l-ser': 'rs',
  'eu-l-mon': 'me',
  'eu-l-kos': 'xk',
  'eu-l-alb': 'al',
  'eu-l-bos': 'ba',
  'eu-l-nma': 'mk',
  'eu-l-gri': 'gr',
  'eu-l-bul': 'bg',
  'eu-l-roe': 'ro',
  'eu-l-mol': 'md',
  'eu-l-oek': 'ua',
  'eu-l-wit': 'by',
  'eu-l-lit': 'lt',
  'eu-l-let': 'lv',
  'eu-l-est': 'ee',
  'eu-l-rus': 'ru',
  'eu-l-mal': 'mt',
  'eu-l-cyp': 'cy',

  // World Countries from world.json
  'wd-l-can': 'ca',
  'wd-l-usa': 'us',
  'wd-l-mex': 'mx',
  'wd-l-cub': 'cu',
  'wd-l-bra': 'br',
  'wd-l-ven': 've',
  'wd-l-col': 'co',
  'wd-l-per': 'pe',
  'wd-l-chi': 'cl',
  'wd-l-arg': 'ar',
  'wd-l-egy': 'eg',
  'wd-l-alg': 'dz',
  'wd-l-lby': 'ly',
  'wd-l-mar': 'ma',
  'wd-l-tun': 'tn',
  'wd-l-som': 'so',
  'wd-l-eth': 'et',
  'wd-l-sud': 'sd',
  'wd-l-ken': 'ke',
  'wd-l-rwa': 'rw',
  'wd-l-bur': 'bi',
  'wd-l-mli': 'ml',
  'wd-l-nga': 'ng',
  'wd-l-civ': 'ci',
  'wd-l-sen': 'sn',
  'wd-l-cod': 'cd',
  'wd-l-zaf': 'za',
  'wd-l-ukr': 'ua',
  'wd-l-pak': 'pk',
  'wd-l-afg': 'af',
  'wd-l-syr': 'sy',
  'wd-l-isr': 'il',
  'wd-l-idn': 'id',
  'wd-l-phl': 'ph',
  'wd-l-tha': 'th',
  'wd-l-lbn': 'lb',
  'wd-l-jor': 'jo',
  'wd-l-sau': 'sa',
  'wd-l-tur': 'tr',
  'wd-l-chn': 'cn',
  'wd-l-jpn': 'jp',
  'wd-l-ind': 'in',
  'wd-l-irn': 'ir',
  'wd-l-irq': 'iq',
  'wd-l-aus-country': 'au'
};

const countryNameToIso: Record<string, string> = {
  'belgië': 'be',
  'nederland': 'nl',
  'frankrijk': 'fr',
  'duitsland': 'de',
  'verenigd koninkrijk': 'gb',
  'spanje': 'es',
  'italië': 'it',
  'portugal': 'pt',
  'ijsland': 'is',
  'noorwegen': 'no',
  'zweden': 'se',
  'finland': 'fi',
  'denemarken': 'dk',
  'luxemburg': 'lu',
  'ierland': 'ie',
  'oostenrijk': 'at',
  'zwitserland': 'ch',
  'polen': 'pl',
  'tsjechië': 'cz',
  'slowakije': 'sk',
  'hongarije': 'hu',
  'kroatië': 'hr',
  'slovenië': 'si',
  'serbië': 'rs',
  'montenegro': 'me',
  'kosovo': 'xk',
  'albanië': 'al',
  'bosnië en herzegovina': 'ba',
  'noord-macedonië': 'mk',
  'griekenland': 'gr',
  'bulgarije': 'bg',
  'roemenië': 'ro',
  'moldavië': 'md',
  'oekraïne': 'ua',
  'wit-rusland': 'by',
  'litouwen': 'lt',
  'letland': 'lv',
  'estland': 'ee',
  'rusland': 'ru',
  'malta': 'mt',
  'cyprus': 'cy',
  'verenigde staten': 'us',
  'canada': 'ca',
  'mexico': 'mx',
  'brazilië': 'br',
  'argentinië': 'ar',
  'china': 'cn',
  'japan': 'jp',
  'indië': 'in',
  'australië': 'au'
};

const provinceFlagMapping: Record<string, string> = {
  // Belgian Provinces from belgium.json
  'be-p-wvl': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_West_Flanders.svg',
  'be-p-ovl': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Flag_of_East_Flanders.svg',
  'be-p-ant': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Flag_of_Antwerp.svg',
  'be-p-lim': 'https://upload.wikimedia.org/wikipedia/commons/8/81/Flag_of_Limburg_%28Belgium%29.svg',
  'be-p-vbr': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Flemish_Brabant.svg',
  'be-p-wbr': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Flag_of_Walloon_Brabant.svg',
  'be-p-hen': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Flag_of_Hainaut.svg',
  'be-p-lui': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Flag_of_Liege.svg',
  'be-p-lux': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Flag_of_the_Province_of_Luxembourg.svg',
  'be-p-nam': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Flag_of_Namur.svg'
};

export function getIsoCode(itemIdOrName: string): string | null {
  if (!itemIdOrName) return null;
  if (flagMapping[itemIdOrName]) return flagMapping[itemIdOrName];
  if (itemIdOrName.length === 2) return itemIdOrName.toLowerCase();
  
  const lowerName = itemIdOrName.toLowerCase().trim();
  if (countryNameToIso[lowerName]) return countryNameToIso[lowerName];

  return null;
}

export function getFlagUrl(itemIdOrName: string): string | null {
  // Check if it's a Belgian province
  if (provinceFlagMapping[itemIdOrName]) {
    return provinceFlagMapping[itemIdOrName];
  }

  const isoCode = getIsoCode(itemIdOrName);
  if (isoCode) {
    // Primary URL from local public/flags/ directory (hampusborgos/country-flags dataset)
    return `/flags/${isoCode.toLowerCase()}.svg`;
  }

  return null;
}

export function getFallbackFlagUrl(itemIdOrName: string): string | null {
  const isoCode = getIsoCode(itemIdOrName);
  if (isoCode) {
    return `https://raw.githubusercontent.com/hampusborgos/country-flags/main/svg/${isoCode.toLowerCase()}.svg`;
  }
  return null;
}

