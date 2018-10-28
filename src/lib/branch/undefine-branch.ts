import { IDefinitionManager } from "src/interface/definition-manager";
import { IDefinition } from "src/interface/definition";

import { diveDownBranch } from "./dive-down-branch";
import { defaults } from "../defaults/branch/export-branch";

/**
 * Checks if a passed definitions object or any of descendants have specified
 * active status, undefines parts of the branch that do not.
 *
 * @param definitionManager A DefinitionManager instance, whose definitions are
 * being checked.
 *
 * @param definition A definition object, which and whose descendants are being
 * checked.
 */
export function undefineBranch(
  definitionManager: IDefinitionManager,
  definition: IDefinition,
  options: { activeStatus: boolean | null }
) {
  const { activeStatus } = Object.assign({}, defaults, options);

  // If the object's active status is different than the selected one, and
  // object has no children, undefine current definition and do not go deeper.
  const onDiveCheck = definition => Object.keys(definition.children).length > 0;

  // If the object has no children, then if the object's active status is
  // different than the selected one, remove it
  const onNoChildren = (definition: IDefinition) => {
    if (definition.active !== activeStatus) {
      return true;
    }
    definitionManager.undefine(definition.keyword);
  };

  // If the object has children, then if it has no value AND the children have
  // no value, then the branch has no value.
  const onChildren = (definition, childrenValues: boolean[]) => {
    // If at least one of the properties is value as defined above, the branch has value
    if (childrenValues.some(value => value) && childrenValues.length > 0) {
      return true;
    }

    definitionManager.undefine(definition.keyword);
  };

  return diveDownBranch(definition, {
    onDiveCheck,
    onChildren,
    onNoChildren
  });
}
