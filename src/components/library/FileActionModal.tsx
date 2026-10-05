import React, { useState } from 'react';
import { X, Edit2, FolderInput, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { DbLibraryFile, DbLibraryFolder } from '../../repositories/types';

interface FileActionModalProps {
  file: DbLibraryFile | null;
  folders: DbLibraryFolder[];
  mode: 'rename' | 'move' | 'delete';
  onClose: () => void;
  onRename: (fileId: string, newTitle: string) => Promise<void>;
  onMove: (fileId: string, folderId: string | null) => Promise<void>;
  onDelete: (fileId: string, storagePath: string) => Promise<void>;
}

export function FileActionModal({
  file,
  folders,
  mode,
  onClose,
  onRename,
  onMove,
  onDelete,
}: FileActionModalProps) {
  const [title, setTitle] = useState(file?.title || '');
  const [targetFolderId, setTargetFolderId] = useState<string | null>(file?.folder_id || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      if (mode === 'rename') {
        const trimmed = title.trim();
        if (!trimmed) throw new Error('Title cannot be empty.');
        await onRename(file.id, trimmed);
      } else if (mode === 'move') {
        await onMove(file.id, targetFolderId);
      } else if (mode === 'delete') {
        await onDelete(file.id, file.storage_path);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="file-action-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#14110e] border border-neutral-800/80 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            {mode === 'rename' && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Edit2 className="w-4 h-4" />
              </span>
            )}
            {mode === 'move' && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FolderInput className="w-4 h-4" />
              </span>
            )}
            {mode === 'delete' && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Trash2 className="w-4 h-4" />
              </span>
            )}
            <h2 className="text-sm font-bold text-white">
              {mode === 'rename' && 'Rename Document'}
              {mode === 'move' && 'Move Document'}
              {mode === 'delete' && 'Delete Document'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'rename' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Document Title</label>
              <input
                type="text"
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#17130f] border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          )}

          {mode === 'move' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Select Target Folder</label>
              <select
                value={targetFolderId || ''}
                onChange={(e) => setTargetFolderId(e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl bg-[#17130f] border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">📁 Root (No Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'delete' && (
            <div className="space-y-2 py-1">
              <div className="flex items-start gap-2.5 text-neutral-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Are you sure you want to delete <span className="font-semibold text-white">"{file.title}"</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-file-action-btn"
              disabled={isProcessing}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                mode === 'delete'
                  ? 'bg-red-500 hover:bg-red-400 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {mode === 'rename' && 'Save Title'}
                  {mode === 'move' && 'Move File'}
                  {mode === 'delete' && 'Delete File'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
