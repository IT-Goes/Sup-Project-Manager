/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Project, 
  Feature, 
  Priority, 
  FeatureStatus, 
  ActiveTab 
} from './types';
import { 
  loadStoredProjects, 
  saveStoredProjects, 
  loadActiveProjectId, 
  saveActiveProjectId,
  loadTheme,
  saveTheme
} from './utils/storage';
import { Header } from './components/Header';
import { ProjectOverview } from './components/ProjectOverview';
import { FeatureList } from './components/FeatureList';
import { KanbanBoard } from './components/KanbanBoard';
import { SequentialMarkdownModal } from './components/SequentialMarkdownModal';
import { FullProjectExportModal } from './components/FullProjectExportModal';
import { ProjectModal } from './components/ProjectModal';
import { ProjectSelectorModal } from './components/ProjectSelectorModal';
import { DataManagementModal } from './components/DataManagementModal';
import { FolderPlus, Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  // 1. Projects state
  const [projects, setProjects] = useState<Project[]>(() => loadStoredProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const loaded = loadStoredProjects();
    return loadActiveProjectId(loaded[0]?.id || '');
  });

  // 2. Navigation & View state
  const [activeTab, setActiveTab] = useState<ActiveTab>('features');

  // 3. Modals state
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [targetFeatureId, setTargetFeatureId] = useState<string | undefined>(undefined);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isExportPRDOpen, setIsExportPRDOpen] = useState(false);
  const [isDataBackupOpen, setIsDataBackupOpen] = useState(false);

  // Initial Onboarding Project Form State (when no projects exist)
  const [initialProjectName, setInitialProjectName] = useState('');
  const [initialDescription, setInitialDescription] = useState('');
  const [initialPlatform, setInitialPlatform] = useState('');

  // 4. Dual-Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Sync projects to localStorage on mutation
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Sync active project id
  useEffect(() => {
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  // Get active project
  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Switch tab handlers
  const handleTabChange = (tab: ActiveTab) => {
    if (!currentProject) return;

    if (tab === 'spec_walkthrough') {
      // Find first feature needing spec or first feature
      const pending = currentProject.features.find(f => !f.isMarkedDown) || currentProject.features[0];
      if (pending) {
        setTargetFeatureId(pending.id);
        setIsMarkdownModalOpen(true);
      } else {
        alert('Please add at least one feature to launch the Markdown Flow!');
      }
      return;
    }
    if (tab === 'full_prd') {
      setIsExportPRDOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Add Feature (clean, no mock text injected)
  const handleAddFeature = (title: string, category: string, priority: Priority) => {
    if (!currentProject) return;

    const newFeature: Feature = {
      id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      summary: '',
      category: category || 'General',
      priority: priority || 'high',
      status: 'backlog',
      isMarkedDown: false,
      markdownContent: '', // Clean blank markdown for user to write
      checklistTotal: 0,
      checklistDone: 0,
      order: currentProject.features.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === currentProject.id) {
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            features: [newFeature, ...proj.features],
          };
        }
        return proj;
      })
    );
  };

  // Update Feature
  const handleUpdateFeature = (featureId: string, updates: Partial<Feature>) => {
    if (!currentProject) return;

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === currentProject.id) {
          const updatedFeatures = proj.features.map(f => {
            if (f.id === featureId) {
              return { ...f, ...updates, updatedAt: new Date().toISOString() };
            }
            return f;
          });
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            features: updatedFeatures,
          };
        }
        return proj;
      })
    );
  };

  // Delete Feature
  const handleDeleteFeature = (featureId: string) => {
    if (!currentProject) return;

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === currentProject.id) {
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            features: proj.features.filter(f => f.id !== featureId),
          };
        }
        return proj;
      })
    );
  };

  // Duplicate Feature
  const handleDuplicateFeature = (featureId: string) => {
    if (!currentProject) return;

    const feat = currentProject.features.find(f => f.id === featureId);
    if (!feat) return;

    const duplicated: Feature = {
      ...feat,
      id: `feat_${Date.now()}_copy`,
      title: `${feat.title} (Copy)`,
      order: currentProject.features.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === currentProject.id) {
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            features: [...proj.features, duplicated],
          };
        }
        return proj;
      })
    );
  };

  // Reorder Feature
  const handleReorderFeature = (featureId: string, direction: 'up' | 'down') => {
    if (!currentProject) return;

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === currentProject.id) {
          const items = [...proj.features];
          const index = items.findIndex(f => f.id === featureId);
          if (index === -1) return proj;

          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= items.length) return proj;

          const temp = items[index];
          items[index] = items[targetIndex];
          items[targetIndex] = temp;

          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            features: items,
          };
        }
        return proj;
      })
    );
  };

  // Create Project
  const handleSaveNewProject = (projectData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      targetPlatform: projectData.targetPlatform || '',
      tags: projectData.tags || [],
      color: projectData.color || '#0284c7',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      features: [],
    };

    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
  };

  // Handle Initial Onboarding Project Creation
  const handleCreateInitialProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialProjectName.trim()) return;

    handleSaveNewProject({
      name: initialProjectName.trim(),
      description: initialDescription.trim(),
      targetPlatform: initialPlatform.trim(),
    });

    setInitialProjectName('');
    setInitialDescription('');
    setInitialPlatform('');
  };

  // Update Existing Project Details
  const handleUpdateCurrentProject = (projectData: Partial<Project>) => {
    if (!currentProject) return;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === currentProject.id) {
          return {
            ...p,
            ...projectData,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  // Delete Project
  const handleDeleteProject = (projectId: string) => {
    const remaining = projects.filter(p => p.id !== projectId);
    setProjects(remaining);
    if (remaining.length > 0) {
      setActiveProjectId(remaining[0].id);
    } else {
      setActiveProjectId('');
    }
  };

  // Duplicate Project
  const handleDuplicateProject = (projectId: string) => {
    const original = projects.find(p => p.id === projectId);
    if (!original) return;

    const dupProj: Project = {
      ...original,
      id: `proj_${Date.now()}_copy`,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      features: original.features.map(f => ({
        ...f,
        id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      })),
    };

    setProjects(prev => [dupProj, ...prev]);
    setActiveProjectId(dupProj.id);
  };

  // Start Sequential Markdown Flow
  const handleStartSequentialMarkdown = () => {
    if (!currentProject || currentProject.features.length === 0) {
      alert('Add at least one feature to begin authoring markdown specs!');
      return;
    }
    const pending = currentProject.features.find(f => !f.isMarkedDown) || currentProject.features[0];
    setTargetFeatureId(pending.id);
    setIsMarkdownModalOpen(true);
  };

  // Open Markdown Modal for a specific feature
  const handleOpenMarkdownForFeature = (featureId: string) => {
    setTargetFeatureId(featureId);
    setIsMarkdownModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Top Bar Contract Navigation */}
      <Header
        currentProject={currentProject}
        allProjects={projects}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenProjectSelector={() => setIsProjectSelectorOpen(true)}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenExportPRD={() => setIsExportPRDOpen(true)}
        onOpenDataBackup={() => setIsDataBackupOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* If no projects exist, show clean initial project creation view */}
        {!currentProject ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-sm">
              S
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Create your project
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto">
              Name your application and list down all the features you want to add to your app. Then markdown that feature, then another, then that.
            </p>

            <form onSubmit={handleCreateInitialProject} className="mt-8 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm text-left space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Project / App Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={initialProjectName}
                  onChange={(e) => setInitialProjectName(e.target.value)}
                  placeholder="e.g., My Awesome App, TaskFlow, SocialHub"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Goal (optional)
                </label>
                <input
                  type="text"
                  value={initialDescription}
                  onChange={(e) => setInitialDescription(e.target.value)}
                  placeholder="What is this application for?"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Platform / Tech Stack (optional)
                </label>
                <input
                  type="text"
                  value={initialPlatform}
                  onChange={(e) => setInitialPlatform(e.target.value)}
                  placeholder="e.g., Web, iOS, Android, Full Stack, CLI"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!initialProjectName.trim()}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Create Project & Start Brainstorming</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Project Overview & Rapid Feature Capture */}
            <ProjectOverview
              project={currentProject}
              onAddFeature={handleAddFeature}
              onOpenEditProject={() => setIsEditProjectModalOpen(true)}
              onStartSequentialMarkdown={handleStartSequentialMarkdown}
            />

            {/* View Content (Feature List or Kanban Pipeline) */}
            {activeTab === 'features' && (
              <FeatureList
                features={currentProject.features}
                onOpenMarkdownModal={handleOpenMarkdownForFeature}
                onUpdateFeature={handleUpdateFeature}
                onDeleteFeature={handleDeleteFeature}
                onDuplicateFeature={handleDuplicateFeature}
                onReorderFeature={handleReorderFeature}
              />
            )}

            {activeTab === 'board' && (
              <KanbanBoard
                features={currentProject.features}
                onOpenMarkdownModal={handleOpenMarkdownForFeature}
                onUpdateFeature={handleUpdateFeature}
              />
            )}
          </>
        )}

      </main>

      {/* Footer: Quiet editorial footer */}
      <footer className="mt-auto py-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Sup Project Manager</span>
            <span>·</span>
            <span>Free Forever, No Account Needed</span>
            <span>·</span>
            <span>Local-First Markdown Spec Engine</span>
          </div>
          <div className="flex items-center gap-4">
            {currentProject && (
              <button
                onClick={() => setIsExportPRDOpen(true)}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Export PRD Markdown
              </button>
            )}
            <button
              onClick={() => setIsDataBackupOpen(true)}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Backup & Portability
            </button>
          </div>
        </div>
      </footer>

      {/* Sequential Markdown Studio Modal ("Markdown that feature, then another, then that") */}
      {currentProject && (
        <SequentialMarkdownModal
          features={currentProject.features}
          initialFeatureId={targetFeatureId}
          isOpen={isMarkdownModalOpen}
          onClose={() => setIsMarkdownModalOpen(false)}
          onUpdateFeature={handleUpdateFeature}
          onDeleteFeature={handleDeleteFeature}
          projectName={currentProject.name}
        />
      )}

      {/* Full Master PRD Document & Export Modal */}
      {currentProject && (
        <FullProjectExportModal
          project={currentProject}
          isOpen={isExportPRDOpen}
          onClose={() => setIsExportPRDOpen(false)}
        />
      )}

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleSaveNewProject}
      />

      {/* Project Edit Modal */}
      {currentProject && (
        <ProjectModal
          isOpen={isEditProjectModalOpen}
          onClose={() => setIsEditProjectModalOpen(false)}
          onSave={handleUpdateCurrentProject}
          initialProject={currentProject}
        />
      )}

      {/* Project Switcher Modal */}
      <ProjectSelectorModal
        isOpen={isProjectSelectorOpen}
        onClose={() => setIsProjectSelectorOpen(false)}
        projects={projects}
        activeProjectId={currentProject?.id || ''}
        onSelectProject={(id) => setActiveProjectId(id)}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
      />

      {/* Data Backup & Restore Modal */}
      <DataManagementModal
        isOpen={isDataBackupOpen}
        onClose={() => setIsDataBackupOpen(false)}
        projects={projects}
        onImportBackup={(imported) => {
          setProjects(imported);
          if (imported[0]) setActiveProjectId(imported[0].id);
        }}
        onClearAll={() => {
          setProjects([]);
          setActiveProjectId('');
        }}
      />

    </div>
  );
}
