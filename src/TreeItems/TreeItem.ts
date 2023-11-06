import { TreeFolderItem } from "./TreeFolderItem";
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
