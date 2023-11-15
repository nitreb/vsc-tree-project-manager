import * as vscode from "vscode";
import { TreeItem, compareTreeItems } from "./TreeItem";
import { ProjectItemObject } from "./TreeObjectItem";

export class TreeFolderItem extends vscode.TreeItem {
  label: string;
  children: TreeItem[];

  constructor(label: string, children: TreeItem[], isCollapsed: boolean) {
    super(
      label,
      isCollapsed
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.Expanded,
    );
    this.label = label;
    this.tooltip = `${this.label}`;
    this.children = children;
    this.iconPath = new vscode.ThemeIcon("folder");
    this.contextValue = "folderItem";
  }

  deleteChild(item: TreeItem): void {
    const index = this.children.indexOf(item);
    if (index >= 0) {
      this.children.splice(index, 1);
    }
    this.children.forEach((child) => {
      if (child instanceof TreeFolderItem) {
        child.deleteChild(item);
      }
    });
  }

  toJSON(): ProjectItemObject {
    return {
      label: this.label as string,
      path: undefined,
      children: this.children.map((child) => child.toJSON()),
      isCollapsed:
        this.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed,
      type: "folder",
    };
  }

  recursivelySortChildren() {
    this.children.sort(compareTreeItems);
    this.children.forEach((child) => {
      if (child instanceof TreeFolderItem) {
        child.recursivelySortChildren();
      }
    });
  }
}

export class UnsortedTreeFolderItem extends TreeFolderItem {
  constructor(children: TreeItem[], isCollapsed: boolean) {
    super("Unsorted", children, isCollapsed);
    this.iconPath = new vscode.ThemeIcon("files");
  }

  toJSON(): ProjectItemObject {
    return {
      label: this.label as string,
      path: undefined,
      children: this.children.map((child) => child.toJSON()),
      isCollapsed:
        this.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed,
      type: "unsorted",
    };
  }
}
