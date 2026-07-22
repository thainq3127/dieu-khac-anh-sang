import { CanvasElement, ElementKind } from './types'
import { createElement, newId } from './constants'

// Find an element and its parent and index in the tree
export function findElementAndParent(
  elements: CanvasElement[],
  id: string,
  parent: CanvasElement | null = null
): { element: CanvasElement; parent: CanvasElement | null; index: number } | null {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].id === id) {
      return { element: elements[i], parent, index: i }
    }
    if (elements[i].children && elements[i].children!.length > 0) {
      const found = findElementAndParent(elements[i].children!, id, elements[i])
      if (found) return found
    }
  }
  return null
}

// Find an element by ID
export function findElementInTree(elements: CanvasElement[], id: string): CanvasElement | null {
  const result = findElementAndParent(elements, id)
  return result ? result.element : null
}

// Remove an element from the tree
export function removeElementFromTree(elements: CanvasElement[], id: string): CanvasElement[] {
  return elements
    .filter(el => el.id !== id)
    .map(el => {
      if (el.children && el.children.length > 0) {
        return {
          ...el,
          children: removeElementFromTree(el.children, id),
        }
      }
      return el
    })
}

// Update an element in the tree
export function updateElementInTree(
  elements: CanvasElement[],
  id: string,
  updates: Partial<CanvasElement>
): CanvasElement[] {
  return elements.map(el => {
    if (el.id === id) {
      return { ...el, ...updates }
    }
    if (el.children && el.children.length > 0) {
      return {
        ...el,
        children: updateElementInTree(el.children, id, updates),
      }
    }
    return el
  })
}

// Deep clone an element and generate new IDs for it and all of its descendants
export function cloneElementWithNewIds(element: CanvasElement): CanvasElement {
  const newIdVal = newId()
  return {
    ...element,
    id: newIdVal,
    children: element.children?.map(child => cloneElementWithNewIds(child)),
  }
}

// Insert an element inside a parent container
export function insertAsChild(
  elements: CanvasElement[],
  parentId: string,
  childElement: CanvasElement
): CanvasElement[] {
  return elements.map(el => {
    if (el.id === parentId) {
      return {
        ...el,
        children: [...(el.children || []), childElement],
      }
    }
    if (el.children && el.children.length > 0) {
      return {
        ...el,
        children: insertAsChild(el.children, parentId, childElement),
      }
    }
    return el
  })
}

// Main logic to add a new palette item or move an existing canvas element in the tree
export function addOrMoveElementInTree(
  elements: CanvasElement[],
  activeId: string,
  overId: string,
  paletteKind?: ElementKind
): CanvasElement[] {
  let elementToPlace: CanvasElement
  let treeWithoutActive = elements

  if (paletteKind) {
    elementToPlace = createElement(paletteKind)
  } else {
    const activeInfo = findElementAndParent(elements, activeId)
    if (!activeInfo) return elements
    elementToPlace = activeInfo.element
    treeWithoutActive = removeElementFromTree(elements, activeId)
  }

  // Case 1: Drop over the root canvas
  if (overId === 'root-canvas' || overId === 'canvas-drop-zone') {
    if (treeWithoutActive.some(e => e.id === elementToPlace.id)) {
      return treeWithoutActive
    }
    return [...treeWithoutActive, elementToPlace]
  }

  // Case 2: Find target element in tree
  const overInfo = findElementAndParent(treeWithoutActive, overId)
  if (!overInfo) {
    // If not found in the pruned tree, let's check if the target ID is a container/column in the original tree
    const originalOverElement = findElementInTree(elements, overId)
    if (originalOverElement && (originalOverElement.kind === 'column' || originalOverElement.kind === 'container')) {
      return insertAsChild(treeWithoutActive, overId, elementToPlace)
    }
    // Fallback: append to root
    return [...treeWithoutActive, elementToPlace]
  }

  const { element: overElement, parent: overParent, index: overIndex } = overInfo

  // If the target is a column or container, and we want to drop it INSIDE it
  if (overElement.kind === 'column' || overElement.kind === 'container') {
    if (overElement.id === elementToPlace.id) return treeWithoutActive
    const currentChildren = overElement.children || []
    if (currentChildren.some(c => c.id === elementToPlace.id)) return treeWithoutActive
    return updateElementInTree(treeWithoutActive, overElement.id, {
      children: [elementToPlace, ...currentChildren], // insert at the beginning
    })
  }

  // If dropping next to a sibling
  if (overParent) {
    const currentChildren = [...(overParent.children || [])]
    const filtered = currentChildren.filter(c => c.id !== elementToPlace.id)
    filtered.splice(overIndex, 0, elementToPlace)
    return updateElementInTree(treeWithoutActive, overParent.id, {
      children: filtered,
    })
  } else {
    // Root level sibling insertion
    const newElements = [...treeWithoutActive]
    newElements.splice(overIndex, 0, elementToPlace)
    return newElements
  }
}
