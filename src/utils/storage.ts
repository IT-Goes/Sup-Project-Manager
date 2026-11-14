import { Project } from '../types';

const STORAGE_KEY = 'sup_project_manager_data_v2';
const LEGACY_STORAGE_KEY = 'sup_project_manager_data_v1';
const ACTIVE_PROJECT_KEY = 'sup_project_manager_active_id_v2';
const THEME_KEY = 'sup_project_manager_theme';

export function loadStoredProjects(): Project[] {
  try {
    // Check current storage key
    let raw = localStorage.getItem(STORAGE_KEY);
    
    // If not found, check legacy key and migrate if user created custom projects
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacyParsed = JSON.parse(legacyRaw);
          if (Array.isArray(legacyParsed)) {
            // Strip out old mock presets
            const userOnly = legacyParsed.filter(
              (p: Project) => p.id !== 'proj_sup_manager' && p.id !== 'proj_saas_analytics'
            );
            if (userOnly.length > 0) {
              saveStoredProjects(userOnly);
              return userOnly;
            }
          }
        } catch {
          // ignore
        }
      }
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any mock presets
      return parsed.filter(
        (p: Project) => p.id !== 'proj_sup_manager' && p.id !== 'proj_saas_analytics'
      );
    }
    return [];
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return [];
  }
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to storage:', err);
  }
}

export function loadActiveProjectId(fallbackId: string): string {
  try {
    const id = localStorage.getItem(ACTIVE_PROJECT_KEY);
    return id || fallbackId;
  } catch {
    return fallbackId;
  }
}

export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch (err) {
    console.error('Failed to save active project ID:', err);
  }
}

export function exportBackupJSON(projects: Project[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `sup_project_manager_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function downloadMarkdownFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', filename.endsWith('.md') ? filename : `${filename}.md`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme:', err);
  }
}
