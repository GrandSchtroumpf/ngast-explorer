import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, EventEmitter } from 'vscode';
import type { workspaces } from '@angular-devkit/core';
import * as fs from 'fs';
import { WorkspaceSymbols, NgModuleSymbol, ComponentSymbol } from 'ngast';
import { join } from 'path';

export type WorkspaceItem = ProjectItem | NgModuleItem | ComponentItem;

export class WorkspaceTree implements TreeDataProvider<WorkspaceItem> {
  private workspace: WorkspaceSymbols;

  constructor(
    private root: string,
    private config: workspaces.WorkspaceDefinition
  ) {
    const tsconfig = ['tsconfig.base.json', 'tsconfig.json']
      .map(path => join(root, path))
      .find(path => fs.existsSync(path));
    if (tsconfig) {
      this.workspace = new WorkspaceSymbols(tsconfig);
    } else {
      throw new Error('Could not find tsconfig.json or tsconfig.base.json')
    }
  }

  getTreeItem(item: WorkspaceItem) {
    return item;
  }

  async getChildren(item: ProjectItem | NgModuleItem) {
    if (!item) {
      const projects: ProjectItem[] = [];
      for (const [name, value] of this.config.projects.entries()) {
        const item = new ProjectItem(name, value);
        projects.push(item);
      }
      return projects;
    }

    if (item instanceof ProjectItem) {
      const sourceRoot = item.project.sourceRoot;
      if (sourceRoot) {
        const base = join(this.root, sourceRoot).split('\\').join('/');
        return this.workspace.getAllModules()
          .filter(m => m.path.startsWith(base))
          .map(m => new NgModuleItem(m));
      }
    }
    if (item instanceof NgModuleItem) {
      return item.getComponents();
    }
    return [];
  }
}

/////////////
// PROJECT //
/////////////

export class ProjectItem extends TreeItem {
  constructor(public name: string, public project: workspaces.ProjectDefinition) {
    super(name, TreeItemCollapsibleState.Collapsed);
  }

}

////////////
// MODULE //
////////////

function getModuleCollapse(symbol: NgModuleSymbol) {
  return symbol.getDeclarations().filter(s => s.isSymbol('Component')).length
    ? TreeItemCollapsibleState.Collapsed
    : TreeItemCollapsibleState.None;
}

export class NgModuleItem extends TreeItem {
  constructor(private symbol: NgModuleSymbol) {
    super(symbol.name, getModuleCollapse(symbol));
  }

  getComponents() {
    return this.symbol.getDeclarations()
      .filter(s => s.isSymbol('Component'))
      .map(s => new ComponentItem(s as ComponentSymbol));
  }
}


///////////////
// COMPONENT //
///////////////

export class ComponentItem extends TreeItem {
  description = this.symbol.metadata.selector || '';
  constructor(private symbol: ComponentSymbol) {
    super(symbol.name);
  }
}