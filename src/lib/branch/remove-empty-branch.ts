import { IDefinition } from "src/interface/definition";

import { hasBranchValue } from "./has-branch-value";
import { bubbleUpBranch } from "./bubble-up-branch";

/**
 * Removes nested definitions objects that do not terminate with a value
 * (E.g. they are only nested objects terminating with empty object)
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject An object that contains definitions.
 */
export function removeEmptyBranch(
  path: string[],
  definitionsObject: IDefinition
) {
  // If current item is null (e.g. path is deeper than the definitionObject),
  // it is unknown if the branch has value, so propagate consent to remove
  // up the tree until non-null is encountered.
  const onDefinitionSkip = (
    definition: IDefinition,
    parent: IDefinition,
    key: IDefinition["keyword"]
  ) => {
    if (definition === null) return true;
  };

  // If current item's value is not null, it is a value, so do not
  // remove this branch as it has a value, and propagate this info
  // through.
  const onBubbleCheck = (
    definition: IDefinition,
    parent: IDefinition,
    key: IDefinition["keyword"]
  ) => {
    return definition.value !== null;
  };

  // Check if object has children and delete those sub-branches that lack value
  const onChildInspection = (
    definition: IDefinition,
    parentDefinition: IDefinition,
    key: IDefinition["keyword"]
  ) => {
    if (!hasBranchValue(parentDefinition.children[key])) {
      delete parentDefinition.children[key];
    }
  };

  // If at the end the object has no children, it has no value, and can be removed
  const onNoChildren = (
    definition: IDefinition,
    parentDefinition: IDefinition,
    key: IDefinition["keyword"]
  ) => {
    if (definition.value === null) {
      delete parentDefinition.children[key];
    }
  };

  bubbleUpBranch(path, definitionsObject, {
    onDefinitionSkip,
    onBubbleCheck,
    onChildInspection,
    onNoChildren
  });
}
