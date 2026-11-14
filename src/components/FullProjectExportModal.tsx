import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  CheckCheck, 
  Code2, 
  Eye, 
  X,
  Sparkles
} from 'lucide-react';
import { Project } from '../types';
import { generateConsolidatedProjectPRD, renderMarkdown } from '../utils/markdownUtils';
import { downloadMarkdownFile } from '../utils/storage';

interface FullProjectExportModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const FullProjectExportModal: React.FC<FullProjectExportModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const prdMarkdown = generateConsolidatedProjectPRD(project);

  const handleCopy = () => {
    navigator.clipboard.writeText(prdMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const slug = project.name.toLowerCase().replace(/[^\w]/g, '_');
    downloadMarkdownFile(prdMarkdown, `${slug}_complete_prd.md`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-5xl h-[92vh] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Master PRD & Markdown Specification
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Consolidated document of all {project.features.length} features for {project.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-200/70 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Formatted</span>
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'raw'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw Markdown</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-700"
              title="Copy all markdown to clipboard"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied PRD!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PRD.md</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-neutral-50/40 dark:bg-neutral-950/40">
          <div className="max-w-3xl mx-auto">
            {activeTab === 'preview' ? (
              <div 
                className="markdown-body bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(prdMarkdown) }}
              />
            ) : (
              <div className="bg-neutral-900 text-neutral-100 p-6 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                <pre>{prdMarkdown}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span>Ready to paste directly into GitHub Issues, Notion, Cursor, or AI Code Gen prompts.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
