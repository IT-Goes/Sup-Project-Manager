export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type FeatureStatus = 'backlog' | 'specifying' | 'ready' | 'in_progress' | 'shipped';

export interface Feature {
  id: string;
  title: string;
  summary: string;
  category: string;
  priority: Priority;
  status: FeatureStatus;
  isMarkedDown: boolean;
  markdownContent: string;
  checklistTotal: number;
  checklistDone: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  targetPlatform: string;
  tags: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
  features: Feature[];
}

export type ActiveTab = 'features' | 'board' | 'spec_walkthrough' | 'full_prd';
