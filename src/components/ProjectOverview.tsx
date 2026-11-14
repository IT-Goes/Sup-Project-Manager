import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  FileCheck, 
  ListTodo, 
  Settings2,
  ArrowRight
} from 'lucide-react';
import { Project, Priority } from '../types';

interface ProjectOverviewProps {
  project: Project;
  onAddFeature: (title: string, category: string, priority: Priority) => void;
  onOpenEditProject: () => void;
  onStartSequentialMarkdown: () => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  onAddFeature,
  onOpenEditProject,
  onStartSequentialMarkdown,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('high');

  const totalFeatures = project.features.length;
  const markedDownCount = project.features.filter(f => f.isMarkedDown).length;
  const shippedCount = project.features.filter(f => f.status === 'shipped').length;
  
  // Total checklist items
  const totalTasks = project.features.reduce((acc, f) => acc + (f.checklistTotal || 0), 0);
  const doneTasks = project.features.reduce((acc, f) => acc + (f.checklistDone || 0), 0);

  const specProgressPercent = totalFeatures > 0 ? Math.round((markedDownCount / totalFeatures) * 100) : 0;

  // Existing categories in this project for smart autocompletion
  const existingCategories = Array.from(new Set(project.features.map(f => f.category))).filter(Boolean);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    onAddFeature(newTitle.trim(), newCategory.trim() || 'General', newPriority);
    setNewTitle('');
    // Keep category or leave blank for next
  };

  const nextPendingFeature = project.features.find(f => !f.isMarkedDown) || project.features[0];

  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Project Header & Metadata */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {project.name}
              </h1>
              <button
                onClick={onOpenEditProject}
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                title="Edit Project Details"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
            </div>

            {project.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Zero-Pill Metadata Discipline: Clean unboxed text with · separators */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              {project.targetPlatform && <span>{project.targetPlatform}</span>}
              {project.targetPlatform && project.tags && project.tags.length > 0 && <span aria-hidden="true">·</span>}
              {project.tags && project.tags.length > 0 && (
                <span>{project.tags.join(', ')}</span>
              )}
              {((project.targetPlatform) || (project.tags && project.tags.length > 0)) && <span aria-hidden="true">·</span>}
              <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Quick CTA to start Markdown Flow */}
          {totalFeatures > 0 && (
            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              <button
                onClick={onStartSequentialMarkdown}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {markedDownCount === totalFeatures ? 'Review Markdown Specs' : `Markdown Features (${markedDownCount}/${totalFeatures})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {nextPendingFeature && !nextPendingFeature.isMarkedDown && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Next up: <span className="font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[200px] inline-block align-bottom">{nextPendingFeature.title}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* High-Density Metric Grid (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Features</div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
                {totalFeatures}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <span>Marked Down</span>
                <span className="font-mono tabular-nums text-neutral-700 dark:text-neutral-300 font-semibold">{specProgressPercent}%</span>
              </div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
                {markedDownCount} <span className="text-xs font-normal text-neutral-400">/ {totalFeatures}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Shipped</div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
                {shippedCount} <span className="text-xs font-normal text-neutral-400">/ {totalFeatures}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Checklist Tasks</div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
                {doneTasks} <span className="text-xs font-normal text-neutral-400">/ {totalTasks}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Progress bar across features */}
        {totalFeatures > 0 && (
          <div className="mt-4 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-sky-600 dark:bg-sky-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${specProgressPercent}%` }}
            />
          </div>
        )}

        {/* Feature Quick-Capture Bar: Instant Brainstorming */}
        <form onSubmit={handleQuickAdd} className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            <div className="relative flex-1">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Type a feature name you want to add and press Enter..."
                className="w-full h-10 px-3.5 text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
              />
            </div>

            {/* Category Input (with datalist of user's own categories) */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                list="existing-project-categories"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category (e.g. Core, Auth, UI)"
                className="h-10 px-3 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow w-36 sm:w-44"
              />
              <datalist id="existing-project-categories">
                {existingCategories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>

              {/* Priority Selector */}
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="h-10 px-3 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Add Button */}
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="h-10 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Feature</span>
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};
