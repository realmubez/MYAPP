export function PhilosophyBanner() {
  const steps = [
    { label: 'LISTEN', desc: 'Audio / pronunciation' },
    { label: 'READ', desc: 'Context & sentence' },
    { label: 'UNDERSTAND', desc: 'Concept & meaning' },
    { label: 'TYPE', desc: 'Muscle memory' },
    { label: 'RECALL', desc: 'Active retrieval' },
    { label: 'APPLY', desc: 'Real code / speech' },
    { label: 'REPEAT', desc: 'Spaced rhythm' },
  ];

  return (
    <div
      id="philosophy-section"
      className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4 sm:p-5 text-center"
    >
      <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-400 mb-3">
        Learning Philosophy
      </p>

      {/* Horizontal step flow on desktop, wrap cleanly on mobile */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2 sm:gap-3">
            <span className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 font-semibold text-neutral-200">
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="text-neutral-600 font-sans select-none">→</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400 mt-3 max-w-xl mx-auto font-sans">
        Learn subjects <span className="text-neutral-300 font-medium">through typing</span>.
        Speed and accuracy naturally sharpen as your mental models solidify.
      </p>
    </div>
  );
}
