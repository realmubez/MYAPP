import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { DbLibraryFolder } from '../../repositories/types';
import { SUBJECT_REGISTRY } from '../../services/subjectRegistry';
import { SubjectDefinition } from '../../types';

interface UploadFileModalProps {
  folders: DbLibraryFolder[];
  currentFolderId: string | null;
  onClose: () => void;
  onUpload: (params: {
    file: File;
    title: string;
    folderId: string | null;
    subjectId: string | null;
    tags: string[];
  }) => Promise<void>;
}

export function UploadFileModal({
  folders,
  currentFolderId,
  onClose,
  onUpload,
}: UploadFileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState<string | null>(currentFolderId);
  const [subjectId, setSubjectId] = useState<string | null>('');
  const [tagsInput, setTagsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    if (file.size > 50 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`Upload failed: "${file.name}" (${sizeMB} MB) exceeds the allowed 50 MB file size.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    if (!allowed.includes(ext)) {
      setError(`Upload failed: Unsupported file type. Only PDF and images (PNG, JPEG, WEBP) are supported.`);
      return;
    }

    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onUpload({
        file: selectedFile,
        title: title.trim() || selectedFile.name,
        folderId: folderId || null,
        subjectId: subjectId || null,
        tags,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      id="upload-file-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#14110e] border border-neutral-800/80 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Upload className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">Upload Study Material</h2>
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
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Dropzone */}
          <div
            id="file-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : selectedFile
                ? 'border-amber-500/40 bg-[#17130f]'
                : 'border-neutral-800 hover:border-neutral-700 bg-[#100d0a]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-7 h-7 text-amber-400 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-white truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to change
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 text-neutral-500 mx-auto" />
                <p className="text-xs font-semibold text-neutral-300">
                  Drag & drop your file here, or <span className="text-amber-400">browse</span>
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  Supported: PDF, PNG, JPEG, WEBP · Max 50 MB
                </p>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ganze Zahlen Arbeitsblatt 1"
              className="w-full h-10 px-3 rounded-xl bg-[#17130f] border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Folder & Subject Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Folder</label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl bg-[#17130f] border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">No Folder (Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Subject (Metadata)</label>
              <select
                value={subjectId || ''}
                onChange={(e) => setSubjectId(e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl bg-[#17130f] border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">None / General</option>
                {(Object.values(SUBJECT_REGISTRY) as SubjectDefinition[]).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., chapter 1, algebra, homework"
              className="w-full h-10 px-3 rounded-xl bg-[#17130f] border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-upload-btn"
              disabled={isUploading || !selectedFile}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
