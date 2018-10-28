import { IDefinition } from "src/interface/definition";

import { defaults } from "../defaults/branch/dive-down-branch";

/**
 * Starts at the specified definition and dives down to children, evaluating
 * passed functions at each step.
 *
 * @param definition An definition object.
 *
 * @param options An object of options
 *   - `onChildren` A function that is called when the definition has
 * children. (origDefObj, childrenValues)=> any, where childrenValues is array
 * of values returned from recursive diveDown calls on children.
 *   - `onDiveCheck` A function that checks whether the dive should
 * continue. (origDefObj) => boolean.
 *   - `onNoChildren` A function that is called when the definition object has
 * no children. (origDefObj) => void.
 */
export function diveDownBranch<T1, T2>(
  definition: IDefinition,
  options: {
    onChildren?: (definition: IDefinition, childrenValues: (T1 | T2)[]) => T1;
    onDiveCheck?: (definition: IDefinition) => boolean;
    onNoChildren?: (definition: IDefinition) => T2;
  } = {},
  ...args: any[]
): T1 | T2 {
  const opt = Object.assign({}, defaults, options);

  // Evaluate whether the dive should continue and go over each child
  // recursively if so. Then evaluate current definition based on the
  // definition and the children's returned values.
  if (opt.onDiveCheck(definition)) {
    const childrenValues = Object.keys(definition.children).map(key =>
      diveDownBranch(definition.children[key], opt, ...args)
    );
    return opt.onChildren(definition, childrenValues);
  }

  // Evaluate value to be returned if definition has no children.
  return opt.onNoChildren(definition);
}
