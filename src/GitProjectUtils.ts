import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ConfigurationManager } from "./ConfigurationManager";
import {
  TreeFolderItem,
  UnsortedTreeFolderItem,
} from "./TreeItems/TreeFolderItem";
import { TreeItem } from "./TreeItems/TreeItem";
import { TreeProjectItem } from "./TreeItems/TreeProjectItem";

export function getUnimportedGitProjects(
  importedGitProjects: TreeFolderItem,
): UnsortedTreeFolderItem {
  const configurationManager = new ConfigurationManager();
  const unimportedGitProjects: TreeItem[] = [];
  configurationManager.baseWorkspaceDirectories.forEach((directory) => {
    unimportedGitProjects.push(
      ..._getUnimportedGitProjectsInDirectory(
        directory,
        importedGitProjects,
        configurationManager.maximumDepthRecursion,
      ),
    );
  });
  return new UnsortedTreeFolderItem(unimportedGitProjects);
}

function _getUnimportedGitProjectsInDirectory(
  directory: string,
  importedGitProjects: TreeFolderItem,
  recusionLevel: number,
): TreeItem[] {
  const configurationManager = new ConfigurationManager();
  const unimportedProjects: TreeItem[] = [];
  _getDirectories(directory).forEach((subdirectory) => {
    if (!configurationManager.excludedFolders.includes(subdirectory)) {
      const subdirectoryPath = path.join(directory, subdirectory);
      if (recusionLevel > 0) {
        unimportedProjects.push(
          ..._getUnimportedGitProjectsInDirectory(
            subdirectoryPath,
            importedGitProjects,
            recusionLevel - 1,
          ),
        );
      }
      if (fs.readdirSync(subdirectoryPath).includes(".git")) {
        if (!_isPathAlreadyImported(subdirectoryPath, importedGitProjects)) {
          unimportedProjects.push(
            new TreeProjectItem(
              path.basename(subdirectoryPath),
              vscode.Uri.file(subdirectoryPath),
            ),
          );
        }
      }
    }
  });
  return unimportedProjects;
}

function _getDirectories(source: fs.PathLike): string[] {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

function _isPathAlreadyImported(
  path: string,
  importedGitProjects: TreeFolderItem,
): boolean {
  return importedGitProjects.children.some((treeItem) => {
    if (treeItem instanceof TreeFolderItem) {
      return _isPathAlreadyImported(path, treeItem);
    } else if (treeItem instanceof TreeProjectItem) {
      return path === treeItem.resourceUri.path;
    }
  });
}
