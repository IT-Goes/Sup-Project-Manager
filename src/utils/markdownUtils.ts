import { marked } from 'marked';
import { Project, Feature } from '../types';

// Configure marked with sensible defaults
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Render Markdown string to safe HTML
 */
export function renderMarkdown(content: string): string {
  if (!content || !content.trim()) {
    return '<p class="text-neutral-400 italic">No markdown specification written yet. Click above to insert a template or start typing...</p>';
  }
  try {
    return marked.parse(content) as string;
  } catch (err) {
    console.error('Error parsing markdown:', err);
    return `<pre class="text-red-500">${content}</pre>`;
  }
}

/**
 * Calculate checklist total and completed items from markdown string
 */
export function calculateChecklistStats(content: string): { total: number; done: number } {
  if (!content) return { total: 0, done: 0 };
  
  const checkboxRegex = /^[\s]*[-*+]\s+\[([ xX])\]/gm;
  let total = 0;
  let done = 0;
  let match;

  while ((match = checkboxRegex.exec(content)) !== null) {
    total++;
    if (match[1].toLowerCase() === 'x') {
      done++;
    }
  }

  return { total, done };
}

/**
 * Estimate reading time and word count
 */
export function getMarkdownWordStats(content: string) {
  if (!content) return { words: 0, readTimeMinutes: 0, characters: 0 };
  const characters = content.length;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return { words, readTimeMinutes, characters };
}

/**
 * Common Specification Templates for Quick-Insert
 */
export const MARKDOWN_TEMPLATES = [
  {
    id: 'user_story',
    label: 'User Story & Criteria',
    description: 'Agile story with acceptance criteria checklist',
    content: `### 1. User Story
> **As a** [type of user]  
> **I want to** [perform an action]  
> **So that** [achieve an outcome / value].

### 2. Acceptance Criteria
- [ ] Must handle primary happy path
- [ ] Gracefully handle network disconnect or validation failure
- [ ] Responsive design across desktop (1440px) and mobile (<480px)
- [ ] Keyboard accessible with clear focus rings

### 3. Edge Cases & Constraints
- Empty state: what does the user see when no data is loaded?
- Error recovery: retry mechanism or descriptive feedback message.`
  },
  {
    id: 'api_spec',
    label: 'API & Data Contract',
    description: 'Endpoint definition, request payload, and schema',
    content: `### API Endpoint Specification
**Method & Route:** \`POST /api/v1/resource\`  
**Auth Required:** Yes (Bearer Token)

#### Request Body Schema
\`\`\`json
{
  "name": "Feature Item",
  "category": "Core",
  "priority": "high",
  "enabled": true
}
\`\`\`

#### Expected Responses
- \`201 Created\`: Successfully provisioned resource
- \`400 Bad Request\`: Missing required parameters
- \`401 Unauthorized\`: Expired or invalid token

#### Implementation Checklist
- [ ] Add schema validation middleware (Zod / Joi)
- [ ] Write integration test covering 400 error conditions
- [ ] Emit audit log event upon successful mutation`
  },
  {
    id: 'ui_ux_flow',
    label: 'UI/UX Component Spec',
    description: 'Visual layout, states, animations, and interactions',
    content: `### Visual Architecture & UX Flow

#### Component Hierarchy
- \`<Header />\`: Single-line brand mark, nav tabs, primary action
- \`<MainViewport />\`: 60% neutral canvas, 30% structural surfaces
- \`<DetailPane />\`: Contextual inspector with edit controls

#### Interaction States
- [ ] **Default / Resting**: Clean typography, subtle hairline border
- [ ] **Hover / Focus**: 150ms cubic-bezier transition, visible outline
- [ ] **Loading / Skeleton**: Tabular row skeleton with zero layout jitter
- [ ] **Success State**: Subtle non-blocking indicator`
  },
  {
    id: 'full_prd',
    label: 'Comprehensive PRD Template',
    description: 'Full Product Requirements Document format',
    content: `## 1. Problem Statement
Describe the core pain point this feature solves for the target user.

## 2. Proposed Solution
High-level overview of the feature mechanics, user workflow, and expected behavior.

## 3. Detailed Requirements
### Functional
- [ ] Requirement 1: Core interaction
- [ ] Requirement 2: Data persistence and offline cache
- [ ] Requirement 3: Export or sharing mechanism

### Non-Functional
- [ ] Response latency $\\le 200\\text{ms}$
- [ ] WCAG AA color contrast compliance

## 4. Technical Architecture
Notes on state management, dependencies, database schema, or third-party integrations.`
  }
];

/**
 * Generate a complete, polished consolidated Master PRD Markdown document for the entire project
 */
export function generateConsolidatedProjectPRD(project: Project): string {
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalFeatures = project.features.length;
  const markedDownCount = project.features.filter(f => f.isMarkedDown).length;
  const shippedCount = project.features.filter(f => f.status === 'shipped').length;

  let prd = `# ${project.name} — Product Specification Document (PRD)\n\n`;
  prd += `> Generated by **Sup Project Manager** · Free & Zero-Account Workspace\n`;
  prd += `> Date: ${now} · Status: ${markedDownCount}/${totalFeatures} Features Specified\n\n`;

  prd += `## 1. Executive Summary\n`;
  prd += `${project.description || 'No description provided.'}\n\n`;
  prd += `- **Target Platform:** ${project.targetPlatform || 'Web / General'}\n`;
  if (project.tags && project.tags.length > 0) {
    prd += `- **Domain & Tech Stack:** ${project.tags.join(', ')}\n`;
  }
  prd += `- **Specification Progress:** ${markedDownCount} of ${totalFeatures} features detailed (${totalFeatures > 0 ? Math.round((markedDownCount / totalFeatures) * 100) : 0}% complete)\n`;
  prd += `- **Shipped Features:** ${shippedCount} of ${totalFeatures}\n\n`;

  prd += `## 2. Feature Roadmap & Status Matrix\n\n`;
  prd += `| # | Feature Name | Category | Priority | Status | Spec Ready |\n`;
  prd += `|---|---|---|---|---|:---:|\n`;
  project.features.forEach((feat, idx) => {
    const isReadyEmoji = feat.isMarkedDown ? '✅ Yes' : '⏳ Draft';
    const statusLabel = feat.status.replace('_', ' ').toUpperCase();
    prd += `| ${idx + 1} | [${feat.title}](#${slugify(feat.title)}) | ${feat.category} | ${feat.priority.toUpperCase()} | ${statusLabel} | ${isReadyEmoji} |\n`;
  });
  prd += `\n---\n\n`;

  prd += `## 3. Detailed Feature Specifications\n\n`;

  if (project.features.length === 0) {
    prd += `*No features have been added to this project yet.*\n`;
  } else {
    project.features.forEach((feat, idx) => {
      prd += `### <a id="${slugify(feat.title)}"></a>${idx + 1}. ${feat.title}\n\n`;
      prd += `- **Category:** ${feat.category} · **Priority:** ${feat.priority.toUpperCase()} · **Status:** ${feat.status.replace('_', ' ')}\n`;
      if (feat.summary) {
        prd += `- **Summary:** *${feat.summary}*\n`;
      }
      prd += `\n`;
      if (feat.markdownContent && feat.markdownContent.trim()) {
        prd += `${feat.markdownContent.trim()}\n\n`;
      } else {
        prd += `*Markdown specification is pending for this feature.*\n\n`;
      }
      prd += `---\n\n`;
    });
  }

  prd += `\n*End of Product Specification Document for ${project.name}*\n`;

  return prd;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}
