import * as vscode from "vscode";
import { ProjectItemObject } from "./TreeObjectItem";

export class TreeProjectItem extends vscode.TreeItem {
  label: string;
  resourceUri: vscode.Uri;

  constructor(label: string, path: vscode.Uri) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.label = label;
    this.resourceUri = path;
    this.iconPath = new vscode.ThemeIcon("circle-outline");
    this.contextValue = "projectItem";
    this.command = {
      command: "treeprojectmanager.openProject",
      title: "Open project",
      arguments: [this],
    };
    this.tooltip = new vscode.MarkdownString(
      `${this.label as string}  
      *${this.resourceUri.path}*
      `,
    );
  }

  toJSON(): ProjectItemObject {
    return {
      label: this.label as string,
      path: this.resourceUri.path,
      children: undefined,
      isCollapsed: false,
      type: "project",
    };
  }
}
