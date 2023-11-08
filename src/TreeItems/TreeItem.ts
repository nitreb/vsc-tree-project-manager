import { TreeFolderItem, UnsortedTreeFolderItem } from "./TreeFolderItem";
import { TreeProjectItem } from "./TreeProjectItem";

export type TreeItem = TreeFolderItem | TreeProjectItem;

export function getTreeItemParent(
  treeItem: TreeItem,
  treeToSearch: TreeFolderItem,
): TreeFolderItem | undefined {
  for (let i = 0; i < treeToSearch.children.length; i += 1) {
    const children = treeToSearch.children[i];
    if (treeItem === children) {
      return treeToSearch;
    } else {
      if (children instanceof TreeFolderItem) {
        let parentInSubtree = getTreeItemParent(treeItem, children);
        if (parentInSubtree) {
          return parentInSubtree;
        }
      }
    }
  }
}

export function removeTreeItemFromTreeFolderItem(
  treeItem: TreeItem,
  treeFolderItem: TreeFolderItem,
) {
  const index = treeFolderItem.children.indexOf(treeItem);
  if (index >= 0) {
    treeFolderItem.children.splice(index, 1);
  } else {
    treeFolderItem.children.forEach((item) => {
      if (item instanceof TreeFolderItem) {
        removeTreeItemFromTreeFolderItem(treeItem, item);
      }
    });
  }
}

function _compareTreeItemLabel(labelA: string, labelB: string) {
  if (labelA < labelB) {
    return -1;
  }
  if (labelA > labelB) {
    return 1;
  }
  return 0;
}

export function compareTreeItems(
  treeItemA: TreeItem,
  treeItemB: TreeItem,
): number {
  if (treeItemA instanceof UnsortedTreeFolderItem) {
    return 1;
  }
  if (treeItemB instanceof UnsortedTreeFolderItem) {
    return -1;
  }
  if (treeItemA.constructor === treeItemB.constructor) {
    return _compareTreeItemLabel(
      treeItemA.label.toString().toUpperCase(),
      treeItemB.label.toString().toUpperCase(),
    );
  }
  if (
    treeItemA instanceof TreeFolderItem &&
    treeItemB instanceof TreeProjectItem
  ) {
    return -1;
  }
  if (
    treeItemA instanceof TreeProjectItem &&
    treeItemB instanceof TreeFolderItem
  ) {
    return 1;
  }
  return 0;
}
