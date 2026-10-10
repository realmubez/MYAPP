/**
 * File Reader & Document Parsing Service
 * Enables reading, listening, and practicing any uploaded or preloaded file
 * without requiring user login.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker if in browser
if (typeof window !== 'undefined') {
  try {
    // Use bundled or cdn worker safely
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch {
    // worker setup fallback
  }
}

export interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'md' | 'doc' | 'sample';
  fileSizeFormatted: string;
  uploadedAt: number;
  content: string;
  summary?: string;
  description: string;
  language: 'en' | 'de' | 'so' | 'multi';
  wordCount: number;
  readingTimeMinutes: number;
}

export const PRELOADED_STUDY_FILES: StudyDocument[] = [
  {
    id: 'file-people-descriptions',
    title: 'Character Descriptions: The Man & The Woman',
    fileName: 'the_man_and_the_woman.txt',
    fileType: 'sample',
    fileSizeFormatted: '1.2 KB',
    uploadedAt: Date.now() - 3600000 * 24,
    language: 'multi',
    description: 'Core English lesson describing height, age, clothes (wears, wearing, pants, shoes) with German and Somali vocabulary.',
    content: `The man is tall and slim, and he looks around 30 years old. He has short dark hair, a beard, and he wears glasses. He is wearing a dark T-shirt, pants, and black shoes.

The woman is short and a little heavy, and she is around 40 years old. She has brown hair and a happy smile. She is wearing a light tunic shirt, pants, and flat shoes.

Both individuals are dressed comfortably for everyday activities. Notice the difference between "he wears glasses" (habitual/general state) and "he is wearing a dark T-shirt" (present continuous action). Key clothing words include pants, shoes, T-shirt, and tunic.`,
    wordCount: 97,
    readingTimeMinutes: 1,
  },
  {
    id: 'file-cafe-conversation',
    title: 'Everyday Dialogue: Meeting at the Cafe',
    fileName: 'meeting_at_the_cafe.md',
    fileType: 'sample',
    fileSizeFormatted: '2.4 KB',
    uploadedAt: Date.now() - 3600000 * 12,
    language: 'en',
    description: 'Realistic English conversational reading with useful phrases for daily life, ordering drinks, and describing schedules.',
    content: `A: Hello! It is wonderful to see you today. How has your week been?
B: Hi! It has been quite busy, but I am doing very well, thank you. Let us find a quiet table near the window.
A: Look at that gentleman over there. He looks around 30 years old and he is wearing a dark jacket with black shoes. He seems to be reading an interesting book.
B: Yes, and the barista wearing the green apron makes the best coffee in town. What would you like to drink?
A: I will have a warm black coffee and a small croissant, please.
B: Excellent choice! Learning and practicing every single day makes language fluency come naturally.`,
    wordCount: 114,
    readingTimeMinutes: 1,
  },
  {
    id: 'file-vocab-study-guide',
    title: 'Vocabulary Study Guide: English • German • Somali',
    fileName: 'clothing_and_appearance_vocab.txt',
    fileType: 'sample',
    fileSizeFormatted: '3.1 KB',
    uploadedAt: Date.now() - 3600000 * 6,
    language: 'multi',
    description: 'Detailed vocabulary guide with tri-lingual explanations for wearing, wears, around, pants, shoes, tall, slim, and tunic.',
    content: `Vocabulary Reference Guide — Tri-lingual (English • Deutsch • Soomaali):

1. WEARING / WEARS:
- English: "He is wearing a dark T-shirt." (Present state) | "He wears glasses." (Habit)
- German: "Er trägt ein dunkles T-Shirt." | "Er trägt eine Brille." (anhaben / tragen)
- Somali: "Wuxuu xidhan yahay funaanad madow." | "Wuxuu xidhaa muraayado." (xidhasho)

2. AROUND (APPROXIMATELY):
- English: "She is around 40 years old."
- German: "Sie ist ungefähr / circa 40 Jahre alt."
- Somali: "Waxay jirtaa ku dhawaad 40 sano."

3. PANTS / TROUSERS:
- English: "comfortable casual pants"
- German: "die Hose / bequeme Hosen"
- Somali: "surwaal raaxo leh"

4. SHOES:
- English: "black shoes and flat shoes"
- German: "schwarze Schuhe und flache Schuhe"
- Somali: "kabo madow iyo kabo fidsan"

5. TALL & SLIM:
- English: "The man is tall and slim."
- German: "Der Mann ist groß und schlank."
- Somali: "Ninku waa dheer yahay waana dhuuban yahay."`,
    wordCount: 165,
    readingTimeMinutes: 2,
  },
  {
    id: 'file-german-story',
    title: 'Lesetext: Der Morgen in der Stadt (German Reading)',
    fileName: 'der_morgen_in_der_stadt.txt',
    fileType: 'sample',
    fileSizeFormatted: '1.8 KB',
    uploadedAt: Date.now() - 3600000 * 2,
    language: 'de',
    description: 'German reading practice text with simple present tense and everyday vocabulary.',
    content: `Der Morgen in der Stadt ist immer voller Leben. Die Menschen gehen zur Arbeit oder zur Schule.

Ein junger Mann steht an der Haltestelle. Er ist groß und schlank. Er trägt einen dunklen Mantel, eine bequeme Hose und schwarze Schuhe. Er sieht ungefähr 25 Jahre alt aus und liest aufmerksam die Nachrichten auf seinem Telefon.

Eine Frau mit braunen Haaren und einem freundlichen Lächeln steigt in den Bus ein. Sie trägt eine helle Jacke und flache Schuhe. Das Wetter ist heute angenehm und die Sonne scheint über den Dächern der Stadt.`,
    wordCount: 88,
    readingTimeMinutes: 1,
  },
];

const LOCAL_STORAGE_KEY = 'mylearning_public_study_files';

export class FileReaderService {
  /**
   * Load saved custom files from localStorage
   */
  static getStoredFiles(): StudyDocument[] {
    if (typeof window === 'undefined') return PRELOADED_STUDY_FILES;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: StudyDocument[] = JSON.parse(stored);
        // Combine preloaded and custom
        const customIds = new Set(parsed.map((f) => f.id));
        const filteredPreloaded = PRELOADED_STUDY_FILES.filter((f) => !customIds.has(f.id));
        return [...parsed, ...filteredPreloaded];
      }
    } catch (err) {
      console.warn('Failed to load stored study files:', err);
    }
    return PRELOADED_STUDY_FILES;
  }

  /**
   * Save a new file into local browser storage
   */
  static saveFile(doc: StudyDocument): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getStoredFiles();
      const updated = [doc, ...current.filter((f) => f.id !== doc.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
    } catch (err) {
      console.warn('Failed to save study file locally:', err);
    }
  }

  /**
   * Delete a custom file
   */
  static deleteFile(fileId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getStoredFiles();
      const updated = current.filter((f) => f.id !== fileId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to delete study file:', err);
    }
  }

  /**
   * Parse uploaded File object (PDF, TXT, MD, DOCX)
   */
  static async parseFile(file: File): Promise<StudyDocument> {
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase() || 'txt';
    const fileSizeFormatted = formatFileSize(file.size);

    let extractedText = '';

    if (extension === 'pdf') {
      extractedText = await this.extractTextFromPDF(file);
    } else {
      // Plain text, markdown, json, etc.
      extractedText = await file.text();
    }

    const cleanContent = cleanExtractedText(extractedText);
    if (!cleanContent) {
      throw new Error(`Could not extract readable text from "${fileName}". Please ensure the file contains text.`);
    }

    const wordCount = countWords(cleanContent);
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 130));

    // Guess document language
    const language = detectLanguage(cleanContent);

    const doc: StudyDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: formatDocumentTitle(fileName),
      fileName,
      fileType: extension === 'pdf' ? 'pdf' : extension === 'md' ? 'md' : 'txt',
      fileSizeFormatted,
      uploadedAt: Date.now(),
      content: cleanContent,
      description: `Uploaded document with ${wordCount} words (~${readingTimeMinutes} min reading time).`,
      language,
      wordCount,
      readingTimeMinutes,
    };

    this.saveFile(doc);
    return doc;
  }

  /**
   * Extract text from PDF using pdfjs-dist
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        fullText += pageText + '\n\n';
      }

      return fullText.trim();
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      // Fallback: try raw string search if pdfjs worker fails
      try {
        const text = await file.text();
        const match = text.match(/\(([^()]+)\)/g);
        if (match && match.length > 5) {
          return match.map((m) => m.slice(1, -1)).join(' ');
        }
      } catch {
        // ignore
      }
      throw new Error(`Failed to parse PDF "${file.name}": ${err.message || 'Corrupted or encrypted PDF'}`);
    }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDocumentTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  return withoutExt
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function detectLanguage(text: string): 'en' | 'de' | 'so' | 'multi' {
  const lower = text.toLowerCase();
  const germanMatches = (lower.match(/\b(der|die|das|und|ist|nicht|ein|eine|einen|trägt|schuhe|hose|mann|frau)\b/g) || []).length;
  const somaliMatches = (lower.match(/\b(waa|iyo|ku|ka|waxay|wuxuu|yahay|xidhan|surwaal|kabo|madow|dheer)\b/g) || []).length;
  const englishMatches = (lower.match(/\b(the|is|and|he|she|wearing|wears|around|pants|shoes|tall|slim)\b/g) || []).length;

  if (germanMatches > englishMatches && germanMatches > somaliMatches) return 'de';
  if (somaliMatches > englishMatches && somaliMatches > germanMatches) return 'so';
  if (englishMatches > 0 && (germanMatches > 2 || somaliMatches > 2)) return 'multi';
  return 'en';
}
