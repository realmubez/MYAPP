import { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Pin,
  Tag,
  BookOpen,
  Folder,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

interface DemoNote {
  id: string;
  title: string;
  preview: string;
  subject: string;
  date: string;
  isPinned?: boolean;
  tags: string[];
}

const INITIAL_NOTES: DemoNote[] = [
  {
    id: 'n-1',
    title: 'German Adjective Endings Summary',
    preview: 'Rules for definite and indefinite articles (der/die/das vs ein/eine). Accusative and Dative endings with practical memory mnemonics...',
    subject: 'German',
    date: '16 Sep 2026',
    isPinned: true,
    tags: ['Grammar', 'B1', 'Declension'],
  },
  {
    id: 'n-2',
    title: 'Ganze Zahlen — Vorzeichenregeln',
    preview: 'Minus mal Minus ergibt Plus. Minus mal Plus ergibt Minus. Subtraktion einer negativen Zahl entspricht der Addition des Betrags...',
    subject: 'Mathematics',
    date: '15 Sep 2026',
    isPinned: true,
    tags: ['Arithmetic', 'Vorzeichen', 'School'],
  },
  {
    id: 'n-3',
    title: 'Python Dict & Set Comprehensions',
    preview: 'Syntax patterns for dictionary comprehensions: {k: v for k, v in iterable if condition}. Fast set membership tests...',
    subject: 'Python',
    date: '14 Sep 2026',
    tags: ['Syntax', 'DataStructures'],
  },
  {
    id: 'n-4',
    title: 'Swedish V2 Rule in Subordinate Clauses',
    preview: 'In main clauses the verb is in position 2. In subordinate clauses (bisatser), "inte" comes BEFORE the finite verb...',
    subject: 'Swedish',
    date: '12 Sep 2026',
    tags: ['Grammar', 'Syntax', 'Bisats'],
  },
];

export function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [notes] = useState<DemoNote[]>(INITIAL_NOTES);
  const { profile } = useProfile();

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? n.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Study Notebook
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Notes
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            In-lesson scratchpad notes, rules, formulas, and study annotations.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-amber-500/10 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search & Tags */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, or grammar rules..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#14110e] border border-neutral-800/80 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60 transition-all"
          />
        </div>

        {/* Tag pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-400 text-[11px] font-mono shrink-0 mr-1">Tags:</span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer shrink-0 ${
              selectedTag === null
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="rounded-2xl border border-neutral-800/80 bg-[#14110e] p-5 hover:border-neutral-700 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    {note.subject}
                  </span>
                  {note.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                      <Pin className="w-3 h-3 fill-amber-400" /> Pinned
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">{note.date}</span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                {note.title}
              </h2>

              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                {note.preview}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-neutral-800/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
