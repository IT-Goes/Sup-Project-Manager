import React from 'react';
import { 
  X, 
  Plus, 
  FolderOpen, 
  Check, 
  Trash2, 
  Copy, 
  Calendar, 
  Layers 
} from 'lucide-react';
import { Project } from '../types';

interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
}

export const ProjectSelectorModal: React.FC<ProjectSelectorModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onDuplicateProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Projects & Workspaces
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const total = proj.features.length;
            const markedCount = proj.features.filter(f => f.isMarkedDown).length;
            const percent = total > 0 ? Math.round((markedCount / total) * 100) : 0;

            return (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isActive
                    ? 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: proj.color || '#0284c7' }}
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {proj.name}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-1.5 py-0.2 rounded font-mono">
                          Active
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {proj.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 pt-1 font-mono tabular-nums">
                      <span>{total} features</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{markedCount} specified ({percent}%)</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div 
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onDuplicateProject(proj.id)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Duplicate project"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {projects.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete project "${proj.name}" and all its features?`)) {
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shrink-0 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {projects.length} {projects.length === 1 ? 'Project' : 'Projects'} in workspace
          </span>
          <button
            onClick={() => {
              onClose();
              onNewProject();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create New Project</span>
          </button>
        </div>

      </div>
    </div>
  );
};
