import * as vscode from "vscode";
import { TreeFolderItem, UnsortedTreeFolderItem } from "./TreeFolderItem";
import { TreeItem } from "./TreeItem";
import { TreeProjectItem } from "./TreeProjectItem";

export interface ProjectItemObject {
  label: string;
  path: string | undefined;
  children: ProjectItemObject[] | undefined;
  isCollapsed: boolean;
  type: "folder" | "project" | "unsorted";
}

export function projectItemFromObject(object: ProjectItemObject): TreeItem {
  if (object.type === "folder") {
    return new TreeFolderItem(
      object.label,
      object.children!.map(projectItemFromObject),
      object.isCollapsed,
    );
  } else if (object.type === "project") {
    return new TreeProjectItem(object.label, vscode.Uri.file(object.path!));
  } else if (object.type === "unsorted") {
    return new UnsortedTreeFolderItem(
      object.children!.map(projectItemFromObject),
      object.isCollapsed,
    );
  } else {
    throw Error("treeItem format not supported.");
  }
}
