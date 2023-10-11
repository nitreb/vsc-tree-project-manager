import * as vscode from "vscode";
import { TreeItem } from "./TreeItem";
import { ProjectItemObject } from "./TreeObjectItem";

export class TreeFolderItem extends vscode.TreeItem {
  children: TreeItem[];

  constructor(label: string, children: TreeItem[]) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
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
      type: "folder",
    };
  }
}

export class UnsortedTreeFolderItem extends TreeFolderItem {
  constructor(children: TreeItem[]) {
    super("Unsorted", children);
  }

  toJSON(): ProjectItemObject {
    return {
      label: this.label as string,
      path: undefined,
      children: this.children.map((child) => child.toJSON()),
      type: "unsorted",
    };
  }
}
