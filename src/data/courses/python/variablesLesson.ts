import { MultiLangTranslation } from '../../../services/translationPreference';

export type PythonStepType =
  | 'concept'
  | 'typeIdea'
  | 'typeCode'
  | 'changeCode'
  | 'predict'
  | 'writeCode'
  | 'debug'
  | 'understand'
  | 'recall'
  | 'challenge';

export interface PythonDrillItem {
  id: string;
  type: PythonStepType;
  drillMode?: 'idea' | 'code';
  badgeLabel?: string;
  prompt?: MultiLangTranslation | string;
  targetCode: string;
  translationSupport?: MultiLangTranslation;
  codeContext?: string;
  brokenCode?: string;
  expectedOutput?: string;
  isRecallMode?: boolean;
  hint?: MultiLangTranslation | string;
  visualBreakdown?: Array<{
    label: string;
    description: MultiLangTranslation | string;
  }>;
  explanationBefore?: MultiLangTranslation | string;
  explanationAfter?: MultiLangTranslation | string;
}

export interface PythonInteractiveStep {
  stepNumber: number;
  badgeLabel: string;
  title: MultiLangTranslation | string;
  stepType: PythonStepType;
  contextNote?: MultiLangTranslation | string;
  drills: PythonDrillItem[];
}

export const PYTHON_VARIABLES_STEPS: PythonInteractiveStep[] = [
  // ==========================================
  // STEP 1 — CONCEPT: WHAT IS A VARIABLE?
  // ==========================================
  {
    stepNumber: 1,
    badgeLabel: 'UNDERSTAND',
    title: {
      en: 'What is a variable?',
      so: 'Waa maxay variable?',
      sv: 'Vad är en variabel?',
    },
    stepType: 'concept',
    contextNote: {
      en: 'A variable gives a value a name so we can use that value later.',
      so: 'Variable-ku wuxuu qiime siiyaa magac si aan mar dambe u isticmaali karno.',
      sv: 'En variabel ger ett värde ett namn så att vi kan använda värdet senare.',
    },
    drills: [
      {
        id: 'py-var-01a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'TYPE THE IDEA',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'A variable stores a value.',
        translationSupport: {
          so: 'Variable-ku wuxuu kaydiyaa qiime.',
          sv: 'En variabel lagrar ett värde.',
        },
        visualBreakdown: [
          {
            label: 'name',
            description: {
              en: 'variable name',
              so: 'magaca variable-ka',
              sv: 'variabelnamn',
            },
          },
          {
            label: '=',
            description: {
              en: 'assigns / stores a value',
              so: '= wuxuu qiime ku kaydiyaa variable-ka',
              sv: '= tilldelar ett värde till en variabel',
            },
          },
          {
            label: '"Ali"',
            description: {
              en: 'text value (string)',
              so: '"Ali" waa qoraal; Python-ka waxaa lagu magacaabaa string',
              sv: '"Ali" är text; i Python kallas det en string',
            },
          },
        ],
        explanationAfter: {
          en: 'A variable gives a value a name so we can use that value later.',
          so: 'Variable-ku wuxuu qiime siiyaa magac si aan mar dambe u isticmaali karno.',
          sv: 'En variabel ger ett värde ett namn så att vi kan använda värdet senare.',
        },
      },
      {
        id: 'py-var-01b',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'TYPE THE CODE',
        prompt: {
          en: 'TYPE THE CODE:',
          so: 'QOR CODE-KA:',
          sv: 'SKRIV KODEN:',
        },
        targetCode: 'name = "Ali"',
        explanationAfter: {
          en: 'You stored "Ali" inside the variable called name.',
          so: 'Waxaad ku kaydisay "Ali" gudaha variable-ka la yiraahdo name.',
          sv: 'Du lagrade "Ali" i variabeln med namnet name.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 2 — HOW VARIABLES WORK
  // ==========================================
  {
    stepNumber: 2,
    badgeLabel: 'UNDERSTAND',
    title: {
      en: 'How variables work',
      so: 'Sida variable-yadu u shaqeeyaan',
      sv: 'Hur variabler fungerar',
    },
    stepType: 'concept',
    contextNote: {
      en: 'You created a variable called name storing "Ali". When Python later sees name, it uses that stored value.',
      so: 'Waxaad abuurtay variable la yiraahdo name oo kaydinaya "Ali". Marka Python mar dambe uu arko name, wuxuu isticmaalaa qiimahaas la kaydiyay.',
      sv: 'Du skapade en variabel som heter name och lagrar "Ali". När Python senare ser name använder den det sparade värdet.',
    },
    drills: [
      {
        id: 'py-var-02a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'TYPE WHAT YOU LEARNED',
        prompt: {
          en: 'TYPE WHAT YOU LEARNED:',
          so: 'QOR WAXAAD BARATAY:',
          sv: 'SKRIV VAD DU LÄRDE DIG:',
        },
        targetCode: 'The variable name stores the value "Ali".',
        translationSupport: {
          so: 'Variable-ka name wuxuu kaydiyaa qiimaha "Ali".',
          sv: 'Variabeln name lagrar värdet "Ali".',
        },
        explanationAfter: {
          en: 'When Python evaluates name, it accesses "Ali".',
          so: 'Marka Python uu fiiriyo name, wuxuu helayaa "Ali".',
          sv: 'När Python läser name hämtar den "Ali".',
        },
      },
      {
        id: 'py-var-02b',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'TYPE THE CODE',
        prompt: {
          en: 'Type the assignment to reinforce memory:',
          so: 'Ku qor assignment-ka si aad u xasuusato:',
          sv: 'Skriv tilldelningen för att förstärka minnet:',
        },
        targetCode: 'name = "Ali"',
        codeContext: 'name → "Ali"',
        explanationAfter: {
          en: 'name now holds the value "Ali" in memory.',
          so: 'name hadda wuxuu memory-ga ku hayaa qiimaha "Ali".',
          sv: 'name håller nu värdet "Ali" i minnet.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 3 — USE THE VARIABLE
  // ==========================================
  {
    stepNumber: 3,
    badgeLabel: 'USE THE VARIABLE',
    title: {
      en: 'Printing a variable',
      so: 'Daabacaadda variable-ka',
      sv: 'Skriva ut en variabel',
    },
    stepType: 'typeCode',
    contextNote: {
      en: 'Instead of writing "Ali" again inside print(), we pass the variable name.',
      so: 'Halkii aan mar kale ku qori lahayn "Ali" gudaha print(), waxaan u gudbinaynaa magaca variable-ka.',
      sv: 'Istället för att skriva "Ali" igen inuti print() skickar vi variabelnamnet.',
    },
    drills: [
      {
        id: 'py-var-03a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'TYPE THE IDEA',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'print() displays a value.',
        translationSupport: {
          so: 'print() wuxuu shaashadda ku soo bandhigaa qiime.',
          sv: 'print() visar ett värde.',
        },
        explanationAfter: {
          en: 'print() is the Python function that sends output to the screen.',
          so: 'print() waa function-ka Python ee output-ka u dira shaashadda.',
          sv: 'print() är Python-funktionen som visar output på skärmen.',
        },
      },
      {
        id: 'py-var-03b',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'TYPE THE CODE',
        prompt: {
          en: 'Print the variable name:',
          so: 'Daabac magaca variable-ka:',
          sv: 'Skriv ut variabelnamnet:',
        },
        codeContext: 'name = "Ali"',
        targetCode: 'print(name)',
        expectedOutput: 'Ali',
        explanationAfter: {
          en: 'name ("Ali") → print(name) → Ali',
          so: 'name ("Ali") → print(name) → Ali',
          sv: 'name ("Ali") → print(name) → Ali',
        },
      },
    ],
  },

  // ==========================================
  // STEP 4 — TYPE MULTILINE CODE
  // ==========================================
  {
    stepNumber: 4,
    badgeLabel: 'TYPE THE CODE',
    title: {
      en: 'Combine assignment and print',
      so: 'Isku dar assignment-ka iyo print',
      sv: 'Kombinera tilldelning och print',
    },
    stepType: 'typeCode',
    contextNote: {
      en: 'Type both lines. Press Enter to start a new line.',
      so: 'Qor labada sadarba. Taabo Enter si aad sadar cusub u bilowdo.',
      sv: 'Skriv båda raderna. Tryck på Enter för att starta en ny rad.',
    },
    drills: [
      {
        id: 'py-var-04',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'TYPE THE CODE',
        prompt: {
          en: 'TYPE THE CODE (Press Enter for line 2):',
          so: 'QOR CODE-KA (Taabo Enter sadarka 2aad):',
          sv: 'SKRIV KODEN (Tryck på Enter för rad 2):',
        },
        targetCode: 'name = "Ali"\nprint(name)',
        expectedOutput: 'Ali',
      },
    ],
  },

  // ==========================================
  // STEP 5 — CHANGE THE VALUE
  // ==========================================
  {
    stepNumber: 5,
    badgeLabel: 'CHANGE THE VALUE',
    title: {
      en: 'Updating a variable',
      so: 'Beddelidda qiimaha variable-ka',
      sv: 'Uppdatera en variabel',
    },
    stepType: 'changeCode',
    contextNote: {
      en: 'Reassign means giving a variable a new value. Python variables can change.',
      so: 'Reassign waxay ka dhigan tahay in variable-ka la siiyo qiime cusub. Variable-yada Python way isbeddeli karaan.',
      sv: 'Omtilldelning betyder att ge en variabel ett nytt värde. Python-variabler kan ändras.',
    },
    drills: [
      {
        id: 'py-var-05a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'TYPE THE IDEA',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'A variable can change its value.',
        translationSupport: {
          so: 'Variable-ku wuxuu beddeli karaa qiimihiisa.',
          sv: 'En variabel kan ändra sitt värde.',
        },
        explanationAfter: {
          en: 'Variables are flexible containers; assigning a new value overwrites the old one.',
          so: 'Variable-yadu waa sanduuqyo dabacsan; marka qiime cusub la siiyo kii hore ayaa tirtirma.',
          sv: 'Variabler är flexibla behållare; ett nytt värde ersätter det gamla.',
        },
      },
      {
        id: 'py-var-05b',
        type: 'changeCode',
        drillMode: 'code',
        badgeLabel: 'CHANGE THE VALUE',
        prompt: {
          en: 'Store "Amina" instead:',
          so: 'Ku kaydi "Amina" beddelkeeda:',
          sv: 'Lagra "Amina" istället:',
        },
        codeContext: 'name = "Ali"',
        targetCode: 'name = "Amina"',
        explanationAfter: {
          en: 'Before: name → "Ali"\nNow: name → "Amina"\nThe variable is still called name, only its value changed.',
          so: 'Hore: name → "Ali"\nHadda: name → "Amina"\nVariable-ka wali waxaa la yiraahdaa name, kaliya qiimihiisa ayaa isbeddelay.',
          sv: 'Före: name → "Ali"\nNu: name → "Amina"\nVariabeln heter fortfarande name, bara dess värde ändrades.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 6 — CHANGE THE VARIABLE
  // ==========================================
  {
    stepNumber: 6,
    badgeLabel: 'CHANGE THE VARIABLE',
    title: {
      en: 'New variable name',
      so: 'Magac variable cusub',
      sv: 'Nytt variabelnamn',
    },
    stepType: 'writeCode',
    contextNote: {
      en: 'Previously: name = "Amina". Now choose a different variable name.',
      so: 'Hore: name = "Amina". Hadda dooro magac variable oo ka duwan.',
      sv: 'Tidigare: name = "Amina". Välj nu ett annat variabelnamn.',
    },
    drills: [
      {
        id: 'py-var-06',
        type: 'writeCode',
        drillMode: 'code',
        badgeLabel: 'WRITE THE CODE',
        prompt: {
          en: 'Create a variable called student instead. Store "Amina" in it.',
          so: 'Samee variable la yiraahdo student beddelkeeda. Ku kaydi "Amina".',
          sv: 'Skapa en variabel som heter student istället. Lagra "Amina" i den.',
        },
        targetCode: 'student = "Amina"',
        isRecallMode: true,
        hint: 'student = ...',
      },
    ],
  },

  // ==========================================
  // STEP 7 — NUMBERS
  // ==========================================
  {
    stepNumber: 7,
    badgeLabel: 'NUMBERS',
    title: {
      en: 'Storing integers',
      so: 'Kaydinta tirooyinka (integers)',
      sv: 'Lagra heltal (integers)',
    },
    stepType: 'typeCode',
    contextNote: {
      en: '20 is an integer. An integer is a whole number without quotation marks.',
      so: '20 waa integer. Integer waa tiro dhan oo aan calaamadaha xigashada lahayn.',
      sv: '20 är ett heltal (integer). Ett heltal skrivs utan citationstecken.',
    },
    drills: [
      {
        id: 'py-var-07a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'PROGRAMMING VOCABULARY',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'An integer is a whole number.',
        translationSupport: {
          so: 'Integer waa tiro dhan.',
          sv: 'Ett heltal (integer) är ett tal utan decimaler.',
        },
        explanationAfter: {
          en: 'Numbers like 20, 100, and 5 are integers in Python.',
          so: 'Tirooyinka sida 20, 100, iyo 5 waa integers gudaha Python.',
          sv: 'Tal som 20, 100 och 5 är heltal (integers) i Python.',
        },
      },
      {
        id: 'py-var-07b',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'STORE INTEGER',
        prompt: {
          en: 'Store the number 20:',
          so: 'Ku kaydi lambarka 20:',
          sv: 'Lagra talet 20:',
        },
        targetCode: 'age = 20',
      },
      {
        id: 'py-var-07c',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'PRINT INTEGER',
        prompt: {
          en: 'Print the age variable:',
          so: 'Daabac variable-ka age:',
          sv: 'Skriv ut variabeln age:',
        },
        codeContext: 'age = 20',
        targetCode: 'print(age)',
        expectedOutput: '20',
      },
    ],
  },

  // ==========================================
  // STEP 8 — STRING VS NUMBER
  // ==========================================
  {
    stepNumber: 8,
    badgeLabel: 'STRING VS NUMBER',
    title: {
      en: 'Text vs Numbers',
      so: 'Qoraal (string) vs Tiro (number)',
      sv: 'Text vs Tal',
    },
    stepType: 'typeCode',
    contextNote: {
      en: '"Stockholm" is a string. A string is text in quotes. 20 is an integer.',
      so: '"Stockholm" waa string. String waa qoraal xigasho ku jirta. 20 waa integer.',
      sv: '"Stockholm" är en string. En string är text med citationstecken. 20 är ett heltal.',
    },
    drills: [
      {
        id: 'py-var-08a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'PROGRAMMING VOCABULARY',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'A string stores text.',
        translationSupport: {
          so: 'String wuxuu kaydiyaa qoraal.',
          sv: 'En string lagrar text.',
        },
        explanationAfter: {
          en: 'Strings always use quotation marks like "Stockholm" or "Ali".',
          so: 'Strings mar walba waxay isticmaalaan calaamadaha xigashada sida "Stockholm" ama "Ali".',
          sv: 'Strängar (strings) använder alltid citationstecken som "Stockholm" eller "Ali".',
        },
      },
      {
        id: 'py-var-08b',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'STORE STRING',
        prompt: {
          en: '1 of 2 — Store text in a variable:',
          so: '1 ee 2 — Ku kaydi qoraal variable:',
          sv: '1 av 2 — Lagra text i en variabel:',
        },
        targetCode: 'city = "Stockholm"',
      },
      {
        id: 'py-var-08c',
        type: 'typeCode',
        drillMode: 'code',
        badgeLabel: 'STORE INTEGER',
        prompt: {
          en: '2 of 2 — Store a number in a variable:',
          so: '2 ee 2 — Ku kaydi tiro variable:',
          sv: '2 av 2 — Lagra ett tal i en variabel:',
        },
        targetCode: 'score = 100',
      },
    ],
  },

  // ==========================================
  // STEP 9 — PREDICT
  // ==========================================
  {
    stepNumber: 9,
    badgeLabel: 'PREDICT',
    title: {
      en: 'Predict the output',
      so: 'Qiyaas output-ka',
      sv: 'Förutse outputen',
    },
    stepType: 'predict',
    contextNote: {
      en: 'Output is what the program displays on screen.',
      so: 'Output waa waxa uu barnaamijku ku soo daabaco shaashadda.',
      sv: 'Outputen är vad programmet visar på skärmen.',
    },
    drills: [
      {
        id: 'py-var-09a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'PROGRAMMING VOCABULARY',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'The output is what the program displays.',
        translationSupport: {
          so: 'Output waa waxa uu barnaamijku soo bandhigo.',
          sv: 'Outputen är vad programmet visar.',
        },
        explanationAfter: {
          en: 'When programmers say "predict the output", they mean what appears on screen.',
          so: 'Marka la yiraahdo "qiyaas output-ka", waxaa loola jeedaa waxa shaashadda ka soo bixi doona.',
          sv: 'När programmerare säger "förutse outputen" menar de vad som visas på skärmen.',
        },
      },
      {
        id: 'py-var-09b',
        type: 'predict',
        drillMode: 'code',
        badgeLabel: 'PREDICT THE OUTPUT',
        codeContext: 'age = 20\nprint(age)',
        prompt: {
          en: 'What will Python print?',
          so: 'Python muxuu soo daabici doonaa?',
          sv: 'Vad kommer Python att skriva ut?',
        },
        targetCode: '20',
        expectedOutput: '20',
        explanationAfter: {
          en: 'age stores 20, so print(age) outputs 20.',
          so: 'age wuxuu kaydiyaa 20, markaa print(age) wuxuu soo saarayaa 20.',
          sv: 'age lagrar 20, så print(age) ger outputen 20.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 10 — PREDICT AGAIN
  // ==========================================
  {
    stepNumber: 10,
    badgeLabel: 'PREDICT',
    title: {
      en: 'Predict string output',
      so: 'Qiyaas output-ka string-ka',
      sv: 'Förutse string-output',
    },
    stepType: 'predict',
    contextNote: {
      en: 'Notice: terminal output displays the text without string quotation marks.',
      so: 'Ogow: output-ka terminal-ku wuxuu qoraalka ku soo bandhigaa bilaa calaamadaha xigashada.',
      sv: 'Observera: terminaloutputen visar texten utan citationstecken.',
    },
    drills: [
      {
        id: 'py-var-10',
        type: 'predict',
        drillMode: 'code',
        badgeLabel: 'PREDICT THE OUTPUT',
        codeContext: 'city = "Stockholm"\nprint(city)',
        prompt: {
          en: 'What will Python print?',
          so: 'Python muxuu soo daabici doonaa?',
          sv: 'Vad kommer Python att skriva ut?',
        },
        targetCode: 'Stockholm',
        expectedOutput: 'Stockholm',
        explanationAfter: {
          en: 'print(city) prints Stockholm without quotes.',
          so: 'print(city) wuxuu daabacaa Stockholm bilaa calaamadaha xigashada.',
          sv: 'print(city) skriver ut Stockholm utan citationstecken.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 11 — VARIABLE CHANGES
  // ==========================================
  {
    stepNumber: 11,
    badgeLabel: 'PREDICT',
    title: {
      en: 'Reassignment flow',
      so: 'Habka beddelka qiimaha',
      sv: 'Omtilldelningsflöde',
    },
    stepType: 'predict',
    contextNote: {
      en: 'Python executes code top-to-bottom.',
      so: 'Python wuxuu code-ka u fuliyaa kor ilaa hoos.',
      sv: 'Python kör koden uppifrån och ned.',
    },
    drills: [
      {
        id: 'py-var-11',
        type: 'predict',
        drillMode: 'code',
        badgeLabel: 'PREDICT THE OUTPUT',
        codeContext: 'score = 10\nscore = 20\nprint(score)',
        prompt: {
          en: 'What will Python print?',
          so: 'Python muxuu soo daabici doonaa?',
          sv: 'Vad kommer Python att skriva ut?',
        },
        targetCode: '20',
        expectedOutput: '20',
        explanationAfter: {
          en: 'score first stored 10, then score = 20 replaced it. The final value is 20.',
          so: 'score markii hore wuxuu kaydiyay 10, kadib score = 20 ayaa beddelay. Qiimaha ugu dambeeya waa 20.',
          sv: 'score lagrade först 10, sedan ersatte score = 20 det. Slutvärdet är 20.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 12 — WRITE FROM ENGLISH
  // ==========================================
  {
    stepNumber: 12,
    badgeLabel: 'WRITE THE CODE',
    title: {
      en: 'Write from instruction',
      so: 'Ku qor tilmaanta',
      sv: 'Skriv utifrån instruktionen',
    },
    stepType: 'writeCode',
    contextNote: {
      en: 'Translate the requirement directly into working Python code.',
      so: 'U beddel shuruudda si toos ah code Python oo shaqaynaya.',
      sv: 'Översätt instruktionen direkt till fungerande Python-kod.',
    },
    drills: [
      {
        id: 'py-var-12',
        type: 'writeCode',
        drillMode: 'code',
        badgeLabel: 'WRITE THE CODE',
        prompt: {
          en: 'Create a variable called city and store the text "Stockholm" in it.',
          so: 'Samee variable la yiraahdo city oo ku kaydi qoraalka "Stockholm".',
          sv: 'Skapa en variabel som heter city och lagra texten "Stockholm" i den.',
        },
        targetCode: 'city = "Stockholm"',
        isRecallMode: true,
        hint: 'city = "..."',
      },
    ],
  },

  // ==========================================
  // STEP 13 — WRITE FROM REQUIREMENT
  // ==========================================
  {
    stepNumber: 13,
    badgeLabel: 'WRITE THE CODE',
    title: {
      en: 'Assign and print',
      so: 'Ku kaydi oo daabac',
      sv: 'Tilldela och skriv ut',
    },
    stepType: 'writeCode',
    contextNote: {
      en: 'Write Python statements matching each requirement.',
      so: 'Qor weedho Python ah oo u dhigma shuruud kasta.',
      sv: 'Skriv Python-satser som matchar varje krav.',
    },
    drills: [
      {
        id: 'py-var-13a',
        type: 'writeCode',
        drillMode: 'code',
        badgeLabel: 'STEP 1 OF 3',
        prompt: {
          en: '1 of 3 — Create a variable called score. Store the number 100.',
          so: '1 ee 3 — Samee variable la yiraahdo score. Ku kaydi lambarka 100.',
          sv: '1 av 3 — Skapa en variabel som heter score. Lagra talet 100.',
        },
        targetCode: 'score = 100',
        isRecallMode: true,
        hint: 'score = ...',
      },
      {
        id: 'py-var-13b',
        type: 'writeCode',
        drillMode: 'code',
        badgeLabel: 'STEP 2 OF 3',
        prompt: {
          en: '2 of 3 — Print score.',
          so: '2 ee 3 — Daabac score.',
          sv: '2 av 3 — Skriv ut score.',
        },
        targetCode: 'print(score)',
        isRecallMode: true,
        hint: 'print(...)',
        expectedOutput: '100',
      },
      {
        id: 'py-var-13c',
        type: 'writeCode',
        drillMode: 'code',
        badgeLabel: 'STEP 3 OF 3',
        prompt: {
          en: '3 of 3 — Now combine both lines:',
          so: '3 ee 3 — Hadda isku dar labada sadar:',
          sv: '3 av 3 — Kombinera nu båda raderna:',
        },
        targetCode: 'score = 100\nprint(score)',
        isRecallMode: true,
        hint: 'score = 100\nprint(score)',
        expectedOutput: '100',
      },
    ],
  },

  // ==========================================
  // STEP 14 — MULTILINE REQUIREMENT
  // ==========================================
  {
    stepNumber: 14,
    badgeLabel: 'WRITE THE CODE',
    title: {
      en: 'Complete script from instructions',
      so: 'Barnaamij dhammaystiran oo ku salaysan tilmaamo',
      sv: 'Komplett skript från instruktioner',
    },
    stepType: 'writeCode',
    contextNote: {
      en: 'Create a variable called language. Store "Python" in it. Then print the variable.',
      so: 'Samee variable la yiraahdo language. Ku kaydi "Python". Kadib daabac variable-ka.',
      sv: 'Skapa en variabel som heter language. Lagra "Python" i den. Skriv sedan ut variabeln.',
    },
    drills: [
      {
        id: 'py-var-14',
        type: 'writeCode',
        drillMode: 'code',
        badgeLabel: 'WRITE THE CODE',
        prompt: {
          en: 'Write the 2-line program (Press Enter between lines):',
          so: 'Qor barnaamijka 2-da sadar ah (Taabo Enter inta u dhaxaysa sadarrada):',
          sv: 'Skriv 2-radersprogrammet (Tryck på Enter mellan raderna):',
        },
        targetCode: 'language = "Python"\nprint(language)',
        isRecallMode: true,
        hint: 'language = "Python"\nprint(...)',
        expectedOutput: 'Python',
      },
    ],
  },

  // ==========================================
  // STEP 15 — DEBUG
  // ==========================================
  {
    stepNumber: 15,
    badgeLabel: 'DEBUG',
    title: {
      en: 'Case sensitivity',
      so: 'Kala soocidda xaraf weyn iyo xaraf yar',
      sv: 'Skiftlägeskänslighet',
    },
    stepType: 'debug',
    contextNote: {
      en: 'Something is wrong in the code snippet below. Python is case-sensitive.',
      so: 'Wax baa khaldan code-ka hoose. Python wuxuu kala saaraa xaraf weyn iyo xaraf yar.',
      sv: 'Något är fel i kodstycket nedan. Python skiljer på stora och små bokstäver.',
    },
    drills: [
      {
        id: 'py-var-15a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'PROGRAMMING VOCABULARY',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'Python is case-sensitive.',
        translationSupport: {
          so: 'Python wuxuu kala soocaa xaraf weyn iyo xaraf yar.',
          sv: 'Python skiljer på stora och små bokstäver.',
        },
        explanationAfter: {
          en: 'Name and name are treated as two different variables in Python.',
          so: 'Name iyo name Python wuxuu u arkaa laba variable oo kala duwan.',
          sv: 'Name och name behandlas som två olika variabler i Python.',
        },
      },
      {
        id: 'py-var-15b',
        type: 'debug',
        drillMode: 'code',
        badgeLabel: 'FIX THE CODE',
        brokenCode: 'name = "Ali"\nprint(Name)',
        prompt: {
          en: 'Fix the incorrect line:',
          so: 'Sax sadarka khaldan:',
          sv: 'Rätta till den felaktiga raden:',
        },
        targetCode: 'print(name)',
        isRecallMode: true,
        hint: 'print(name)',
        explanationAfter: {
          en: 'Python variable names are case-sensitive.\nName and name are different.',
          so: 'Magacyada variable-yada Python waxay kala saaraan xaraf weyn iyo xaraf yar.\nName iyo name isku mid ma aha.',
          sv: 'Python skiljer mellan stora och små bokstäver i variabelnamn.\nName och name är olika.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 16 — DEBUG QUOTES
  // ==========================================
  {
    stepNumber: 16,
    badgeLabel: 'DEBUG',
    title: {
      en: 'Missing string quotes',
      so: 'Calaamadaha xigashada oo maqan',
      sv: 'Citationstecken saknas',
    },
    stepType: 'debug',
    contextNote: {
      en: 'We want Stockholm to be text (string). Strings need quotation marks.',
      so: 'Waxaan rabnaa in Stockholm uu noqdo qoraal (string). Qoraalka string-ka ahi wuxuu u baahan yahay calaamadaha xigashada.',
      sv: 'Vi vill att Stockholm ska vara text (string). Strängar behöver citationstecken.',
    },
    drills: [
      {
        id: 'py-var-16a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'PROGRAMMING VOCABULARY',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'Strings need quotation marks.',
        translationSupport: {
          so: 'Qoraalka string-ka ahi wuxuu u baahan yahay calaamadaha xigashada.',
          sv: 'Strängar behöver citationstecken.',
        },
        explanationAfter: {
          en: 'Without quotes, Python thinks Stockholm is a variable name instead of text.',
          so: 'La\'aanta calaamadaha xigashada, Python wuxuu u qaadanayaa inuu Stockholm yahay magac variable ee uusan ahayn qoraal.',
          sv: 'Utan citationstecken tror Python att Stockholm är ett variabelnamn istället för text.',
        },
      },
      {
        id: 'py-var-16b',
        type: 'debug',
        drillMode: 'code',
        badgeLabel: 'FIX THE CODE',
        brokenCode: 'city = Stockholm',
        prompt: {
          en: 'Fix the code so Stockholm is a valid string:',
          so: 'Sax code-ka si Stockholm uu u noqdo string sax ah:',
          sv: 'Rätta koden så att Stockholm blir en giltig string:',
        },
        targetCode: 'city = "Stockholm"',
        isRecallMode: true,
        hint: 'city = "Stockholm"',
        explanationAfter: {
          en: 'Text strings need quotation marks.\nWithout them, Python treats Stockholm as an undefined variable name.',
          so: 'Qoraalka string-ka ah wuxuu u baahan yahay calaamadaha xigashada.\nLa\'aantood, Python wuxuu u qaadanayaa Stockholm variable aan la qeexin.',
          sv: 'Textsträngar behöver citationstecken.\nUtan dem behandlar Python Stockholm som ett odefinierat variabelnamn.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 17 — DEBUG VARIABLE USE
  // ==========================================
  {
    stepNumber: 17,
    badgeLabel: 'DEBUG',
    title: {
      en: 'Variable vs string literal',
      so: 'Variable vs qoraalka tooska ah',
      sv: 'Variabel vs strängliteral',
    },
    stepType: 'debug',
    contextNote: {
      en: 'The equals sign assigns a value. When printing a variable, do not wrap its name in quotation marks.',
      so: 'Calaamadda le\'eg waxay qiime ku kaydisaa variable-ka. Markaad daabacayso variable, ha gelin calaamadaha xigashada.',
      sv: 'Likamedelstecknet tilldelar ett värde. När du skriver ut en variabel, sätt inte citationstecken runt namnet.',
    },
    drills: [
      {
        id: 'py-var-17a',
        type: 'typeIdea',
        drillMode: 'idea',
        badgeLabel: 'PROGRAMMING VOCABULARY',
        prompt: {
          en: 'TYPE THE IDEA:',
          so: 'QOR FIKRADDA:',
          sv: 'SKRIV IDÉN:',
        },
        targetCode: 'The equals sign assigns a value.',
        translationSupport: {
          so: 'Calaamadda le\'eg waxay qiime ku kaydisaa variable-ka.',
          sv: 'Likamedelstecknet tilldelar ett värde.',
        },
        explanationAfter: {
          en: 'In Python, = is the assignment operator that stores data into a variable.',
          so: 'Gudaha Python, = waa calaamadda assignment-ka ee xogta ku kaydisa variable-ka.',
          sv: 'I Python är = tilldelningsoperatorn som lagrar data i en variabel.',
        },
      },
      {
        id: 'py-var-17b',
        type: 'debug',
        drillMode: 'code',
        badgeLabel: 'FIX THE CODE',
        brokenCode: 'age = 20\nprint("age")',
        prompt: {
          en: 'Fix the second line so it prints the variable value 20:',
          so: 'Sax sadarka labaad si uu u daabaco qiimaha variable-ka ee 20:',
          sv: 'Rätta den andra raden så att den skriver ut variabelvärdet 20:',
        },
        targetCode: 'print(age)',
        isRecallMode: true,
        hint: 'print(age)',
        expectedOutput: '20',
        explanationAfter: {
          en: 'print("age") prints the text "age", but print(age) accesses the variable and prints 20.',
          so: 'print("age") wuxuu daabacaa qoraalka "age", laakiin print(age) wuxuu soo saaraa qiimaha variable-ka ee 20.',
          sv: 'print("age") skriver ut texten "age", men print(age) hämtar variabeln och skriver ut 20.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 18 — UNDERSTAND CODE
  // ==========================================
  {
    stepNumber: 18,
    badgeLabel: 'UNDERSTAND CODE',
    title: {
      en: 'Read & inspect variables',
      so: 'Akhri oo baadh variable-yada',
      sv: 'Läs och inspektera variabler',
    },
    stepType: 'understand',
    contextNote: {
      en: 'Read the program below and answer by typing the exact value.',
      so: 'Akhri barnaamijka hoose oo ka jawaab adigoo qoraya qiimaha saxda ah.',
      sv: 'Läs programmet nedan och svara genom att skriva det exakta värdet.',
    },
    drills: [
      {
        id: 'py-var-18a',
        type: 'understand',
        drillMode: 'code',
        badgeLabel: 'READ & TYPE VALUE',
        codeContext: 'product = "Laptop"\nprice = 900',
        prompt: {
          en: '1 of 2 — What value is stored in product?',
          so: '1 ee 2 — Qiimee ku kaydsan product?',
          sv: '1 av 2 — Vilket värde lagras i product?',
        },
        targetCode: 'Laptop',
      },
      {
        id: 'py-var-18b',
        type: 'understand',
        drillMode: 'code',
        badgeLabel: 'READ & TYPE VALUE',
        codeContext: 'product = "Laptop"\nprice = 900',
        prompt: {
          en: '2 of 2 — What value is stored in price?',
          so: '2 ee 2 — Qiimee ku kaydsan price?',
          sv: '2 av 2 — Vilket värde lagras i price?',
        },
        targetCode: '900',
      },
    ],
  },

  // ==========================================
  // STEP 19 — CHANGE EXISTING CODE
  // ==========================================
  {
    stepNumber: 19,
    badgeLabel: 'CHANGE CODE',
    title: {
      en: 'Modify program values',
      so: 'Beddel qiimayaasha barnaamijka',
      sv: 'Ändra programvärden',
    },
    stepType: 'changeCode',
    contextNote: {
      en: 'Current program:\nproduct = "Laptop"\nprice = 900',
      so: 'Barnaamijka hadda:\nproduct = "Laptop"\nprice = 900',
      sv: 'Nuvarande program:\nproduct = "Laptop"\nprice = 900',
    },
    drills: [
      {
        id: 'py-var-19a',
        type: 'changeCode',
        drillMode: 'code',
        badgeLabel: 'CHANGE CODE',
        codeContext: 'product = "Laptop"\nprice = 900',
        prompt: {
          en: '1 of 2 — Change the product to "Phone":',
          so: '1 ee 2 — Beddel product una beddel "Phone":',
          sv: '1 av 2 — Ändra product till "Phone":',
        },
        targetCode: 'product = "Phone"',
      },
      {
        id: 'py-var-19b',
        type: 'changeCode',
        drillMode: 'code',
        badgeLabel: 'CHANGE CODE',
        codeContext: 'product = "Phone"\nprice = 900',
        prompt: {
          en: '2 of 2 — Change the price to 700:',
          so: '2 ee 2 — Beddel price una beddel 700:',
          sv: '2 av 2 — Ändra price till 700:',
        },
        targetCode: 'price = 700',
      },
    ],
  },

  // ==========================================
  // STEP 20 — RECALL
  // ==========================================
  {
    stepNumber: 20,
    badgeLabel: 'RECALL',
    title: {
      en: 'Recall syntax from memory',
      so: 'Xasuuso syntax-ka adigoo maskaxda ka shaqaysiinaya',
      sv: 'Återkalla syntax från minnet',
    },
    stepType: 'recall',
    contextNote: {
      en: 'No code answers shown. Write each statement from memory.',
      so: 'Jawaabo code lama muujinayo. Qor weedh kasta adigoo xasuustaada isticmaalaya.',
      sv: 'Inga kodsvar visas. Skriv varje sats från minnet.',
    },
    drills: [
      {
        id: 'py-var-20a',
        type: 'recall',
        drillMode: 'code',
        badgeLabel: 'RECALL 1 OF 4',
        prompt: {
          en: '1 of 4 — Create a variable called name containing "Amina":',
          so: '1 ee 4 — Samee variable la yiraahdo name oo ku kaydi "Amina":',
          sv: '1 av 4 — Skapa en variabel som heter name som innehåller "Amina":',
        },
        targetCode: 'name = "Amina"',
        isRecallMode: true,
        hint: 'name = "..."',
      },
      {
        id: 'py-var-20b',
        type: 'recall',
        drillMode: 'code',
        badgeLabel: 'RECALL 2 OF 4',
        prompt: {
          en: '2 of 4 — Create a variable called age containing 25:',
          so: '2 ee 4 — Samee variable la yiraahdo age oo ku kaydi 25:',
          sv: '2 av 4 — Skapa en variabel som heter age som innehåller 25:',
        },
        targetCode: 'age = 25',
        isRecallMode: true,
        hint: 'age = ...',
      },
      {
        id: 'py-var-20c',
        type: 'recall',
        drillMode: 'code',
        badgeLabel: 'RECALL 3 OF 4',
        prompt: {
          en: '3 of 4 — Print the name variable:',
          so: '3 ee 4 — Daabac variable-ka name:',
          sv: '3 av 4 — Skriv ut variabeln name:',
        },
        targetCode: 'print(name)',
        isRecallMode: true,
        hint: 'print(...)',
        expectedOutput: 'Amina',
      },
      {
        id: 'py-var-20d',
        type: 'recall',
        drillMode: 'code',
        badgeLabel: 'RECALL 4 OF 4',
        prompt: {
          en: '4 of 4 — Create language containing "Python" and print it:',
          so: '4 ee 4 — Samee language oo ku kaydi "Python" kadibna daabac:',
          sv: '4 av 4 — Skapa language som innehåller "Python" och skriv ut den:',
        },
        targetCode: 'language = "Python"\nprint(language)',
        isRecallMode: true,
        hint: 'language = "Python"\nprint(...)',
        expectedOutput: 'Python',
      },
    ],
  },

  // ==========================================
  // STEP 21 — PERSONAL MISTAKE PRACTICE
  // ==========================================
  {
    stepNumber: 21,
    badgeLabel: 'ONE MORE TIME',
    title: {
      en: 'Reinforce variable assignment',
      so: 'Xooji kaydinta variable-ka',
      sv: 'Förstärk variabeltilldelning',
    },
    stepType: 'recall',
    contextNote: {
      en: 'Lock in muscle memory for variable declaration.',
      so: 'Xooji xasuustaada ku saabsan declaration-ka variable-ka.',
      sv: 'Förstärk muskelminnet för variabeldeklaration.',
    },
    drills: [
      {
        id: 'py-var-21',
        type: 'recall',
        drillMode: 'code',
        badgeLabel: 'ONE MORE TIME',
        prompt: {
          en: 'ONE MORE TIME — Create city containing "Stockholm":',
          so: 'MAR KALE — Samee city oo ku kaydi "Stockholm":',
          sv: 'EN GÅNG TILL — Skapa city som innehåller "Stockholm":',
        },
        targetCode: 'city = "Stockholm"',
        isRecallMode: true,
        hint: 'city = "Stockholm"',
      },
    ],
  },

  // ==========================================
  // STEP 22 — FINAL CODE CHALLENGE
  // ==========================================
  {
    stepNumber: 22,
    badgeLabel: 'CODE CHALLENGE 🐍',
    title: {
      en: 'Variables Mastery Challenge',
      so: 'Tartanka Barashada Variable-yada',
      sv: 'Mästartest för variabler',
    },
    stepType: 'challenge',
    contextNote: {
      en: 'Create a variable named name.\nStore "Amina" in it.\nThen print the variable.',
      so: 'Samee variable la yiraahdo name.\nKu kaydi "Amina".\nKadib daabac variable-ka.',
      sv: 'Skapa en variabel som heter name.\nLagra "Amina" i den.\nSkriv sedan ut variabeln.',
    },
    drills: [
      {
        id: 'py-var-22',
        type: 'challenge',
        drillMode: 'code',
        badgeLabel: 'FINAL CHALLENGE',
        prompt: {
          en: 'Write the complete program from scratch (Press Enter for line 2):',
          so: 'Qor barnaamijka oo dhan bilow ilaa dhammaad (Taabo Enter sadarka 2aad):',
          sv: 'Skriv hela programmet från början (Tryck på Enter för rad 2):',
        },
        targetCode: 'name = "Amina"\nprint(name)',
        isRecallMode: true,
        hint: 'name = "Amina"\nprint(name)',
        expectedOutput: 'Amina',
      },
    ],
  },

  // ==========================================
  // STEP 23 — BONUS CHALLENGE (OPTIONAL)
  // ==========================================
  {
    stepNumber: 23,
    badgeLabel: 'BONUS CHALLENGE 🐍',
    title: {
      en: 'Multi-variable Script',
      so: 'Barnaamij leh dhowr variable',
      sv: 'Skript med flera variabler',
    },
    stepType: 'challenge',
    contextNote: {
      en: 'Create: name = "Amina" and age = 25.\nThen print both variables on separate lines.',
      so: 'Samee: name = "Amina" iyo age = 25.\nKadib labada variable ku daabac sadarro kala gaar ah.',
      sv: 'Skapa: name = "Amina" och age = 25.\nSkriv sedan ut båda variablerna på separata rader.',
    },
    drills: [
      {
        id: 'py-var-23',
        type: 'challenge',
        drillMode: 'code',
        badgeLabel: 'BONUS CHALLENGE',
        prompt: {
          en: 'Write all 4 lines (Press Enter between lines):',
          so: 'Qor dhammaan 4-ta sadar (Taabo Enter inta u dhaxaysa sadarrada):',
          sv: 'Skriv alla 4 rader (Tryck på Enter mellan raderna):',
        },
        targetCode: 'name = "Amina"\nage = 25\nprint(name)\nprint(age)',
        isRecallMode: true,
        hint: 'name = "Amina"\nage = 25\nprint(name)\nprint(age)',
        expectedOutput: 'Amina\n25',
      },
    ],
  },
];

