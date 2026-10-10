/**
 * Context-aware dictionary and translation provider for Straightforward Elementary Reading Passages
 * Supports German (de), Swedish (sv), and Somali (so).
 * Every word includes grammatical context, meaning in context, and phonetic pronunciation hint.
 */

export type ReadingTranslationLang = 'de' | 'sv' | 'so';

export interface WordContextTranslation {
  word: string; // Base English word
  partOfSpeech: string; // e.g. 'noun', 'verb', 'adjective', 'number'
  contextMeaning: string; // Brief English explanation of how it is used in the sentence
  translations: {
    de: { translation: string; note?: string };
    sv: { translation: string; note?: string };
    so: { translation: string; note?: string };
  };
}

export const READING_WORD_DICTIONARY: Record<string, WordContextTranslation> = {
  // --- Names, Nouns, Places ---
  emily: {
    word: 'Emily',
    partOfSpeech: 'proper noun',
    contextMeaning: 'A woman\'s personal first name (the subject of the text).',
    translations: {
      de: { translation: 'Emily', note: 'Eigenname (weiblich)' },
      sv: { translation: 'Emily', note: 'Egennamn (kvinna)' },
      so: { translation: 'Emily', note: 'Magaca qofka (dheddig)' },
    },
  },
  years: {
    word: 'years',
    partOfSpeech: 'plural noun',
    contextMeaning: 'Units of age or time (here: "29 years old" / "three years ago").',
    translations: {
      de: { translation: 'Jahre', note: 'Plural von Jahr' },
      sv: { translation: 'år', note: 'Plural av år' },
      so: { translation: 'sano / sanadood', note: 'Wadarta sanad' },
    },
  },
  year: {
    word: 'year',
    partOfSpeech: 'noun',
    contextMeaning: 'Unit of 12 months or age.',
    translations: {
      de: { translation: 'Jahr' },
      sv: { translation: 'år' },
      so: { translation: 'sanad' },
    },
  },
  bristol: {
    word: 'Bristol',
    partOfSpeech: 'proper noun',
    contextMeaning: 'A major historic city in south-west England.',
    translations: {
      de: { translation: 'Bristol', note: 'Stadt in Südwest-England' },
      sv: { translation: 'Bristol', note: 'Stad i sydvästra England' },
      so: { translation: 'Bristol', note: 'Magaalo ku taal Ingiriiska' },
    },
  },
  england: {
    word: 'England',
    partOfSpeech: 'proper noun',
    contextMeaning: 'Country part of the United Kingdom.',
    translations: {
      de: { translation: 'England', note: 'Land in Großbritannien' },
      sv: { translation: 'England' },
      so: { translation: 'Ingiriiska' },
    },
  },
  english: {
    word: 'English',
    partOfSpeech: 'adjective',
    contextMeaning: 'Relating to England or British culture (here: "English tea").',
    translations: {
      de: { translation: 'englisch / englischer', note: 'z.B. englischer Tee' },
      sv: { translation: 'engelsk / engelskt', note: 't.ex. engelskt te' },
      so: { translation: 'Ingiriis / shaaha Ingiriiska' },
    },
  },
  tea: {
    word: 'tea',
    partOfSpeech: 'noun',
    contextMeaning: 'A hot beverage made by infusing dried crushed tea leaves in boiling water.',
    translations: {
      de: { translation: 'Tee', note: 'Heißgetränk' },
      sv: { translation: 'te' },
      so: { translation: 'shaah' },
    },
  },
  graphic: {
    word: 'graphic',
    partOfSpeech: 'adjective',
    contextMeaning: 'Relating to visual art, design, and digital images.',
    translations: {
      de: { translation: 'Grafik- / grafisch', note: 'bezogen auf Design' },
      sv: { translation: 'grafisk' },
      so: { translation: 'garaafik / naqshadeyn muuqaal' },
    },
  },
  designer: {
    word: 'designer',
    partOfSpeech: 'noun',
    contextMeaning: 'A professional person who plans the visual form or look of things.',
    translations: {
      de: { translation: 'Designer / Gestalter', note: 'Berufsbezeichnung' },
      sv: { translation: 'designer / formgivare' },
      so: { translation: 'naqshadeeye' },
    },
  },
  canada: {
    word: 'Canada',
    partOfSpeech: 'proper noun',
    contextMeaning: 'Country in North America.',
    translations: {
      de: { translation: 'Kanada' },
      sv: { translation: 'Kanada' },
      so: { translation: 'Kanada' },
    },
  },
  canadian: {
    word: 'Canadian',
    partOfSpeech: 'adjective',
    contextMeaning: 'From or belonging to Canada (here: "Canadian boyfriend").',
    translations: {
      de: { translation: 'kanadisch / Kanadier', note: 'kanadischer Freund' },
      sv: { translation: 'kanadensisk' },
      so: { translation: 'u dhashay Kanada / reer Kanada' },
    },
  },
  vancouver: {
    word: 'Vancouver',
    partOfSpeech: 'proper noun',
    contextMeaning: 'A major coastal city in British Columbia, Canada.',
    translations: {
      de: { translation: 'Vancouver', note: 'Großstadt in Westkanada' },
      sv: { translation: 'Vancouver' },
      so: { translation: 'Vancouver', note: 'Magaalo weyn oo Kanada ku taal' },
    },
  },
  apartment: {
    word: 'apartment',
    partOfSpeech: 'noun',
    contextMeaning: 'A suite of rooms forming one separate residence in a larger building (flat).',
    translations: {
      de: { translation: 'Wohnung / Apartment', note: 'Mietwohnung' },
      sv: { translation: 'lägenhet' },
      so: { translation: 'guri dabaq ah / dabaq' },
    },
  },
  floor: {
    word: 'floor',
    partOfSpeech: 'noun',
    contextMeaning: 'A storey or level of a building (here: "tenth floor").',
    translations: {
      de: { translation: 'Stockwerk / Etage', note: 'zehnter Stock' },
      sv: { translation: 'våning' },
      so: { translation: 'dabaq / dabaqa 10-aad' },
    },
  },
  tenth: {
    word: 'tenth',
    partOfSpeech: 'ordinal number',
    contextMeaning: 'Position number 10 (10th).',
    translations: {
      de: { translation: 'zehnte / zehnter' },
      sv: { translation: 'tionde' },
      so: { translation: 'tobnaad' },
    },
  },
  view: {
    word: 'view',
    partOfSpeech: 'noun',
    contextMeaning: 'What can be seen from a specific window or location.',
    translations: {
      de: { translation: 'Aussicht / Blick', note: 'Blick auf die Berge' },
      sv: { translation: 'utsikt' },
      so: { translation: 'muuqaal / daawasho' },
    },
  },
  mountains: {
    word: 'mountains',
    partOfSpeech: 'plural noun',
    contextMeaning: 'Large natural elevations of the earth\'s surface rising abruptly.',
    translations: {
      de: { translation: 'Berge / Gebirge' },
      sv: { translation: 'berg' },
      so: { translation: 'buuro' },
    },
  },
  mountain: {
    word: 'mountain',
    partOfSpeech: 'noun',
    contextMeaning: 'Large natural elevation of the earth.',
    translations: {
      de: { translation: 'Berg' },
      sv: { translation: 'berg' },
      so: { translation: 'buur' },
    },
  },
  city: {
    word: 'city',
    partOfSpeech: 'noun',
    contextMeaning: 'A large town.',
    translations: {
      de: { translation: 'Stadt / Großstadt' },
      sv: { translation: 'stad' },
      so: { translation: 'magaalo' },
    },
  },
  park: {
    word: 'park',
    partOfSpeech: 'noun',
    contextMeaning: 'A large public garden or green area for recreation.',
    translations: {
      de: { translation: 'Park / Grünanlage' },
      sv: { translation: 'park' },
      so: { translation: 'beerta nasashada / baarkin nasasho' },
    },
  },
  work: {
    word: 'work',
    partOfSpeech: 'noun / verb',
    contextMeaning: 'Job activity or workplace (here: "after work" & "bus to work").',
    translations: {
      de: { translation: 'Arbeit / arbeiten', note: 'nach der Arbeit' },
      sv: { translation: 'arbete / jobb' },
      so: { translation: 'shaqo / shaqada kadib' },
    },
  },
  boyfriend: {
    word: 'boyfriend',
    partOfSpeech: 'noun',
    contextMeaning: 'A regular male romantic partner.',
    translations: {
      de: { translation: 'fester Freund / Lebenspartner' },
      sv: { translation: 'pojkvän' },
      so: { translation: 'saaxiib jacayl (wiil)' },
    },
  },
  bus: {
    word: 'bus',
    partOfSpeech: 'noun',
    contextMeaning: 'A large motor vehicle carrying passengers by road.',
    translations: {
      de: { translation: 'Bus' },
      sv: { translation: 'buss' },
      so: { translation: 'bas' },
    },
  },
  office: {
    word: 'office',
    partOfSpeech: 'noun',
    contextMeaning: 'A room or building used as a place of business.',
    translations: {
      de: { translation: 'Büro / Arbeitsplatz' },
      sv: { translation: 'kontor' },
      so: { translation: 'xafiis' },
    },
  },
  weather: {
    word: 'weather',
    partOfSpeech: 'noun',
    contextMeaning: 'State of the atmosphere with respect to wind, temperature, cloudiness, and rain/snow.',
    translations: {
      de: { translation: 'Wetter' },
      sv: { translation: 'väder' },
      so: { translation: 'cimilo / cimilada' },
    },
  },
  winter: {
    word: 'winter',
    partOfSpeech: 'noun',
    contextMeaning: 'The coldest season of the year, between autumn and spring.',
    translations: {
      de: { translation: 'Winter' },
      sv: { translation: 'vinter' },
      so: { translation: 'jiilaal / xilliga qabowga' },
    },
  },
  summer: {
    word: 'summer',
    partOfSpeech: 'noun',
    contextMeaning: 'The warmest season of the year, between spring and autumn.',
    translations: {
      de: { translation: 'Sommer' },
      sv: { translation: 'sommar' },
      so: { translation: 'xagaa / xilliga kuleylka' },
    },
  },
  family: {
    word: 'family',
    partOfSpeech: 'noun',
    contextMeaning: 'Parents, siblings, and other relatives.',
    translations: {
      de: { translation: 'Familie' },
      sv: { translation: 'familj' },
      so: { translation: 'qoys / reer' },
    },
  },
  friends: {
    word: 'friends',
    partOfSpeech: 'plural noun',
    contextMeaning: 'Close companions bonded by mutual affection.',
    translations: {
      de: { translation: 'Freunde / Freundinnen' },
      sv: { translation: 'vänner' },
      so: { translation: 'saaxiibo' },
    },
  },
  friend: {
    word: 'friend',
    partOfSpeech: 'noun',
    contextMeaning: 'Close companion.',
    translations: {
      de: { translation: 'Freund / Freundin' },
      sv: { translation: 'vän' },
      so: { translation: 'saaxiib' },
    },
  },

  // --- Verbs (Inflected & Base forms) ---
  is: {
    word: 'is',
    partOfSpeech: 'verb (to be)',
    contextMeaning: 'Third-person singular present of "be" (here: "Emily is 29").',
    translations: {
      de: { translation: 'ist', note: 'Form von sein' },
      sv: { translation: 'är', note: 'Form av vara' },
      so: { translation: 'waa / waxa ay tahay' },
    },
  },
  comes: {
    word: 'comes',
    partOfSpeech: 'verb',
    contextMeaning: 'Third-person singular of "come" (here: "comes from" = originates from).',
    translations: {
      de: { translation: 'stammt / kommt', note: 'kommt aus' },
      sv: { translation: 'kommer', note: 'kommer från' },
      so: { translation: 'ka timaadaa' },
    },
  },
  moved: {
    word: 'moved',
    partOfSpeech: 'past verb',
    contextMeaning: 'Changed residence or country ("moved to Canada").',
    translations: {
      de: { translation: 'zog / ist umgezogen', note: 'Vergangenheitsform' },
      sv: { translation: 'flyttade' },
      so: { translation: 'u guurtay' },
    },
  },
  lives: {
    word: 'lives',
    partOfSpeech: 'verb',
    contextMeaning: 'Third-person singular of "live" (resides permanently).',
    translations: {
      de: { translation: 'wohnt / lebt' },
      sv: { translation: 'bor / lever' },
      so: { translation: 'ku nooshahay' },
    },
  },
  has: {
    word: 'has',
    partOfSpeech: 'verb',
    contextMeaning: 'Third-person singular of "have" (possesses or features).',
    translations: {
      de: { translation: 'hat', note: 'Form von haben' },
      sv: { translation: 'har' },
      so: { translation: 'leedahay / waxay leedahay' },
    },
  },
  walks: {
    word: 'walks',
    partOfSpeech: 'verb',
    contextMeaning: 'Third-person singular of "walk" (moves on foot for exercise/leisure).',
    translations: {
      de: { translation: 'spaziert / geht zu Fuß' },
      sv: { translation: 'promenerar / går' },
      so: { translation: 'socotaa / socod ku tagtaa' },
    },
  },
  takes: {
    word: 'takes',
    partOfSpeech: 'verb',
    contextMeaning: 'Uses transport (here: "takes the bus" = travels by bus).',
    translations: {
      de: { translation: 'nimmt', note: 'nimmt den Bus' },
      sv: { translation: 'tar', note: 'tar bussen' },
      so: { translation: 'raacdaa', note: 'baska ayey raacdaa' },
    },
  },
  snows: {
    word: 'snows',
    partOfSpeech: 'verb',
    contextMeaning: 'Atmospheric water vapor freezes and falls as white flakes.',
    translations: {
      de: { translation: 'schneit', note: 'es schneit' },
      sv: { translation: 'snöar' },
      so: { translation: 'baraf da\'aa' },
    },
  },
  goes: {
    word: 'goes',
    partOfSpeech: 'verb',
    contextMeaning: 'Third-person singular of "go" (travels or engages in activity).',
    translations: {
      de: { translation: 'geht / fährt', note: 'geht Skifahren / Wandern' },
      sv: { translation: 'åker / går' },
      so: { translation: 'tagtaa / aadaa' },
    },
  },
  skiing: {
    word: 'skiing',
    partOfSpeech: 'noun / gerund',
    contextMeaning: 'The sport or activity of gliding on snow on skis.',
    translations: {
      de: { translation: 'Skifahren' },
      sv: { translation: 'skidåkning' },
      so: { translation: 'baraf ku simbiriirixasho' },
    },
  },
  hiking: {
    word: 'hiking',
    partOfSpeech: 'noun / gerund',
    contextMeaning: 'The activity of going for long walks in the countryside or mountains.',
    translations: {
      de: { translation: 'Wandern' },
      sv: { translation: 'vandring' },
      so: { translation: 'buuro fuulid / socod buureed' },
    },
  },
  loves: {
    word: 'loves',
    partOfSpeech: 'verb',
    contextMeaning: 'Third-person singular of "love" (likes very much).',
    translations: {
      de: { translation: 'liebt', note: 'mag sehr' },
      sv: { translation: 'älskar' },
      so: { translation: 'jeceshahay' },
    },
  },
  misses: {
    word: 'misses',
    partOfSpeech: 'verb',
    contextMeaning: 'Feels sorrow or longing for the absence of someone or something.',
    translations: {
      de: { translation: 'vermisst', note: 'sehnt sich nach' },
      sv: { translation: 'saknar' },
      so: { translation: 'u xiistaa / tabaysaa' },
    },
  },

  // --- Adjectives & Adverbs ---
  old: {
    word: 'old',
    partOfSpeech: 'adjective',
    contextMeaning: 'Having lived for a specified period (here: "29 years old").',
    translations: {
      de: { translation: 'alt', note: '29 Jahre alt' },
      sv: { translation: 'gammal / år gammal' },
      so: { translation: 'jir / 29 jir' },
    },
  },
  now: {
    word: 'now',
    partOfSpeech: 'adverb',
    contextMeaning: 'At the present time.',
    translations: {
      de: { translation: 'jetzt / nun' },
      sv: { translation: 'nu' },
      so: { translation: 'hadda' },
    },
  },
  beautiful: {
    word: 'beautiful',
    partOfSpeech: 'adjective',
    contextMeaning: 'Pleasing the senses visually (here: "beautiful view").',
    translations: {
      de: { translation: 'wunderschön / herrlich' },
      sv: { translation: 'vacker / underbar' },
      so: { translation: 'qurux badan' },
    },
  },
  near: {
    word: 'near',
    partOfSpeech: 'preposition / adjective',
    contextMeaning: 'Close to; at a short distance from.',
    translations: {
      de: { translation: 'in der Nähe von / nahe' },
      sv: { translation: 'nära' },
      so: { translation: 'u dhow' },
    },
  },
  after: {
    word: 'after',
    partOfSpeech: 'preposition',
    contextMeaning: 'Following in time (here: "after work").',
    translations: {
      de: { translation: 'nach', note: 'nach der Arbeit' },
      sv: { translation: 'efter' },
      so: { translation: 'kadib / shaqada kadib' },
    },
  },
  often: {
    word: 'often',
    partOfSpeech: 'adverb of frequency',
    contextMeaning: 'Frequently; many times.',
    translations: {
      de: { translation: 'oft / häufig' },
      sv: { translation: 'ofta' },
      so: { translation: 'marar badan / badanaa' },
    },
  },
  because: {
    word: 'because',
    partOfSpeech: 'conjunction',
    contextMeaning: 'For the reason that.',
    translations: {
      de: { translation: 'weil / da' },
      sv: { translation: 'eftersom / för att' },
      so: { translation: 'sababtoo ah' },
    },
  },
  far: {
    word: 'far',
    partOfSpeech: 'adverb / adjective',
    contextMeaning: 'At a great distance (here: "far away").',
    translations: {
      de: { translation: 'weit', note: 'weit weg' },
      sv: { translation: 'långt', note: 'långt borta' },
      so: { translation: 'fog / aad u fog' },
    },
  },
  away: {
    word: 'away',
    partOfSpeech: 'adverb',
    contextMeaning: 'At a distance from a place (here: "far away").',
    translations: {
      de: { translation: 'weg / entfernt' },
      sv: { translation: 'bort / borta' },
      so: { translation: 'meel fog' },
    },
  },
  colder: {
    word: 'colder',
    partOfSpeech: 'comparative adjective',
    contextMeaning: 'Lower in temperature than another place.',
    translations: {
      de: { translation: 'kälter', note: 'kälter als in England' },
      sv: { translation: 'kallare' },
      so: { translation: 'ka qabow badan' },
    },
  },
  than: {
    word: 'than',
    partOfSpeech: 'conjunction',
    contextMeaning: 'Used to introduce the second element in a comparison (colder than).',
    translations: {
      de: { translation: 'als', note: 'kälter als' },
      sv: { translation: 'än', note: 'kallare än' },
      so: { translation: 'in ka badan / marka loo eego' },
    },
  },
  three: {
    word: 'three',
    partOfSpeech: 'cardinal number',
    contextMeaning: 'Number 3.',
    translations: {
      de: { translation: 'drei' },
      sv: { translation: 'tre' },
      so: { translation: 'saddex' },
    },
  },
  29: {
    word: '29 (twenty-nine)',
    partOfSpeech: 'number',
    contextMeaning: 'Age number 29.',
    translations: {
      de: { translation: 'neunundzwanzig (29)' },
      sv: { translation: 'tjugonio (29)' },
      so: { translation: 'labaatan iyo sagaal (29)' },
    },
  },
  ago: {
    word: 'ago',
    partOfSpeech: 'adverb',
    contextMeaning: 'Before the present time (here: "three years ago").',
    translations: {
      de: { translation: 'vor', note: 'vor drei Jahren' },
      sv: { translation: 'sedan', note: 'för tre år sedan' },
      so: { translation: 'ka hor / saddex sano ka hor' },
    },
  },
  but: {
    word: 'but',
    partOfSpeech: 'conjunction',
    contextMeaning: 'Introduces a contrasting idea.',
    translations: {
      de: { translation: 'aber' },
      sv: { translation: 'men' },
      so: { translation: 'laakiin' },
    },
  },
  and: {
    word: 'and',
    partOfSpeech: 'conjunction',
    contextMeaning: 'Connects words, clauses, or sentences.',
    translations: {
      de: { translation: 'und' },
      sv: { translation: 'och' },
      so: { translation: 'iyo' },
    },
  },
  in: {
    word: 'in',
    partOfSpeech: 'preposition',
    contextMeaning: 'Inside or situated within (here: in Vancouver / in an apartment / in winter).',
    translations: {
      de: { translation: 'in / im' },
      sv: { translation: 'i' },
      so: { translation: 'ku / gudaheeda' },
    },
  },
  on: {
    word: 'on',
    partOfSpeech: 'preposition',
    contextMeaning: 'Supported by or situated at (here: "on the tenth floor").',
    translations: {
      de: { translation: 'im / auf', note: 'im zehnten Stock' },
      sv: { translation: 'på', note: 'på tionde våningen' },
      so: { translation: 'korkiisa / dabaqa' },
    },
  },
  with: {
    word: 'with',
    partOfSpeech: 'preposition',
    contextMeaning: 'Accompanied by (here: "with her boyfriend").',
    translations: {
      de: { translation: 'mit' },
      sv: { translation: 'med' },
      so: { translation: 'la / isaga iyo iyada' },
    },
  },
  from: {
    word: 'from',
    partOfSpeech: 'preposition',
    contextMeaning: 'Indicating origin (here: "from Bristol").',
    translations: {
      de: { translation: 'aus / von' },
      sv: { translation: 'från' },
      so: { translation: 'ka yimid / laga soo bilaabo' },
    },
  },
  to: {
    word: 'to',
    partOfSpeech: 'preposition',
    contextMeaning: 'Expressing destination or direction (here: "moved to Canada" / "bus to work").',
    translations: {
      de: { translation: 'nach / zu', note: 'nach Kanada' },
      sv: { translation: 'till' },
      so: { translation: 'ilaa / xagga' },
    },
  },
  of: {
    word: 'of',
    partOfSpeech: 'preposition',
    contextMeaning: 'Expressing belonging, connection, or view (here: "view of the mountains").',
    translations: {
      de: { translation: 'von / auf', note: 'Blick auf' },
      sv: { translation: 'av / över', note: 'utsikt över' },
      so: { translation: 'ee' },
    },
  },
  she: {
    word: 'she',
    partOfSpeech: 'subject pronoun',
    contextMeaning: 'Refers to the female subject (Emily).',
    translations: {
      de: { translation: 'sie' },
      sv: { translation: 'hon' },
      so: { translation: 'iyada' },
    },
  },
  her: {
    word: 'her',
    partOfSpeech: 'possessive adjective / pronoun',
    contextMeaning: 'Belonging to a woman (here: "her apartment", "her boyfriend", "her family").',
    translations: {
      de: { translation: 'ihr / ihre', note: 'ihre Wohnung' },
      sv: { translation: 'hennes' },
      so: { translation: 'keeda / waxa ay leedahay' },
    },
  },
  it: {
    word: 'it',
    partOfSpeech: 'pronoun',
    contextMeaning: 'Refers to a thing or condition (here: "it is near a park", "it snows").',
    translations: {
      de: { translation: 'es', note: 'es liegt in der Nähe' },
      sv: { translation: 'det / den' },
      so: { translation: 'waxay / ay' },
    },
  },
  the: {
    word: 'the',
    partOfSpeech: 'definite article',
    contextMeaning: 'Refers to specific known objects or places.',
    translations: {
      de: { translation: 'der / die / das / den' },
      sv: { translation: 'den / det (bestämd form)' },
      so: { translation: 'ka / ta (qodob go\'an)' },
    },
  },
  a: {
    word: 'a / an',
    partOfSpeech: 'indefinite article',
    contextMeaning: 'Singular indefinite article (here: "a graphic designer", "an apartment").',
    translations: {
      de: { translation: 'ein / eine' },
      sv: { translation: 'en / ett' },
      so: { translation: 'mid (wax aan go\'anayn)' },
    },
  },
  an: {
    word: 'an',
    partOfSpeech: 'indefinite article',
    contextMeaning: 'Used before vowel sounds (here: "an apartment").',
    translations: {
      de: { translation: 'ein / eine' },
      sv: { translation: 'en / ett' },
      so: { translation: 'mid' },
    },
  },
};

/**
 * Normalizes an English token (lowercased, stripped of trailing punctuation).
 */
export function normalizeReadingToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
    .trim();
}

/**
 * Looks up contextual translation for a selected word.
 * Falls back to clean grammatical message if not present.
 */
export function lookupWordTranslation(rawWord: string): WordContextTranslation | null {
  const norm = normalizeReadingToken(rawWord);
  if (!norm) return null;

  if (READING_WORD_DICTIONARY[norm]) {
    return READING_WORD_DICTIONARY[norm];
  }

  // Common singular/plural or tense base fallback
  if (norm.endsWith('s') && READING_WORD_DICTIONARY[norm.slice(0, -1)]) {
    return READING_WORD_DICTIONARY[norm.slice(0, -1)];
  }

  return null;
}
