import React from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = React.memo(({ math, block = false, className = '' }) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`w-full overflow-x-auto overflow-y-hidden py-1 px-1 my-1 text-center font-mono select-text scrollbar-thin ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-middle select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
