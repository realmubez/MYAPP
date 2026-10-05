import React, { useState } from 'react';
import { X, Edit2, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { DbLibraryFolder } from '../../repositories/types';

interface FolderActionModalProps {
  folder: DbLibraryFolder | null;
  mode: 'rename' | 'delete';
  onClose: () => void;
  onRename: (folderId: string, newName: string) => Promise<void>;
  onDelete: (folderId: string) => Promise<void>;
}

export function FolderActionModal({
  folder,
  mode,
  onClose,
  onRename,
  onDelete,
}: FolderActionModalProps) {
  const [name, setName] = useState(folder?.name || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!folder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      if (mode === 'rename') {
        const trimmed = name.trim();
        if (!trimmed) throw new Error('Folder name cannot be empty.');
        await onRename(folder.id, trimmed);
      } else if (mode === 'delete') {
        await onDelete(folder.id);
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
      id="folder-action-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#14110e] border border-neutral-800/80 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            {mode === 'rename' ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Edit2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Trash2 className="w-4 h-4" />
              </span>
            )}
            <h2 className="text-sm font-bold text-white">
              {mode === 'rename' ? 'Rename Folder' : 'Delete Folder'}
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
          {mode === 'rename' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Folder Name</label>
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#17130f] border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-2 py-1">
              <div className="flex items-start gap-2.5 text-neutral-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Are you sure you want to delete folder <span className="font-semibold text-white">"{folder.name}"</span>?
                  Files inside will be preserved and moved to root.
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
              id="confirm-folder-action-btn"
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
                <span>{mode === 'rename' ? 'Save Name' : 'Delete Folder'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
