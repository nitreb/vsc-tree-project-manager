import { TreeFolderItem } from "./TreeFolderItem";
import { TreeProjectItem } from "./TreeProjectItem";

export type TreeItem = TreeFolderItem | TreeProjectItem;

export function getTreeItemParent(
  treeItem: TreeItem,
  rootTree: TreeFolderItem,
): TreeFolderItem {
  for (let i = 0; i < rootTree.children.length; i += 1) {
    const children = rootTree.children[i];
    if (treeItem === children) {
      return rootTree;
    } else {
      if (children instanceof TreeFolderItem) {
        return getTreeItemParent(treeItem, children);
      }
    }
  }
  return rootTree;
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
