import { IDefinition } from "src/interface/definition";

import { DefinitionManagerArgumentHandler } from "../../argument-handler";
import { getOrCreateDefinitionParent } from "../get-or-create-definition-parent";
import { createDefinition } from "../create-definition";
import { defaults } from "../defaults/handlers/definition-handler";

/**
 * Looks up specified definition. Runs the passed callback if and only if
 * the definition exists, and prepends the found definition as the first
 * argument. First 4 arguments (`callback`, `definitionPath`,
 * `definitionObject`, `options`) are consumed (they are not forwarded to the
 * callback), the remaining arguments are forwarded to the callback.
 *
 * @param callback A function that is called with prepended definition object.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject A definitions object that is searched through.
 *
 * @param options An object of options:
 *   - `abortOnFail` - Whether the handler should not proceed if definition
 * is not found or it is null. Default: `true`
 *   - `action` - boolean or null, whether the newly created object and the path
 * to it (if 'create': true) should be explicitly actived, inactived, or left
 * as is, in which case the newly created object is actiaved, but path is not
 * altered.
 * Default: null
 *   - `activeStatus` - boolean or null, whether only active (true), inactive
 * (false), or all (null) definitions should be considered when getting a
 * definition. Default: `null`
 *   - `create` - boolean, whether the object specified by path should be created
 * if it doesn't exist yet. Default: `true`
 *   - `depthOffset` - Specify offset from the path's depth, at which the
 * definition object should be retrieved or created. Default: `0`
 */

export function definitionHandler<T>(
  callback: (definition: IDefinition, ...args: any[]) => T,
  path: string[],
  definitionsObject: IDefinition = createDefinition(),
  options: {
    abortOnFail?: boolean;
    action?: boolean | null;
    activeStatus?: boolean | null;
    create?: boolean;
    depthOffset?: number;
  } = {},
  ...args: any[]
) {
  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options,
    defaults
  })
    .processOptions()
    .finally(({ path, definitionsObject, options }) => {
      const definition = getOrCreateDefinitionParent(
        path,
        definitionsObject,
        options
      );
      if (definition === null && options.abortOnFail) return;

      return callback(definition, ...args);
    }) as T;
}
