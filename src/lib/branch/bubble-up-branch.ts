/// <reference path="../../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;
import { defaults } from "../defaults/branch/bubble-up-branch";

/**
 * Starts at the deepend end of the specified path and bubbles up, evaluating
 * passed functions at each step.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject An object that contains definitions.
 *
 * @param options An object of options
 *   - `onChildInspection` A function that checks the child definition object
 * of current definition object. (childDefObj, origDefObj, childKey) => void
 *   - `onBubbleCheck` A function that checks whether the bubbling should
 * continue. (origDefObj, parentDefObj, origKey) => boolean.
 *   - `onDefinitionSkip` A function that checks whether the current definition
 * should be skipped and bubbling continue.
 * (origDefObj, parentDefObj, origKey) => boolean.
 *   - `onNoChildren` A function that is called when the definition object has
 * no children. (origDefObj, parentDefObj, origKey) => void.
 */

export function bubbleUpBranch(
  path: string[],
  definitionsObject: IDefinition,
  options: {
    onChildInspection?: (
      definition: IDefinition,
      parentDefinition: IDefinition,
      definitionKey: IDefinition["keyword"],
      childrenDefinitions: IDefinition[]
    ) => void;
    onBubbleCheck?: (
      definition: IDefinition,
      parentDefinition: IDefinition,
      definitionKey: IDefinition["keyword"]
    ) => boolean;
    onDefinitionSkip?: (
      definition: IDefinition,
      parentDefinition: IDefinition,
      definitionKey: IDefinition["keyword"]
    ) => boolean;
    onNoChildren?: (
      definition: IDefinition,
      parentDefinition: IDefinition,
      definitionKey: IDefinition["keyword"]
    ) => void;
  } = {}
) {
  const {
    onChildInspection,
    onBubbleCheck,
    onDefinitionSkip,
    onNoChildren
  } = Object.assign({}, defaults, options);

  const definitionObjects: {
    parent: IDefinition;
    key: string;
    definition: IDefinition;
  }[] = [];

  path.reduce((definitionObject, currentPath) => {
    if (definitionObject === null) return null;
    if (!definitionObject.children.hasOwnProperty(currentPath)) {
      return null;
    }

    definitionObjects.push({
      parent: definitionObject,
      key: currentPath,
      definition: definitionObject.children[currentPath]
    });
    return definitionObject.children[currentPath];
  }, definitionsObject);

  // definitionObjects is array of nested definition objects,
  // as specified by path, and going deeper with increasing index
  //
  // shallower ---------------------> deeper
  // [{}, {}, {}, {}, str, null, null, null]
  //
  // Where '{}' is definition objects, 'str' is the value, and 'null'
  // is where the specified path was deeper than the specified branch.

  // Reduce loop starts at the deepest end of the branch and goes outwards
  definitionObjects.reduceRight((continueBubble, currentDepth, i) => {
    if (!continueBubble) return false;

    // Evaluate whether the current definition should be skipped.
    if (
      onDefinitionSkip(
        currentDepth.definition,
        currentDepth.parent,
        currentDepth.key
      )
    ) {
      return true;
    }

    // Evaluate whether the bubbling should continue.
    if (
      !onBubbleCheck(
        currentDepth.definition,
        currentDepth.parent,
        currentDepth.key
      )
    ) {
      return false;
    }

    // Go over each child and evaluate onChildInspection.
    if (Object.keys(currentDepth.definition.children).length > 0) {
      const childrenDefinitions = Object.keys(
        currentDepth.definition.children
      ).map(key => currentDepth.definition.children[key]);
      onChildInspection(
        currentDepth.definition,
        currentDepth.parent,
        currentDepth.key,
        childrenDefinitions
      );
    }

    // If definition object has no children, evaluate onNoChildren.
    if (Object.keys(currentDepth.definition.children).length === 0) {
      onNoChildren(
        currentDepth.definition,
        currentDepth.parent,
        currentDepth.key
      );
    }
    return true;
  }, true);
}
