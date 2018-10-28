import { IDefinition } from "src/interface/definition";

import { DefinitionManagerArgumentHandler } from "../argument-handler";
import { defaults } from "./defaults/search";

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
 *   - `activeStatus` - boolean or null, whether only active (true), inactive
 * (false), or all (null) definitions should be considered when getting a
 * definition. Default: `null`
 *   - `returnAsBoolean` - Whether the return value should be boolean. If
 * `false`, return value is either the value of the definition, or `null` if
 * definition was not found. Default: `false`
 */
export function search(
  path: string | string[],
  definitionsObject: IDefinition,
  options: {
    returnAsBoolean?: boolean;
    activeStatus?: boolean | null;
  } = {}
) {
  const definitionOptions = {
    create: false,
    depthOffset: -1,
    abortOnFail: false,
    activeStatus: null as boolean | null
  };

  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options,
    defaults
  })
    .processPath()
    .processOptions()
    .getDefinition({}, definitionOptions)
    .finally(({ definitions, lastPathComponent, options }) => {
      if (
        definitions[0] !== null &&
        definitions[0] !== undefined &&
        definitions[0].children.hasOwnProperty(lastPathComponent)
      ) {
        if (options.returnAsBoolean) {
          return true;
        } else {
          return definitions[0].children[lastPathComponent].value;
        }
      } else {
        if (options.returnAsBoolean) {
          return false;
        }
      }
    });
}
