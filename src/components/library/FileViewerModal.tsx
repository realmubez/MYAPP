import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileText,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { DbLibraryFile } from '../../repositories/types';
import { libraryRepository } from '../../repositories/libraryRepository';

interface FileViewerModalProps {
  file: DbLibraryFile | null;
  onClose: () => void;
  onPageUpdate?: (fileId: string, page: number) => void;
}

export function FileViewerModal({ file, onClose, onPageUpdate }: FileViewerModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // PDF page state
  const [currentPage, setCurrentPage] = useState<number>(file?.last_read_page || 1);

  // Image zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    if (!file) {
      setSignedUrl(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setCurrentPage(file.last_read_page || 1);
    setZoomLevel(1);

    libraryRepository
      .getFileSignedUrl(file.storage_path)
      .then((url) => {
        if (isMounted) {
          setSignedUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load file preview.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    if (file) {
      libraryRepository.updateLastReadPage(file.id, newPage).catch(console.error);
      onPageUpdate?.(file.id, newPage);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  if (!file) return null;

  return (
    <div
      id="file-viewer-backdrop"
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      {/* Header Bar */}
      <header className="h-14 border-b border-neutral-800 bg-[#12100d] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-white truncate">
              {file.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono truncate">
              <span>{file.file_name}</span>
              {file.subject_id && (
                <>
                  <span>·</span>
                  <span className="capitalize text-amber-400/90">{file.subject_id}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PDF Page Controls */}
          {file.file_type === 'pdf' && (
            <div className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 rounded-lg px-2 py-1 mr-2">
              <button
                type="button"
                id="pdf-prev-page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-xs font-mono text-neutral-300">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Page</span>
                <input
                  type="number"
                  min="1"
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      handlePageChange(val);
                    }
                  }}
                  className="w-10 h-6 bg-neutral-950 border border-neutral-700 rounded text-center text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                id="pdf-next-page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Image Zoom Controls */}
          {file.file_type === 'image' && (
            <div className="flex items-center gap-1 bg-neutral-900/80 border border-neutral-800 rounded-lg p-1 mr-2">
              <button
                type="button"
                id="img-zoom-out-btn"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="img-zoom-reset-btn"
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 text-[11px] font-mono text-neutral-300 hover:text-white"
                title="Reset zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                id="img-zoom-in-btn"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Open In New Tab */}
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
              title="Open raw file in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Close Modal */}
          <button
            type="button"
            id="close-viewer-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex items-center justify-center p-2 sm:p-4">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-neutral-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span>Generating secure file preview...</span>
          </div>
        )}

        {error && (
          <div className="max-w-md p-6 rounded-2xl bg-[#17130f] border border-red-500/30 text-center space-y-3">
            <p className="text-sm font-semibold text-red-400">Failed to load document</p>
            <p className="text-xs text-neutral-400">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200"
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && signedUrl && (
          <>
            {file.file_type === 'pdf' && (
              <div className="w-full h-full max-w-6xl rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-900 shadow-2xl">
                <iframe
                  key={`${signedUrl}#page=${currentPage}`}
                  src={`${signedUrl}#page=${currentPage}`}
                  title={file.title}
                  className="w-full h-full border-0"
                />
              </div>
            )}

            {file.file_type === 'image' && (
              <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                <img
                  src={signedUrl}
                  alt={file.title}
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
