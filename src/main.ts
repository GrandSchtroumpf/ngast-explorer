import * as vscode from 'vscode';
import { workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import { join } from 'path';
import { WorkspaceTree } from './tree';

export async function activate(context: vscode.ExtensionContext) {
  const root = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (root) {
    const ngJsonPath = join(root, 'angular.json');
    const host = workspaces.createWorkspaceHost(new NodeJsSyncHost());
    const { workspace } = await workspaces.readWorkspace(ngJsonPath, host);
    const treeDataProvider = new WorkspaceTree(root, workspace);
    const treeView = vscode.window.createTreeView('workspaceTree', { treeDataProvider });

    const listeners = [
      treeView,
      // vscode.commands.registerCommand('project.selected', (name, project) => this.selectProject(name, project)),
      // vscode.commands.registerCommand('module.selected', module => this.selectModule(module)),
      // vscode.commands.registerCommand('component.selected', directive => this.selectComponent(directive)),
    ];

    listeners.forEach(sub => context.subscriptions.push(sub));
  }
}
