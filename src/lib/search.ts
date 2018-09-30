/// <reference path="../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;
import IOptions = DefinitionInjector.IOptions;

import { DefinitionManagerArgumentHandler } from "../argument-handler";

/**
 * Retrieves either a value or boolean of existence of a definition
 * specified by a path.
 * Returns undefined if path doesn't lead to a definition value.
 *
 * @param path A string or array of strings that points to a definition within
 * a definitions object structure.
 *
 * @param definitionsObject A definitions object that is searched through.
 *
 * @param options An object of options:
 *   - `returnAsBoolean` - Whether the return value should be boolean. If
 * `false`, return value is either the value of the definition, or `null` if
 * definition was not found.
 */
export function search(
  path: string | string[],
  definitionsObject: IDefinition,
  options: IOptions & {
    returnAsBoolean?: boolean;
  } = {}
) {
  const definitionOptions = {
    create: false,
    depthOffset: -1,
    abortOnFail: false
  };

  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options
  })
    .processPath()
    .processOptions()
    .getDefinition({}, definitionOptions)
    .finally(({ definitions, lastPathComponent, options }) => {
      if (
        definitions[0] !== null &&
        definitions[0] !== undefined &&
        definitions[0].hasOwnProperty(lastPathComponent)
      ) {
        if (options.returnAsBoolean) {
          return true;
        } else {
          return definitions[0][lastPathComponent];
        }
      } else {
        if (options.returnAsBoolean) {
          return false;
        }
      }
    });
}
