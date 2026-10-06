export interface VocabularyEntry {
  id: string;
  word: string;
  partOfSpeech: string;
  englishMeaning: string;
  englishExample: string;
  
  // German translation and example
  germanWord: string;
  germanMeaning: string;
  germanExample: string;

  // Somali translation and example
  somaliWord: string;
  somaliMeaning: string;
  somaliExample: string;

  passageContext: string;
}

export const PUBLIC_VOCABULARY_LIST: VocabularyEntry[] = [
  {
    id: 'vocab-wearing',
    word: 'wearing',
    partOfSpeech: 'verb (present participle)',
    englishMeaning: 'Having clothes, shoes, or accessories on one’s body right now.',
    englishExample: 'He is wearing a dark T-shirt, pants, and black shoes.',
    germanWord: 'trägt / anhaben',
    germanMeaning: 'Kleidung oder Schuhe am Körper tragen.',
    germanExample: 'Er trägt ein dunkles T-Shirt, eine Hose und schwarze Schuhe.',
    somaliWord: 'xidhan / gashan',
    somaliMeaning: 'Dharka ama kabaha oo qofka jidhkiisa ku jira xilligan.',
    somaliExample: 'Wuxuu xidhan yahay funaanad madow, surwaal, iyo kabo madow.',
    passageContext: 'He is wearing a dark T-shirt... / She is wearing a light tunic shirt...',
  },
  {
    id: 'vocab-wears',
    word: 'wears',
    partOfSpeech: 'verb (3rd person singular)',
    englishMeaning: 'Regularly or habitually puts on clothes or accessories.',
    englishExample: 'He wears glasses to read and see clearly.',
    germanWord: 'trägt',
    germanMeaning: 'Gewohnheitsmäßig eine Brille oder Kleidung tragen.',
    germanExample: 'Er trägt eine Brille.',
    somaliWord: 'wuxuu xidhaa',
    somaliMeaning: 'Caado ahaan xidhashada muraayadaha ama dharka.',
    somaliExample: 'Wuxuu xidhaa muraayado.',
    passageContext: '...and he wears glasses.',
  },
  {
    id: 'vocab-around',
    word: 'around',
    partOfSpeech: 'preposition / adverb',
    englishMeaning: 'Approximately or roughly (used with age or quantity).',
    englishExample: 'He looks around 30 years old.',
    germanWord: 'ungefähr / circa / etwa',
    germanMeaning: 'Etwa oder annähernd ein bestimmtes Alter haben.',
    germanExample: 'Er sieht ungefähr 30 Jahre alt aus.',
    somaliWord: 'ku dhawaad / qiyaastii',
    somaliMeaning: 'Qiyaas ama wax ku dhow da’ gaar ah.',
    somaliExample: 'Wuxuu u muuqdaa ku dhawaad 30 jir.',
    passageContext: '...he looks around 30 years old / ...she is around 40 years old.',
  },
  {
    id: 'vocab-pants',
    word: 'pants',
    partOfSpeech: 'noun (plural)',
    englishMeaning: 'An outer piece of clothing covering the body from waist to ankles.',
    englishExample: 'She is wearing comfortable casual pants.',
    germanWord: 'die Hose / Hosen',
    germanMeaning: 'Ein Kleidungsstück für die Beine.',
    germanExample: 'Sie trägt bequeme Hosen.',
    somaliWord: 'surwaal',
    somaliMeaning: 'Dhar daboolaya dhexda ilaa canqowyada.',
    somaliExample: 'Waxay xidhan tahay surwaal.',
    passageContext: '...dark T-shirt, pants, and black shoes.',
  },
  {
    id: 'vocab-shoes',
    word: 'shoes',
    partOfSpeech: 'noun (plural)',
    englishMeaning: 'Outer coverings for the human foot typically made of leather or rubber.',
    englishExample: 'He is wearing black shoes.',
    germanWord: 'die Schuhe',
    germanMeaning: 'Fußbekleidung mit fester Sohle.',
    germanExample: 'Er trägt schwarze Schuhe.',
    somaliWord: 'kabo / kabaha',
    somaliMeaning: 'Wax lagu xidho cagaha si looga ilaaliyo dhulka.',
    somaliExample: 'Wuxuu xidhan yahay kabo madow.',
    passageContext: '...and black shoes / ...and flat shoes.',
  },
  {
    id: 'vocab-tall',
    word: 'tall',
    partOfSpeech: 'adjective',
    englishMeaning: 'Of great or more than average height.',
    englishExample: 'The man is tall and athletic.',
    germanWord: 'groß (Körpergröße)',
    germanMeaning: 'Eine überdurchschnittliche Körpergröße habend.',
    germanExample: 'Der Mann ist groß und schlank.',
    somaliWord: 'dheer (joog ahaan)',
    somaliMeaning: 'Qof dhererkiisu ka sarreeyo celceliska.',
    somaliExample: 'Ninku waa dheer yahay oo dhuuban yahay.',
    passageContext: 'The man is tall and slim...',
  },
  {
    id: 'vocab-slim',
    word: 'slim',
    partOfSpeech: 'adjective',
    englishMeaning: 'Gracefully thin, slender in an attractive way.',
    englishExample: 'He has a slim and healthy build.',
    germanWord: 'schlank / dünn',
    germanMeaning: 'Dünn auf eine ansprechende und sportliche Art.',
    germanExample: 'Er hat eine schlanke Figur.',
    somaliWord: 'dhuuban / caato fiican',
    somaliMeaning: 'Qof aan buurnayn oo dhuuban.',
    somaliExample: 'Wuxuu leeyahay jir dhuuban.',
    passageContext: 'The man is tall and slim...',
  },
  {
    id: 'vocab-beard',
    word: 'beard',
    partOfSpeech: 'noun',
    englishMeaning: 'The hair growing on the chin and lower cheeks of a man’s face.',
    englishExample: 'He has short dark hair and a neat beard.',
    germanWord: 'der Bart',
    germanMeaning: 'Haare am Kinn und an den Wangen eines Mannes.',
    germanExample: 'Er hat einen gepflegten Bart.',
    somaliWord: 'gadh / gar',
    somaliMeaning: 'Timaha ka baxa garka iyo dhabannada ninka.',
    somaliExample: 'Wuxuu leeyahay gadh madow.',
    passageContext: '...a beard, and he wears glasses.',
  },
  {
    id: 'vocab-glasses',
    word: 'glasses',
    partOfSpeech: 'noun (plural)',
    englishMeaning: 'A pair of lenses in a frame that rest on the nose and ears to correct vision.',
    englishExample: 'She puts on her reading glasses.',
    germanWord: 'die Brille',
    germanMeaning: 'Sehhilfe mit zwei Gläsern und Gestell.',
    germanExample: 'Er trägt eine Brille zum Lesen.',
    somaliWord: 'muraayado / muraayadaha aragga',
    somaliMeaning: 'Qalabka indhaha loo xidho si wax loo arko.',
    somaliExample: 'Wuxuu xidhaa muraayado.',
    passageContext: '...and he wears glasses.',
  },
  {
    id: 'vocab-short',
    word: 'short',
    partOfSpeech: 'adjective',
    englishMeaning: 'Measuring a small distance from head to toe (height).',
    englishExample: 'The woman is short and friendly.',
    germanWord: 'klein (Körpergröße)',
    germanMeaning: 'Geringe Körpergröße habend.',
    germanExample: 'Die Frau ist eher klein gewachsen.',
    somaliWord: 'gaaban (joog ahaan)',
    somaliMeaning: 'Qof aan dherer lahayn oo gaaban.',
    somaliExample: 'Haweeneydu waa gaaban tahay.',
    passageContext: 'The woman is short and a little heavy...',
  },
  {
    id: 'vocab-heavy',
    word: 'heavy',
    partOfSpeech: 'adjective',
    englishMeaning: 'Having relatively large body weight or stout build.',
    englishExample: 'She is a little heavy but very active.',
    germanWord: 'kräftig / mollig / schwer',
    germanMeaning: 'Ein höheres Körpergewicht oder kräftigen Bau habend.',
    germanExample: 'Sie ist etwas kräftiger gebaut.',
    somaliWord: 'xoogaa buuran / culus',
    somaliMeaning: 'Qof xoogaa miisaan leh ama buuran.',
    somaliExample: 'Waa xoogaa buuran tahay.',
    passageContext: 'The woman is short and a little heavy...',
  },
  {
    id: 'vocab-smile',
    word: 'smile',
    partOfSpeech: 'noun / verb',
    englishMeaning: 'A pleased, kind, or amused facial expression with upturned mouth corners.',
    englishExample: 'She has a bright and happy smile.',
    germanWord: 'das Lächeln / lächeln',
    germanMeaning: 'Ein fröhlicher oder freundlicher Gesichtsausdruck.',
    germanExample: 'Sie hat ein sehr freundliches Lächeln.',
    somaliWord: 'dhoolla-caddayn / dhoolla-tus',
    somaliMeaning: 'Muuqaalka wejiga ee muujinaya farxad iyo kalgacal.',
    somaliExample: 'Waxay leedahay dhoolla-caddayn farxad leh.',
    passageContext: '...and a happy smile.',
  },
  {
    id: 'vocab-tunic',
    word: 'tunic',
    partOfSpeech: 'noun',
    englishMeaning: 'A loose, long garment reaching typically down to the hips or thighs.',
    englishExample: 'She is wearing a comfortable light tunic shirt.',
    germanWord: 'die Tunika',
    germanMeaning: 'Ein locker fallendes, längeres Oberteil.',
    germanExample: 'Sie trägt ein helles Tunika-Shirt.',
    somaliWord: 'shaadh dheer (tunik)',
    somaliMeaning: 'Shaadh dabacsan oo dheer oo gaadha miskaha.',
    somaliExample: 'Waxay xidhan tahay shaadh dheer oo ifaya.',
    passageContext: 'She is wearing a light tunic shirt...',
  },
  {
    id: 'vocab-flat-shoes',
    word: 'flat shoes',
    partOfSpeech: 'noun phrase',
    englishMeaning: 'Shoes having little or no heel, designed for walking comfort.',
    englishExample: 'She prefers walking in flat shoes.',
    germanWord: 'flache Schuhe',
    germanMeaning: 'Bequeme Schuhe ohne Absatz.',
    germanExample: 'Sie trägt bequeme, flache Schuhe.',
    somaliWord: 'kabo fidsan (cidhib la’aan)',
    somaliMeaning: 'Kabo raaxo leh oo aan cidhib dheer lahayn.',
    somaliExample: 'Waxay xidhan tahay kabo fidsan oo raaxo leh.',
    passageContext: '...pants, and flat shoes.',
  },
];

export function findVocabularyByWord(rawWord: string): VocabularyEntry | undefined {
  const clean = rawWord.toLowerCase().replace(/[^a-z-]/g, '');
  return PUBLIC_VOCABULARY_LIST.find(
    (v) =>
      v.word.toLowerCase() === clean ||
      v.id.includes(clean) ||
      (clean === 'wear' && v.word === 'wears') ||
      (clean === 'shoe' && v.word === 'shoes') ||
      (clean === 'pant' && v.word === 'pants') ||
      (clean === 'glasses' && v.word === 'glasses')
  );
}
