/// <reference path="../../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;
import { diveDownBranch } from "./dive-down-branch";

/**
 * Checks if a passed definitions object is active in itself or in its
 * children.
 *
 * @param definition An definition object, that is being checked for activity.
 */
export function isBranchActive(definition: IDefinition) {
  // If the object has value, the branch definitely has value
  const onDiveCheck = definition => definition.active === true;

  // If the object has no children, then if it is not active, the branch is
  // not active.
  const onNoChildren = definition => definition.active === true;

  // If the object has children, then if it is not active AND the children are
  // not active, then the branch is not active.
  const onChildren = (definition, childrenValues: boolean[]) => {
    if (definition.active === true) return true;

    // If at least one of the children is active, the branch is active
    return childrenValues.some(value => value);
  };

  return diveDownBranch(definition, {
    onDiveCheck,
    onChildren,
    onNoChildren
  });
}
