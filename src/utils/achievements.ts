export interface Achievement {
  key: string;
  title: string;
  desc: string;
  icon: string; // Emoji or Lucide icon reference
  category: 'general' | 'belgium' | 'europe' | 'world' | 'accuracy';
}

export const LIST_OF_ACHIEVEMENTS: Achievement[] = [
  // General Progress
  { key: 'first_steps', title: 'Eerste stappen', desc: 'Beantwoord je allereerste vraag correct', icon: '🐣', category: 'general' },
  { key: 'answered_10', title: 'Verkenner', desc: 'Beantwoord 10 vragen', icon: '🧭', category: 'general' },
  { key: 'answered_50', title: 'Cartograaf in spé', desc: 'Beantwoord 50 vragen', icon: '🗺️', category: 'general' },
  { key: 'answered_100', title: 'Vaste Bezoeker', desc: 'Beantwoord 100 vragen', icon: '🏛️', category: 'general' },
  { key: 'answered_500', title: 'Wetenschapper', desc: 'Beantwoord 500 vragen', icon: '🧬', category: 'general' },
  { key: 'answered_1000', title: 'Professor in Geo', desc: 'Beantwoord 1000 vragen', icon: '🎓', category: 'general' },
  
  // Correct Counts
  { key: 'correct_5', title: 'High Five', desc: 'Beantwoord 5 vragen correct', icon: '🖐️', category: 'general' },
  { key: 'correct_25', title: 'Kennisbank', desc: 'Beantwoord 25 vragen correct', icon: '📚', category: 'general' },
  { key: 'correct_100', title: 'Wandelende Atlas', desc: 'Beantwoord 100 vragen correct', icon: '🌍', category: 'general' },
  { key: 'correct_500', title: 'Eindeloos Geheugen', desc: 'Beantwoord 500 vragen correct', icon: '💾', category: 'general' },

  // Belgium Specific (Specialist goals)
  { key: 'belgium_explorer', title: 'Belgische Toerist', desc: 'Beantwoord een vraag over België correct', icon: '🍫', category: 'belgium' },
  { key: 'province_specialist', title: 'Provinciegouverneur', desc: 'Ken alle provincies van België uit je hoofd', icon: '🦁', category: 'belgium' },
  { key: 'river_navigator', title: 'Zeeschipper', desc: 'Beantwoord een riviervraag correct', icon: '⚓', category: 'belgium' },
  { key: 'belgium_master', title: 'Frietmeester', desc: 'Behaal 100% op de provincie quiz', icon: '🍟', category: 'belgium' },
  { key: 'belgium_ports', title: 'Havenmeester', desc: 'Beantwoord een vraag over Belgische havens correct', icon: '🚢', category: 'belgium' },
  { key: 'belgium_highways', title: 'Asfaltvreter', desc: 'Identificeer autosnelwegen in België', icon: '🚗', category: 'belgium' },
  { key: 'belgium_regions', title: 'Gewestenkenner', desc: 'Beantwoord een vraag over de gewesten correct', icon: '🏘️', category: 'belgium' },

  // Europe Specific
  { key: 'europe_explorer', title: 'Spoorzoeker Europa', desc: 'Beantwoord een vraag over Europa correct', icon: '🇪🇺', category: 'europe' },
  { key: 'border_guard', title: 'Douane-officier', desc: 'Beantwoord een vraag over de Europese landen correct', icon: '🛂', category: 'europe' },
  { key: 'captain', title: 'Eerste Stuurman', desc: 'Ken alle Europese zeeën en zeestraten', icon: '⛵', category: 'europe' },
  { key: 'europe_capitals', title: 'Europarlementariër', desc: 'Ken 20 Europese hoofdsteden', icon: '🏢', category: 'europe' },
  { key: 'europe_rivers', title: 'Rivierloods', desc: 'Beantwoord een Europese riviervraag correct', icon: '🌊', category: 'europe' },
  { key: 'europe_mountains', title: 'Alpiste', desc: 'Beantwoord een vraag over de bergen correct', icon: '🏔️', category: 'europe' },
  { key: 'europe_islands', title: 'Eilandhopper', desc: 'Ken de eilanden en schiereilanden van de Europese cursus', icon: '🏝️', category: 'europe' },

  // World Specific
  { key: 'world_explorer', title: 'Wereldreiziger', desc: 'Beantwoord een vraag over de wereld correct', icon: '🛰️', category: 'world' },
  { key: 'urban_planner', title: 'Wereldburger', desc: 'Identificeer een grote wereldstad correct', icon: '🏙️', category: 'world' },
  { key: 'equator_walker', title: 'Referentielijn Ranger', desc: 'Beantwoord een referentievraag correct', icon: '🌐', category: 'world' },
  { key: 'world_rivers', title: 'Nijlpaard', desc: 'Beantwoord een wereldriviervraag correct', icon: '🐊', category: 'world' },
  { key: 'world_mountains', title: 'Berggeit', desc: 'Ken de werelds grootste gebergten', icon: '⛰️', category: 'world' },
  { key: 'world_continents', title: 'Pangaea Meester', desc: 'Klik correct op alle werelddelen en continenten', icon: '🪐', category: 'world' },
  { key: 'world_oceans', title: 'Oceaan Heerser', desc: 'Ken alle grote oceanen en hun alternatieve namen', icon: '🐳', category: 'world' },

  // Accuracy and Performance (Strict goals)
  { key: 'smart_cookie', title: 'Knappe Kop', desc: 'Behaal een nauwkeurigheid van 80%+ met ten minste 50 vragen', icon: '🧠', category: 'accuracy' },
  { key: 'geography_guru', title: 'Geografisch Genie', desc: 'Behaal een nauwkeurigheid van 95%+ met ten minste 100 vragen', icon: '✨', category: 'accuracy' },
  { key: 'speed_demon', title: 'Snelheidsduivel', desc: 'Beantwoord 10 vragen correct binnen 3 seconden per vraag', icon: '⚡', category: 'accuracy' },
  
  // Custom challenges/achievements
  { key: 'no_mistakes_10', title: 'Foutloos Werk', desc: 'Doe een quiz van 10 vragen met 100% correct', icon: '🎯', category: 'accuracy' },
  { key: 'no_mistakes_25', title: 'Perfectie in Kaart', desc: 'Beantwoord 25 vragen achter elkaar correct', icon: '💎', category: 'accuracy' },
  { key: 'blind_map_pro', title: 'Sensorgestuurd', desc: 'Beantwoord 5 blind map vragen achter elkaar correct', icon: '🦇', category: 'accuracy' },
  { key: 'timed_hero_30', title: '30s Sprinter', desc: 'Voltooi een quiz in de 30s Tijdsuitdaging met 10+ goede antwoorden', icon: '⏰', category: 'accuracy' },
  { key: 'timed_hero_60', title: '60s Atleet', desc: 'Behaal minstens 15 correcte antwoorden in een 60s quiz', icon: '⏱️', category: 'accuracy' },
  { key: 'timed_hero_120', title: 'Marathonloper', desc: 'Behaal minstens 30 correcte antwoorden in een 2m quiz', icon: '🏃', category: 'accuracy' },
  { key: 'spaced_rep_pioneer', title: 'Vergeetachtigheids-Vechter', desc: 'Gebruik het herhalingssysteem om 5 items te herhalen', icon: '🔄', category: 'general' },
  { key: 'database_inspector', title: 'Systeembeheerder', desc: 'Controleer de databank via de debug/audit pagina', icon: '🛠️', category: 'general' },
  { key: 'pwa_pioneer', title: 'Lokaal Archief', desc: 'Laad de applicatie volledig en sla je statistieken lokaal op', icon: '📦', category: 'general' },
  { key: 'ai_apprentice', title: 'AI-Geleerde', desc: 'Laad het AI-leeradvies segment op', icon: '🤖', category: 'general' },
  { key: 'completionist_bronze', title: 'Verzamelaar brons', desc: 'Ontgrendel 5 achievements', icon: '🥉', category: 'general' },
  { key: 'completionist_silver', title: 'Verzamelaar zilver', desc: 'Ontgrendel 15 achievements', icon: '🥈', category: 'general' },
  { key: 'completionist_gold', title: 'Verzamelaar goud', desc: 'Ontgrendel 30 achievements', icon: '🥇', category: 'general' }
];

export const getAchievementsProgress = (unlockedKeys: string[]) => {
  return {
    unlockedCount: unlockedKeys.length,
    totalCount: LIST_OF_ACHIEVEMENTS.length,
    percentage: Math.round((unlockedKeys.length / LIST_OF_ACHIEVEMENTS.length) * 100)
  };
};
