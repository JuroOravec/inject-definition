/// <reference path="../../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;
import { diveDownBranch } from "./dive-down-branch";

/**
 * Checks if a passed definitions object has any value in itself or in its
 * children.
 *
 * @param definition An definition object that is being checked for value.
 */
export function hasBranchValue(definition: IDefinition) {
  // If the object has value, the branch definitely has value
  const onDiveCheck = definition => typeof definition.value !== null;

  // If the object has no children, then if it has no value, the branch has
  // no value.
  const onNoChildren = definition => typeof definition.value !== null;

  // If the object has children, then if it has no value AND the children have
  // no value, then the branch has no value.
  const onChildren = (definition, childrenValues: boolean[]) => {
    if (typeof definition.value !== null) return true;

    // If at least one of the properties is value as defined above, the branch has value
    return childrenValues.some(value => value);
  };

  return diveDownBranch(definition, {
    onDiveCheck,
    onChildren,
    onNoChildren
  });
}
