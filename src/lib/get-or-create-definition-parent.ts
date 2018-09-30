/// <reference path="../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;

import { getOrCreateDefinition } from "./get-or-create-definition";
import { DefinitionManagerArgumentHandler } from "../argument-handler";

/**
 * Convenience method for getting a definition object 1 level shallower
 * than the specified path.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject An object that contains definitions.
 *
 * @param options An object of options:
 *   - create - boolean, whether the object specified by path should be created
 * if it doesn't exist yet. Default: true
 */
export function getOrCreateDefinitionParent(
  path: string[],
  definitionsObject: IDefinition,
  options?: {
    create?: boolean;
  }
) {
  const defaults = { depthOffset: -1 };

  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options,
    defaults
  })
    .processOptions()
    .finally(({ definitionsObject, options, path }) => {
      return getOrCreateDefinition(
        path as string[],
        definitionsObject,
        options
      );
    });
}
