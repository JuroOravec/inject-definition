/// <reference path="../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;

import { DefinitionManagerArgumentHandler } from "../argument-handler";
import { getOrCreateDefinition } from "./get-or-create-definition";
import { defaults } from "./defaults/get-or-create-definition-parent";

/**
 * Convenience method for getting a definition object 1 level shallower
 * than the specified path.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject An object that contains definitions.
 *
 * @param options An object of options:
 *   - `action` - boolean or null, whether the newly created object and the path
 * to it (if 'create': true) should be explicitly actived, inactived, or left
 * as is, in which case the newly created object is actiaved, but path is not
 * altered.
 * Default: `null`
 *   - `activeStatus` - boolean or null, whether only active (true), inactive
 * (false), or all (null) definitions should be considered when getting a
 * definition. Default: `null`
 *   - `create` - boolean, whether the object specified by path should be created
 * if it doesn't exist yet. Default: `true`
 */
export function getOrCreateDefinitionParent(
  path: string[],
  definitionsObject: IDefinition,
  options?: {
    action?: boolean | null;
    activeStatus?: boolean | null;
    create?: boolean;
  }
) {
  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options,
    defaults
  })
    .processOptions()
    .finally(({ definitionsObject, options, path }) => {
      return getOrCreateDefinition(path, definitionsObject, options);
    });
}
