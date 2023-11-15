import * as vscode from "vscode";
import { getUnimportedGitProjects } from "./GitProjectUtils";
import {
  TreeFolderItem,
  UnsortedTreeFolderItem,
} from "./TreeItems/TreeFolderItem";
import {
  TreeItem,
  getTreeItemParent,
  removeTreeItemFromTreeFolderItem,
} from "./TreeItems/TreeItem";
import {
  ProjectItemObject,
  projectItemFromObject,
} from "./TreeItems/TreeObjectItem";
import { TreeProjectItem } from "./TreeItems/TreeProjectItem";

export class TreeProjectManager
  implements
    vscode.TreeDataProvider<TreeItem>,
    vscode.TreeDragAndDropController<TreeItem>
{
  rootProjectTree: TreeFolderItem = new TreeFolderItem("root", [], false);
  dropMimeTypes = ["application/vnd.code.tree.projectTreeProvider"];
  dragMimeTypes = ["text/uri-list"];

  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private globalState: vscode.ExtensionContext["globalState"]) {
    this._loadProjectTreeFromGlobalState();
  }

  handleDrag(
    source: readonly TreeItem[],
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken,
  ): void | Thenable<void> {
    dataTransfer.set(
      "application/vnd.code.tree.projectTreeProvider",
      new vscode.DataTransferItem(source),
    );
  }

  handleDrop(
    target: TreeItem | undefined,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken,
  ): void | Thenable<void> {
    const transferItem = dataTransfer.get(
      "application/vnd.code.tree.projectTreeProvider",
    );
    if (!transferItem) {
      return;
    }
    const treeItems: TreeItem[] = transferItem.value;
    treeItems.forEach((treeItem) => {
      if (!(treeItem instanceof UnsortedTreeFolderItem)) {
        this.removeTreeItemFromRootProjectTree(treeItem);
        this._addTreeItemToTreeItemTarget(treeItem, target);
      }
    });
    this.refreshViewAndSaveTreeConfiguration();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    if (element) {
      if (element instanceof TreeFolderItem) {
        return Promise.resolve(element.children);
      }
      return Promise.resolve([]);
    }
    if (this.rootProjectTree) {
      return Promise.resolve(this.rootProjectTree.children);
    }
    return Promise.resolve([]);
  }

  private _loadProjectTreeFromGlobalState() {
    const globalStateProjectTree: string | undefined =
      this.globalState.get("projectTree");
    if (globalStateProjectTree) {
      const jsonProjectList: ProjectItemObject[] = JSON.parse(
        globalStateProjectTree,
      );
      this.rootProjectTree.children = jsonProjectList.map(
        projectItemFromObject,
      );
    }
    this._onDidChangeTreeData.fire();
  }

  refreshViewAndSaveTreeConfiguration() {
    this.rootProjectTree.recursivelySortChildren();
    this._onDidChangeTreeData.fire();
    const jsonProjectTree = JSON.stringify(
      this.rootProjectTree.children.map((projectItem: TreeItem) => {
        return projectItem.toJSON();
      }),
    );
    this.globalState.update("projectTree", jsonProjectTree);
    this.globalState.setKeysForSync(["projectTree"]);
  }

  fetchUnimportedProjects() {
    this._addUnsortedProjects(getUnimportedGitProjects(this.rootProjectTree));
    this.refreshViewAndSaveTreeConfiguration();
  }

  editTreeItemLabel(project: TreeItem) {
    vscode.window
      .showInputBox({
        value: project.label as string,
        prompt: "Enter a new label for the project.",
      })
      .then((newLabel) => {
        if (newLabel) {
          project.label = newLabel;
          this.refreshViewAndSaveTreeConfiguration();
        }
      });
  }

  private _addUnsortedProjects(unsortedProjects: UnsortedTreeFolderItem) {
    if (unsortedProjects.children.length > 0) {
      updateUnsortedTreeFolderItem: {
        for (const treeItem of this.rootProjectTree.children) {
          if (treeItem instanceof UnsortedTreeFolderItem) {
            treeItem.children.push(...unsortedProjects.children);
            break updateUnsortedTreeFolderItem;
          }
        }
        this.rootProjectTree.children.push(unsortedProjects);
      }
    }
  }

  removeTreeItemFromRootProjectTree(treeItem: TreeItem): void {
    removeTreeItemFromTreeFolderItem(treeItem, this.rootProjectTree);
  }

  private _addTreeItemToTreeItemTarget(
    treeItemToAdd: TreeItem,
    treeItemTarget?: TreeItem,
  ) {
    let targetTreeFolderItem: TreeFolderItem = this.rootProjectTree;
    if (treeItemTarget instanceof TreeProjectItem) {
      targetTreeFolderItem =
        getTreeItemParent(treeItemTarget, this.rootProjectTree) ||
        targetTreeFolderItem;
    } else if (treeItemTarget instanceof TreeFolderItem) {
      targetTreeFolderItem = treeItemTarget;
    }
    targetTreeFolderItem.children.push(treeItemToAdd);
  }

  createFolderToTreeFolderItem(
    folderName: string,
    treeFolderItem: TreeItem | undefined,
  ) {
    const newFolder = new TreeFolderItem(folderName, [], false);
    this._addTreeItemToTreeItemTarget(newFolder, treeFolderItem);
    this.refreshViewAndSaveTreeConfiguration();
  }
}
