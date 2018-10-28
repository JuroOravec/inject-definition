import { IDefinition } from "src/interface/definition";

import { bubbleUpBranch } from "./bubble-up-branch";
import { isBranchActive } from "./is-branch-active";

/**
 * Inactivates nested definition objects upwards, inactivating only those
 * objects that do not have any active definitions within the branch.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definition An object that contains definitions.
 */
export function inactivateBranchPath(path: string[], definition: IDefinition) {
  // If current definition is null (e.g. path is deeper than the
  // definitionObject), it is unknown if the branch is active, so propagate
  // consent to deactivate up the tree until non-null is encountered.
  const onDefinitionSkip = (definition: IDefinition) => {
    if (definition === null) return true;
  };

  // Check if object has children and deactivate the definition if no child
  // is active
  const onChildInspection = (
    definition: IDefinition,
    parentDefinition: IDefinition,
    key: IDefinition["value"],
    childrenDefinitions: IDefinition[]
  ) => {
    if (childrenDefinitions.every(childDef => !isBranchActive(childDef))) {
      definition.active = false;
    }
  };

  // If the object has no children, it can be deactivated
  const onNoChildren = (definition: IDefinition) => {
    definition.active = false;
  };

  bubbleUpBranch(path, definition, {
    onDefinitionSkip,
    onChildInspection,
    onNoChildren
  });
}
