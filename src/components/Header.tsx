import React from 'react';
import { 
  FolderGit2, 
  ListFilter, 
  Kanban, 
  Sparkles, 
  FileText, 
  Sun, 
  Moon, 
  Download, 
  Plus,
  FolderOpen
} from 'lucide-react';
import { Project, ActiveTab } from '../types';

interface HeaderProps {
  currentProject?: Project | null;
  allProjects: Project[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenProjectSelector: () => void;
  onOpenNewProject: () => void;
  onOpenExportPRD: () => void;
  onOpenDataBackup: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  allProjects,
  activeTab,
  onTabChange,
  onOpenProjectSelector,
  onOpenNewProject,
  onOpenExportPRD,
  onOpenDataBackup,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark with active project indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-sm tracking-tight shadow-sm">
              S
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
              Sup Project Manager
            </span>
          </div>

          {currentProject && (
            <div className="hidden sm:flex items-center text-xs text-neutral-400 dark:text-neutral-500">
              <span className="mx-2">/</span>
              <button
                onClick={onOpenProjectSelector}
                className="group flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
                title="Switch or manage projects"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentProject.color || '#0284c7' }} />
                <span className="truncate max-w-[140px] md:max-w-[200px]">{currentProject.name}</span>
                <FolderOpen className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Zone 2: Clean single-line workspace navigation tabs */}
        {currentProject && (
          <nav className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => onTabChange('features')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'features'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Feature List</span>
            </button>

            <button
              onClick={() => onTabChange('spec_walkthrough')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'spec_walkthrough'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Markdown Flow</span>
            </button>

            <button
              onClick={() => onTabChange('board')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'board'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline Board</span>
            </button>

            <button
              onClick={() => onTabChange('full_prd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'full_prd'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PRD Document</span>
            </button>
          </nav>
        )}

        {/* Zone 3: Primary action + Utilities (Theme & Backups) */}
        <div className="flex items-center gap-2 shrink-0">
          {currentProject && (
            <button
              onClick={onOpenExportPRD}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shrink-0 border border-neutral-200 dark:border-neutral-700"
              title="Download consolidated Markdown PRD"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PRD</span>
            </button>
          )}

          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenDataBackup}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Data backup, export JSON, and restore"
            aria-label="Data backups"
          >
            <FolderGit2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
