/// <reference path="../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;

import { DefinitionManagerArgumentHandler } from "../argument-handler";

type getOrCreateDefinitionOptions = {
  create?: boolean;
  depthOffset?: number;
};

/**
 *  Creates or retrieves a definition value specified by path and definition
 *  object.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject An object that contains definitions.
 *
 * @param options An object of options:
 *   - create - boolean, whether the object specified by path should be created
 * if it doesn't exist yet. Default: true
 *   - depthOffset - Specify offset from the path's depth, at which the
 * definition object should be retrieved or created. Default: 0
 */
export function getOrCreateDefinition(
  path: string[],
  definitionsObject: IDefinition,
  options?: {
    create?: boolean;
    depthOffset?: number;
  }
) {
  const defaults = {
    create: true,
    depthOffset: 0
  };

  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options,
    defaults
  })
    .processOptions()
    .finally(({ definitionsObject, options, path }) => {
      return (path as string[]).reduce(
        (definitionObject, currentPath, i, arr) => {
          // Propagate null downwards if path is deeper than definition object
          if (definitionObject === null) return null;

          // Return definition's parent Object
          if (
            i ===
            arr.length + (options as getOrCreateDefinitionOptions).depthOffset
          ) {
            return definitionObject as IDefinition;
          }

          if (!definitionObject.hasOwnProperty(currentPath)) {
            if (
              (options as getOrCreateDefinitionOptions).create &&
              definitionObject !== undefined
            ) {
              definitionObject[currentPath] = {} as IDefinition;
            } else {
              return null;
            }
          }

          return definitionObject[currentPath] as IDefinition;
        },
        definitionsObject
      );
    });
}
