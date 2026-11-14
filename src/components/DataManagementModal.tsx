import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  ShieldCheck, 
  Trash2, 
  FileJson
} from 'lucide-react';
import { Project } from '../types';
import { exportBackupJSON } from '../utils/storage';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onImportBackup: (importedProjects: Project[]) => void;
  onClearAll: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  projects,
  onImportBackup,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name && parsed[0].features) {
          onImportBackup(parsed);
          alert('Backup restored successfully!');
          onClose();
        } else {
          alert('Invalid backup file format. Expected an array of projects with features.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Data Backup & Portability
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Privacy & Free banner */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <span className="font-semibold text-neutral-900 dark:text-white">100% Free & Private.</span> No account, email, or credentials required. All projects and feature specifications are stored locally on your device in browser cache.
            </div>
          </div>

          {/* Backup Actions */}
          <div className="space-y-2 pt-2">
            
            {/* Export JSON */}
            <button
              onClick={() => exportBackupJSON(projects)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">Export Full Workspace Backup (.json)</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Download all projects, feature notes, and markdown documents</div>
                </div>
              </div>
            </button>

            {/* Import JSON */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">Restore from Backup (.json)</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Load previously exported JSON workspace data</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Clear All */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all projects and start completely fresh? This cannot be undone unless you have a JSON backup.')) {
                  onClearAll();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">Clear All Projects</div>
                  <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80">Wipe local workspace cache completely</div>
                </div>
              </div>
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
