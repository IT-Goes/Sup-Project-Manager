import React from 'react';
import { 
  FileText, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ListTodo, 
  PlusCircle 
} from 'lucide-react';
import { Feature, FeatureStatus, Priority } from '../types';

interface KanbanBoardProps {
  features: Feature[];
  onOpenMarkdownModal: (featureId: string) => void;
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
}

const COLUMNS: { id: FeatureStatus; title: string; hint: string }[] = [
  { id: 'backlog', title: 'Backlog', hint: 'Initial feature ideas' },
  { id: 'specifying', title: 'Specifying', hint: 'Authoring markdown' },
  { id: 'ready', title: 'Ready to Build', hint: 'Markdown approved' },
  { id: 'in_progress', title: 'In Dev', hint: 'Building feature' },
  { id: 'shipped', title: 'Shipped', hint: 'Live in app' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  features,
  onOpenMarkdownModal,
  onUpdateFeature,
}) => {
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

  const moveFeature = (featureId: string, currentStatus: FeatureStatus, direction: 'prev' | 'next') => {
    const statusOrder: FeatureStatus[] = ['backlog', 'specifying', 'ready', 'in_progress', 'shipped'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    if (direction === 'prev' && currentIdx > 0) {
      onUpdateFeature(featureId, { status: statusOrder[currentIdx - 1] });
    } else if (direction === 'next' && currentIdx < statusOrder.length - 1) {
      onUpdateFeature(featureId, { status: statusOrder[currentIdx + 1] });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colFeatures = features.filter(f => f.status === col.id);

          return (
            <div 
              key={col.id} 
              className="bg-neutral-100/70 dark:bg-neutral-900/50 rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 flex flex-col h-[75vh]"
            >
              
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    {col.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {col.hint}
                  </p>
                </div>
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md font-mono tabular-nums border border-neutral-200 dark:border-neutral-700">
                  {colFeatures.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colFeatures.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                    No features in {col.title}
                  </div>
                ) : (
                  colFeatures.map((feat) => {
                    const statusOrder: FeatureStatus[] = ['backlog', 'specifying', 'ready', 'in_progress', 'shipped'];
                    const currentIdx = statusOrder.indexOf(feat.status);

                    return (
                      <div
                        key={feat.id}
                        className="bg-white dark:bg-neutral-800/90 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700/80 shadow-2xs hover:shadow-xs transition-shadow group flex flex-col justify-between gap-2.5"
                      >
                        
                        {/* Title and metadata */}
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[130px]">
                              {feat.category}
                            </span>
                            <span className={`text-[10px] ${getPriorityStyle(feat.priority)} capitalize`}>
                              {feat.priority}
                            </span>
                          </div>

                          <h5 
                            onClick={() => onOpenMarkdownModal(feat.id)}
                            className="text-xs font-semibold text-neutral-900 dark:text-white cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 leading-snug line-clamp-2"
                          >
                            {feat.title}
                          </h5>

                          {feat.summary && (
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                              {feat.summary}
                            </p>
                          )}
                        </div>

                        {/* Checklist & Markdown stats */}
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                          
                          <div className="flex items-center gap-1.5">
                            {feat.checklistTotal > 0 ? (
                              <span className="flex items-center gap-0.5 font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
                                <ListTodo className="w-3 h-3 text-sky-500" />
                                <span>{feat.checklistDone}/{feat.checklistTotal}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-400">0 tasks</span>
                            )}

                            {feat.isMarkedDown && (
                              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-0.5" title="Marked down">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Spec</span>
                              </span>
                            )}
                          </div>

                          {/* Quick Card Controls */}
                          <div className="flex items-center gap-1">
                            {currentIdx > 0 && (
                              <button
                                onClick={() => moveFeature(feat.id, feat.status, 'prev')}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                title="Move Left"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => onOpenMarkdownModal(feat.id)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 hover:text-sky-600 transition-colors"
                              title="Markdown Spec"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {currentIdx < statusOrder.length - 1 && (
                              <button
                                onClick={() => moveFeature(feat.id, feat.status, 'next')}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                title="Move Right"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
