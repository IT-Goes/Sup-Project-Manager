import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles, 
  FileText, 
  Download, 
  Copy, 
  CheckCheck,
  Bold, 
  Italic, 
  Code, 
  ListTodo, 
  Heading1, 
  Heading2, 
  Table, 
  Quote, 
  Link2,
  Columns,
  Eye,
  PenLine,
  Trash2,
  X
} from 'lucide-react';
import { Feature, Priority, FeatureStatus } from '../types';
import { 
  renderMarkdown, 
  calculateChecklistStats, 
  getMarkdownWordStats, 
  MARKDOWN_TEMPLATES 
} from '../utils/markdownUtils';
import { downloadMarkdownFile } from '../utils/storage';

interface SequentialMarkdownModalProps {
  features: Feature[];
  initialFeatureId?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
  onDeleteFeature: (featureId: string) => void;
  projectName: string;
}

export const SequentialMarkdownModal: React.FC<SequentialMarkdownModalProps> = ({
  features,
  initialFeatureId,
  isOpen,
  onClose,
  onUpdateFeature,
  onDeleteFeature,
  projectName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync index when initialFeatureId changes or modal opens
  useEffect(() => {
    if (initialFeatureId && features.length > 0) {
      const idx = features.findIndex(f => f.id === initialFeatureId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialFeatureId, isOpen, features]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= features.length && features.length > 0) {
      setCurrentIndex(features.length - 1);
    }
  }, [features.length, currentIndex]);

  const currentFeature = features[currentIndex];

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to Save and go to Next Feature
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleMarkDownAndNext();
      }
      // Alt + ArrowRight for Next
      if (e.altKey && e.key === 'ArrowRight' && currentIndex < features.length - 1) {
        e.preventDefault();
        setCurrentIndex(prev => prev + 1);
      }
      // Alt + ArrowLeft for Prev
      if (e.altKey && e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(prev => prev - 1);
      }
      // Escape to close
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, features.length]);

  if (!isOpen || !currentFeature) return null;

  const { words, readTimeMinutes, characters } = getMarkdownWordStats(currentFeature.markdownContent);
  const { total: totalTasks, done: doneTasks } = calculateChecklistStats(currentFeature.markdownContent);

  const handleContentChange = (newContent: string) => {
    const stats = calculateChecklistStats(newContent);
    onUpdateFeature(currentFeature.id, {
      markdownContent: newContent,
      checklistTotal: stats.total,
      checklistDone: stats.done,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleInsertSnippet = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = currentFeature.markdownContent || '';
    const selectedText = originalText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = originalText.substring(0, start) + replacement + originalText.substring(end);

    handleContentChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  const handleInsertTemplate = (templateContent: string) => {
    const current = currentFeature.markdownContent || '';
    const updated = current.trim() ? `${current}\n\n${templateContent}` : templateContent;
    handleContentChange(updated);
  };

  const handleMarkDownAndNext = () => {
    // 1. Mark this feature as documented
    const isNowMarked = true;
    const newStatus: FeatureStatus = currentFeature.status === 'backlog' ? 'specifying' : currentFeature.status;
    
    onUpdateFeature(currentFeature.id, {
      isMarkedDown: isNowMarked,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });

    // 2. Celebration
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0284c7', '#38bdf8', '#10b981', '#f59e0b']
      });
    } catch {
      // Ignore if canvas confetti isn't supported
    }

    // 3. Move to next feature if available
    if (currentIndex < features.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(currentFeature.markdownContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    const slug = currentFeature.title.toLowerCase().replace(/[^\w]/g, '_');
    const header = `# ${currentFeature.title}\n**Project:** ${projectName} | **Category:** ${currentFeature.category} | **Priority:** ${currentFeature.priority}\n\n`;
    downloadMarkdownFile(header + (currentFeature.markdownContent || ''), `${slug}_spec.md`);
  };

  // Toggle checklist checkbox directly inside rendered preview
  const handlePreviewCheckboxToggle = (index: number) => {
    const lines = (currentFeature.markdownContent || '').split('\n');
    let taskCounter = 0;
    const newLines = lines.map(line => {
      const match = line.match(/^(\s*[-*+]\s+\[)([ xX])(\].*)$/);
      if (match) {
        if (taskCounter === index) {
          const currentCheck = match[2].toLowerCase() === 'x';
          const newCheck = currentCheck ? ' ' : 'x';
          taskCounter++;
          return `${match[1]}${newCheck}${match[3]}`;
        }
        taskCounter++;
      }
      return line;
    });

    handleContentChange(newLines.join('\n'));
  };

  const totalFeatures = features.length;
  const markedDownTotal = features.filter(f => f.isMarkedDown).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl h-[94vh] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* Modal Top Stepper Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Stepper Navigation: Feature X of Y */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Feature (Alt + Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentIndex(prev => Math.min(features.length - 1, prev + 1))}
                  disabled={currentIndex === features.length - 1}
                  className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next Feature (Alt + Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Progress counter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white font-mono tabular-nums">
                  Feature {currentIndex + 1} of {totalFeatures}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">·</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {markedDownTotal}/{totalFeatures} Specified
                </span>
              </div>

              {/* Jump Dropdown */}
              <select
                value={currentFeature.id}
                onChange={(e) => {
                  const idx = features.findIndex(f => f.id === e.target.value);
                  if (idx !== -1) setCurrentIndex(idx);
                }}
                className="hidden md:inline-block text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-2 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                {features.map((f, i) => (
                  <option key={f.id} value={f.id}>
                    {i + 1}. {f.title} {f.isMarkedDown ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode & Close */}
            <div className="flex items-center gap-2">
              
              {/* Split / Edit / Preview Toggle */}
              <div className="flex items-center bg-neutral-200/60 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title="Editor only"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Write</span>
                </button>

                <button
                  onClick={() => setViewMode('split')}
                  className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title="Side-by-side split"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split</span>
                </button>

                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title="Preview only"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <button
                onClick={handleCopyMarkdown}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                title="Copy markdown text"
              >
                {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownloadSpec}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                title="Download this feature spec (.md)"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Stepper progress dots line */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto py-1">
            {features.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all shrink-0 ${
                  i === currentIndex
                    ? 'w-8 bg-sky-600 dark:bg-sky-400'
                    : f.isMarkedDown
                    ? 'w-4 bg-emerald-500 dark:bg-emerald-400 hover:w-6'
                    : 'w-4 bg-neutral-300 dark:bg-neutral-700 hover:w-6'
                }`}
                title={`${i + 1}. ${f.title} (${f.isMarkedDown ? 'Marked Down' : 'Draft'})`}
              />
            ))}
          </div>
        </div>

        {/* Feature Meta Row (Title, Status, Priority, Category) */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Title edit */}
            <div className="flex-1">
              <input
                type="text"
                value={currentFeature.title}
                onChange={(e) => onUpdateFeature(currentFeature.id, { title: e.target.value })}
                className="w-full text-lg sm:text-xl font-bold bg-transparent border-0 border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-900 dark:focus:border-white focus:outline-none text-neutral-900 dark:text-white py-0.5 px-0 transition-colors"
                placeholder="Feature title..."
              />
            </div>

            {/* Quick Status and Priority controls */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              
              {/* Category */}
              <input
                type="text"
                value={currentFeature.category}
                onChange={(e) => onUpdateFeature(currentFeature.id, { category: e.target.value })}
                className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md border border-neutral-300 dark:border-neutral-700 w-28 text-xs focus:outline-none"
                title="Category / Module"
              />

              {/* Priority */}
              <select
                value={currentFeature.priority}
                onChange={(e) => onUpdateFeature(currentFeature.id, { priority: e.target.value as Priority })}
                className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs focus:outline-none"
              >
                <option value="critical">Critical Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              {/* Status */}
              <select
                value={currentFeature.status}
                onChange={(e) => onUpdateFeature(currentFeature.id, { status: e.target.value as FeatureStatus })}
                className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs focus:outline-none"
              >
                <option value="backlog">Backlog</option>
                <option value="specifying">Specifying</option>
                <option value="ready">Ready to Build</option>
                <option value="in_progress">In Progress</option>
                <option value="shipped">Shipped</option>
              </select>

              {/* Marked Down Toggle */}
              <button
                onClick={() => onUpdateFeature(currentFeature.id, { isMarkedDown: !currentFeature.isMarkedDown })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  currentFeature.isMarkedDown
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${currentFeature.isMarkedDown ? 'stroke-[3]' : 'opacity-40'}`} />
                <span>{currentFeature.isMarkedDown ? 'Marked Down' : 'Mark Down'}</span>
              </button>

            </div>

          </div>
        </div>

        {/* Markdown Toolbar */}
        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleInsertSnippet('### ')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs font-semibold"
              title="Heading 3 (###)"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertSnippet('#### ')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs font-semibold"
              title="Heading 4 (####)"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />
            <button
              onClick={() => handleInsertSnippet('**', '**', 'bold text')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertSnippet('*', '*', 'italic text')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertSnippet('`', '`', 'code')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs"
              title="Inline Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertSnippet('- [ ] ', '', 'Task item')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs"
              title="Task Checkbox (- [ ])"
            >
              <ListTodo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertSnippet('> ', '', 'Quote block')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs"
              title="Blockquote (>)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertSnippet('| Column 1 | Column 2 |\n|---|---|\n| Item 1 | Item 2 |\n')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs"
              title="Insert Table"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertSnippet('[', '](https://example.com)', 'Link label')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md text-xs"
              title="Insert Link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset Templates Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-neutral-400 dark:text-neutral-500 hidden md:inline">Insert Template:</span>
            {MARKDOWN_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleInsertTemplate(tpl.content)}
                className="px-2 py-1 text-xs bg-neutral-200/70 hover:bg-neutral-300/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md transition-colors whitespace-nowrap"
                title={tpl.description}
              >
                + {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Pane Workspace Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Pane: Markdown Source Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex flex-col h-full border-r border-neutral-200 dark:border-neutral-800 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="flex-1 p-3">
                <textarea
                  ref={textareaRef}
                  value={currentFeature.markdownContent || ''}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Author your feature markdown here... Define user stories, acceptance criteria checklists, API specifications, and notes."
                  className="w-full h-full p-4 bg-transparent border-0 text-sm font-mono leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>

              {/* Status bar */}
              <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between font-mono tabular-nums bg-neutral-50 dark:bg-neutral-900/90">
                <div className="flex items-center gap-3">
                  <span>{words} words</span>
                  <span>·</span>
                  <span>{characters} chars</span>
                  <span>·</span>
                  <span>~{readTimeMinutes} min read</span>
                </div>
                <div>
                  <span>Checklist: {doneTasks}/{totalTasks} tasks</span>
                </div>
              </div>
            </div>
          )}

          {/* Right Pane: Live Markdown Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`flex flex-col h-full overflow-y-auto bg-neutral-50/50 dark:bg-neutral-900/40 p-6 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="max-w-2xl mx-auto w-full">
                <div className="mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Rendered Specification Preview
                  </span>
                </div>

                <div 
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(currentFeature.markdownContent) }}
                  onClick={(e) => {
                    // Check if clicked an input checkbox
                    const target = e.target as HTMLElement;
                    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
                      // Find checkbox index
                      const allCheckboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"]'));
                      const idx = allCheckboxes.indexOf(target as HTMLInputElement);
                      if (idx !== -1) {
                        handlePreviewCheckboxToggle(idx);
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar: "Markdown That Feature, Then Another, Then That" */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-between gap-4">
          
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete feature "${currentFeature.title}"?`)) {
                onDeleteFeature(currentFeature.id);
                if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Feature</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Done & Close
            </button>

            {/* Core Action: Mark Down & Next Feature ("then another, then that") */}
            <button
              onClick={handleMarkDownAndNext}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-lg shadow-sm transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {currentIndex < features.length - 1 ? 'Mark Down & Next Feature →' : 'Mark Down & Complete Spec'}
              </span>
              <span className="hidden sm:inline-block text-[10px] opacity-75 ml-1 font-mono">
                (Ctrl+Enter)
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
