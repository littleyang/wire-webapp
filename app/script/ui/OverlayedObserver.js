/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.ui = z.ui || {};

/**
 * Keeps track of elements that are overlayed by other elemenst (thus not visible on screen).
 *
 */
z.ui.OverlayedObserver = (() => {
  // keeps track of all the elements we need to check when there is a mutation
  const overlayedElements = new Map();

  const checkOverlayedElements = mutations => {
    mutations.forEach(({removedNodes}) => {
      if (removedNodes && removedNodes.length) {
        overlayedElements.forEach((onVisible, element) => {
          if (!isOverlayed(element)) {
            onVisible();
            removeElement(element);
          }
        });
      }
    });
  };

  const mutationObserver = new MutationObserver(checkOverlayedElements);

  /**
   * Returns true if an element is above the element being watched.
   *
   * @param {HTMLElement} domElement - the element we want to check.
   * @returns {boolean} Is the element overlayed.
   */
  const isOverlayed = domElement => {
    const box = domElement.getBoundingClientRect();
    const elementAtPoint = document.elementFromPoint(box.left, box.top);
    return elementAtPoint && domElement !== elementAtPoint && !domElement.contains(elementAtPoint);
  };

  const addElement = (element, onVisible) => {
    if (!isOverlayed(element)) {
      return onVisible();
    }
    if (overlayedElements.size === 0) {
      mutationObserver.observe(document.body, {childList: true, subtree: true});
    }
    overlayedElements.set(element, onVisible);
  };

  const removeElement = element => {
    overlayedElements.delete(element);
    if (overlayedElements.size < 1) {
      mutationObserver.disconnect();
    }
  };

  return {onElementVisible: addElement, removeElement};
})();
