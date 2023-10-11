import * as vscode from "vscode";

export class ConfigurationManager {
  private _treeProjectManagerConfiguration =
    vscode.workspace.getConfiguration("treeProjectManager");
  private _baseWorkspaceDirectories?: string[] =
    this._treeProjectManagerConfiguration.get("baseWorkspaceDirectories");
  private _maximumDepthRecursion?: number =
    this._treeProjectManagerConfiguration.get("maximumDepthRecursion");
  private _excludedFolders?: string[] =
    this._treeProjectManagerConfiguration.get("excludedFolders");

  get baseWorkspaceDirectories(): string[] {
    if (this._baseWorkspaceDirectories) {
      return this._baseWorkspaceDirectories;
    }
    this._promptUserForWorkspaceDirectory().then((directory) => {
      return [directory];
    });
    return [];
  }

  get maximumDepthRecursion(): number {
    if (this._maximumDepthRecursion) {
      return this._maximumDepthRecursion;
    }
    return 0;
  }

  get excludedFolders(): string[] {
    if (this._excludedFolders) {
      return this._excludedFolders;
    }
    return [];
  }

  private async _promptUserForWorkspaceDirectory(): Promise<string> {
    const currentWorkspaces = vscode.workspace.workspaceFolders;
    let prefilledDirectory = require("os").homedir();
    if (currentWorkspaces) {
      prefilledDirectory = currentWorkspaces[0].uri.path;
    }
    vscode.window
      .showInputBox({
        value: prefilledDirectory,
        prompt: "Please provide a directory where to look for projects.",
      })
      .then((directory) => {
        if (directory) {
          this._treeProjectManagerConfiguration.update(
            "baseWorkspaceDirectories",
            [directory],
            vscode.ConfigurationTarget.Global,
          );
          return Promise.resolve(directory);
        }
      });
    return Promise.reject();
  }
}
