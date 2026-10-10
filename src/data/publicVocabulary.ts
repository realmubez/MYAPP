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

  passageContext?: string;
}

export const PUBLIC_VOCABULARY_LIST: VocabularyEntry[] = [
  {
    id: 'vocab-tall',
    word: 'tall',
    partOfSpeech: 'adjective',
    englishMeaning: 'Of great or more than average height.',
    englishExample: 'The man is tall and slim.',
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
    englishMeaning: 'Gracefully thin, slender in an attractive and fit way.',
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
    englishMeaning: 'Approximately or roughly (used with age, time, or quantity).',
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
    englishMeaning: 'Measuring a small distance from head to toe (height) or small length.',
    englishExample: 'The woman is short and friendly.',
    germanWord: 'klein (Körpergröße) / kurz',
    germanMeaning: 'Geringe Körpergröße habend oder von kurzer Dauer.',
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
    id: 'vocab-flat',
    word: 'flat',
    partOfSpeech: 'adjective',
    englishMeaning: 'Having a level surface without raised parts or heels.',
    englishExample: 'She wears flat shoes for walking.',
    germanWord: 'flach (ohne Absatz)',
    germanMeaning: 'Ebene Fläche ohne erhöhten Absatz.',
    germanExample: 'Sie trägt flache Schuhe.',
    somaliWord: 'fidsan (cidhib la’aan)',
    somaliMeaning: 'Kabo toosan oo aan cidhib taagan lahayn.',
    somaliExample: 'Waxay xidhataa kabo fidsan.',
    passageContext: '...pants, and flat shoes.',
  },
  {
    id: 'vocab-hair',
    word: 'hair',
    partOfSpeech: 'noun',
    englishMeaning: 'The fine thread-like strands growing from the skin of humans, especially on the head.',
    englishExample: 'He has short dark hair.',
    germanWord: 'die Haare / das Haar',
    germanMeaning: 'Fadenförmige Hornfäden auf dem Kopf.',
    germanExample: 'Er hat kurze dunkle Haare.',
    somaliWord: 'timo / timaha',
    somaliMeaning: 'Dunta dabiiciga ah ee madaxa ka baxda.',
    somaliExample: 'Wuxuu leeyahay timo gaagaaban.',
    passageContext: '...short dark hair and a beard...',
  },
  {
    id: 'vocab-dark',
    word: 'dark',
    partOfSpeech: 'adjective',
    englishMeaning: 'With little or no light; of a deep shade approaching black.',
    englishExample: 'He is wearing a dark T-shirt.',
    germanWord: 'dunkel',
    germanMeaning: 'Wenig Licht aufweisend oder ein tiefer Farbton.',
    germanExample: 'Er trägt ein dunkles T-Shirt.',
    somaliWord: 'madow / gudcur',
    somaliMeaning: 'Midab adag oo iftiin yar leh ama xiga madowga.',
    somaliExample: 'Wuxuu xidhan yahay funaanad madow.',
    passageContext: '...wearing a dark T-shirt...',
  },
];

export function findVocabularyByWord(rawWord: string): VocabularyEntry | undefined {
  const clean = rawWord.toLowerCase().replace(/[^a-z-]/g, '');
  if (!clean) return undefined;

  return PUBLIC_VOCABULARY_LIST.find((v) => {
    const vWord = v.word.toLowerCase();
    if (vWord === clean) return true;
    if (v.id === `vocab-${clean}`) return true;

    // Stemming and variation matching
    if (clean === 'wear' && (vWord === 'wears' || vWord === 'wearing')) return true;
    if (clean === 'wears' && vWord === 'wears') return true;
    if (clean === 'wearing' && vWord === 'wearing') return true;
    if (clean === 'shoe' && vWord === 'shoes') return true;
    if (clean === 'shoes' && vWord === 'shoes') return true;
    if (clean === 'pant' && vWord === 'pants') return true;
    if (clean === 'pants' && vWord === 'pants') return true;
    if (clean === 'glasses' && vWord === 'glasses') return true;
    if (clean === 'smiles' && vWord === 'smile') return true;
    if (clean === 'smiling' && vWord === 'smile') return true;
    if (clean === 'beards' && vWord === 'beard') return true;

    return false;
  });
}
