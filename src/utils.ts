import { workspaces } from "@angular-devkit/core";

export function getProject(workspace: workspaces.WorkspaceDefinition, type: 'application' | 'library') {
  const projects: workspaces.ProjectDefinition[] = [];
  workspace.projects.forEach(project => {
    if (isProjectType(project, type)) {
      projects.push(project);
    }
  })
  return projects;
}

export function isProjectType(project: workspaces.ProjectDefinition, type: 'application' | 'library') {
  return project.extensions['projectType'] === type;
}