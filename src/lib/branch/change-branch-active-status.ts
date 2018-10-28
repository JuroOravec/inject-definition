import { IDefinition } from "src/interface/definition";

import { diveDownBranch } from "./dive-down-branch";

/**
 * Changes active status of all definitions withing the branch specified by
 * passed definition to the specified value.
 *
 * @param definition A definition object, which and whose descendants are being
 * checked.
 *
 * @param status A boolean representing the new active status.
 */
export function changeBranchActiveStatus(
  definition: IDefinition,
  status: boolean
) {
  // Change activity to set status no matter if the definition has or has not
  // children.
  const onNoChildren = (definition: IDefinition) => {
    definition.active = status;
  };
  const onChildren = (definition: IDefinition) => {
    definition.active = status;
  };

  return diveDownBranch(definition, {
    onChildren,
    onNoChildren
  });
}
