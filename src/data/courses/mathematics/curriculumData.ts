export interface MathExercise {
  id: string;
  title: string;
  latexQuestion: string; // rendered with KaTeX
  instructionDe: string; // Simple German A2 instruction
  instructionSo?: string; // Somali helper translation
  placeholder: string;
  expectedAnswer: string; // The canonical answer
  alternateAnswers?: string[];
  hintDe: string;
  hintSo?: string;
  explanationDe: string; // Why this works (German A2)
  explanationSo?: string; // Somali translation
  steps: {
    latex?: string;
    textDe: string;
    textSo?: string;
  }[];
}

export interface MathSection {
  id: string;
  number: number;
  titleDe: string;
  titleSo: string;
  summaryDe: string;
  summarySo: string;
  ruleLatex?: string;
  workedExample: {
    problemLatex: string;
    solutionLatex: string;
    explanationDe: string;
    explanationSo: string;
    steps: {
      latex?: string;
      de: string;
      so: string;
    }[];
  };
  exercises: MathExercise[];
}

export const MATH_SECTIONS: MathSection[] = [
  // Section 1: Ganze Zahlen
  {
    id: 'ganze-zahlen',
    number: 1,
    titleDe: '1. Ganze Zahlen (Positive & Negative Zahlen)',
    titleSo: '1. Tirooyinka Dhan (Togan & Taban)',
    summaryDe: 'Ganze Zahlen sind positive Zahlen, negative Zahlen und die Null. Auf dem Zahlenstrahl liegen negative Zahlen links von der Null.',
    summarySo: 'Tirooyinka dhan waa tirooyinka togan (+), taban (-) iyo eber (0). Khadka tirooyinka waxay xagga bidix kaga yaallaan eber.',
    ruleLatex: '\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots',
    workedExample: {
      problemLatex: '\\text{Welche Zahl ist kleiner: } -5 \\text{ oder } -2?',
      solutionLatex: '-5 < -2',
      explanationDe: 'Auf dem Zahlenstrahl liegt -5 weiter links als -2. Deshalb ist -5 kleiner als -2.',
      explanationSo: 'Khadka tirooyinka -5 waxay xagga bidix kaga sii fog tahay -2. Sidaa darteed -5 ayaa ka yar -2.',
      steps: [
        {
          latex: '-5 \\text{ liegt links von } -2',
          de: 'Je weiter links eine Zahl auf dem Zahlenstrahl liegt, desto kleiner ist sie.',
          so: 'Tiro kasta oo bidixda u sii janjeerta, way ka sii yaraysaa.',
        },
        {
          latex: '-5 < -2',
          de: 'Deshalb ist -5 kleiner als -2.',
          so: 'Sidaa darteed -5 waxay ka yar tahay -2.',
        },
      ],
    },
    exercises: [
      {
        id: 'gz-1',
        title: 'Vergleich ganzer Zahlen',
        latexQuestion: '\\text{Was ist kleiner: } -8 \\text{ oder } -3?',
        instructionDe: 'Schreibe die kleinere Zahl auf.',
        instructionSo: 'Qor tirada ka yar labadooda.',
        placeholder: 'z. B. -8',
        expectedAnswer: '-8',
        hintDe: 'Denke an ein Thermometer: Was ist kälter: -8 Grad oder -3 Grad?',
        hintSo: 'U feker sida heer-kulbeegga: kee qabow badan: -8 mise -3?',
        explanationDe: '-8 liegt auf dem Zahlenstrahl weiter links als -3. Deshalb ist -8 kleiner als -3.',
        explanationSo: '-8 waxay ku taallaa bidixda -3, marka waa ka yar tahay.',
        steps: [
          {
            latex: '-8 < -3',
            textDe: '-8 ist weiter von der Null nach links entfernt als -3.',
            textSo: '-8 waxay eber ka xigtaa dhanka bidix marka loo eego -3.',
          },
          {
            latex: '\\text{Ergebnis: } -8',
            textDe: 'Die kleinere Zahl ist -8.',
            textSo: 'Tirada yar waa -8.',
          },
        ],
      },
      {
        id: 'gz-2',
        title: 'Gegenzahl finden',
        latexQuestion: '\\text{Was ist die Gegenzahl von } -7?',
        instructionDe: 'Die Gegenzahl hat denselben Abstand zu 0, aber das andere Vorzeichen.',
        instructionSo: 'Tirada liddiga ku ah waxay leedahay calaamad ka soo horjeedda.',
        placeholder: 'z. B. 7',
        expectedAnswer: '7',
        alternateAnswers: ['+7'],
        hintDe: 'Aus Minus wird Plus. Welche Zahl liegt gegenüber von -7?',
        hintSo: 'Ka dhig calaamad togan (+). Waa maxay liddiga -7?',
        explanationDe: 'Die Gegenzahl von -7 ist +7 (oder einfach 7).',
        explanationSo: 'Liddiga -7 waa 7 togan (+7).',
        steps: [
          {
            latex: '-(-7) = 7',
            textDe: 'Zwei Minuszeichen heben sich auf: die Gegenzahl ist +7.',
            textSo: 'Labo calaamadood oo kala dhimis waxay isu beddelaan togan: waa 7.',
          },
        ],
      },
    ],
  },

  // Section 2: Addieren und Subtrahieren
  {
    id: 'addieren-subtrahieren',
    number: 2,
    titleDe: '2. Addieren und Subtrahieren mit Vorzeichen',
    titleSo: '2. Isku-darka iyo Kala-goynta Calaamadaha leh',
    summaryDe: 'Gleiche Vorzeichen werden addiert (Guthaben wächst oder Schulden wachsen). Verschiedene Vorzeichen werden subtrahiert.',
    summarySo: 'Haddii ay calaamaduhu isku mid yihiin, isku dar oo qaado calaamadda. Haddii ay kala duwan yihiin, kala gooy oo qaado calaamadda tirada weyn.',
    ruleLatex: '(-a) + (-b) = -(a+b) \\quad | \\quad (-a) - (-b) = -a + b',
    workedExample: {
      problemLatex: '(-12) + (-8) = ?',
      solutionLatex: '(-12) + (-8) = -20',
      explanationDe: 'Du hast 12 Euro Schulden und machst noch 8 Euro Schulden. Zusammen hast du 20 Euro Schulden.',
      explanationSo: 'Waxaad qabtaa 12 deyn ah waxaana ku darsamay 8 deyn ah. Wadarta waa 20 deyn (-20).',
      steps: [
        {
          latex: '12 + 8 = 20',
          de: 'Addiere die Zahlen: 12 + 8 = 20.',
          so: 'Isku dar tirooyinka: 12 + 8 = 20.',
        },
        {
          latex: '-(20) = -20',
          de: 'Weil beide Zahlen negativ sind, bleibt das Minuszeichen: -20.',
          so: 'Maadaama labaduba ay taban yihiin, calaamaddu waa taban: -20.',
        },
      ],
    },
    exercises: [
      {
        id: 'as-1',
        title: 'Gleiche Vorzeichen addieren',
        latexQuestion: '(-15) + (-6) = ?',
        instructionDe: 'Rechne die Aufgabe aus.',
        instructionSo: 'Xisaabi wadarta labada tiro ee taban.',
        placeholder: 'z. B. -21',
        expectedAnswer: '-21',
        hintDe: 'Beide Zahlen haben ein Minus (-). Addiere 15 und 6 und setze ein Minus davor.',
        hintSo: 'Labaduba waa taban (-). Isku dar 15 iyo 6 dabadeed raaci calaamadda dhimista.',
        explanationDe: 'Minus und Minus beim Zusammenzählen bleibt Minus. 15 + 6 = 21, also -21.',
        explanationSo: '15 iyo 6 isku darkoodu waa 21, maadaama ay labaduba taban yihiin waa -21.',
        steps: [
          {
            latex: '15 + 6 = 21',
            textDe: 'Addiere die Beträge ohne Vorzeichen: 15 + 6 = 21.',
            textSo: 'Isku dar adigoo calaamadaha iska daaya: 15 + 6 = 21.',
          },
          {
            latex: '(-15) + (-6) = -21',
            textDe: 'Setze das gemeinsame Minuszeichen davor: -21.',
            textSo: 'Hore kaga dar calaamadda dhimista: -21.',
          },
        ],
      },
      {
        id: 'as-2',
        title: 'Minus und Minus wird Plus (Subtraktion)',
        latexQuestion: '(-14) - (-9) = ?',
        instructionDe: 'Löse zuerst die doppelte Klammer auf: - (-9) wird zu + 9.',
        instructionSo: 'Kala bixi calaamadda: laba calaamadood oo dhimis ah waxay noqdaan togan (+).',
        placeholder: 'z. B. -5',
        expectedAnswer: '-5',
        hintDe: 'Minus mal Minus ergibt Plus: Die Rechnung wird zu -14 + 9.',
        hintSo: '- (-9) waxay noqonaysaa + 9. Xisaabi: -14 + 9.',
        explanationDe: '- (-9) wird zu + 9. Also rechnest du -14 + 9 = -5.',
        explanationSo: '-14 + 9 waxay la mid tahay -5.',
        steps: [
          {
            latex: '(-14) - (-9) = -14 + 9',
            textDe: 'Aus minus minus wird plus.',
            textSo: 'Laba dhimis isku xigta waxay noqdaan togan.',
          },
          {
            latex: '-14 + 9 = -5',
            textDe: '14 Schulden minus 9 Guthaben = 5 Schulden übrig (-5).',
            textSo: '14 deyn ah oo aad 9 ka bixisay waxa kugu haraya 5 deyn ah (-5).',
          },
        ],
      },
      {
        id: 'as-3',
        title: 'Ungleiche Vorzeichen',
        latexQuestion: '25 + (-32) = ?',
        instructionDe: 'Rechne aus.',
        instructionSo: 'Xisaabi tiradan togan iyo midda taban.',
        placeholder: 'z. B. -7',
        expectedAnswer: '-7',
        hintDe: 'Die größere Zahl (32) hat ein Minus. Das Ergebnis muss negativ sein.',
        hintSo: 'Tirada weyn (32) waxay wadataa calaamadda taban (-). Natiijadu waa taban.',
        explanationDe: '32 - 25 = 7. Weil 32 negativ war, lautet das Ergebnis -7.',
        explanationSo: '32 - 25 = 7. Maadaama 32 ay taban tahay, jawaabtu waa -7.',
        steps: [
          {
            latex: '32 - 25 = 7',
            textDe: 'Ziehe die kleinere Zahl von der größeren ab: 32 - 25 = 7.',
            textSo: 'Tirada yar ka jar midda weyn: 32 - 25 = 7.',
          },
          {
            latex: '25 + (-32) = -7',
            textDe: 'Übernimm das Vorzeichen der betragsmäßig größeren Zahl: -7.',
            textSo: 'Qaado calaamadda tirada weyn: -7.',
          },
        ],
      },
    ],
  },

  // Section 3: Multiplizieren und Dividieren mit Vorzeichen
  {
    id: 'multiplizieren-dividieren',
    number: 3,
    titleDe: '3. Multiplizieren und Dividieren mit Vorzeichen',
    titleSo: '3. Isku-dhufashada iyo Isu-qaybinta Calaamadaha leh',
    summaryDe: 'Gleiche Vorzeichen ergeben Plus (+). Ungleiche Vorzeichen ergeben Minus (-).',
    summarySo: 'Calaamado isku mid ah waxay bixiyaan Togan (+). Calaamado kala duwan waxay bixiyaan Taban (-).',
    ruleLatex: '(+) \\cdot (+) = + \\quad | \\quad (-) \\cdot (-) = + \\quad | \\quad (+) \\cdot (-) = - \\quad | \\quad (-) \\cdot (+) = -',
    workedExample: {
      problemLatex: '(-4) \\cdot (-6) = ?',
      solutionLatex: '(-4) \\cdot (-6) = 24',
      explanationDe: 'Minus mal Minus ergibt Plus. 4 mal 6 ist 24.',
      explanationSo: 'Taban ku dhufo taban waxay noqotaa togan. 4 ku dhufo 6 waa 24.',
      steps: [
        {
          latex: '4 \\cdot 6 = 24',
          de: 'Multipliziere die Zahlen: 4 · 6 = 24.',
          so: 'Isku dhufo tirooyinka: 4 · 6 = 24.',
        },
        {
          latex: '(-) \\cdot (-) = (+)',
          de: 'Zwei Minuszeichen ergeben immer Plus: +24 oder einfach 24.',
          so: 'Labo calaamadood oo taban waxay bixiyaan togan: 24.',
        },
      ],
    },
    exercises: [
      {
        id: 'md-1',
        title: 'Minus mal Minus',
        latexQuestion: '(-7) \\cdot (-5) = ?',
        instructionDe: 'Multipliziere mit Vorzeichen.',
        instructionSo: 'Isku dhufo labada tiro ee taban.',
        placeholder: 'z. B. 35',
        expectedAnswer: '35',
        alternateAnswers: ['+35'],
        hintDe: 'Minus mal Minus ergibt Plus (+). Rechne 7 · 5.',
        hintSo: 'Taban iyo taban waxay noqdaan togan (+). Xisaabi 7 · 5.',
        explanationDe: 'Minus mal Minus ergibt Plus: 7 · 5 = 35.',
        explanationSo: '(-) ku dhufo (-) waa (+): 7 · 5 = 35.',
        steps: [
          {
            latex: '7 \\cdot 5 = 35',
            textDe: 'Multipliziere 7 mit 5.',
            textSo: 'Isku dhufo 7 iyo 5.',
          },
          {
            latex: '(-7) \\cdot (-5) = 35',
            textDe: 'Das Vorzeichen ist positiv: +35.',
            textSo: 'Calaamaddu waa togan: 35.',
          },
        ],
      },
      {
        id: 'md-2',
        title: 'Plus mal Minus',
        latexQuestion: '8 \\cdot (-9) = ?',
        instructionDe: 'Multipliziere mit Vorzeichen.',
        instructionSo: 'Isku dhufo tiro togan iyo mid taban.',
        placeholder: 'z. B. -72',
        expectedAnswer: '-72',
        hintDe: 'Plus mal Minus ergibt immer Minus (-).',
        hintSo: 'Togan ku dhufo taban waxay had iyo jeer noqotaa taban (-).',
        explanationDe: 'Plus mal Minus ergibt Minus: 8 · 9 = 72, also -72.',
        explanationSo: '(+) ku dhufo (-) waa (-): 8 · 9 = 72, natiijadu waa -72.',
        steps: [
          {
            latex: '8 \\cdot 9 = 72',
            textDe: '8 mal 9 ist 72.',
            textSo: '8 ku dhufo 9 waa 72.',
          },
          {
            latex: '8 \\cdot (-9) = -72',
            textDe: 'Weil die Vorzeichen ungleich sind, ist das Ergebnis negativ: -72.',
            textSo: 'Maadaama calaamaduhu kala duwan yihiin, natiijadu waa taban: -72.',
          },
        ],
      },
      {
        id: 'md-3',
        title: 'Division mit Vorzeichen',
        latexQuestion: '(-48) : (-6) = ?',
        instructionDe: 'Dividiere die beiden Zahlen.',
        instructionSo: 'Isu qaybi labada tiro ee taban.',
        placeholder: 'z. B. 8',
        expectedAnswer: '8',
        alternateAnswers: ['+8'],
        hintDe: 'Gleiche Vorzeichen beim Teilen ergeben Plus. Wie oft passt 6 in 48?',
        hintSo: 'Taban loo qaybiyo taban waa togan (+). Immisa jeer ayey 6 ku jirtaa 48?',
        explanationDe: 'Minus geteilt durch Minus ergibt Plus: 48 : 6 = 8.',
        explanationSo: '(-) loo qaybiyo (-) waa (+): 48 loo qaybiyo 6 waa 8.',
        steps: [
          {
            latex: '48 : 6 = 8',
            textDe: '48 geteilt durch 6 ist 8.',
            textSo: '48 loo qaybiyo 6 waa 8.',
          },
          {
            latex: '(-48) : (-6) = 8',
            textDe: 'Minus durch Minus ist Plus.',
            textSo: 'Taban loo qaybiyo taban waa togan.',
          },
        ],
      },
    ],
  },

  // Section 4: Punkt vor Strich
  {
    id: 'punkt-vor-strich',
    number: 4,
    titleDe: '4. Vorrangregeln (Punkt vor Strich & Klammern)',
    titleSo: '4. Qaanuunka Kala-horeynta (Kulamada & Qawsaska)',
    summaryDe: '1. Klammern zuerst berechnen. 2. Punktrechnung (· und :) vor Strichrechnung (+ und -). 3. Von links nach rechts.',
    summarySo: '1. Marka hore xisaabi waxa ku jira qawlka (brackets). 2. Isku-dhufashada iyo isu-qaybinta ayaa ka horreeya isku-darka iyo kala-goynta. 3. Ka bilow bidix una wad midig.',
    ruleLatex: '\\text{1. Klammern } () \\quad \\rightarrow \\quad \\text{2. Punkt } (\\cdot, :) \\quad \\rightarrow \\quad \\text{3. Strich } (+, -)',
    workedExample: {
      problemLatex: '5 + 3 \\cdot 4 = ?',
      solutionLatex: '5 + 12 = 17',
      explanationDe: 'Zuerst Punktrechnung: 3 · 4 = 12. Erst danach addieren: 5 + 12 = 17.',
      explanationSo: 'Marka hore samee isku-dhufashada: 3 · 4 = 12. Dabadeed isku dar: 5 + 12 = 17.',
      steps: [
        {
          latex: '3 \\cdot 4 = 12',
          de: 'Punkt vor Strich: Berechne zuerst die Multiplikation.',
          so: 'Isku-dhufashada ayaa ka horreysa: 3 · 4 = 12.',
        },
        {
          latex: '5 + 12 = 17',
          de: 'Addiere nun: 5 + 12 = 17.',
          so: 'Hadda isku dar: 5 + 12 = 17.',
        },
      ],
    },
    exercises: [
      {
        id: 'pvs-1',
        title: 'Punktrechnung vor Strichrechnung',
        latexQuestion: '20 - 4 \\cdot 3 = ?',
        instructionDe: 'Beachte die Vorrangregel: Punkt vor Strich!',
        instructionSo: 'Isku-dhufashada ka horraysii kala-goynta.',
        placeholder: 'z. B. 8',
        expectedAnswer: '8',
        hintDe: 'Rechne zuerst 4 · 3. Ziehe das Ergebnis danach von 20 ab.',
        hintSo: 'Marka hore xisaabi 4 · 3. Dabadeedna 20 ka jar natiijada.',
        explanationDe: 'Zuerst Punktrechnung: 4 · 3 = 12. Dann: 20 - 12 = 8.',
        explanationSo: 'Marka hore 4 · 3 = 12. Dabadeed 20 - 12 = 8.',
        steps: [
          {
            latex: '4 \\cdot 3 = 12',
            textDe: 'Berechne zuerst die Multiplikation: 4 · 3 = 12.',
            textSo: 'Horta xisaabi isku-dhufashada: 4 · 3 = 12.',
          },
          {
            latex: '20 - 12 = 8',
            textDe: 'Rechne nun: 20 - 12 = 8.',
            textSo: 'Hadda kala gooy: 20 - 12 = 8.',
          },
        ],
      },
      {
        id: 'pvs-2',
        title: 'Klammer geht vor Punktrechnung',
        latexQuestion: '(6 + 4) \\cdot 5 = ?',
        instructionDe: 'Rechne zuerst die Aufgabe in der Klammer.',
        instructionSo: 'Marka hore xisaabi waxa ku dhex jira qawska.',
        placeholder: 'z. B. 50',
        expectedAnswer: '50',
        hintDe: 'Was ergibt 6 + 4? Multipliziere das Ergebnis mit 5.',
        hintSo: 'Waa maxay 6 + 4? Jawaabta ku dhufo 5.',
        explanationDe: 'Klammer zuerst: 6 + 4 = 10. Dann 10 · 5 = 50.',
        explanationSo: 'Qawska marka hore: 6 + 4 = 10. Dabadeed 10 · 5 = 50.',
        steps: [
          {
            latex: '6 + 4 = 10',
            textDe: 'Berechne die Klammer: 6 + 4 = 10.',
            textSo: 'Xisaabi qawska: 6 + 4 = 10.',
          },
          {
            latex: '10 \\cdot 5 = 50',
            textDe: 'Multipliziere mit 5: 10 · 5 = 50.',
            textSo: 'Ku dhufo 5: 10 · 5 = 50.',
          },
        ],
      },
      {
        id: 'pvs-3',
        title: 'Komplexer Ausdruck mit Vorzeichen',
        latexQuestion: '18 + (-2) \\cdot 7 = ?',
        instructionDe: 'Rechne Punkt vor Strich mit Vorzeichen.',
        instructionSo: 'Xisaabi isku-dhufashada marka hore adigoo calaamadda ilaalinaya.',
        placeholder: 'z. B. 4',
        expectedAnswer: '4',
        hintDe: 'Rechne zuerst (-2) · 7 = -14. Dann rechne 18 + (-14).',
        hintSo: 'Horta (-2) ku dhufo 7 = -14. Dabadeed 18 + (-14) xisaabi.',
        explanationDe: '(-2) · 7 = -14. Danach 18 + (-14) = 18 - 14 = 4.',
        explanationSo: '(-2) · 7 = -14. Dabadeed 18 - 14 = 4.',
        steps: [
          {
            latex: '(-2) \\cdot 7 = -14',
            textDe: 'Punktrechnung: (-2) · 7 = -14.',
            textSo: 'Isku-dhufasho: (-2) · 7 = -14.',
          },
          {
            latex: '18 + (-14) = 4',
            textDe: '18 - 14 = 4.',
            textSo: '18 - 14 = 4.',
          },
        ],
      },
    ],
  },

  // Section 5: Terme zusammenfassen
  {
    id: 'terme-zusammenfassen',
    number: 5,
    titleDe: '5. Terme zusammenfassen (Gleichartige Terme)',
    titleSo: '5. Isku-darka Erayada Isku-midka ah (Like Terms)',
    summaryDe: 'Nur gleichartige Terme (gleiche Variablen mit gleicher Potenz) dürfen addiert oder subtrahiert werden.',
    summarySo: 'Kaliya erayada leh xaraf isku mid ah ayaa la isku dari karaa ama la kala jari karaa.',
    ruleLatex: 'ax + bx = (a + b)x \\quad | \\quad 8x - 3x + 2y = 5x + 2y',
    workedExample: {
      problemLatex: '8x - 3x + 2y = ?',
      solutionLatex: '5x + 2y',
      explanationDe: '8x und 3x sind gleichartige Terme. Deshalb rechnen wir 8 - 3 = 5, also 5x. Die 2y bleibt stehen, weil y eine andere Variable ist.',
      explanationSo: '8x iyo 3x waa isku nooc. Waxaan xisaabinaynaa 8 - 3 = 5, marka waa 5x. Qaybta 2y sidooda ayay u hartaa maxaa yeelay y waa xaraf kale.',
      steps: [
        {
          latex: '8x - 3x = (8 - 3)x = 5x',
          de: 'Fasse die x-Terme zusammen: 8 - 3 = 5, also 5x.',
          so: 'Isku gee xarafka x: 8 - 3 = 5, taas oo noqonaysa 5x.',
        },
        {
          latex: '5x + 2y',
          de: '2y hat eine andere Variable und kann nicht mit 5x verrechnet werden.',
          so: '2y waxay leedahay xaraf kale lama dhex gelin karo 5x.',
        },
      ],
    },
    exercises: [
      {
        id: 'tz-1',
        title: 'Einfache Variablen zusammenfassen',
        latexQuestion: '7a + 4a - 3a = ?',
        instructionDe: 'Fasse die gleichartigen Terme zusammen.',
        instructionSo: 'Isku gee erayadan leh xarafka "a".',
        placeholder: 'z. B. 8a',
        expectedAnswer: '8a',
        hintDe: 'Rechne die Zahlen vor dem a: 7 + 4 - 3.',
        hintSo: 'Xisaabi tirooyinka horyaalla xarafka "a": 7 + 4 - 3.',
        explanationDe: '7 + 4 = 11, und 11 - 3 = 8. Also 8a.',
        explanationSo: '7 + 4 = 11, dabadeed 11 - 3 = 8. Natiijadu waa 8a.',
        steps: [
          {
            latex: '(7 + 4 - 3)a',
            textDe: 'Klammere die Zahlen aus: (7 + 4 - 3)a.',
            textSo: 'Soo bixi tirooyinka: (7 + 4 - 3)a.',
          },
          {
            latex: '8a',
            textDe: 'Ergebnis: 8a.',
            textSo: 'Jawaab: 8a.',
          },
        ],
      },
      {
        id: 'tz-2',
        title: 'Zwei verschiedene Variablen',
        latexQuestion: '4x + 6y + 5x - 2y = ?',
        instructionDe: 'Fasse x mit x und y mit y zusammen.',
        instructionSo: 'Isku gee x iyo x, dabadeedna y iyo y.',
        placeholder: 'z. B. 9x + 4y',
        expectedAnswer: '9x + 4y',
        alternateAnswers: ['9x+4y', '4y + 9x', '4y+9x'],
        hintDe: 'x-Terme: 4x + 5x = 9x. y-Terme: 6y - 2y = 4y.',
        hintSo: 'Qaybta x: 4x + 5x = 9x. Qaybta y: 6y - 2y = 4y.',
        explanationDe: '4x + 5x ergibt 9x. 6y - 2y ergibt 4y. Zusammen: 9x + 4y.',
        explanationSo: '4x + 5x waa 9x. 6y - 2y waa 4y. Wadartu waa 9x + 4y.',
        steps: [
          {
            latex: '(4x + 5x) + (6y - 2y)',
            textDe: 'Sortiere nach gleichen Variablen.',
            textSo: 'U kala saar xarfaha isku nooca ah.',
          },
          {
            latex: '9x + 4y',
            textDe: 'Fasse zusammen: 9x + 4y.',
            textSo: 'Isku dar: 9x + 4y.',
          },
        ],
      },
      {
        id: 'tz-3',
        title: 'Variablen und reine Zahlen',
        latexQuestion: '12m + 7 - 5m + 3 = ?',
        instructionDe: 'Fasse die m-Terme zusammen und danach die Zahlen.',
        instructionSo: 'Isku gee erayada "m" wata iyo tirooyinka caadiga ah.',
        placeholder: 'z. B. 7m + 10',
        expectedAnswer: '7m + 10',
        alternateAnswers: ['7m+10', '10 + 7m', '10+7m'],
        hintDe: '12m - 5m = 7m. Und 7 + 3 = 10.',
        hintSo: '12m - 5m = 7m. Tirooyinkuna waa 7 + 3 = 10.',
        explanationDe: '12m - 5m = 7m. Die Zahlen 7 + 3 = 10. Zusammen: 7m + 10.',
        explanationSo: '12m - 5m waa 7m, tirooyinkuna 7 + 3 waa 10. Waa 7m + 10.',
        steps: [
          {
            latex: '(12m - 5m) + (7 + 3)',
            textDe: 'Gruppiere m und reine Zahlen getrennt.',
            textSo: 'Isku koob m iyo tirooyinka caadiga ah.',
          },
          {
            latex: '7m + 10',
            textDe: 'Ergebnis: 7m + 10.',
            textSo: 'Natiijo: 7m + 10.',
          },
        ],
      },
    ],
  },

  // Section 6: Terme multiplizieren und dividieren
  {
    id: 'terme-multiplizieren',
    number: 6,
    titleDe: '6. Terme multiplizieren und dividieren',
    titleSo: '6. Isku-dhufashada iyo Isu-qaybinta Erayada Aljebra',
    summaryDe: 'Multipliziere Zahl mit Zahl und Variable mit Variable. Beachte Potenzen: x · x = x².',
    summarySo: 'Isku dhufo tirada iyo tirada, xarafka iyo xarafka. Xusuusnow: x · x = x².',
    ruleLatex: '3x \\cdot 4y = 12xy \\quad | \\quad 5x \\cdot 2x = 10x^2 \\quad | \\quad 15x : 3 = 5x',
    workedExample: {
      problemLatex: '4x \\cdot 3y = ?',
      solutionLatex: '12xy',
      explanationDe: 'Multipliziere zuerst die Zahlen: 4 · 3 = 12. Hänge danach die Variablen an: xy. Das Ergebnis ist 12xy.',
      explanationSo: 'Marka hore isku dhufo tirooyinka: 4 · 3 = 12. Dabadeed raaci xarfaha: xy. Waa 12xy.',
      steps: [
        {
          latex: '4 \\cdot 3 = 12',
          de: 'Zahlen multiplizieren: 4 · 3 = 12.',
          so: 'Isku dhufo tirooyinka: 4 · 3 = 12.',
        },
        {
          latex: 'x \\cdot y = xy',
          de: 'Variablen aneinanderhängen: xy.',
          so: 'Xarfaha isku dhaji: xy.',
        },
        {
          latex: '12xy',
          de: 'Zusammenfügen: 12xy.',
          so: 'Isu geey: 12xy.',
        },
      ],
    },
    exercises: [
      {
        id: 'tm-1',
        title: 'Terme mit zwei Variablen multiplizieren',
        latexQuestion: '5a \\cdot 6b = ?',
        instructionDe: 'Multipliziere Zahlen und Variablen.',
        instructionSo: 'Isku dhufo tirooyinka iyo xarfaha.',
        placeholder: 'z. B. 30ab',
        expectedAnswer: '30ab',
        alternateAnswers: ['30ba'],
        hintDe: 'Rechne 5 · 6. Die Variablen a und b schreibst du dahinter.',
        hintSo: 'Xisaabi 5 · 6. Xarfaha a iyo b ka daba qor.',
        explanationDe: '5 mal 6 ist 30. Mit den Variablen a und b ergibt das 30ab.',
        explanationSo: '5 ku dhufo 6 waa 30. Xarfahana waa ab, marka waa 30ab.',
        steps: [
          {
            latex: '5 \\cdot 6 = 30',
            textDe: 'Multipliziere die Koeffizienten: 5 · 6 = 30.',
            textSo: 'Isku dhufo tirooyinka: 5 · 6 = 30.',
          },
          {
            latex: '30ab',
            textDe: 'Hänge ab an: 30ab.',
            textSo: 'Raaci xarfaha: 30ab.',
          },
        ],
      },
      {
        id: 'tm-2',
        title: 'Potenzbildung (x mal x)',
        latexQuestion: '3x \\cdot 7x = ?',
        instructionDe: 'Beachte: x mal x ergibt x².',
        instructionSo: 'Ogow: x ku dhufo x waxay noqotaa x².',
        placeholder: 'z. B. 21x^2 oder 21x²',
        expectedAnswer: '21x^2',
        alternateAnswers: ['21x²', '21*x^2', '21 x^2'],
        hintDe: '3 · 7 = 21. x · x = x². Zusammen: 21x².',
        hintSo: '3 · 7 = 21. x · x = x². Wadartu waa 21x².',
        explanationDe: '3 · 7 = 21. Weil x mit sich selbst multipliziert wird, entsteht x². Also 21x².',
        explanationSo: '3 · 7 = 21. Maadaama x nafsaddeeda lagu dhuftay waa x². Natiijadu waa 21x².',
        steps: [
          {
            latex: '3 \\cdot 7 = 21',
            textDe: 'Zahlen: 3 · 7 = 21.',
            textSo: 'Tirooyin: 3 · 7 = 21.',
          },
          {
            latex: 'x \\cdot x = x^2',
            textDe: 'Variablen: x · x = x².',
            textSo: 'Xarfo: x · x = x².',
          },
          {
            latex: '21x^2',
            textDe: 'Ergebnis: 21x².',
            textSo: 'Jawaab: 21x².',
          },
        ],
      },
      {
        id: 'tm-3',
        title: 'Terme dividieren',
        latexQuestion: '24y : 6 = ?',
        instructionDe: 'Teile die Zahl vor der Variablen durch 6.',
        instructionSo: 'U qaybi tirada hortaalla y lambarka 6.',
        placeholder: 'z. B. 4y',
        expectedAnswer: '4y',
        hintDe: '24 geteilt durch 6 = 4. Die Variable y bleibt erhalten.',
        hintSo: '24 loo qaybiyo 6 waa 4. Xarafka y ayaa soo raacaya.',
        explanationDe: '24 : 6 = 4. Das y bleibt stehen. Also 4y.',
        explanationSo: '24 : 6 = 4, y-na waa ku lifaaqan tahay: 4y.',
        steps: [
          {
            latex: '24 : 6 = 4',
            textDe: 'Teile die Zahl: 24 : 6 = 4.',
            textSo: 'Qaybi tirada: 24 : 6 = 4.',
          },
          {
            latex: '4y',
            textDe: 'Ergebnis: 4y.',
            textSo: 'Natiijo: 4y.',
          },
        ],
      },
    ],
  },

  // Section 7: Werte in Terme einsetzen
  {
    id: 'werte-einsetzen',
    number: 7,
    titleDe: '7. Werte in Terme einsetzen (Substitution)',
    titleSo: '7. Tirada Xarafka lagu Beddelo (Substitution)',
    summaryDe: 'Ersetze die Variable durch die vorgegebene Zahl und berechne das Ergebnis. Achte bei negativen Zahlen auf Klammern!',
    summarySo: 'Xarafka meeshiisa geli tirada laguu sheegay dabadeed xisaabi. Haddii ay tahay tiro taban qawl geli!',
    ruleLatex: '\\text{Wenn } x = -4, \\text{ berechne } 3x - 7: \\quad 3 \\cdot (-4) - 7 = -12 - 7 = -19',
    workedExample: {
      problemLatex: '\\text{Gegeben: } x = -4. \\quad \\text{Berechne: } 3x - 7',
      solutionLatex: '3 \\cdot (-4) - 7 = -19',
      explanationDe: 'Setze für x die Zahl (-4) ein: 3 mal (-4) ist -12. Dann rechnest du -12 - 7 = -19.',
      explanationSo: 'Xarafka x geli (-4): 3 ku dhufo (-4) waa -12. Dabadeedna -12 - 7 = -19.',
      steps: [
        {
          latex: '3 \\cdot (-4) - 7',
          de: 'Setze -4 mit Klammer für x ein.',
          so: 'Geli -4 oo qaws ku jira booska x.',
        },
        {
          latex: '-12 - 7',
          de: 'Punktrechnung: 3 · (-4) = -12.',
          so: 'Isku-dhufasho: 3 · (-4) = -12.',
        },
        {
          latex: '-19',
          de: '-12 minus 7 ergibt -19.',
          so: '-12 laga jaray 7 waa -19.',
        },
      ],
    },
    exercises: [
      {
        id: 'we-1',
        title: 'Einsetzen mit negativer Zahl',
        latexQuestion: '\\text{Wenn } x = -5, \\text{ was ist } 4x + 6?',
        instructionDe: 'Setze -5 für x ein und rechne aus.',
        instructionSo: 'Geli -5 booska x dabadeed xisaabi.',
        placeholder: 'z. B. -14',
        expectedAnswer: '-14',
        hintDe: '4 · (-5) = -20. Rechne danach -20 + 6.',
        hintSo: '4 ku dhufo (-5) = -20. Dabadeed -20 + 6 xisaabi.',
        explanationDe: '4 · (-5) + 6 = -20 + 6 = -14.',
        explanationSo: '4 · (-5) + 6 = -20 + 6 = -14.',
        steps: [
          {
            latex: '4 \\cdot (-5) + 6',
            textDe: 'Setze -5 für x ein.',
            textSo: 'Geli -5 meesha x.',
          },
          {
            latex: '-20 + 6 = -14',
            textDe: 'Berechne 4 · (-5) = -20, dann -20 + 6 = -14.',
            textSo: 'Xisaabi 4 · (-5) = -20, dabadeed -20 + 6 = -14.',
          },
        ],
      },
      {
        id: 'we-2',
        title: 'Quadratischer Term mit negativer Zahl',
        latexQuestion: '\\text{Wenn } a = -3, \\text{ was ist } a^2 + 5?',
        instructionDe: 'Achtung: (-3)² bedeutet (-3) · (-3) = +9.',
        instructionSo: 'Ogow: (-3)² waxay ka dhigan tahay (-3) · (-3) = +9.',
        placeholder: 'z. B. 14',
        expectedAnswer: '14',
        hintDe: 'Minus mal Minus ist Plus: (-3)² = 9. Dann rechne 9 + 5.',
        hintSo: 'Taban ku dhufo taban waa togan: (-3)² = 9. Dabadeed 9 + 5 = 14.',
        explanationDe: '(-3)² = 9. Und 9 + 5 = 14.',
        explanationSo: '(-3)² = 9, 9 + 5-na waa 14.',
        steps: [
          {
            latex: '(-3)^2 + 5 = 9 + 5',
            textDe: 'Minus drei im Quadrat ist plus neun.',
            textSo: 'Saddex taban laba-jibbaarkeedu waa sagaal togan.',
          },
          {
            latex: '14',
            textDe: '9 + 5 = 14.',
            textSo: '9 + 5 = 14.',
          },
        ],
      },
      {
        id: 'we-3',
        title: 'Zwei Variablen einsetzen',
        latexQuestion: '\\text{Wenn } x = 4 \\text{ und } y = -2, \\text{ was ist } 2x - 3y?',
        instructionDe: 'Setze die Zahlen für x und y ein.',
        instructionSo: 'Geli 4 meesha x, iyo -2 meesha y.',
        placeholder: 'z. B. 14',
        expectedAnswer: '14',
        hintDe: '2 · 4 = 8. Und (-3) · (-2) = +6. Rechne 8 + 6.',
        hintSo: '2 · 4 = 8. (-3) ku dhufo (-2) waa +6. Isku dar 8 + 6.',
        explanationDe: '2·(4) - 3·(-2) = 8 - (-6) = 8 + 6 = 14.',
        explanationSo: '2·(4) - 3·(-2) = 8 + 6 = 14.',
        steps: [
          {
            latex: '2 \\cdot 4 - 3 \\cdot (-2)',
            textDe: 'Einsetzen: 2 · 4 = 8 und 3 · (-2) = -6.',
            textSo: 'Gelin: 2 · 4 = 8 iyo 3 · (-2) = -6.',
          },
          {
            latex: '8 - (-6) = 8 + 6 = 14',
            textDe: 'Minus minus wird plus: 8 + 6 = 14.',
            textSo: 'Laba dhimis waxay noqotaa togan: 8 + 6 = 14.',
          },
        ],
      },
    ],
  },

  // Section 8: Textaufgaben
  {
    id: 'textaufgaben',
    number: 8,
    titleDe: '8. Textaufgaben Schritt für Schritt',
    titleSo: '8. Su\'aalaha Qoraalka ah Tallaabo Tallaabo',
    summaryDe: '1. Lies genau: Was ist gegeben? 2. Was wird gesucht? 3. Stelle den Rechenausdruck (Term) auf. 4. Rechne und schreibe die Antwort.',
    summarySo: '1. Si fiican u akri: maxaa lagu siiyay? 2. Maxaa la rabaa? 3. Samee isla-xisaabtan (term). 4. Xisaabi oo qor jawaabta.',
    ruleLatex: '\\text{Gegeben} \\quad \\rightarrow \\quad \\text{Gesucht} \\quad \\rightarrow \\quad \\text{Rechnung} \\quad \\rightarrow \\quad \\text{Antwort}',
    workedExample: {
      problemLatex: '\\text{Morgens hat es } -3^{\\circ}\\text{C}. \\text{ Mittags steigt die Temperatur um } 8^{\\circ}\\text{C}. \\text{ Wie warm ist es nun?}',
      solutionLatex: '-3 + 8 = 5^{\\circ}\\text{C}',
      explanationDe: 'Die Starttemperatur ist -3. Wenn es wärmer wird, addieren wir +8. -3 + 8 = 5 Grad.',
      explanationSo: 'Heerkulka hore waa -3. Markuu kordho waxaan ku darraynaa +8. -3 + 8 = 5 darajo.',
      steps: [
        {
          latex: '\\text{Rechnung: } -3 + 8',
          de: 'Start: -3. Anstieg um 8 Grad bedeutet Plus 8.',
          so: 'Bilow: -3. Koror 8 darajo ah waxay ka dhigan tahay isku-dar 8.',
        },
        {
          latex: '5^{\\circ}\\text{C}',
          de: 'Mittags sind es 5 Grad Celsius.',
          so: 'Duhurtii heerkulku waa 5 darajo Celsius.',
        },
      ],
    },
    exercises: [
      {
        id: 'ta-1',
        title: 'Kontostand berechnen',
        latexQuestion: '\\text{Ali hat } 45\\text{ € auf dem Konto. Er kauft ein Ticket für } 60\\text{ €. Wie ist sein Kontostand?}',
        instructionDe: 'Berechne den neuen Kontostand in Euro (als Zahl mit Vorzeichen).',
        instructionSo: 'Xisaabi lacagta koontada ugu hartay (tiro iyo calaamadeeda).',
        placeholder: 'z. B. -15',
        expectedAnswer: '-15',
        alternateAnswers: ['-15€', '-15 €', '-15 Euro'],
        hintDe: 'Er gibt mehr Geld aus als er hat: 45 - 60 = ?',
        hintSo: 'Wuxuu bixiyay lacag ka badan tii uu haystay: 45 - 60 = ?',
        explanationDe: '45 - 60 = -15. Sein Konto ist mit 15 Euro im Minus (-15 €).',
        explanationSo: '45 - 60 = -15. Koontadiisu waxay ku jirtaa 15 deyn ah (-15 €).',
        steps: [
          {
            latex: '45 - 60 = -15',
            textDe: 'Ziehe den Kaufpreis vom Guthaben ab: 45 - 60 = -15.',
            textSo: 'Ka jar qiimaha tigidka lacagtii hortaallay: 45 - 60 = -15.',
          },
          {
            latex: '\\text{Antwort: } -15\\text{ €}',
            textDe: 'Der neue Kontostand ist -15 €.',
            textSo: 'Hadhaaga koontadu waa -15 €.',
          },
        ],
      },
      {
        id: 'ta-2',
        title: 'Umfang eines Rechtecks als Term',
        latexQuestion: '\\text{Ein Rechteck hat die Seiten } a = 2x \\text{ und } b = 3x. \\text{ Fasse den Umfang } U = 2a + 2b \\text{ zusammen.}',
        instructionDe: 'Setze 2x für a und 3x für b ein und fasse zusammen.',
        instructionSo: 'Geli a = 2x iyo b = 3x formula-ha U = 2a + 2b dabadeed isku gee.',
        placeholder: 'z. B. 10x',
        expectedAnswer: '10x',
        hintDe: '2 · (2x) = 4x. Und 2 · (3x) = 6x. Addiere 4x + 6x.',
        hintSo: '2 · 2x = 4x. 2 · 3x = 6x. Isku dar 4x + 6x.',
        explanationDe: 'U = 2·(2x) + 2·(3x) = 4x + 6x = 10x.',
        explanationSo: 'U = 4x + 6x = 10x.',
        steps: [
          {
            latex: 'U = 2 \\cdot (2x) + 2 \\cdot (3x)',
            textDe: 'Setze die Seiten ein.',
            textSo: 'Geli dhererka dhinacyada.',
          },
          {
            latex: 'U = 4x + 6x = 10x',
            textDe: 'Multipliziere und addiere: 4x + 6x = 10x.',
            textSo: 'Isku dhufo oo isku dar: 4x + 6x = 10x.',
          },
        ],
      },
    ],
  },

  // Section 9: Prüfungstraining
  {
    id: 'pruefungstraining',
    number: 9,
    titleDe: '9. Prüfungstraining (Gemischte Aufgaben)',
    titleSo: '9. Tababarka Imtixaanka (Su\'aalo Isku-dhafan)',
    summaryDe: 'Hier trainierst du alles zusammen für Tests und Klassenarbeiten: Vorzeichen, Klammern, Terme und Einsetzen.',
    summarySo: 'Halkan waxaad ku tababaranaysaa dhammaan waxyaabihii aad soo baratay oo isku dhafan: calaamadaha, qawsaska, iyo aljebraha.',
    ruleLatex: '\\text{Konzentriere dich: Schritt für Schritt rechnen!}',
    workedExample: {
      problemLatex: '(-3) \\cdot (4 - 9) + 5 = ?',
      solutionLatex: '(-3) \\cdot (-5) + 5 = 15 + 5 = 20',
      explanationDe: '1. Klammer zuerst: 4 - 9 = -5. 2. Punktrechnung: (-3) · (-5) = 15. 3. Addieren: 15 + 5 = 20.',
      explanationSo: '1. Qawska marka hore: 4 - 9 = -5. 2. Isku-dhufasho: (-3) · (-5) = 15. 3. Isku dar: 15 + 5 = 20.',
      steps: [
        {
          latex: '4 - 9 = -5',
          de: 'Klammer berechnen: 4 - 9 = -5.',
          so: 'Qawska: 4 - 9 = -5.',
        },
        {
          latex: '(-3) \\cdot (-5) = 15',
          de: 'Punktrechnung: Minus mal Minus ergibt Plus 15.',
          so: 'Isku-dhufasho: Taban ku dhufo taban waa togan 15.',
        },
        {
          latex: '15 + 5 = 20',
          de: 'Endergebnis: 15 + 5 = 20.',
          so: 'Natiijo: 15 + 5 = 20.',
        },
      ],
    },
    exercises: [
      {
        id: 'pt-1',
        title: 'Prüfungsaufgabe: Term vereinfachen',
        latexQuestion: '5x - (2x + 7) + 3 = ?',
        instructionDe: 'Löse die Minusklammer auf und fasse zusammen.',
        instructionSo: 'Kala bixi qawska dhimistu hortaal dabadeed isku gee.',
        placeholder: 'z. B. 3x - 4',
        expectedAnswer: '3x - 4',
        alternateAnswers: ['3x-4', '-4 + 3x', '-4+3x'],
        hintDe: 'Minus vor der Klammer ändert alle Vorzeichen: -(2x + 7) wird zu -2x - 7.',
        hintSo: 'Calaamadda dhimista ee qawska hortaal waxay rogtaa calaamadaha gudaha: -2x - 7.',
        explanationDe: '5x - 2x - 7 + 3 = 3x - 4.',
        explanationSo: '5x - 2x waa 3x. -7 + 3 waa -4. Wadartu waa 3x - 4.',
        steps: [
          {
            latex: '5x - 2x - 7 + 3',
            textDe: 'Minusklammer auflösen: Vorzeichen in der Klammer drehen sich um.',
            textSo: 'Fur qawska dhimista: calaamadaha guduhu way rogmadaan.',
          },
          {
            latex: '3x - 4',
            textDe: 'Fasse zusammen: 5x - 2x = 3x und -7 + 3 = -4.',
            textSo: 'Isku dar: 5x - 2x = 3x iyo -7 + 3 = -4.',
          },
        ],
      },
      {
        id: 'pt-2',
        title: 'Prüfungsaufgabe: Punkt vor Strich mit Vorzeichen',
        latexQuestion: '(-6) \\cdot (-4) - (-5) \\cdot 3 = ?',
        instructionDe: 'Berechne Punktrechnungen vor der Subtraktion.',
        instructionSo: 'Horta xisaabi labada isku-dhufasho.',
        placeholder: 'z. B. 39',
        expectedAnswer: '39',
        alternateAnswers: ['+39'],
        hintDe: '(-6) · (-4) = 24. Und (-5) · 3 = -15. Dann 24 - (-15) = 24 + 15.',
        hintSo: '(-6) · (-4) = 24. (-5) · 3 = -15. Dabadeed 24 - (-15) = 24 + 15.',
        explanationDe: '24 - (-15) = 24 + 15 = 39.',
        explanationSo: '24 - (-15) waxay noqotaa 24 + 15 = 39.',
        steps: [
          {
            latex: '(-6) \\cdot (-4) = 24',
            textDe: 'Erste Multiplikation: Minus mal Minus = +24.',
            textSo: 'Isku-dhufashada 1aad: -6 ku dhufo -4 = +24.',
          },
          {
            latex: '(-5) \\cdot 3 = -15',
            textDe: 'Zweite Multiplikation: -5 mal 3 = -15.',
            textSo: 'Isku-dhufashada 2aad: -5 ku dhufo 3 = -15.',
          },
          {
            latex: '24 - (-15) = 24 + 15 = 39',
            textDe: '24 - (-15) wird zu 24 + 15 = 39.',
            textSo: '24 - (-15) waxay noqotaa 24 + 15 = 39.',
          },
        ],
      },
      {
        id: 'pt-3',
        title: 'Prüfungsaufgabe: Term berechnen',
        latexQuestion: '\\text{Wenn } x = -2, \\text{ was ist } 2x^2 - 3x + 1?',
        instructionDe: 'Setze x = -2 sorgfältig mit Klammern ein.',
        instructionSo: 'Geli x = -2 adigoo qaws gelinaya.',
        placeholder: 'z. B. 15',
        expectedAnswer: '15',
        hintDe: '(-2)² = 4, also 2 · 4 = 8. -3 · (-2) = +6. Dann: 8 + 6 + 1.',
        hintSo: '(-2)² = 4, marka 2 · 4 = 8. -3 · (-2) = +6. Dabadeed: 8 + 6 + 1 = 15.',
        explanationDe: '2·(-2)² - 3·(-2) + 1 = 2·4 + 6 + 1 = 8 + 6 + 1 = 15.',
        explanationSo: '2·4 + 6 + 1 = 8 + 6 + 1 = 15.',
        steps: [
          {
            latex: '2 \\cdot (-2)^2 - 3 \\cdot (-2) + 1',
            textDe: 'Setze -2 ein.',
            textSo: 'Geli -2 meelaha x.',
          },
          {
            latex: '2 \\cdot 4 + 6 + 1',
            textDe: '(-2)² = 4 und -3 · (-2) = +6.',
            textSo: '(-2)² = 4 iyo -3 · (-2) = +6.',
          },
          {
            latex: '8 + 6 + 1 = 15',
            textDe: '8 + 6 + 1 = 15.',
            textSo: '8 + 6 + 1 = 15.',
          },
        ],
      },
    ],
  },
];
