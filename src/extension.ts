import * as vscode from "vscode";
import { TreeFolderItem } from "./TreeItems/TreeFolderItem";
import { TreeItem } from "./TreeItems/TreeItem";
import { TreeProjectItem } from "./TreeItems/TreeProjectItem";
import { TreeProjectManager } from "./TreeProjectManager";

export function activate(context: vscode.ExtensionContext) {
  const treeProjectManager = new TreeProjectManager(context.globalState);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "treeprojectmanager.fetchUnimportedProjects",
      () => {
        treeProjectManager.fetchUnimportedProjects();
      },
    ),
    vscode.commands.registerCommand(
      "treeprojectmanager.editFolderName",
      (projectItem: TreeFolderItem) => {
        treeProjectManager.editTreeItemLabel(projectItem);
      },
    ),
    vscode.commands.registerCommand(
      "treeprojectmanager.editProjectName",
      (projectItem: TreeProjectItem) => {
        treeProjectManager.editTreeItemLabel(projectItem);
      },
    ),
    vscode.commands.registerCommand(
      "treeprojectmanager.openProject",
      (projectItem: TreeItem) => {
        if (
          projectItem.collapsibleState === vscode.TreeItemCollapsibleState.None
        ) {
          vscode.commands.executeCommand(
            "vscode.openFolder",
            projectItem.resourceUri,
          );
        }
      },
    ),
    vscode.commands.registerCommand(
      "treeprojectmanager.newFolder",
      (projectItem: TreeItem | undefined) => {
        vscode.window
          .showInputBox({
            title: "Folder name",
            prompt: "Enter the name of the new folder.",
          })
          .then((folderName) => {
            if (folderName) {
              treeProjectManager.createFolderToTreeFolderItem(
                folderName,
                projectItem,
              );
            }
          });
      },
    ),
    vscode.commands.registerCommand(
      "treeprojectmanager.deleteFolder",
      (projectItem: TreeItem) => {
        treeProjectManager.removeTreeItemFromRootProjectTree(projectItem);
        treeProjectManager.refreshViewAndSaveTreeConfiguration();
      },
    ),
  );
  const treeView = vscode.window.createTreeView("treeProjectManager", {
    treeDataProvider: treeProjectManager,
    dragAndDropController: treeProjectManager,
  });

  treeView.onDidCollapseElement((e) => {
    treeProjectManager.setTreeItemCollapsibleState(
      e.element,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
  });
  treeView.onDidExpandElement((e) => {
    treeProjectManager.setTreeItemCollapsibleState(
      e.element,
      vscode.TreeItemCollapsibleState.Expanded,
    );
  });
}

export function deactivate() {}
