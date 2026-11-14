import React, { useState } from 'react';
import { 
  Check, 
  Search, 
  Sparkles, 
  FileText, 
  MoreVertical, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2,
  Clock,
  Layers,
  ListTodo
} from 'lucide-react';
import { Feature, Priority, FeatureStatus } from '../types';

interface FeatureListProps {
  features: Feature[];
  onOpenMarkdownModal: (featureId: string) => void;
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
  onDeleteFeature: (featureId: string) => void;
  onDuplicateFeature: (featureId: string) => void;
  onReorderFeature: (featureId: string, direction: 'up' | 'down') => void;
  onQuickAddTrigger?: () => void;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  features,
  onOpenMarkdownModal,
  onUpdateFeature,
  onDeleteFeature,
  onDuplicateFeature,
  onReorderFeature,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecStatus, setFilterSpecStatus] = useState<'all' | 'needs_spec' | 'marked_down'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(features.map(f => f.category))).filter(Boolean);

  // Filtering logic
  const filteredFeatures = features.filter(f => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = f.title.toLowerCase().includes(q);
      const matchCat = f.category.toLowerCase().includes(q);
      const matchSummary = f.summary?.toLowerCase().includes(q);
      const matchContent = f.markdownContent?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchSummary && !matchContent) return false;
    }

    if (filterSpecStatus === 'needs_spec' && f.isMarkedDown) return false;
    if (filterSpecStatus === 'marked_down' && !f.isMarkedDown) return false;

    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    if (filterPriority !== 'all' && f.priority !== filterPriority) return false;

    return true;
  });

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-600 dark:text-amber-400 font-medium';
      case 'medium':
        return 'text-sky-600 dark:text-sky-400';
      case 'low':
      default:
        return 'text-neutral-500 dark:text-neutral-400';
    }
  };

  const getStatusBadge = (status: FeatureStatus) => {
    switch (status) {
      case 'shipped':
        return { label: 'Shipped', style: 'text-emerald-700 dark:text-emerald-300' };
      case 'in_progress':
        return { label: 'In Progress', style: 'text-sky-700 dark:text-sky-300' };
      case 'ready':
        return { label: 'Ready to Build', style: 'text-indigo-700 dark:text-indigo-300' };
      case 'specifying':
        return { label: 'Specifying', style: 'text-amber-700 dark:text-amber-300' };
      case 'backlog':
      default:
        return { label: 'Backlog', style: 'text-neutral-600 dark:text-neutral-400' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-colors">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features by name, markdown keywords, category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Spec Status Filter */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterSpecStatus('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSpecStatus === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All ({features.length})
            </button>
            <button
              onClick={() => setFilterSpecStatus('needs_spec')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSpecStatus === 'needs_spec'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Needs Spec ({features.filter(f => !f.isMarkedDown).length})
            </button>
            <button
              onClick={() => setFilterSpecStatus('marked_down')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSpecStatus === 'marked_down'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Marked Down ({features.filter(f => f.isMarkedDown).length})
            </button>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-1 px-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="py-1 px-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

        </div>

      </div>

      {/* Feature Items List */}
      {filteredFeatures.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center transition-colors">
          <Layers className="w-10 h-10 mx-auto text-neutral-400 dark:text-neutral-600 mb-3" />
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            {features.length === 0 ? 'No features listed yet' : 'No matching features'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
            {features.length === 0 
              ? 'Use the capture bar above to jot down the first feature you want in your application.'
              : 'Try clearing your filters or search keywords.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/80 transition-colors shadow-2xs">
          {filteredFeatures.map((feat, index) => {
            const hasMarkdown = !!(feat.markdownContent && feat.markdownContent.trim());
            const statusInfo = getStatusBadge(feat.status);

            return (
              <div 
                key={feat.id}
                className="group p-4 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                
                {/* Left: Checkbox toggle & Feature Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  
                  {/* Marked Down Checkbox */}
                  <button
                    onClick={() => onUpdateFeature(feat.id, { isMarkedDown: !feat.isMarkedDown })}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      feat.isMarkedDown
                        ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                    }`}
                    title={feat.isMarkedDown ? 'Marked down (Click to unmark)' : 'Click to mark down this feature'}
                  >
                    {feat.isMarkedDown && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 
                        onClick={() => onOpenMarkdownModal(feat.id)}
                        className="text-sm font-semibold text-neutral-900 dark:text-white cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate"
                      >
                        {feat.title}
                      </h4>

                      {/* Zero-Pill Metadata with · separator */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>·</span>
                        <span className="capitalize">{feat.category}</span>
                        <span>·</span>
                        <span className={`capitalize ${getPriorityStyle(feat.priority)}`}>
                          {feat.priority}
                        </span>
                      </div>
                    </div>

                    {/* Summary or Markdown Preview snippet */}
                    {feat.summary && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                        {feat.summary}
                      </p>
                    )}

                    {/* Task checklist stats */}
                    <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500 pt-0.5 font-mono tabular-nums">
                      {feat.checklistTotal > 0 ? (
                        <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                          <ListTodo className="w-3 h-3 text-sky-500" />
                          <span>{feat.checklistDone}/{feat.checklistTotal} checklist tasks</span>
                        </span>
                      ) : (
                        <span>No checklist yet</span>
                      )}

                      <span>·</span>

                      {hasMarkdown ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Spec written ({Math.round((feat.markdownContent.length) / 5)} words)
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">
                          No markdown spec yet
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right: Actions and Workflow Selector */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  
                  {/* Status Dropdown */}
                  <select
                    value={feat.status}
                    onChange={(e) => onUpdateFeature(feat.id, { status: e.target.value as FeatureStatus })}
                    className={`text-xs py-1 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-medium focus:outline-none ${statusInfo.style}`}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="specifying">Specifying</option>
                    <option value="ready">Ready</option>
                    <option value="in_progress">In Dev</option>
                    <option value="shipped">Shipped</option>
                  </select>

                  {/* Primary "Markdown Spec" CTA */}
                  <button
                    onClick={() => onOpenMarkdownModal(feat.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-100 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
                    title="Write or review feature markdown"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Markdown Spec</span>
                  </button>

                  {/* Move Up / Down Buttons */}
                  <div className="hidden sm:flex items-center gap-0.5">
                    <button
                      onClick={() => onReorderFeature(feat.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onReorderFeature(feat.id, 'down')}
                      disabled={index === filteredFeatures.length - 1}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Secondary Actions (Duplicate / Delete) */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === feat.id ? null : feat.id)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="More actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === feat.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-20">
                        <button
                          onClick={() => {
                            onDuplicateFeature(feat.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete feature "${feat.title}"?`)) {
                              onDeleteFeature(feat.id);
                            }
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
